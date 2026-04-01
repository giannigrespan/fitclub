// Supabase Edge Function — Invio push notifications via Expo
// Chiamata internamente da altre edge functions o trigger

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type PushPayload = {
  to: string | string[]       // Expo push token(s)
  title: string
  body: string
  data?: Record<string, unknown>
  sound?: 'default' | null
  badge?: number
}

type NotificationRecord = {
  user_id: string
  type: string
  title: string
  body: string
  reference_id?: string
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

async function sendExpoPush(payloads: PushPayload[]) {
  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payloads),
  })
  return response.json()
}

Deno.serve(async (req) => {
  try {
    const body = await req.json() as {
      notification: NotificationRecord
      push_token?: string
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Salva la notifica nel DB
    const { error: dbError } = await supabase
      .from('notifications')
      .insert(body.notification)

    if (dbError) throw dbError

    // Se è disponibile un push token, invia la notifica push
    if (body.push_token) {
      await sendExpoPush([{
        to: body.push_token,
        title: body.notification.title,
        body: body.notification.body,
        sound: 'default',
        data: {
          type: body.notification.type,
          reference_id: body.notification.reference_id,
        },
      }])
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
