import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// Adapter SecureStore per persistenza sicura del token JWT
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Tipi database derivati dallo schema PRD
export type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  is_public: boolean
  level: number
  total_reps: number
  wins: number
  losses: number
  current_streak: number
  best_streak: number
  created_at: string
  updated_at: string
}

export type ExerciseType = 'pushup' | 'squat' | 'situp' | 'jumpingjack' | 'burpee'

export type Performance = {
  id: string
  user_id: string
  exercise_type: ExerciseType
  reps: number
  duration_seconds: number
  avg_quality: number | null
  video_url: string | null
  is_public: boolean
  challenge_id: string | null
  duel_id: string | null
  created_at: string
}

export type DuelStatus = 'pending' | 'accepted' | 'active' | 'completed' | 'expired' | 'declined'

export type Duel = {
  id: string
  challenger_id: string
  challenged_id: string
  exercise_type: ExerciseType
  status: DuelStatus
  expires_at: string
  challenger_reps: number | null
  challenged_reps: number | null
  winner_id: string | null
  created_at: string
  completed_at: string | null
}
