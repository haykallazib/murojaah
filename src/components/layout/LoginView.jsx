import { useState } from 'react'
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  Mail,
  UserRound,
} from 'lucide-react'
import { useAuthSession } from '../../hooks/useAuthSession.js'

export function LoginView({ sessionError = '', passwordRecovery = false }) {
  const {
    signInWithPassword,
    signUpWithPassword,
    resendSignupConfirmation,
    requestPasswordReset,
    updatePassword,
    signOut,
    signInWithGoogle,
    authError,
  } = useAuthSession()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [recoveryComplete, setRecoveryComplete] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(sessionError || authError)
  const [notice, setNotice] = useState('')
  const [canResendConfirmation, setCanResendConfirmation] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setCanResendConfirmation(false)
    const normalizedEmail = email.trim()

    if (isForgotPassword && !normalizedEmail) {
      setError('Masukkan email akun Anda terlebih dahulu.')
      return
    }
    if (isSignUp && !name.trim()) {
      setError('Masukkan nama lengkap Anda.')
      return
    }
    if ((isSignUp || passwordRecovery) && password.length < 8) {
      setError('Sandi harus memiliki minimal 8 karakter.')
      return
    }
    if ((isSignUp || passwordRecovery) && password !== confirmPassword) {
      setError('Konfirmasi sandi tidak cocok.')
      return
    }

    setBusy(true)
    try {
      if (passwordRecovery) {
        await updatePassword({ password })
        setPassword('')
        setConfirmPassword('')
        setRecoveryComplete(true)
        setNotice('Sandi berhasil diperbarui. Kembali ke masuk untuk menggunakan sandi baru.')
      } else if (isForgotPassword) {
        await requestPasswordReset({ email: normalizedEmail })
        setNotice('Jika email terdaftar, tautan untuk mengatur ulang sandi akan dikirim. Periksa kotak masuk dan folder spam.')
      } else if (isSignUp) {
        const { needsEmailConfirmation } = await signUpWithPassword({
          name: name.trim(),
          email: normalizedEmail,
          password,
        })
        if (needsEmailConfirmation) {
          setIsSignUp(false)
          setCanResendConfirmation(true)
          setPassword('')
          setConfirmPassword('')
          setNotice('Pendaftaran berhasil. Periksa email Anda untuk mengonfirmasi akun, lalu masuk.')
        } else {
          setIsSignUp(false)
          setCanResendConfirmation(false)
          setPassword('')
          setConfirmPassword('')
          setNotice('Akun berhasil dibuat dan Anda sudah masuk.')
        }
      } else {
        await signInWithPassword({ email: normalizedEmail, password })
      }
    } catch (authActionError) {
      if (!isSignUp && authActionError.code === 'email_not_confirmed') {
        setCanResendConfirmation(true)
        setError('Email belum dikonfirmasi. Buka tautan konfirmasi yang dikirim ke email Anda, atau kirim ulang email konfirmasi.')
      } else if (!isSignUp && authActionError.code === 'invalid_credentials') {
        setError('Email atau sandi salah. Pastikan memakai email yang sama saat mendaftar, atau pilih “Lupa sandi?” untuk membuat sandi baru.')
      } else if (
        isSignUp
        && (authActionError.code === 'over_email_send_rate_limit'
          || /email rate limit exceeded/i.test(authActionError.message || ''))
      ) {
        setError('Supabase sedang membatasi pengiriman email konfirmasi. Jangan daftar berulang kali. Akun mungkin sudah tercatat; coba masuk dengan email yang sama. Jika muncul “Email belum dikonfirmasi”, tunggu hingga batas email pulih lalu kirim ulang konfirmasi, atau minta admin proyek mengatur SMTP email di Supabase.')
      } else {
        setError(authActionError.message || 'Proses akun gagal. Silakan coba lagi.')
      }
    } finally {
      setBusy(false)
    }
  }

  const handleResendConfirmation = async () => {
    setError('')
    setNotice('')
    setBusy(true)
    try {
      await resendSignupConfirmation({ email: email.trim() })
      setNotice('Email konfirmasi berhasil dikirim ulang. Periksa kotak masuk dan folder spam Anda.')
    } catch (authActionError) {
      setError(authActionError.message || 'Email konfirmasi gagal dikirim. Silakan coba lagi nanti.')
    } finally {
      setBusy(false)
    }
  }

  const handleReturnFromRecovery = async () => {
    setError('')
    setBusy(true)
    try {
      await signOut()
      setRecoveryComplete(false)
      setNotice('Sandi berhasil diperbarui. Silakan masuk dengan sandi baru.')
    } catch (authActionError) {
      setError(authActionError.message || 'Tidak dapat kembali ke halaman masuk. Silakan muat ulang halaman.')
    } finally {
      setBusy(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setNotice('')
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch (authActionError) {
      setError(authActionError.message || 'Login Google gagal. Silakan coba lagi.')
      setBusy(false)
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-y-auto bg-[#0b0f19] px-4 py-8 text-slate-100">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="relative z-10 my-auto w-full max-w-[440px] rounded-2xl border border-white/10 bg-[#111827]/80 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:p-8">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient shadow-[0_12px_30px_-10px_rgba(34,211,238,.65),inset_0_1px_rgba(255,255,255,.35)]">
            <span className="font-arabic text-3xl text-white">م</span>
          </div>
          <p className="font-display text-lg font-semibold tracking-wide text-white">Murojaah</p>
          <p className="mt-1 text-[10px] tracking-[.22em] text-slate-500">HAFALAN AL-QUR’AN</p>
          <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-white">
            {passwordRecovery
              ? 'Atur Sandi Baru'
              : isForgotPassword
                ? 'Lupa Sandi'
                : isSignUp
                  ? 'Buat Akun Baru'
                  : 'Selamat datang'}
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-400">
            {passwordRecovery
              ? 'Buat sandi baru untuk akun Anda.'
              : isForgotPassword
                ? 'Masukkan email akun Anda untuk menerima tautan atur ulang sandi.'
                : isSignUp
                  ? 'Mulai perjalanan hafalan Al-Qur’an Anda.'
                  : 'Silakan masuk untuk melanjutkan hafalan Anda.'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {isSignUp && !passwordRecovery && (
            <label className="block text-xs font-medium text-slate-300">
              <span className="mb-2 block">Nama lengkap</span>
              <span className="relative block">
                <UserRound size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Nama lengkap"
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0b0f19]/65 pl-10 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-400/10"
                />
              </span>
            </label>
          )}

          {!passwordRecovery && (
            <label className="block text-xs font-medium text-slate-300">
              <span className="mb-2 block">Email</span>
              <span className="relative block">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nama@email.com"
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0b0f19]/65 pl-10 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-400/10"
                />
              </span>
            </label>
          )}

          {!isForgotPassword && !recoveryComplete && (
            <PasswordField
              label={passwordRecovery ? 'Sandi baru' : 'Sandi'}
              value={password}
              onChange={setPassword}
              visible={showPassword}
              onToggle={() => setShowPassword((shown) => !shown)}
              autoComplete={isSignUp || passwordRecovery ? 'new-password' : 'current-password'}
              minLength={isSignUp || passwordRecovery ? 8 : undefined}
            />
          )}

          {(isSignUp || passwordRecovery) && !recoveryComplete && (
            <PasswordField
              label="Konfirmasi sandi"
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={showPassword}
              onToggle={() => setShowPassword((shown) => !shown)}
              autoComplete="new-password"
              minLength={8}
            />
          )}

          {!recoveryComplete && (
            <button type="submit" disabled={busy || Boolean(authError)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-cyan-200/35 bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-400 px-4 text-sm font-semibold text-slate-950 shadow-[0_10px_28px_-12px_rgba(34,211,238,.75),inset_0_1px_rgba(255,255,255,.4),inset_0_-2px_rgba(8,145,178,.3)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-12px_rgba(34,211,238,.8),inset_0_1px_rgba(255,255,255,.45)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60">
              {busy ? <LoaderCircle size={16} className="animate-spin" /> : <LogIn size={16} />}
              {busy
                ? 'Memproses...'
                : passwordRecovery
                  ? 'Simpan Sandi Baru'
                  : isForgotPassword
                    ? 'Kirim Tautan'
                    : isSignUp
                      ? 'Daftar Akun'
                      : 'Masuk'}
            </button>
          )}
        </form>

        {!isSignUp && !isForgotPassword && !passwordRecovery && (
          <button
            type="button"
            onClick={() => {
              setError('')
              setNotice('')
              setIsForgotPassword(true)
              setPassword('')
            }}
            className="mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold text-cyan-300 underline decoration-cyan-300/30 underline-offset-4 transition hover:text-cyan-100"
          >
            Lupa sandi?
          </button>
        )}
        {recoveryComplete && (
          <button
            type="button"
            onClick={handleReturnFromRecovery}
            disabled={busy}
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-400 px-4 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {busy ? 'Memproses...' : 'Kembali ke Masuk'}
          </button>
        )}

        {(error || authError || sessionError) && (
          <p role="alert" className="mt-4 rounded-xl border border-rose-300/15 bg-rose-300/[.05] px-3 py-2.5 text-xs leading-5 text-rose-200">
            {error || authError || sessionError}
          </p>
        )}
        {notice && (
          <p role="status" className="mt-4 rounded-xl border border-emerald-300/15 bg-emerald-300/[.05] px-3 py-2.5 text-xs leading-5 text-emerald-100">
            {notice}
          </p>
        )}
        {canResendConfirmation && !isSignUp && !isForgotPassword && (
          <button
            type="button"
            onClick={handleResendConfirmation}
            disabled={busy || Boolean(authError) || !email.trim()}
            className="mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold text-cyan-300 underline decoration-cyan-300/30 underline-offset-4 transition hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Mengirim...' : 'Kirim ulang email konfirmasi'}
          </button>
        )}

        <div className="my-6 flex items-center gap-3 text-[10px] tracking-wide text-slate-500">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <span className="shrink-0">Atau lanjutkan dengan</span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={busy || Boolean(authError)}
          className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[.045] px-4 text-sm font-semibold text-slate-100 shadow-[inset_0_1px_rgba(255,255,255,.05)] transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[.075] hover:shadow-[0_10px_28px_-16px_rgba(255,255,255,.28)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <LoaderCircle size={16} className="animate-spin text-slate-300" /> : <GoogleMark />}
          Masuk dengan Google
        </button>

        {!passwordRecovery && (
          <p className="mt-6 text-center text-xs text-slate-400">
            {isForgotPassword ? 'Sudah ingat sandi?' : isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(isForgotPassword ? false : !isSignUp)
                setIsForgotPassword(false)
                setError('')
                setNotice('')
                setCanResendConfirmation(false)
                setPassword('')
                setConfirmPassword('')
              }}
              className="rounded-sm font-semibold text-cyan-300 underline decoration-cyan-300/30 underline-offset-4 transition hover:text-cyan-100 hover:decoration-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40"
            >
              {isForgotPassword ? 'Masuk' : isSignUp ? 'Masuk' : 'Daftar'}
            </button>
          </p>
        )}
      </section>
    </main>
  )
}

function PasswordField({ label, value, onChange, visible, onToggle, autoComplete, minLength }) {
  return (
    <label className="block text-xs font-medium text-slate-300">
      <span className="mb-2 block">{label}</span>
      <span className="relative block">
        <LockKeyhole size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={label === 'Sandi' ? 'Masukkan sandi' : 'Ulangi sandi'}
          className="h-12 w-full rounded-xl border border-white/10 bg-[#0b0f19]/65 pl-10 pr-11 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-400/10"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
    </label>
  )
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5 shrink-0">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5h6.6c3.9-3.6 6.1-8.8 6.1-14.9Z" />
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20 20 0 0 0 24 44Z" />
      <path fill="#FBBC05" d="M12.6 27.7a12 12 0 0 1 0-7.4v-5.2H5.8a20 20 0 0 0 0 17.8l6.8-5.2Z" />
      <path fill="#EA4335" d="M24 11.9c3 0 5.7 1 7.8 3.1l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.8 15.1l6.8 5.2c1.6-4.8 6.1-8.4 11.4-8.4Z" />
    </svg>
  )
}
