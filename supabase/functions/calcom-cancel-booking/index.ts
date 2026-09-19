import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const CALCOM_API_KEY = Deno.env.get("CALCOM_API_KEY") || "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

Deno.serve(async (req: Request) => {
  // 1. Obsługa CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return json({ error: "Dozwolona wyłącznie metoda POST" }, 405);
  }

  try {
    // 2. Weryfikacja JWT użytkownika
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Brak nagłówka autoryzacji (JWT)" }, 401);
    }

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return json({ error: "Nieprawidłowy lub wygasły token sesji" }, 401);
    }

    // Pobranie profilu użytkownika wykonującego akcję
    const { data: callerProfile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("id, role, full_name, email")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (profileErr || !callerProfile) {
      return json({ error: "Nie znaleziono profilu zalogowanego użytkownika" }, 404);
    }

    // 3. Odczyt parametrów żądania
    const body = await req.json().catch(() => ({}));
    const { bookingId, externalId, cancellationReason } = body;

    if (!bookingId && !externalId) {
      return json({ error: "Wymagany parametr 'bookingId' lub 'externalId'" }, 400);
    }

    // 4. Pobranie rezerwacji z bazy danych
    let query = supabaseAdmin
      .from("bookings")
      .select(`
        id,
        client_id,
        scheduled_at,
        status_id,
        payment_status_id,
        external_id,
        booking_statuses!inner(name, label),
        payment_statuses(name, label)
      `);

    if (bookingId) {
      query = query.eq("id", bookingId);
    } else {
      query = query.eq("external_id", externalId);
    }

    const { data: booking, error: bookingErr } = await query.maybeSingle();

    if (bookingErr || !booking) {
      return json({ error: "Nie znaleziono wskazanej rezerwacji" }, 404);
    }

    // 5. Weryfikacja uprawnień (czy to właściciel wizyty lub administrator)
    const isOwner = booking.client_id === callerProfile.id;
    const isAdmin = callerProfile.role === "admin";

    if (!isOwner && !isAdmin) {
      return json({ error: "Brak uprawnień do anulowania tej rezerwacji" }, 403);
    }

    // 6. Sprawdzenie, czy wizyta nie jest już anulowana
    const currentStatusName = (booking.booking_statuses as any)?.name;
    if (currentStatusName === "cancelled") {
      return json({ error: "Ta wizyta została już wcześniej anulowana" }, 400);
    }

    // 7. Serwerowa walidacja zasady 24h
    const scheduledTime = new Date(booking.scheduled_at).getTime();
    const now = Date.now();
    const hoursRemaining = (scheduledTime - now) / (1000 * 60 * 60);

    // Administrator może odwołać wizytę o dowolnej porze, pacjent wyłącznie >= 24h
    if (!isAdmin && hoursRemaining < 24) {
      return json({
        error: "Do wizyty zostało mniej niż 24 godziny. Samodzielne odwołanie wizyty nie jest już możliwe. Prosimy o bezpośredni kontakt telefoniczny z gabinetem (tel. +48 729 933 833)."
      }, 400);
    }

    // 8. Wywołanie Cal.com API v2 z nagłówkiem cal-api-version: 2026-02-25
    const reasonText = cancellationReason || "Odwołano przez pacjenta w panelu pacjenta";

    if (booking.external_id) {
      if (!CALCOM_API_KEY) {
        console.warn("OSTRZEŻENIE: Brak zmiennej CALCOM_API_KEY w środowisku Edge Function. Pomijanie odwołania w Cal.com.");
      } else {
        try {
          console.log(`Wywołuję Cal.com API v2 cancel dla booking external_id: ${booking.external_id}...`);
          const calResponse = await fetch(`https://api.cal.com/v2/bookings/${booking.external_id}/cancel`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${CALCOM_API_KEY}`,
              "cal-api-version": "2026-02-25",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cancellationReason: reasonText,
            }),
          });

          const calData = await calResponse.json().catch(() => null);
          console.log(`Odpowiedź Cal.com API (${calResponse.status}):`, JSON.stringify(calData));

          if (!calResponse.ok) {
            console.error(`Błąd anulowania w Cal.com API (${calResponse.status}):`, calData);
            // Nie przerywamy, aby umożliwić spójność w bazie nawet gdyby Cal.com zwrócił np. błąd 404
          }
        } catch (calErr) {
          console.error("Wyjątek podczas wywołania Cal.com API:", calErr);
        }
      }
    }

    // 9. Ustalenie statusu anulowania oraz statusu płatności
    const { data: cancelledStatus, error: statusErr } = await supabaseAdmin
      .from("booking_statuses")
      .select("id")
      .eq("name", "cancelled")
      .single();

    if (statusErr || !cancelledStatus) {
      throw new Error("Nie znaleziono statusu rezerwacji 'cancelled' w bazie");
    }

    const currentPaymentName = (booking.payment_statuses as any)?.name;
    let newPaymentStatusId = booking.payment_status_id;

    // Jeśli wizyta była opłacona online -> oznacz jako 'refund_pending'
    if (currentPaymentName === "paid_online") {
      const { data: refundPendingStatus, error: refundErr } = await supabaseAdmin
        .from("payment_statuses")
        .select("id")
        .eq("name", "refund_pending")
        .single();

      if (!refundErr && refundPendingStatus) {
        newPaymentStatusId = refundPendingStatus.id;
      } else {
        console.error("Nie znaleziono statusu 'refund_pending' w tabeli payment_statuses:", refundErr);
      }
    }

    // 10. Aktualizacja rekordu rezerwacji w Supabase
    const { data: updatedBooking, error: updateErr } = await supabaseAdmin
      .from("bookings")
      .update({
        status_id: cancelledStatus.id,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reasonText,
        payment_status_id: newPaymentStatusId,
      })
      .eq("id", booking.id)
      .select(`
        id,
        scheduled_at,
        status_id,
        payment_status_id,
        cancelled_at,
        cancellation_reason,
        booking_statuses(name, label),
        payment_statuses(name, label)
      `)
      .single();

    if (updateErr) {
      console.error("Błąd aktualizacji rezerwacji w bazie:", updateErr);
      throw updateErr;
    }

    return json({
      success: true,
      message: "Wizyta została pomyślnie anulowana",
      booking: updatedBooking,
    }, 200);

  } catch (error) {
    const err = error as Error;
    console.error("Krytyczny błąd w calcom-cancel-booking:", err);
    return json({ error: err.message || "Wystąpił nieoczekiwany błąd serwera" }, 500);
  }
});
