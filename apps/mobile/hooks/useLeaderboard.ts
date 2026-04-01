import { useQuery } from '@tanstack/react-query'
import { supabase, ExerciseType } from '../lib/supabase'

type LeaderboardEntry = {
  rank: number
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  total_reps: number
  best_single: number
}

function getWeekStart(date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // lunedì
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export function useLeaderboard(exerciseType: ExerciseType, limit = 100) {
  const weekStart = getWeekStart()

  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', exerciseType, weekStart],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_weekly_leaderboard', {
        p_exercise_type: exerciseType,
        p_week_start: weekStart,
        p_limit: limit,
        p_offset: 0,
      })
      if (error) throw error
      return data ?? []
    },
    staleTime: 1000 * 60 * 5, // 5 minuti
  })
}
