import { useEffect, useRef, useState } from 'react'
import { Bell, BellOff, Check, Menu, X } from 'lucide-react'
import { getSurah } from '../../utils/quranData.js'

const SCHEDULES_KEY = 'murojaah-schedules'
const NOTIFICATIONS_ENABLED_KEY = 'murojaah-notifications-enabled'
const SENT_REMINDERS_KEY = 'murojaah-sent-reminders'

function getNotificationPermission() {
  return 'Notification' in window ? window.Notification.permission : 'unsupported'
}

function getNotificationsEnabled() {
  try {
    return window.localStorage.getItem(NOTIFICATIONS_ENABLED_KEY) === 'true'
  } catch {
    return false
  }
}

export function Navbar({ onMenuClick, activeTab = 'Tes Hafalan' }) {
  const [today, setToday] = useState(() => new Date())
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [permission, setPermission] = useState(getNotificationPermission)
  const [notificationsEnabled, setNotificationsEnabled] = useState(getNotificationsEnabled)
  const [notificationError, setNotificationError] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const notificationPanelRef = useRef(null)

  useEffect(() => {
    const intervalId = window.setInterval(() => setToday(new Date()), 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (!notificationOpen) return undefined
    const closeOnOutsideClick = (event) => {
      if (!notificationPanelRef.current?.contains(event.target)) setNotificationOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setNotificationOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [notificationOpen])

  useEffect(() => {
    if (!notificationsEnabled || permission !== 'granted') return undefined

    const checkSchedules = () => {
      let schedules
      try {
        schedules = JSON.parse(window.localStorage.getItem(SCHEDULES_KEY) ?? '[]')
        if (!Array.isArray(schedules)) throw new Error('Data jadwal tidak valid.')
      } catch {
        setNotificationError('Jadwal pengingat tidak dapat dibaca dari penyimpanan browser.')
        return
      }

      const now = new Date()
      const dateKey = now.toLocaleDateString('en-CA')
      const timeKey = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const dueSchedules = schedules.filter((schedule) => (
        schedule.active
        && schedule.time === timeKey
        && schedule.days?.includes(now.getDay())
        && schedule.completedOn !== dateKey
      ))
      if (!dueSchedules.length) return

      let sentReminders
      try {
        sentReminders = JSON.parse(window.localStorage.getItem(SENT_REMINDERS_KEY) ?? '{}')
        if (!sentReminders || Array.isArray(sentReminders) || typeof sentReminders !== 'object') sentReminders = {}
      } catch {
        sentReminders = {}
      }

      const dueAndUnsent = dueSchedules.filter((schedule) => sentReminders[`${dateKey}:${schedule.id}`] !== true)
      if (!dueAndUnsent.length) return

      dueAndUnsent.forEach((schedule) => {
        const surah = getSurah(schedule.surahNumber)
        const title = `Waktunya murojaah · ${surah.transliteration}`
        const body = `Target ayat ${schedule.startAyah}–${schedule.endAyah}. Semoga murojaahmu lancar.`
        try {
          const notification = new window.Notification(title, { body, tag: `murojaah-${schedule.id}` })
          notification.onclick = () => {
            window.focus()
            notification.close()
          }
          sentReminders[`${dateKey}:${schedule.id}`] = true
        } catch {
          setNotificationError('Notifikasi gagal ditampilkan. Periksa pengaturan notifikasi browser.')
          return
        }
      })

      try {
        window.localStorage.setItem(SENT_REMINDERS_KEY, JSON.stringify(sentReminders))
      } catch {
        setNotificationError('Status pengingat tidak dapat disimpan; notifikasi berulang mungkin terjadi.')
      }
    }

    checkSchedules()
    const intervalId = window.setInterval(checkSchedules, 15_000)
    return () => window.clearInterval(intervalId)
  }, [notificationsEnabled, permission])

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(today)

  const enableNotifications = async () => {
    setNotificationError('')
    setNotificationMessage('')
    if (permission === 'unsupported') {
      setNotificationError('Browser ini tidak mendukung notifikasi desktop.')
      return
    }
    if (!window.isSecureContext) {
      setNotificationError('Notifikasi hanya tersedia di HTTPS atau localhost.')
      return
    }

    let nextPermission = permission
    if (nextPermission === 'default') {
      try {
        nextPermission = await window.Notification.requestPermission()
      } catch {
        setNotificationError('Izin notifikasi tidak dapat diminta dari browser.')
        return
      }
      setPermission(nextPermission)
    }

    if (nextPermission !== 'granted') {
      setNotificationError('Izin notifikasi ditolak. Ubah izinnya melalui pengaturan situs di browser.')
      return
    }

    try {
      window.localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true')
    } catch {
      setNotificationError('Preferensi notifikasi tidak dapat disimpan di browser.')
      return
    }
    setNotificationsEnabled(true)
    setNotificationMessage('Pengingat aktif. Notifikasi dikirim saat aplikasi terbuka.')
  }

  const disableNotifications = () => {
    try {
      window.localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false')
    } catch {
      setNotificationError('Preferensi notifikasi tidak dapat disimpan di browser.')
      return
    }
    setNotificationsEnabled(false)
    setNotificationError('')
    setNotificationMessage('Pengingat dimatikan.')
  }

  return (
    <header className="relative z-10 flex h-[72px] items-center justify-between border-b border-white/[.055] px-4 sm:px-7 md:px-10">
      <button type="button" aria-label="Buka menu" onClick={onMenuClick} className="icon-button md:hidden"><Menu size={19} /></button>
      <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex"><span>Ruang belajar</span><span className="text-slate-700">/</span><span className="text-slate-300">{activeTab}</span></div>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <time dateTime={today.toISOString()} className="hidden rounded-full border border-white/[.07] bg-white/[.025] px-3 py-1.5 text-[11px] text-slate-400 sm:inline-flex">{formattedDate}</time>
        <div className="relative" ref={notificationPanelRef}>
          <button
            type="button"
            aria-label="Notifikasi pengingat"
            aria-expanded={notificationOpen}
            aria-haspopup="dialog"
            onClick={() => { setNotificationOpen((open) => !open); setNotificationError(''); setNotificationMessage('') }}
            className="icon-button relative"
          >
            <Bell size={17} />
            <span className={`absolute right-2 top-2 h-1.5 w-1.5 rounded-full ${notificationsEnabled && permission === 'granted' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
          </button>
          {notificationOpen && (
            <section role="dialog" aria-label="Pengaturan notifikasi" className="glass-panel absolute right-0 top-11 z-50 w-[min(340px,calc(100vw-2rem))] rounded-2xl p-4 shadow-[0_24px_70px_-24px_rgba(0,0,0,.95)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[.06] text-cyan-200">
                    {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-white">Pengingat murojaah</h2>
                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      {notificationsEnabled ? 'Pengingat jadwal sedang aktif.' : 'Aktifkan notifikasi untuk mengingatkan jadwalmu.'}
                    </p>
                  </div>
                </div>
                <button type="button" aria-label="Tutup notifikasi" onClick={() => setNotificationOpen(false)} className="icon-button !h-8 !w-8"><X size={15} /></button>
              </div>

              <div className="mt-4 rounded-xl border border-white/[.06] bg-white/[.02] px-3 py-2.5">
                <p className="text-[11px] text-slate-300">
                  Status izin: <span className={permission === 'granted' ? 'text-emerald-300' : permission === 'denied' ? 'text-rose-300' : 'text-amber-200'}>
                    {permission === 'granted' ? 'Diizinkan' : permission === 'denied' ? 'Ditolak' : permission === 'unsupported' ? 'Tidak didukung' : 'Belum diminta'}
                  </span>
                </p>
                <p className="mt-1 text-[10px] leading-4 text-slate-500">
                  Pengingat mengikuti hari dan jam pada jadwal. Browser harus tetap membuka aplikasi.
                </p>
              </div>

              {notificationError && <p role="alert" className="mt-3 text-[11px] leading-5 text-rose-300">{notificationError}</p>}
              {notificationMessage && <p role="status" className="mt-3 inline-flex items-start gap-1.5 text-[11px] leading-5 text-emerald-200"><Check size={13} className="mt-0.5 shrink-0" />{notificationMessage}</p>}

              {notificationsEnabled ? (
                <button type="button" onClick={disableNotifications} className="secondary-button mt-4 w-full justify-center !min-h-10 !py-2 text-xs">
                  Matikan pengingat
                </button>
              ) : (
                <button type="button" onClick={enableNotifications} disabled={permission === 'unsupported'} className="primary-button mt-4 w-full justify-center !min-h-10 !py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50">
                  <Bell size={14} /> Aktifkan notifikasi
                </button>
              )}
            </section>
          )}
        </div>
      </div>
    </header>
  )
}
