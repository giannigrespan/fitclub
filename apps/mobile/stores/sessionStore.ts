import { create } from 'zustand'
import { ExerciseType } from '../lib/supabase'

// Stato della sessione di allenamento in corso (offline-first)
type RepState = 'IDLE' | 'DOWN' | 'UP'

type WorkoutSession = {
  exerciseType: ExerciseType | null
  reps: number
  repState: RepState
  startedAt: number | null
  isActive: boolean
}

type SessionState = WorkoutSession & {
  startSession: (exerciseType: ExerciseType) => void
  incrementRep: () => void
  updateRepState: (state: RepState) => void
  endSession: () => WorkoutSession
  resetSession: () => void
}

const defaultSession: WorkoutSession = {
  exerciseType: null,
  reps: 0,
  repState: 'IDLE',
  startedAt: null,
  isActive: false,
}

export const useSessionStore = create<SessionState>((set, get) => ({
  ...defaultSession,

  startSession: (exerciseType) => {
    set({ exerciseType, reps: 0, repState: 'IDLE', startedAt: Date.now(), isActive: true })
  },

  incrementRep: () => {
    set((s) => ({ reps: s.reps + 1, repState: 'UP' }))
  },

  updateRepState: (repState) => {
    set({ repState })
  },

  endSession: () => {
    const current = get()
    const snapshot = { ...current }
    set({ isActive: false })
    return snapshot
  },

  resetSession: () => {
    set(defaultSession)
  },
}))
