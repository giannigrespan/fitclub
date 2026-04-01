// Supabase Edge Function — Controlla e chiude duels scaduti
// Eseguita ogni 15 minuti via Supabase Scheduled Functions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const now = new Date().toISOString()

    // Trova duels scaduti (status active/accepted, expires_at passato)
    const { data: expiredDuels, error: fetchError } = await supabase
      .from('duels')
      .select('id, challenger_id, challenged_id, challenger_reps, challenged_reps')
      .in('status', ['active', 'accepted', 'pending'])
      .lt('expires_at', now)

    if (fetchError) throw fetchError
    if (!expiredDuels || expiredDuels.length === 0) {
      return new Response(JSON.stringify({ expired: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Risolvi ogni duel scaduto
    const updates = await Promise.allSettled(
      expiredDuels.map(async (duel) => {
        const cReps = duel.challenger_reps ?? 0
        const dReps = duel.challenged_reps ?? 0

        let winner_id: string | null = null
        if (cReps > dReps) winner_id = duel.challenger_id
        else if (dReps > cReps) winner_id = duel.challenged_id
        // parità → winner_id rimane null

        const { error } = await supabase
          .from('duels')
          .update({
            status: 'expired',
            winner_id,
            completed_at: now,
          })
          .eq('id', duel.id)

        if (error) throw error
        return duel.id
      })
    )

    const successes = updates.filter((r) => r.status === 'fulfilled').length
    const failures = updates.filter((r) => r.status === 'rejected').length

    return new Response(
      JSON.stringify({ expired: successes, failed: failures }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
