import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const CALCOM_API_KEY = Deno.env.get("CALCOM_API_KEY") || "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "mgr Joanna Kubiak - Gabinet <kontakt@joannakubiakpsycholog.pl>";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    console.log("Rozpoczynam weryfikację nieopłaconych rezerwacji starszych niż 2 godziny...");

    // 1. Granica 2 godzin wstecz
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    // 2. Pobieramy statusy z bazy
    const { data: unpaidPaymentStatus } = await supabaseAdmin
      .from("payment_statuses")
      .select("id")
      .eq("name", "unpaid")
      .single();

    const { data: confirmedBookingStatus } = await supabaseAdmin
      .from("booking_statuses")
      .select("id")
      .eq("name", "confirmed")
      .single();

    const { data: cancelledBookingStatus } = await supabaseAdmin
      .from("booking_statuses")
      .select("id")
      .eq("name", "cancelled")
      .single();

    if (!unpaidPaymentStatus || !confirmedBookingStatus || !cancelledBookingStatus) {
      throw new Error("Nie znaleziono wymaganych statusów rezerwacji/płatności w bazie.");
    }

    // 3. Wyszukujemy potwierdzone, ale nieopłacone rezerwacje starsze niż 2 godziny
    const { data: expiredBookings, error: fetchErr } = await supabaseAdmin
      .from("bookings")
      .select(`
        id,
        scheduled_at,
        created_at,
        external_id,
        profiles(full_name, email),
        visit_types(title)
      `)
      .eq("payment_status_id", unpaidPaymentStatus.id)
      .eq("status_id", confirmedBookingStatus.id)
      .lt("created_at", twoHoursAgo);

    if (fetchErr) {
      throw fetchErr;
    }

    console.log(`Znaleziono ${expiredBookings?.length || 0} wygasłych rezerwacji.`);

    const results = [];

    for (const booking of expiredBookings || []) {
      const reasonText = "Automatyczne anulowanie: brak płatności w regulaminowym czasie 2 godzin";

      // A. Zwalniamy slot w Cal.com
      if (booking.external_id && CALCOM_API_KEY) {
        try {
          console.log(`Anulowanie w Cal.com dla UID: ${booking.external_id}...`);
          const calRes = await fetch(`https://api.cal.com/v2/bookings/${booking.external_id}/cancel`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${CALCOM_API_KEY}`,
              "cal-api-version": "2026-02-25",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ cancellationReason: reasonText }),
          });
          const calData = await calRes.json().catch(() => null);
          console.log(`Cal.com cancel status (${calRes.status}):`, calData);
        } catch (calErr) {
          console.error(`Błąd zwalniania slotu Cal.com dla rezerwacji ${booking.id}:`, calErr);
        }
      }

      // B. Aktualizujemy rekord w Supabase
      const { error: updateErr } = await supabaseAdmin
        .from("bookings")
        .update({
          status_id: cancelledBookingStatus.id,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reasonText,
        })
        .eq("id", booking.id);

      if (updateErr) {
        console.error(`Błąd aktualizacji rezerwacji ${booking.id}:`, updateErr);
        continue;
      }

      // C. Wysyłka maila do pacjenta o anulowaniu z powodu braku płatności
      const patientEmail = (booking.profiles as any)?.email;
      const patientName = (booking.profiles as any)?.full_name || "Pacjencie";
      const visitTitle = (booking.visit_types as any)?.title || "Konsultacja indywidualna";
      const formattedDate = new Date(booking.scheduled_at).toLocaleString("pl-PL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      if (patientEmail && RESEND_API_KEY) {
        try {
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2D3748; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; background: #ffffff; }
                .header { background-color: #2F5C3A; color: white; padding: 32px 24px; text-align: center; }
                .content { padding: 32px 24px; }
                .info-box { background-color: #FFF5F5; border-left: 4px solid #E53E3E; padding: 16px; border-radius: 8px; margin: 24px 0; }
                .footer { background-color: #F7FAFC; padding: 20px; text-align: center; font-size: 12px; color: #718096; }
                .btn { display: inline-block; background-color: #2F5C3A; color: #ffffff !important; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 16px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 style="margin:0; font-weight: normal; font-size: 22px;">Informacja o anulowaniu rezerwacji</h2>
                  <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Gabinet Psychologiczny mgr Joanna Kubiak</p>
                </div>
                <div class="content">
                  <p>Dzień dobry <strong>${patientName}</strong>,</p>
                  <p>Informujemy, że Twoja rezerwacja na wizytę została <strong>anulowana</strong> z powodu nieodnotowania opłaty w regulaminowym czasie <strong>2 godzin</strong>.</p>
                  
                  <div class="info-box">
                    <p style="margin: 0; font-weight: bold; color: #9B2C2C;">Szczegóły anulowanej wizyty:</p>
                    <p style="margin: 6px 0 0 0; font-size: 14px;">
                      Usługa: <strong>${visitTitle}</strong><br>
                      Termin: <strong>${formattedDate}</strong>
                    </p>
                  </div>

                  <p>Zarezerwowany termin w kalendarzu został automatycznie zwolniony dla innych pacjentów.</p>
                  <p>Jeśli nadal potrzebujesz konsultacji, serdecznie zapraszamy do wybrania nowego dogodnego terminu na naszej stronie:</p>
                  
                  <div style="text-align: center; margin: 28px 0;">
                    <a href="https://joannakubiakpsycholog.pl/rezerwacja" class="btn">Zarezerwuj nowy termin</a>
                  </div>

                  <p style="font-size: 13px; color: #718096; margin-top: 30px;">
                    W razie pytań prosimy o bezpośredni kontakt telefoniczny z gabinetem: <strong>+48 729 933 833</strong>.
                  </p>
                </div>
                <div class="footer">
                  <p style="margin: 0;">mgr Joanna Kubiak &bull; Psycholog dziecięcy i młodzieży</p>
                  <p style="margin: 4px 0 0 0;">Wiadomość wygenerowana automatycznie przez system rezerwacji.</p>
                </div>
              </div>
            </body>
            </html>
          `;

          const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: [patientEmail],
              subject: "Informacja o anulowaniu rezerwacji z powodu braku płatności",
              html: emailHtml,
            }),
          });

          console.log(`Wysłano e-mail o anulowaniu do ${patientEmail} (Status: ${emailRes.status})`);
        } catch (emailErr) {
          console.error(`Błąd wysyłki e-maila do ${patientEmail}:`, emailErr);
        }
      }

      results.push({
        bookingId: booking.id,
        scheduledAt: booking.scheduled_at,
        patientEmail,
        status: "cancelled",
      });
    }

    return json({
      success: true,
      processedCount: results.length,
      cancelledBookings: results,
    });
  } catch (error: any) {
    console.error("Błąd w cancel-expired-unpaid-bookings:", error);
    return json({ error: error.message || "Wystąpił nieoczekiwany błąd" }, 500);
  }
});
