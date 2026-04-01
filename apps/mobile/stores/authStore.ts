import { create } from 'zustand'
import { Session, User } from '@supabase/supabase-js'
import { supabase, Profile } from '../lib/supabase'

type AuthState = {
  session: Session | null
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isInitialized: boolean

  // Actions
  initialize: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (data: Partial<Pick<Profile, 'username' | 'display_name' | 'bio' | 'avatar_url' | 'is_public'>>) => Promise<{ error: string | null }>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null, isInitialized: true })

    if (session?.user) {
      await get().refreshProfile()
    }

    // Ascolta i cambiamenti di sessione
    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user ?? null })
      if (session?.user) {
        await get().refreshProfile()
      } else {
        set({ profile: null })
      }
    })
  },

  signInWithEmail: async (email, password) => {
    set({ isLoading: true })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    set({ isLoading: false })
    return { error: error?.message ?? null }
  },

  signUpWithEmail: async (email, password) => {
    set({ isLoading: true })
    const { error } = await supabase.auth.signUp({ email, password })
    set({ isLoading: false })
    return { error: error?.message ?? null }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true })
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'fitduel://auth/callback',
      },
    })
    set({ isLoading: false })
    return { error: error?.message ?? null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null, profile: null })
  },

  refreshProfile: async () => {
    const { user } = get()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) set({ profile: data as Profile })
  },

  updateProfile: async (data) => {
    const { user } = get()
    if (!user) return { error: 'Non autenticato' }

    const { error } = await supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (!error) await get().refreshProfile()
    return { error: error?.message ?? null }
  },
}))
