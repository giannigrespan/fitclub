// Supabase Edge Function — Reset leaderboard settimanale
// Eseguita ogni lunedì 00:01 UTC via pg_cron o Supabase Scheduled Functions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXERCISE_TYPES = ['pushup', 'squat', 'situp', 'jumpingjack', 'burpee'] as const

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Calcola il lunedì della settimana corrente
    const now = new Date()
    const day = now.getUTCDay()
    const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1)
    const weekStart = new Date(now.setUTCDate(diff)).toISOString().split('T')[0]

    const results = []
    for (const exercise of EXERCISE_TYPES) {
      const { error } = await supabase.rpc('upsert_weekly_leaderboard', {
        p_exercise_type: exercise,
        p_week_start: weekStart,
      })
      results.push({ exercise, error: error?.message ?? null })
    }

    const hasErrors = results.some((r) => r.error)
    return new Response(
      JSON.stringify({ weekStart, results }),
      {
        status: hasErrors ? 207 : 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
