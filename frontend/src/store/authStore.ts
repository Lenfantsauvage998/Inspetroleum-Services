import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Role } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      clearAuth: () => set({ user: null, isAuthenticated: false, isLoading: false }),
      isAdmin: () => (get().user?.role as Role) === 'admin',
    }),
    {
      name: 'auth-storage',
      // Persist identity for fast navbar render on load.
      // SECURITY: role is always stored as 'user' — never trust localStorage for role.
      // AuthContext re-fetches the real role from the server on every session restore.
      partialize: (state) => ({
        user: state.user ? { ...state.user, role: 'user' as Role } : null,
        isAuthenticated: state.isAuthenticated,
      }),
      // SECURITY: on rehydration, strip any tampered role from localStorage.
      // Even if someone edits auth-storage manually, role is reset to 'user'
      // until the live server response sets the real value.
      merge: (persisted, current) => {
        const p = persisted as Partial<typeof current>
        return {
          ...current,
          isAuthenticated: p.isAuthenticated ?? false,
          user: p.user ? { ...p.user, role: 'user' as Role } : null,
        }
      },
    }
  )
)
