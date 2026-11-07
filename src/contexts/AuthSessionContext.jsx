import { useEffect, useMemo, useRef, useState } from 'react'
import { AuthSessionContext } from './authSessionContext.js'
import { supabase, supabaseConfigurationError } from '../utils/supabase.js'

export function AuthSessionProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [authError, setAuthError] = useState(supabaseConfigurationError)
  const [passwordRecovery, setPasswordRecovery] = useState(false)
  const suppressSignupSession = useRef(false)
  useEffect(() => {
    if (!supabase) {
      setAuthReady(true)
      return undefined
    }

    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (active) {
        if (!(suppressSignupSession.current && event === 'SIGNED_IN')) {
          setUser(session?.user ?? null)
        }
        if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true)
        if (event === 'SIGNED_OUT') setPasswordRecovery(false)
        setAuthError('')
        setAuthReady(true)
      }
    })

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return
        if (error) throw error
        if (!suppressSignupSession.current) {
          setUser(data.session?.user ?? null)
        }
        setAuthReady(true)
      })
      .catch((error) => {
        if (!active) return
        setAuthError(`Sesi Supabase tidak dapat dimuat: ${error.message}`)
        setAuthReady(true)
      })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(() => ({
    user,
    authReady,
    authError,
    passwordRecovery,
    signInWithPassword: async ({ email, password }) => {
      if (!supabase) throw new Error(supabaseConfigurationError)
      suppressSignupSession.current = false
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    signUpWithPassword: async ({ name, email, password }) => {
      if (!supabase) throw new Error(supabaseConfigurationError)
      suppressSignupSession.current = true
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) throw error
      if (data.session) {
        const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' })
        if (signOutError) throw signOutError
      }
      return { needsEmailConfirmation: !data.session }
    },
    resendSignupConfirmation: async ({ email }) => {
      if (!supabase) throw new Error(supabaseConfigurationError)
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) throw error
    },
    requestPasswordReset: async ({ email }) => {
      if (!supabase) throw new Error(supabaseConfigurationError)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      })
      if (error) throw error
    },
    updatePassword: async ({ password }) => {
      if (!supabase) throw new Error(supabaseConfigurationError)
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
    },
    signInWithGoogle: async () => {
      if (!supabase) throw new Error(supabaseConfigurationError)
      suppressSignupSession.current = false
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      })
      if (error) throw error
    },
    signOut: async () => {
      if (!supabase) throw new Error(supabaseConfigurationError)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  }), [authError, authReady, passwordRecovery, user])

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
}
