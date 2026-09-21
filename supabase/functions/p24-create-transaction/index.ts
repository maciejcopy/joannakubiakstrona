import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const P24_MERCHANT_ID = Deno.env.get("P24_MERCHANT_ID")!;
const P24_CRC_KEY = Deno.env.get("P24_CRC_KEY")!;
const P24_REPORT_KEY = Deno.env.get("P24_REPORT_KEY")!;
const P24_API_BASE = "https://sandbox.przelewy24.pl/api/v1"; // TODO: zmienić na produkcję w kroku 6
const URL_RETURN_DEFAULT = "https://joannakubiakpsycholog.pl/panel/pacjent/dashboard";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function sha384Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-384", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function findBookingWithRetry(externalId: string, retries = 15, delayMs = 600) {
  for (let i = 0; i < retries; i++) {
    const { data } = await supabase
      .from("bookings")
      .select("id, visit_type_id, client_id")
      .eq("external_id", externalId)
      .maybeSingle();
    if (data) return data;
    await new Promise((res) => setTimeout(res, delayMs));
  }
  return null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { external_id, bookingId, booking_id, profile_id, visit_type_id, scheduled_at, return_url } = body;
    const targetBookingId = bookingId || booking_id;

    if (!external_id && !targetBookingId) {
      return json({ error: "Wymagany parametr 'external_id' lub 'bookingId'" }, 400);
    }

    let booking: { id: string; visit_type_id: string; client_id: string } | null = null;

    // 1. Jeśli przekazano bezpośrednio ID rezerwacji (np. z panelu pacjenta)
    if (targetBookingId) {
      const { data: bData } = await supabase
        .from("bookings")
        .select("id, visit_type_id, client_id")
        .eq("id", targetBookingId)
        .maybeSingle();
      booking = bData;
    }

    // 2. W przeciwnym razie szukamy po external_id z Cal.com
    if (!booking && external_id) {
      booking = await findBookingWithRetry(external_id, 15, 600);
    }

    // 3. Jeśli webhook Cal.com jeszcze nie dotarł, a klient przekazał dane, utwórz rezerwację awaryjnie (fallback)
    if (!booking && external_id && profile_id && visit_type_id) {
      console.log("Rezerwacja nie dotarła z webhooka na czas. Tworzenie awaryjne dla external_id:", external_id);

      const { data: confirmedStatus } = await supabase
        .from("booking_statuses")
        .select("id")
        .eq("name", "confirmed")
        .maybeSingle();

      const { data: unpaidPayment } = await supabase
        .from("payment_statuses")
        .select("id")
        .eq("name", "unpaid")
        .maybeSingle();

      const { data: onlineLocation } = await supabase
        .from("location_types")
        .select("id")
        .eq("name", "online")
        .maybeSingle();

      const { data: officeLocation } = await supabase
        .from("location_types")
        .select("id")
        .eq("name", "office")
        .maybeSingle();

      const { data: insertedBooking, error: insertError } = await supabase
        .from("bookings")
        .upsert(
          {
            client_id: profile_id,
            visit_type_id,
            scheduled_at: scheduled_at || new Date().toISOString(),
            status_id: confirmedStatus?.id,
            payment_status_id: unpaidPayment?.id,
            location_id: onlineLocation?.id || officeLocation?.id,
            source: "website",
            external_id,
          },
          { onConflict: "external_id" }
        )
        .select("id, visit_type_id, client_id")
        .single();

      if (insertError) {
        console.error("Błąd awaryjnego tworzenia rezerwacji:", insertError);
      } else {
        booking = insertedBooking;
      }
    }

    if (!booking) {
      return json({ error: "Nie znaleziono rezerwacji" }, 404);
    }

    const { data: visitType, error: visitTypeError } = await supabase
      .from("visit_types")
      .select("title, price")
      .eq("id", booking.visit_type_id)
      .single();

    if (visitTypeError || !visitType) {
      return json({ error: "Nie znaleziono typu wizyty" }, 404);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", booking.client_id)
      .single();

    if (profileError || !profile) {
      return json({ error: "Nie znaleziono profilu klienta" }, 404);
    }

    const sessionId = `${booking.id}__${Date.now()}`;
    const amount = Math.round(Number(visitType.price) * 100);
    const currency = "PLN";

    const sign = await sha384Hex(
      JSON.stringify({
        sessionId,
        merchantId: Number(P24_MERCHANT_ID),
        amount,
        currency,
        crc: P24_CRC_KEY,
      })
    );

    const effectiveReturnUrl =
      return_url ||
      (req.headers.get("origin")
        ? `${req.headers.get("origin")}/panel/pacjent/dashboard`
        : URL_RETURN_DEFAULT);

    const registerBody = {
      merchantId: Number(P24_MERCHANT_ID),
      posId: Number(P24_MERCHANT_ID),
      sessionId,
      amount,
      currency,
      description: visitType.title,
      email: profile.email,
      client: profile.full_name,
      country: "PL",
      language: "pl",
      urlReturn: effectiveReturnUrl,
      urlStatus: `${SUPABASE_URL}/functions/v1/p24-webhook`,
      sign,
    };

    const authHeader = "Basic " + btoa(`${P24_MERCHANT_ID}:${P24_REPORT_KEY}`);

    const p24Response = await fetch(`${P24_API_BASE}/transaction/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      body: JSON.stringify(registerBody),
    });

    const p24Data = await p24Response.json();

    if (!p24Response.ok || !p24Data?.data?.token) {
      console.error("P24 register error:", p24Data);
      return json({ error: "Błąd rejestracji transakcji P24", details: p24Data }, 502);
    }

    return json({ redirectUrl: `https://sandbox.przelewy24.pl/trnRequest/${p24Data.data.token}` });
  } catch (err) {
    console.error("p24-create-transaction error:", err);
    return json({ error: "Błąd serwera" }, 500);
  }
});
