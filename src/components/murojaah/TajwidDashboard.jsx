import { useState } from 'react'
import { BookOpenCheck, BookOpenText, Check, ChevronRight, CircleHelp, GraduationCap, Layers3, Play, Sparkles } from 'lucide-react'
import { TajwidLessonDetail } from './TajwidLessonDetail.jsx'
import { TajwidQuiz } from './TajwidQuiz.jsx'
import {
  TAJWID_COLOR_KEY,
  TAJWID_PROGRESS_KEY,
  getTajwidChapter,
  tajwidChapters,
} from '../../utils/tajwidData.js'

const chapterIcons = [Layers3, Sparkles, CircleHelp, BookOpenText, AudioIcon, BookOpenCheck, Play, Sparkles, GraduationCap]

function readLearningState() {
  const result = { progress: {}, lastChapterId: '', lastRuleId: '', colorEnabled: true, error: '' }
  try {
    const progress = JSON.parse(window.localStorage.getItem(TAJWID_PROGRESS_KEY) ?? '{}')
    if (progress && typeof progress === 'object' && !Array.isArray(progress)) result.progress = progress
    else result.error = 'Format data progres Tajwid tidak sesuai; memulai sesi dengan progres kosong.'
  } catch {
    result.error = 'Progres Tajwid tidak dapat dibaca dari penyimpanan browser.'
  }
  try {
    const lastLesson = JSON.parse(window.localStorage.getItem('murojaah-tajwid-last-lesson') ?? '{}')
    if (lastLesson && typeof lastLesson === 'object') {
      result.lastChapterId = lastLesson.chapterId ?? ''
      result.lastRuleId = lastLesson.ruleId ?? ''
    }
  } catch {
    result.error = result.error || 'Materi terakhir tidak dapat dibaca dari penyimpanan browser.'
  }
  try {
    result.colorEnabled = window.localStorage.getItem(TAJWID_COLOR_KEY) !== 'false'
  } catch {
    result.error = result.error || 'Pengaturan Tajwid Berwarna tidak dapat dibaca dari penyimpanan browser.'
  }
  return result
}

function AudioIcon({ size = 18 }) {
  return <span aria-hidden="true" className="font-arabic text-lg leading-none" style={{ fontSize: size }}>نّ</span>
}

export function TajwidDashboard({ onColorChange }) {
  const [stored, setStored] = useState(readLearningState)
  const [view, setView] = useState('dashboard')
  const [selectedChapterId, setSelectedChapterId] = useState('')
  const [selectedRuleId, setSelectedRuleId] = useState('')
  const completedCount = tajwidChapters.filter((chapter) => stored.progress[chapter.id]).length
  const selectedChapter = getTajwidChapter(selectedChapterId)

  const saveLastLesson = (chapter, rule) => {
    try {
      window.localStorage.setItem('murojaah-tajwid-last-lesson', JSON.stringify({
        chapterId: chapter.id,
        ruleId: rule.id,
      }))
      setStored((current) => ({ ...current, lastChapterId: chapter.id, lastRuleId: rule.id }))
      return true
    } catch {
      setStored((current) => ({ ...current, error: 'Materi terakhir tidak dapat disimpan di browser.' }))
      return false
    }
  }

  const openLesson = (chapter, ruleId = chapter.rules[0].id) => {
    const rule = chapter.rules.find((item) => item.id === ruleId) ?? chapter.rules[0]
    setSelectedChapterId(chapter.id)
    setSelectedRuleId(rule.id)
    saveLastLesson(chapter, rule)
    setView('detail')
  }

  const toggleColor = (enabled) => {
    try {
      window.localStorage.setItem(TAJWID_COLOR_KEY, String(enabled))
    } catch {
      setStored((current) => ({ ...current, error: 'Pengaturan Tajwid Berwarna tidak dapat disimpan di browser.' }))
      return
    }
    setStored((current) => ({ ...current, colorEnabled: enabled, error: '' }))
    onColorChange(enabled)
  }

  const completeQuiz = (score) => {
    const previousScore = stored.progress[selectedChapter.id]?.score ?? 0
    const nextProgress = {
      ...stored.progress,
      [selectedChapter.id]: { score: Math.max(score, previousScore), completedAt: new Date().toISOString() },
    }
    try {
      window.localStorage.setItem(TAJWID_PROGRESS_KEY, JSON.stringify(nextProgress))
      setStored((current) => ({ ...current, progress: nextProgress, error: '' }))
    } catch {
      setStored((current) => ({ ...current, error: 'Kuis selesai, tetapi progresnya tidak dapat disimpan di browser.' }))
    }
  }

  const resumeLesson = () => {
    const chapter = tajwidChapters.find((item) => item.id === stored.lastChapterId)
      ?? tajwidChapters.find((item) => !stored.progress[item.id])
      ?? tajwidChapters[0]
    openLesson(chapter, stored.lastRuleId)
  }

  if (view === 'detail') {
    return (
      <TajwidLessonDetail
        chapter={selectedChapter}
        initialRuleId={selectedRuleId}
        storageError={stored.error}
        onBack={() => setView('dashboard')}
        onStartQuiz={() => setView('quiz')}
        onRuleChange={(rule) => {
          setSelectedRuleId(rule.id)
          saveLastLesson(selectedChapter, rule)
        }}
      />
    )
  }

  if (view === 'quiz') {
    return (
      <TajwidQuiz
        key={selectedChapter.id}
        chapter={selectedChapter}
        storageError={stored.error}
        onBack={() => setView('detail')}
        onComplete={completeQuiz}
      />
    )
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel relative overflow-hidden rounded-3xl p-5 sm:p-8">
        <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-cyan-400/[.08] blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow flex items-center gap-2"><BookOpenText size={13} /> RUANG BELAJAR AL-QUR’AN</p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">Belajar <span className="text-gradient">Tajwid</span></h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Pelajari kaidah bacaan selangkah demi selangkah, lalu uji pemahamanmu dengan kuis di setiap bab.</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={resumeLesson} className="primary-button"><Play size={15} fill="currentColor" /> Lanjutkan belajar <ChevronRight size={15} /></button>
              <span className="text-xs text-slate-400"><span className="font-semibold text-emerald-300">{completedCount}</span> dari {tajwidChapters.length} bab selesai</span>
            </div>
          </div>
          <label className="flex cursor-pointer items-center justify-between gap-5 rounded-2xl border border-white/[.08] bg-[#080d16]/55 p-4 sm:min-w-[280px]">
            <span>
              <span className="block text-sm font-medium text-white">Tajwid Berwarna</span>
              <span className="mt-1 block max-w-[190px] text-[11px] leading-5 text-slate-500">Tandai beberapa hukum dasar di tampilan Mushaf.</span>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={stored.colorEnabled}
              onChange={(event) => toggleColor(event.target.checked)}
              className="h-5 w-5 shrink-0 accent-cyan-400"
              aria-label="Aktifkan Tajwid Berwarna di Mushaf"
            />
          </label>
        </div>
        {stored.error && <p role="alert" className="relative mt-5 rounded-xl border border-amber-300/15 bg-amber-300/[.05] px-3 py-2 text-xs text-amber-100">{stored.error}</p>}
      </section>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow">KURIKULUM</p><h2 className="mt-1 font-display text-xl font-semibold text-white">Pilih bab pembelajaran</h2></div>
        <p className="text-xs text-slate-500">9 bab · materi dan kuis interaktif</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tajwidChapters.map((chapter, index) => {
          const Icon = chapterIcons[index]
          const chapterProgress = stored.progress[chapter.id]
          const percentage = chapterProgress ? 100 : 0
          return (
            <button
              type="button"
              key={chapter.id}
              onClick={() => openLesson(chapter)}
              className="glass-panel group relative flex min-h-[218px] flex-col overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.01] hover:border-cyan-300/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/[.035] blur-2xl transition group-hover:bg-cyan-400/[.08]" />
              <div className="relative flex w-full items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[.06] text-cyan-200 transition group-hover:border-cyan-300/30 group-hover:bg-cyan-300/[.1]"><Icon size={19} /></span>
                <span dir="rtl" lang="ar" className="font-arabic pt-1 text-xl text-slate-500 transition group-hover:text-cyan-100">{chapter.arabic}</span>
              </div>
              <div className="relative mt-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-base font-semibold text-white">{chapter.title}</h3>
                  {chapterProgress && <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-300/15 bg-emerald-300/[.06] px-2 py-1 text-[9px] font-medium text-emerald-200"><Check size={11} /> Selesai</span>}
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-400">{chapter.description}</p>
              </div>
              <div className="relative mt-auto w-full pt-5">
                <div className="mb-2 flex justify-between text-[10px]"><span className={chapterProgress ? 'text-emerald-200' : 'text-slate-500'}>{chapterProgress ? `Selesai · skor ${chapterProgress.score}/10` : 'Belum mulai'}</span><span className="text-slate-500">{percentage}%</span></div>
                <div className="h-1 overflow-hidden rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500" style={{ width: `${percentage}%` }} /></div>
              </div>
            </button>
          )
        })}
      </section>
      <p className="text-center text-[11px] leading-5 text-slate-600">Materi disusun sebagai pengantar. Belajar talaqqi bersama guru tetap penting untuk mengoreksi makhraj dan bacaan.</p>
    </div>
  )
}
