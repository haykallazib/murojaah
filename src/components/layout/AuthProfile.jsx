import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useAuthSession } from '../../hooks/useAuthSession.js'

export function AuthProfile() {
  const { user, signOut } = useAuthSession()
  const [error, setError] = useState('')

  const handleSignOut = async () => {
    try {
      await signOut()
      setError('')
    } catch (signOutError) {
      setError(signOutError.message || 'Tidak dapat keluar dari akun.')
    }
  }

  if (!user) return null

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Pengguna'
  const initials = Array.from(displayName.trim())[0]?.toLocaleUpperCase() ?? 'U'

  return (
    <div className="rounded-xl border border-white/[.07] bg-white/[.035] p-3 shadow-[inset_0_1px_rgba(255,255,255,.035)]">
      <div className="flex min-w-0 items-center gap-3">
        {user.user_metadata?.avatar_url || user.user_metadata?.picture
          ? <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="" referrerPolicy="no-referrer" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
          : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-400/10 font-semibold text-teal-200">{initials}</span>}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-slate-200">{displayName}</p>
          <p className="truncate text-[10px] text-slate-500">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Keluar dari akun"
          title="Keluar"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-rose-400/10 bg-rose-500/10 px-2.5 text-[10px] font-medium text-rose-300 transition hover:border-rose-400/20 hover:bg-rose-500/20"
        >
          <LogOut size={14} />
          <span>Keluar</span>
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-[10px] leading-4 text-rose-300">{error}</p>}
    </div>
  )
}
