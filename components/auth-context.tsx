"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const mockUser: User = {
  id: 'mock-user-id',
  email: 'test@zhyto.london',
  user_metadata: { full_name: 'Test User' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  role: 'authenticated',
} as User

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      // Mock mode — check localStorage for mock session
      const saved = localStorage.getItem('zhyto-mock-user')
      if (saved === 'true') setUser(mockUser)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const userId = session.user.id
        supabase.from('profiles').select('id').eq('id', userId).maybeSingle().then(({ data }) => {
          if (!data) {
            supabase.from('profiles').insert({ id: userId, role: 'user' }).then()
          }
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    if (!supabase) {
      localStorage.setItem('zhyto-mock-user', 'true')
      setUser(mockUser)
      return
    }
    try {
      await supabase.auth.signInWithOAuth({ provider: 'google' })
    } catch {
      toast.error('Google sign-in failed. Please try again.')
    }
  }

  const signInWithApple = async () => {
    if (!supabase) {
      localStorage.setItem('zhyto-mock-user', 'true')
      setUser(mockUser)
      return
    }
    try {
      await supabase.auth.signInWithOAuth({ provider: 'apple' })
    } catch {
      toast.error('Apple sign-in failed. Please try again.')
    }
  }

  const signOut = async () => {
    localStorage.removeItem('zhyto-mock-user')
    if (!supabase) { setUser(null); return }
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithApple, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
