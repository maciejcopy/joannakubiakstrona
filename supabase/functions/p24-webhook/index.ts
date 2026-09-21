import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const P24_MERCHANT_ID = Deno.env.get("P24_MERCHANT_ID")!;
const P24_CRC_KEY = Deno.env.get("P24_CRC_KEY")!;
const P24_REPORT_KEY = Deno.env.get("P24_REPORT_KEY")!;
const P24_API_BASE = "https://sandbox.przelewy24.pl/api/v1"; // TODO: zmienić na produkcję w kroku 6

const PAID_ONLINE_STATUS_ID = "19b434c2-935f-4328-987e-b34cf489ed22";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function sha384Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-384", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {
  try {
    const body = await req.json();
    const { merchantId, posId, sessionId, amount, originAmount, currency, orderId, methodId, statement, sign } = body;

    const expectedSign = await sha384Hex(JSON.stringify({
      merchantId, posId, sessionId, amount, originAmount, currency, orderId, methodId, statement,
      crc: P24_CRC_KEY,
    }));

    if (expectedSign !== sign) {
      console.error("Nieprawidłowy podpis webhooka P24");
      return new Response("Invalid sign", { status: 400 });
    }

    const verifySign = await sha384Hex(JSON.stringify({ sessionId, orderId, amount, currency, crc: P24_CRC_KEY }));
    const authHeader = "Basic " + btoa(`${P24_MERCHANT_ID}:${P24_REPORT_KEY}`);

    const verifyResponse = await fetch(`${P24_API_BASE}/transaction/verify`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      body: JSON.stringify({
        merchantId: Number(P24_MERCHANT_ID),
        posId: Number(P24_MERCHANT_ID),
        sessionId, amount, currency, orderId, sign: verifySign,
      }),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || verifyData?.data?.status !== "success") {
      console.error("Błąd weryfikacji transakcji P24:", verifyData);
      return new Response("Verify failed", { status: 400 });
    }

    // Wyciągnięcie prawdziwego bookingId (obsługa zarówno "id" jak i "id__timestamp")
    const bookingId = typeof sessionId === "string" && sessionId.includes("__")
      ? sessionId.split("__")[0]
      : sessionId;

    console.log(`P24 webhook zweryfikowany pomyślnie dla sessionId: ${sessionId}, aktualizacja bookingId: ${bookingId}`);

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ payment_status_id: PAID_ONLINE_STATUS_ID })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Błąd aktualizacji bookings:", updateError);
      return new Response("DB update failed", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("p24-webhook error:", err);
    return new Response("Server error", { status: 500 });
  }
});
