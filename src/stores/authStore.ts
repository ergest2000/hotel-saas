import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'guest' | 'receptionist' | 'staff' | 'hr' | 'admin' | 'superadmin'

export interface UserProfile {
  id: string
  hotel_id: string | null
  full_name: string
  avatar_url: string | null
  role: UserRole
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (v: boolean) => void
  setInitialized: (v: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  reset: () => set({ user: null, profile: null }),
}))

export async function initAuth() {
  const store = useAuthStore.getState()
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      store.setUser(session.user)
      await loadProfile(session.user.id)
    }
  } finally {
    store.setLoading(false)
    store.setInitialized(true)
  }

  supabase.auth.onAuthStateChange(async (event, session) => {
    const s = useAuthStore.getState()
    if (event === 'SIGNED_IN' && session?.user) {
      s.setUser(session.user)
      await loadProfile(session.user.id)
    }
    if (event === 'SIGNED_OUT') s.reset()
    if (event === 'TOKEN_REFRESHED' && session?.user) s.setUser(session.user)
  })
}

async function loadProfile(userId: string) {
  const store = useAuthStore.getState()
  try {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    store.setProfile(data)
  } catch {
    store.setProfile(null)
  }
}

export function getRedirectPath(role: UserRole): string {
  return role === 'guest' ? '/booking' : '/admin'
}
