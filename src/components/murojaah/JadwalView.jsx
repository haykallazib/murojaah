import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BellRing,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react'
import { surahs } from '../../utils/quranData.js'

const STORAGE_KEY = 'murojaah-schedules'
const DAYS = [
  { value: 1, label: 'Senin', short: 'Sen' },
  { value: 2, label: 'Selasa', short: 'Sel' },
  { value: 3, label: 'Rabu', short: 'Rab' },
  { value: 4, label: 'Kamis', short: 'Kam' },
  { value: 5, label: 'Jumat', short: 'Jum' },
  { value: 6, label: 'Sabtu', short: 'Sab' },
  { value: 0, label: 'Minggu', short: 'Min' },
]

const defaultSurah = surahs.find((surah) => surah.number === 67) ?? surahs[0]

function loadSchedules() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return { schedules: [], error: '' }

    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) throw new Error('Format data jadwal tidak valid.')
    return {
      schedules: parsed.filter((schedule) => (
        schedule
        && typeof schedule.id === 'string'
        && Number.isInteger(schedule.surahNumber)
        && Number.isInteger(schedule.startAyah)
        && Number.isInteger(schedule.endAyah)
        && typeof schedule.time === 'string'
        && Array.isArray(schedule.days)
      )),
      error: '',
    }
  } catch {
    return { schedules: [], error: 'Jadwal tidak dapat dibaca dari penyimpanan lokal.' }
  }
}

function getToday() {
  return new Date().toLocaleDateString('en-CA')
}

function formatDays(days) {
  if (days.length === 7) return 'Setiap hari'
  return DAYS.filter((day) => days.includes(day.value)).map((day) => day.label).join(', ')
}

export function JadwalView({ onStartSchedule }) {
  const [initialState] = useState(loadSchedules)
  const [schedules, setSchedules] = useState(initialState.schedules)
  const [storageError, setStorageError] = useState(initialState.error)
  const [formError, setFormError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const didMount = useRef(false)

  const [surahNumber, setSurahNumber] = useState(defaultSurah.number)
  const [startAyah, setStartAyah] = useState(1)
  const [endAyah, setEndAyah] = useState(Math.min(10, defaultSurah.verses.length))
  const [time, setTime] = useState('05:00')
  const [days, setDays] = useState([1, 2, 3, 4, 5, 6, 0])

  const selectedSurah = surahs.find((surah) => surah.number === Number(surahNumber)) ?? surahs[0]
  const sortedSchedules = useMemo(
    () => [...schedules].sort((first, second) => first.time.localeCompare(second.time)),
    [schedules],
  )

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules))
      setStorageError('')
    } catch {
      setStorageError('Perubahan jadwal belum tersimpan. Periksa ruang penyimpanan browser Anda.')
    }
  }, [schedules])

  const resetForm = () => {
    setEditingId(null)
    setSurahNumber(defaultSurah.number)
    setStartAyah(1)
    setEndAyah(Math.min(10, defaultSurah.verses.length))
    setTime('05:00')
    setDays([1, 2, 3, 4, 5, 6, 0])
    setFormError('')
  }

  const changeSurah = (value) => {
    const nextSurah = surahs.find((surah) => surah.number === Number(value)) ?? surahs[0]
    setSurahNumber(nextSurah.number)
    setStartAyah(1)
    setEndAyah(Math.min(10, nextSurah.verses.length))
    setFormError('')
  }

  const toggleDay = (day) => {
    setDays((current) => current.includes(day)
      ? current.filter((value) => value !== day)
      : [...current, day])
    setFormError('')
  }

  const submitSchedule = (event) => {
    event.preventDefault()
    if (!days.length) {
      setFormError('Pilih setidaknya satu hari pengulangan.')
      return
    }
    if (startAyah < 1 || endAyah < startAyah || endAyah > selectedSurah.verses.length) {
      setFormError(`Rentang ayat harus berada di antara 1–${selectedSurah.verses.length}.`)
      return
    }

    const schedule = {
      id: editingId ?? globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      surahNumber: Number(surahNumber),
      startAyah: Number(startAyah),
      endAyah: Number(endAyah),
      time,
      days: DAYS.filter((day) => days.includes(day.value)).map((day) => day.value),
      active: editingId
        ? schedules.find((item) => item.id === editingId)?.active ?? true
        : true,
      completedOn: editingId
        ? schedules.find((item) => item.id === editingId)?.completedOn ?? null
        : null,
    }

    setSchedules((current) => editingId
      ? current.map((item) => item.id === editingId ? schedule : item)
      : [...current, schedule])
    resetForm()
  }

  const editSchedule = (schedule) => {
    setEditingId(schedule.id)
    setSurahNumber(schedule.surahNumber)
    setStartAyah(schedule.startAyah)
    setEndAyah(schedule.endAyah)
    setTime(schedule.time)
    setDays(schedule.days)
    setFormError('')
    document.getElementById('jadwal-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const deleteSchedule = (id) => {
    setSchedules((current) => current.filter((schedule) => schedule.id !== id))
    if (editingId === id) resetForm()
  }

  const toggleActive = (id) => {
    setSchedules((current) => current.map((schedule) => (
      schedule.id === id ? { ...schedule, active: !schedule.active } : schedule
    )))
  }

  const toggleCompleted = (id) => {
    const today = getToday()
    setSchedules((current) => current.map((schedule) => (
      schedule.id === id
        ? { ...schedule, completedOn: schedule.completedOn === today ? null : today }
        : schedule
    )))
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="eyebrow mb-2">MUROJAAH HARIAN</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-[2.1rem]">
          Jadwal <span className="text-gradient">Murojaah</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">Konsistensi kecil, hafalan yang terjaga.</p>
      </header>

      {storageError && (
        <p role="alert" className="rounded-2xl border border-amber-300/20 bg-amber-300/[.06] px-4 py-3 text-sm text-amber-100">
          {storageError}
        </p>
      )}

      <form id="jadwal-form" onSubmit={submitSchedule} className="glass-panel relative scroll-mt-6 overflow-hidden rounded-3xl p-5 sm:p-7">
        <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-emerald-400/[.06] blur-3xl" />
        <div className="relative">
          <div className="mb-6 flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-300/15 bg-emerald-300/[.07] text-emerald-200">
              <CalendarDays size={18} />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-white">{editingId ? 'Edit jadwal' : 'Target murojaah'}</h2>
              <p className="mt-1 text-xs text-slate-500">Atur target harian atau mingguan sesuai rutinitasmu.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="field-label sm:col-span-2 lg:col-span-2">
              Pilih surah
              <select className="field-control" value={surahNumber} onChange={(event) => changeSurah(event.target.value)}>
                {surahs.map((surah) => (
                  <option key={surah.number} value={surah.number}>{surah.transliteration} — {surah.arabic}</option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Mulai ayat
              <input
                type="number"
                min="1"
                max={selectedSurah.verses.length}
                className="field-control"
                value={startAyah}
                onChange={(event) => setStartAyah(Number(event.target.value))}
              />
            </label>
            <label className="field-label">
              Sampai ayat
              <input
                type="number"
                min={startAyah}
                max={selectedSurah.verses.length}
                className="field-control"
                value={endAyah}
                onChange={(event) => setEndAyah(Number(event.target.value))}
              />
            </label>
            <label className="field-label sm:col-span-2 lg:col-span-1">
              Waktu pengingat
              <span className="relative block">
                <input type="time" className="field-control" value={time} onChange={(event) => setTime(event.target.value)} />
              </span>
            </label>

            <fieldset className="sm:col-span-2 lg:col-span-3">
              <legend className="mb-2 text-[11px] font-medium text-slate-400">Hari pengulangan</legend>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => {
                  const checked = days.includes(day.value)
                  return (
                    <label key={day.value} className={`cursor-pointer rounded-xl border px-3 py-2 text-xs transition ${checked ? 'border-emerald-300/30 bg-emerald-300/[.1] text-emerald-100' : 'border-white/[.08] bg-white/[.025] text-slate-400 hover:border-white/[.16]'}`}>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggleDay(day.value)}
                      />
                      {day.short}
                    </label>
                  )
                })}
                <button
                  type="button"
                  onClick={() => { setDays(days.length === 7 ? [] : DAYS.map((day) => day.value)); setFormError('') }}
                  className={`rounded-xl border px-3 py-2 text-xs transition ${days.length === 7 ? 'border-cyan-300/25 bg-cyan-300/[.08] text-cyan-100' : 'border-white/[.08] bg-white/[.025] text-slate-400 hover:border-white/[.16]'}`}
                >
                  Setiap hari
                </button>
              </div>
            </fieldset>
          </div>

          {formError && <p role="alert" className="mt-4 text-xs text-rose-300">{formError}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-300/25 bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 shadow-[0_10px_28px_-12px_rgba(52,211,153,.55),inset_0_1px_rgba(255,255,255,.3)] transition hover:-translate-y-0.5 hover:bg-emerald-300">
              {editingId ? <Check size={16} /> : <Plus size={16} />}
              {editingId ? 'Simpan perubahan' : 'Tambah jadwal'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="secondary-button">
                <X size={15} /> Batal
              </button>
            )}
          </div>
        </div>
      </form>

      <div>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow mb-1">RUTINITASMU</p>
            <h2 className="font-display text-xl font-semibold text-white">Daftar jadwal</h2>
          </div>
          <span className="rounded-full border border-white/[.08] bg-white/[.03] px-3 py-1.5 text-[11px] text-slate-400">
            {schedules.length} jadwal
          </span>
        </div>

        {sortedSchedules.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {sortedSchedules.map((schedule) => {
              const surah = surahs.find((item) => item.number === schedule.surahNumber)
              if (!surah) return null
              const completedToday = schedule.completedOn === getToday()
              return (
                <article key={schedule.id} className="glass-panel rounded-2xl p-5 shadow-[0_20px_45px_-30px_rgba(0,0,0,.9),inset_0_1px_rgba(255,255,255,.04)] transition duration-200 hover:-translate-y-0.5 hover:border-white/[.13]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[.06] font-arabic text-xl text-cyan-200">{surah.arabic}</span>
                      <div className="min-w-0">
                        <h3 className="truncate font-display font-semibold text-white">{surah.transliteration}</h3>
                        <p className="mt-1 text-xs text-slate-400">Target ayat {schedule.startAyah}–{schedule.endAyah}</p>
                      </div>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${schedule.active ? 'border-emerald-300/20 bg-emerald-300/[.06] text-emerald-200' : 'border-slate-400/15 bg-slate-400/[.05] text-slate-400'}`}>
                      {schedule.active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 border-t border-white/[.06] pt-4 text-xs">
                    <Clock3 size={14} className="mt-0.5 text-cyan-300" />
                    <span className="font-medium tabular-nums text-slate-200">{schedule.time}</span>
                    <CalendarDays size={14} className="mt-0.5 text-slate-500" />
                    <span className="text-slate-400">{formatDays(schedule.days)}</span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.06] pt-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onStartSchedule(schedule)}
                        disabled={!schedule.active}
                        className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[.08] px-3 py-2 text-xs font-medium text-cyan-100 transition hover:border-cyan-200/35 hover:bg-cyan-300/[.14] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        <Play size={14} fill="currentColor" />
                        Mulai target
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCompleted(schedule.id)}
                        disabled={!schedule.active}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-45 ${completedToday ? 'border-emerald-300/20 bg-emerald-300/[.08] text-emerald-200' : 'border-white/[.08] bg-white/[.025] text-slate-300 hover:border-emerald-300/20 hover:text-emerald-200'}`}
                      >
                        <CheckCircle2 size={15} />
                        {completedToday ? 'Selesai hari ini' : 'Tandai selesai'}
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => toggleActive(schedule.id)} aria-label={schedule.active ? 'Nonaktifkan jadwal' : 'Aktifkan jadwal'} title={schedule.active ? 'Nonaktifkan' : 'Aktifkan'} className="icon-button !h-9 !w-9">
                        {schedule.active ? <RotateCcw size={15} /> : <BellRing size={15} />}
                      </button>
                      <button type="button" onClick={() => editSchedule(schedule)} aria-label="Edit jadwal" title="Edit jadwal" className="icon-button !h-9 !w-9"><Pencil size={15} /></button>
                      <button type="button" onClick={() => deleteSchedule(schedule.id)} aria-label="Hapus jadwal" title="Hapus jadwal" className="icon-button !h-9 !w-9 text-rose-300 hover:!border-rose-300/25 hover:!text-rose-200"><Trash2 size={15} /></button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="glass-panel flex min-h-52 flex-col items-center justify-center rounded-2xl p-6 text-center">
            <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl border border-white/[.08] bg-white/[.03] text-slate-400"><BookOpen size={19} /></span>
            <h3 className="font-display font-semibold text-white">Belum ada jadwal</h3>
            <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">Tambahkan target murojaah pertamamu agar rutinitas hafalan lebih terjaga.</p>
          </div>
        )}
      </div>
    </section>
  )
}
