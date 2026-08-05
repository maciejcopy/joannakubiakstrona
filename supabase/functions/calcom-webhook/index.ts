import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("Otrzymano webhook z Cal.com:", JSON.stringify(body));

    // Cal.com wysyła typ zdarzenia w triggerEvent (np. BOOKING_CREATED)
    const triggerEvent = body.triggerEvent || body.trigger || body.type;
    const payload = body.payload;

    if (!payload) {
      return new Response(JSON.stringify({ error: "Brak payload w zdarzeniu" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const bookingUid = payload.uid;
    const startTime = payload.startTime;

    // Pobranie słowników z bazy (statusy, lokalizacje)
    const { data: confirmedStatus } = await supabase.from('booking_statuses').select('id').eq('name', 'confirmed').single();
    const { data: cancelledStatus } = await supabase.from('booking_statuses').select('id').eq('name', 'cancelled').single();
    const { data: unpaidPayment } = await supabase.from('payment_statuses').select('id').eq('name', 'unpaid').single();
    const { data: onlineLocation } = await supabase.from('location_types').select('id').eq('name', 'online').single();
    const { data: officeLocation } = await supabase.from('location_types').select('id').eq('name', 'office').single();

    if (triggerEvent === 'BOOKING_CREATED') {
      // 1. Ustalenie klienta (profileId)
      let clientId = payload.metadata?.userId || payload.metadata?.clientId;
      const attendee = payload.attendees?.[0];
      const attendeeEmail = attendee?.email;
      const attendeeName = attendee?.name || "Pacjent Cal.com";
      const attendeePhone = attendee?.phoneNumber || attendee?.phone || "";

      // Jeśli nie ma clientId w metadanych (np. ktoś zarezerwował bezpośrednio z cal.com)
      if (!clientId && attendeeEmail) {
        // Spróbuj znaleźć po adresie e-mail
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', attendeeEmail)
          .maybeSingle();

        if (existingProfile) {
          clientId = existingProfile.id;
        } else {
          // Jeśli profil nie istnieje, stwórzmy nowy profil offline dla pacjenta
          const { data: newProfile, error: profileErr } = await supabase
            .from('profiles')
            .insert({
              full_name: attendeeName,
              email: attendeeEmail,
              phone_number: attendeePhone,
              role: 'client'
            })
            .select()
            .single();

          if (profileErr) {
            console.error("Błąd podczas tworzenia profilu dla webhooka:", profileErr);
            throw profileErr;
          }
          clientId = newProfile.id;
        }
      }

      // 2. Ustalenie typu wizyty (visitTypeId)
      let visitTypeId = payload.metadata?.visitTypeId;

      if (!visitTypeId) {
        // Spróbuj dopasować typ usługi po tytule/nazwie z Cal.com
        const eventTitle = payload.type || payload.title || '';
        const { data: matchedVisitType } = await supabase
          .from('visit_types')
          .select('id')
          .ilike('title', `%${eventTitle}%`)
          .maybeSingle();

        if (matchedVisitType) {
          visitTypeId = matchedVisitType.id;
        } else {
          // Pobierz pierwszy dowolny aktywny typ wizyty jako fallback
          const { data: fallbackType } = await supabase
            .from('visit_types')
            .select('id')
            .eq('is_active', true)
            .limit(1)
            .single();
          visitTypeId = fallbackType?.id;
        }
      }

      if (!clientId || !visitTypeId) {
        throw new Error(`Nie udało się przypisać klienta (${clientId}) lub typu wizyty (${visitTypeId})`);
      }

      // 3. Wybór lokalizacji (jeśli w tytule jest 'gabinet', to office, domyślnie online)
      const isOffice = (payload.type || payload.title || '').toLowerCase().includes('gabinet');
      const locationId = isOffice ? (officeLocation?.id || onlineLocation?.id) : (onlineLocation?.id || officeLocation?.id);

      // 4. Zapisanie rezerwacji (upsert po external_id na wypadek ponownego wysłania webhooka)
      const { data: savedBooking, error: bookingErr } = await supabase
        .from('bookings')
        .upsert({
          client_id: clientId,
          visit_type_id: visitTypeId,
          scheduled_at: startTime,
          status_id: confirmedStatus?.id,
          payment_status_id: unpaidPayment?.id,
          location_id: locationId,
          source: 'website',
          external_id: bookingUid
        }, { onConflict: 'external_id' })
        .select()
        .single();

      if (bookingErr) {
        console.error("Błąd zapisu rezerwacji:", bookingErr);
        throw bookingErr;
      }

      console.log("Pomyślnie utworzono/zaktualizowano rezerwację z Cal.com:", savedBooking);

    } else if (triggerEvent === 'BOOKING_CANCELLED') {
      // Odbiór anulowania rezerwacji
      const { data: cancelledBooking, error: cancelErr } = await supabase
        .from('bookings')
        .update({
          status_id: cancelledStatus?.id,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: payload.rejectionReason || payload.cancellationReason || "Anulowano przez Cal.com"
        })
        .eq('external_id', bookingUid)
        .select()
        .maybeSingle();

      if (cancelErr) {
        console.error("Błąd anulowania rezerwacji:", cancelErr);
        throw cancelErr;
      }

      console.log("Anulowano rezerwację w Supabase:", cancelledBooking);

    } else if (triggerEvent === 'BOOKING_RESCHEDULED') {
      // Odbiór zmiany terminu
      const { data: rescheduledBooking, error: rescheduleErr } = await supabase
        .from('bookings')
        .update({
          scheduled_at: startTime,
          status_id: confirmedStatus?.id // Na wypadek gdyby status był inny
        })
        .eq('external_id', bookingUid)
        .select()
        .maybeSingle();

      if (rescheduleErr) {
        console.error("Błąd zmiany terminu rezerwacji:", rescheduleErr);
        throw rescheduleErr;
      }

      console.log("Zmieniono termin rezerwacji w Supabase:", rescheduledBooking);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const err = error as Error;
    console.error("Błąd krytyczny webhooka:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
