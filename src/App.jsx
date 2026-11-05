import { useEffect, useState } from 'react'
import { BottomNav } from './components/layout/BottomNav.jsx'
import { LoginView } from './components/layout/LoginView.jsx'
import { Navbar } from './components/layout/Navbar.jsx'
import { Sidebar } from './components/layout/Sidebar.jsx'
import { ActiveTestView } from './components/murojaah/ActiveTestView.jsx'
import { ErrorHandlingState } from './components/murojaah/ErrorHandlingState.jsx'
import { HadithPage } from './components/murojaah/HadithPage.jsx'
import { JadwalView } from './components/murojaah/JadwalView.jsx'
import { QuranView } from './components/murojaah/QuranView.jsx'
import { ResultScreen } from './components/murojaah/ResultScreen.jsx'
import { SetupModal } from './components/murojaah/SetupModal.jsx'
import { TajwidDashboard } from './components/murojaah/TajwidDashboard.jsx'
import { useSpeechRecognition } from './hooks/useSpeechRecognition.js'
import { useAuthSession } from './hooks/useAuthSession.js'
import { useMurojaahStore } from './store/useMurojaahStore.js'
import { surahs } from './utils/quranData.js'
import { TAJWID_COLOR_KEY } from './utils/tajwidData.js'

const pages = {
  Quran: { title: 'Al-Quran', subtitle: 'Baca dan jaga kedekatanmu dengan Al-Quran.', icon: '۞' },
  Hadist: { title: 'Hadist pilihan', subtitle: 'Renungkan hikmah dari sunnah Rasulullah ﷺ.', icon: '۩' },
  Jadwal: { title: 'Jadwal murojaah', subtitle: 'Konsistensi kecil, hafalan yang terjaga.', icon: '◷' },
  'Belajar Tajwid': { title: 'Belajar Tajwid', subtitle: 'Pahami kaidah bacaan dan latih pemahamanmu.', icon: 'نّ' },
}

export default function App() {
  const { user, authReady, authError, passwordRecovery, signOut } = useAuthSession()

  const handleLogout = async () => {
    await signOut()
  }

  if (!authReady) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0b0f19] text-sm text-slate-400">
        Memeriksa sesi...
      </main>
    )
  }
  if (passwordRecovery) return <LoginView sessionError={authError} passwordRecovery />
  if (!user) return <LoginView sessionError={authError} />

  return <Dashboard onLogout={handleLogout} />
}

function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('Tes Hafalan')
  const [setupOpen, setSetupOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tajwidColor, setTajwidColor] = useState(() => {
    try {
      return window.localStorage.getItem(TAJWID_COLOR_KEY) !== 'false'
    } catch {
      return true
    }
  })
  const state = useMurojaahStore((store) => store.state)
  const hasVerses = useMurojaahStore((store) => store.verses.length > 0)
  const reset = useMurojaahStore((store) => store.reset)
  const { startListening, stopListening } = useSpeechRecognition()

  useEffect(() => () => stopListening(), [stopListening])

  const openSetup = () => {
    stopListening()
    reset()
    setSetupOpen(true)
  }
  const stopTest = () => {
    stopListening()
    reset()
    setSetupOpen(false)
  }
  const retryListening = () => {
    useMurojaahStore.getState().retry()
    startListening()
  }
  const startScheduledTest = (schedule) => {
    stopListening()
    const { config, startTest } = useMurojaahStore.getState()
    startTest({
      ...config,
      surahNumber: schedule.surahNumber,
      startAyah: schedule.startAyah,
      endAyah: schedule.endAyah,
    })
    setActiveTab('Tes Hafalan')
    startListening()
  }
  const continueAfterWrong = () => {
    useMurojaahStore.getState().advance()
    startListening()
  }
  const navigateTo = (tab) => {
    if (tab !== 'Tes Hafalan' && state === 'LISTENING') stopListening()
    setActiveTab(tab)
    setSidebarOpen(false)
  }
  const renderPage = () => {
    if (activeTab === 'Hadist') return <HadithPage />
    if (activeTab === 'Jadwal') return <JadwalView onStartSchedule={startScheduledTest} />
    if (activeTab === 'Quran') return <QuranView tajwidColor={tajwidColor} onTajwidColorChange={setTajwidColor} />
    if (activeTab === 'Belajar Tajwid') return <TajwidDashboard onColorChange={setTajwidColor} />

    if (activeTab !== 'Tes Hafalan') {
      const page = pages[activeTab]
      return (
        <section className="glass-panel flex min-h-[420px] flex-col items-center justify-center rounded-3xl p-8 text-center">
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-white/[.08] bg-white/[.04] text-3xl text-cyan-300">{page.icon}</div>
          <p className="eyebrow mb-2">RUANG IBADAH</p>
          <h2 className="font-display text-3xl font-semibold text-white">{page.title}</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">{page.subtitle}</p>
          {activeTab === 'Quran' && (
            <button type="button" onClick={() => setActiveTab('Tes Hafalan')} className="primary-button mt-7">
              Mulai tes hafalan
            </button>
          )}
        </section>
      )
    }

    if (state === 'FINISHED') return <ResultScreen onRestart={openSetup} />
    if (state === 'WRONG') return <ErrorHandlingState onRetry={retryListening} onContinue={continueAfterWrong} />
    if (state === 'IDLE' || !hasVerses) {
      return <PracticeIntro onSetup={() => setSetupOpen(true)} />
    }
    return <ActiveTestView onStop={stopTest} onStart={startListening} />
  }

  return (
    <div className="min-h-screen bg-ink-900 text-slate-100">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <Sidebar
        activeTab={activeTab}
        onNavigate={navigateTo}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
      />
      <main className="relative min-h-screen md:ml-[272px]">
        <Navbar onMenuClick={() => setSidebarOpen(true)} activeTab={activeTab} />
        <div className="mx-auto max-w-[1440px] px-4 pb-28 pt-5 sm:px-7 md:px-10 md:pb-12 md:pt-8">
          {activeTab !== 'Jadwal' && activeTab !== 'Quran' && activeTab !== 'Belajar Tajwid' && <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">{activeTab === 'Tes Hafalan' ? 'RUANG LATIHAN' : 'MUROJAAH HARIAN'}</p>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-[2.1rem]">
                {activeTab === 'Tes Hafalan' ? <>Tes <span className="text-gradient">Hafalan</span></> : pages[activeTab]?.title}
              </h1>
              <p className="mt-2 text-sm text-slate-400">{activeTab === 'Tes Hafalan' ? 'Jaga ayat yang telah Allah titipkan di dalam hatimu.' : pages[activeTab]?.subtitle}</p>
            </div>
          </header>}
          {renderPage()}
        </div>
      </main>
      <BottomNav activeTab={activeTab} onNavigate={navigateTo} />
      {setupOpen && <SetupModal surahs={surahs} onClose={() => setSetupOpen(false)} onStart={() => {
        setSetupOpen(false)
        startListening()
      }} />}
    </div>
  )
}

function PracticeIntro({ onSetup }) {
  const { startTest, config } = useMurojaahStore()
  const selectedSurah = surahs.find((surah) => surah.number === config.surahNumber) ?? surahs[0]
  const isPending = useMurojaahStore((store) => store.state === 'REQUEST_MIC')

  return (
    <section className="glass-panel relative overflow-hidden rounded-3xl p-5 sm:p-8">
      <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-cyan-500/[.08] blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[.06] px-3 py-1.5 text-xs font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Siap untuk murojaah
          </div>
          <h2 className="max-w-xl font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">Biarkan lisanmu mengingat <span className="text-gradient">ayat-ayat-Nya.</span></h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400">Ucapkan hafalanmu. Kami akan menyimak setiap kata dan membantumu menemukan bagian yang perlu diulang.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={onSetup} className="primary-button">
              <span className="text-lg">▷</span> Mulai sesi
            </button>
            <button type="button" onClick={() => { startTest({ surahNumber: 1, startAyah: 1, endAyah: 7, mode: 'hidden', threshold: 85 }) }} disabled={isPending} className="secondary-button">
              {isPending ? 'Menyiapkan mikrofon...' : 'Coba Al-Fatihah'}
            </button>
          </div>
          <p className="mt-4 text-xs text-slate-500">Akses mikrofon diperlukan · Gunakan Chrome atau Edge</p>
        </div>
        <div className="quran-preview rounded-2xl p-5 sm:p-7">
          <div className="flex items-center justify-between border-b border-white/[.07] pb-4">
            <div>
              <p className="text-xs text-slate-400">SURAH PILIHAN</p>
              <p className="mt-1 font-medium text-white">{selectedSurah.transliteration} <span className="ml-1 text-slate-500">· {selectedSurah.verses.length} ayat</span></p>
            </div>
            <span className="rounded-xl border border-white/[.08] bg-white/[.04] px-3 py-2 font-arabic text-xl text-cyan-200">{selectedSurah.arabic}</span>
          </div>
          <p dir="rtl" className="arabic-text mt-6 text-center text-[2rem] leading-[2.2] text-slate-100 sm:text-[2.4rem]">{selectedSurah.verses[0].text}</p>
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500"><span className="h-px w-8 bg-white/10" /> Ayat {selectedSurah.verses[0].number} <span className="h-px w-8 bg-white/10" /></div>
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/[.06] pt-5 text-center">
            <div><p className="font-display text-lg font-semibold text-white">85%</p><p className="mt-1 text-[10px] text-slate-500">ambang lulus</p></div>
            <div><p className="font-display text-lg font-semibold text-white">3×</p><p className="mt-1 text-[10px] text-slate-500">kesempatan</p></div>
            <div><p className="font-display text-lg font-semibold text-white">Live</p><p className="mt-1 text-[10px] text-slate-500">penilaian suara</p></div>
          </div>
        </div>
      </div>
    </section>
  )
}