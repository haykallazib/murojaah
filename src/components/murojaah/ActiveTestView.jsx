import { useEffect, useMemo } from 'react'
import { Check, Eye, EyeOff, LockKeyhole, Mic, Square, Volume2 } from 'lucide-react'
import { useMurojaahStore } from '../../store/useMurojaahStore.js'
import { getSurah } from '../../utils/quranData.js'

export function ActiveTestView({ onStop, onStart }) {
  const state = useMurojaahStore((store) => store.state)
  const verses = useMurojaahStore((store) => store.verses)
  const currentIndex = useMurojaahStore((store) => store.currentIndex)
  const transcript = useMurojaahStore((store) => store.transcript)
  const visible = useMurojaahStore((store) => store.visible)
  const error = useMurojaahStore((store) => store.error)
  const alignmentNotice = useMurojaahStore((store) => store.alignmentNotice)
  const toggleVisible = useMurojaahStore((store) => store.toggleVisible)
  const advance = useMurojaahStore((store) => store.advance)
  const config = useMurojaahStore((store) => store.config)
  const done = useMurojaahStore((store) => store.verseResults.length)
  const surah = getSurah(config.surahNumber)
  const verse = verses[currentIndex]
  const previous = verses[currentIndex - 1]
  const next = verses[currentIndex + 1]
  const progress = useMemo(() => verses.length ? Math.round((done / verses.length) * 100) : 0, [done, verses.length])

  useEffect(() => {
    if (state !== 'CORRECT') return undefined
    const timer = window.setTimeout(() => {
      advance(true)
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [advance, state])

  if (!verse) return null
  const displayVerse = visible
  const displayHint = config.mode === 'initial' && !visible
  const showText = displayVerse ? verse.text : displayHint ? verse.text.split(/\s+/).map((word) => `${Array.from(word)[0]}…`).join(' ') : '••• ••• ••• •••'
  const isCorrect = state === 'CORRECT'
  const isListening = state === 'LISTENING'
  const isEvaluating = state === 'EVALUATING'

  return (
    <div className="pb-28">
      {isCorrect && <div role="status" className="toast-success mb-5"><span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-400/10 text-emerald-300"><Check size={17} /></span><span className="text-sm font-medium text-emerald-100">MasyaAllah, lanjut ayat berikutnya...</span><span className="ml-auto text-[11px] text-emerald-300/70">Tepat {useMurojaahStore.getState().result?.score}%</span></div>}
      {alignmentNotice && <div role="status" className="mb-5 rounded-2xl border border-amber-300/20 bg-amber-300/[.06] px-4 py-3 text-sm text-amber-100">{alignmentNotice}</div>}
      {error && <div role="alert" className="mb-5 rounded-2xl border border-rose-400/20 bg-rose-400/[.07] px-4 py-3 text-sm text-rose-200">{error}</div>}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><p className="eyebrow mb-1">SEDANG DIUJI</p><p className="text-sm font-medium text-white">{surah.transliteration} <span className="text-slate-500">· {verses.length} ayat</span></p></div>
        <div className="flex items-center gap-2 rounded-full border border-white/[.07] bg-white/[.025] px-3 py-1.5 text-xs text-slate-400"><span className={`h-1.5 w-1.5 rounded-full ${isListening ? 'animate-pulse bg-rose-400' : 'bg-slate-600'}`} /> {isListening ? 'Mendengarkan' : isEvaluating ? 'Menilai...' : isCorrect ? 'Ayat benar' : 'Siap menyimak'}</div>
      </div>

      {previous && <div className="verse-card verse-complete mb-3"><div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[.12em] text-emerald-300/70"><Check size={13} /> Ayat sebelumnya · selesai</div><p dir="rtl" className="arabic-text mt-2 text-right text-xl text-slate-400">{previous.text}</p></div>}

      <section className={`verse-card verse-active rounded-3xl p-5 sm:p-7 ${isListening ? 'animate-glow-breathe' : ''}`}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2"><span className="rounded-full border border-cyan-300/20 bg-cyan-300/[.08] px-2.5 py-1 text-[10px] font-semibold tracking-[.12em] text-cyan-200">AYAT AKTIF</span>{isListening && <span className="live-badge"><span /> LIVE</span>}</div>
          <span className="grid h-9 min-w-9 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[.06] px-2 text-xs font-medium text-cyan-200">{verse.number}</span>
        </div>
        <p dir="rtl" className={`arabic-text min-h-[92px] text-right text-[1.7rem] leading-[1.9] sm:text-[2.25rem] ${displayVerse ? 'text-white' : 'text-slate-500 blur-[1.5px]'} transition`}>{showText}</p>
        <div className="mt-5 rounded-2xl border border-white/[.06] bg-[#080d16]/65 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">Transkripsi suara</span>
            <div className="flex h-5 items-center gap-[3px]" aria-label={isListening ? 'Audio sedang terdeteksi' : 'Audio tidak aktif'}>
              {Array.from({ length: 13 }, (_, index) => <span key={index} className={`audio-bar ${isListening ? 'audio-bar-active' : ''}`} style={{ animationDelay: `${index * 0.075}s` }} />)}
            </div>
          </div>
          <p dir="rtl" className={`arabic-text min-h-8 text-right text-lg ${transcript ? 'text-slate-100' : 'text-slate-600'}`}>{transcript || (isListening ? 'تحدث الآن…' : 'اضغط على الميكروفون للبدء')}</p>
          {state === 'REQUEST_MIC' && <button type="button" onClick={onStart} className="secondary-button mt-3 !min-h-9 !px-3 !py-1.5 text-xs"><Mic size={14} /> Izinkan & mulai mendengarkan</button>}
          {isEvaluating && <p className="mt-2 text-[11px] text-cyan-300">Mencocokkan ayat...</p>}
        </div>
      </section>

      {next && <div className="verse-card verse-locked mt-3"><div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[.12em] text-slate-600"><LockKeyhole size={13} /> Ayat berikutnya · terkunci</div><p dir="rtl" className="arabic-text mt-2 text-right text-xl text-slate-700 blur-[2px]">{next.text}</p></div>}
      {!next && <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-white/[.05] bg-white/[.015] px-4 py-3 text-xs text-slate-500"><Volume2 size={14} /> Ayat terakhir dalam sesi ini</div>}

      <div className="control-dock fixed bottom-[76px] left-3 right-3 z-20 rounded-2xl px-4 py-3 md:bottom-5 md:left-[calc(272px+2rem)] md:right-8">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex justify-between text-[10px]"><span className="text-slate-400">Progres sesi</span><span className="font-medium text-cyan-200">{progress}% <span className="text-slate-600">· {done}/{verses.length}</span></span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-brand-gradient transition-all duration-500" style={{ width: `${progress}%` }} /></div>
          </div>
          <button type="button" onClick={toggleVisible} className="dock-button" title={visible ? 'Sembunyikan teks' : 'Tampilkan teks'}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}<span className="hidden sm:inline">{visible ? 'Sembunyikan' : 'Teks'}</span></button>
          <button type="button" onClick={onStop} className="stop-button"><Square size={13} fill="currentColor" /><span className="hidden sm:inline">Stop</span></button>
        </div>
      </div>
    </div>
  )
}
