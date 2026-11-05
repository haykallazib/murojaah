import { useContext } from 'react'
import { AuthSessionContext } from '../contexts/authSessionContext.js'

export function useAuthSession() {
  const context = useContext(AuthSessionContext)
  if (!context) throw new Error('useAuthSession harus digunakan di dalam AuthSessionProvider.')
  return context
}
