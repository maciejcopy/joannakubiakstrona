import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, phone, message } = await req.json()

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Brakuje wymaganych pól' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get environment variables
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const TO_EMAIL = 'kontakt@joannakubiakpsycholog.pl'

    // TYMCZASOWO: Wklej tutaj swój klucz API z Resend (zaczyna się od "re_")
    const RESEND_API_KEY_TEMP = 'WKLEJ_TUTAJ_SWOJ_PRAWDZIWY_KLUCZ_API'
    const API_KEY = RESEND_API_KEY || RESEND_API_KEY_TEMP

    // Email content
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2F5C3A; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #2F5C3A; }
          .footer { background-color: #FBF4E8; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Nowa wiadomość z formularza kontaktowego</h2>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Imię i nazwisko:</span><br>
              ${name}
            </div>
            <div class="field">
              <span class="label">Email:</span><br>
              <a href="mailto:${email}">${email}</a>
            </div>
            <div class="field">
              <span class="label">Telefon:</span><br>
              ${phone || 'Nie podano'}
            </div>
            <div class="field">
              <span class="label">Wiadomość:</span><br>
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <div class="footer">
            <p>Wiadomość wysłana ze strony joannakubiakpsycholog.pl</p>
            <p>Data: ${new Date().toLocaleString('pl-PL')}</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email using Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Joanna Kubiak - Strona internetowa <onboarding@resend.dev>',
        to: [TO_EMAIL],
        reply_to: email,
        subject: `Nowa wiadomość od ${name}`,
        html: emailContent,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData)
      return new Response(
        JSON.stringify({ 
          error: 'Wystąpił błąd podczas wysyłania wiadomości' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Email sent successfully:', resendData.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Wiadomość została wysłana pomyślnie',
        emailId: resendData.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Wystąpił błąd podczas wysyłania wiadomości' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})