import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, AudioLines, BookOpen, ChevronRight, GraduationCap, Info, Volume2 } from 'lucide-react'
import { getTajwidAccent } from '../../utils/tajwidData.js'
import { getRecitationAudioUrl } from '../../utils/recitationAudio.js'
import { getTajwidExampleForLetter } from '../../utils/tajwidExamples.js'

export function TajwidLessonDetail({ chapter, initialRuleId, onBack, onStartQuiz, onRuleChange, storageError = '' }) {
  const initialRule = chapter.rules.find((rule) => rule.id === initialRuleId) ?? chapter.rules[0]
  const [selectedRule, setSelectedRule] = useState(initialRule)
  const [selectedLetter, setSelectedLetter] = useState('')
  const [audioNotice, setAudioNotice] = useState('')
  const [audioPlaying, setAudioPlaying] = useState(false)
  const audioRef = useRef(null)
  const accent = getTajwidAccent(selectedRule.color)
  const selectedExample = useMemo(
    () => selectedLetter ? getTajwidExampleForLetter(selectedRule, selectedLetter) : selectedRule,
    [selectedLetter, selectedRule],
  )
  const exampleWords = selectedExample.example.split(/\s+/u)
  const audioUrl = getRecitationAudioUrl(selectedExample.reference)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setAudioPlaying(false)
    setAudioNotice('')
    return undefined
  }, [selectedExample])

  useEffect(() => () => {
    audioRef.current?.pause()
  }, [])

  const playAudio = async () => {
    const audio = audioRef.current
    if (!audioUrl || !audio) {
      setAudioNotice('Audio untuk ayat contoh ini tidak tersedia.')
      return
    }
    setAudioNotice('Menghubungkan ke audio bacaan...')
    try {
      await audio.play()
    } catch (error) {
      setAudioPlaying(false)
      setAudioNotice(error.name === 'NotAllowedError'
        ? 'Browser memblokir pemutaran audio. Tekan tombol putar pada pemutar audio di bawah.'
        : 'Audio gagal diputar. Periksa koneksi internet, lalu coba lagi.')
    }
  }

  const selectRule = (rule) => {
    audioRef.current?.pause()
    setSelectedRule(rule)
    setSelectedLetter('')
    setAudioNotice('')
    onRuleChange(rule)
  }

  return (
    <div className="space-y-5">
      {storageError && <p role="alert" className="rounded-xl border border-amber-300/15 bg-amber-300/[.05] px-3 py-2 text-xs text-amber-100">{storageError}</p>}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <button type="button" onClick={onBack} className="transition hover:text-cyan-200">Belajar Tajwid</button>
        <ChevronRight size={13} />
        <span>{chapter.title}</span>
        <ChevronRight size={13} />
        <span className="text-cyan-200">{selectedRule.title}</span>
      </nav>

      <button type="button" onClick={onBack} className="secondary-button !min-h-10 !px-3 !py-2 text-xs"><ArrowLeft size={14} /> Semua bab</button>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
        <main className="space-y-5">
          <section className="glass-panel relative overflow-hidden rounded-3xl p-5 sm:p-8">
            <div className="absolute -right-14 -top-20 h-56 w-56 rounded-full bg-cyan-400/[.07] blur-3xl" />
            <div className="relative">
              <p className="eyebrow">{chapter.title.toUpperCase()} · MATERI</p>
              <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">{selectedRule.title}</h1>
                  <p dir="rtl" lang="ar" className="font-arabic mt-2 text-2xl text-cyan-100">{selectedRule.arabic}</p>
                </div>
                <span className="rounded-full border px-3 py-1.5 text-[10px] font-semibold tracking-wide" style={{ color: accent.text, borderColor: accent.border, backgroundColor: accent.background }}>KAIDAH TAJWID</span>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300">{selectedRule.definition}</p>
            </div>
          </section>

          <section className="glass-panel rounded-3xl p-5 sm:p-7">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[.06] text-cyan-200"><BookOpen size={17} /></span>
              <div><p className="eyebrow">HURUF & PANDUAN</p><h2 className="mt-0.5 text-sm font-semibold text-white">Kenali hurufnya</h2></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedRule.letters.map((letter, index) => (
                <button
                  type="button"
                  key={`${letter}-${index}`}
                  onClick={() => {
                    audioRef.current?.pause()
                    setSelectedLetter(letter)
                  }}
                  aria-pressed={selectedLetter === letter}
                  className={`grid min-h-12 min-w-12 place-items-center rounded-xl border px-3 font-arabic text-2xl transition ${selectedLetter === letter ? 'border-cyan-300/40 bg-cyan-300/[.1] text-cyan-100' : 'border-white/[.08] bg-white/[.025] text-slate-200 hover:border-cyan-300/25 hover:bg-cyan-300/[.04]'}`}
                  aria-label={`Tampilkan contoh ${selectedRule.title} untuk huruf ${letter}`}
                >
                  {letter}
                </button>
              ))}
            </div>
            {selectedLetter && <p role="status" className="mt-3 text-xs text-slate-400">Contoh untuk huruf: <span dir="rtl" className="font-arabic text-lg text-cyan-200">{selectedLetter}</span></p>}
          </section>

          <section className="glass-panel rounded-3xl p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="eyebrow">CONTOH AYAT</p><h2 className="mt-1 text-sm font-semibold text-white">{selectedExample.reference}</h2></div>
              <span className="rounded-full border px-3 py-1.5 text-[10px] font-medium" style={{ color: accent.text, borderColor: accent.border, backgroundColor: accent.background }}>Bagian contoh ditandai</span>
            </div>
            <div className="mt-4 rounded-2xl border border-white/[.06] bg-[#080d16]/65 p-5">
              <p dir="rtl" lang="ar" className="arabic-text text-right text-3xl leading-[2.1] text-slate-400 sm:text-4xl">
                {exampleWords.map((word, index) => {
                  const highlighted = !selectedLetter || selectedExample.highlightedWords?.includes(word)
                  return (
                    <span key={`${word}-${index}`} className={highlighted ? 'rounded-lg border px-2' : ''} style={highlighted ? { color: accent.text, borderColor: accent.border, backgroundColor: accent.background } : undefined}>
                      {word}{index < exampleWords.length - 1 ? ' ' : ''}
                    </span>
                  )
                })}
              </p>
              <p className="mt-4 border-t border-white/[.06] pt-4 text-sm leading-7 text-slate-300">{selectedExample.breakdown}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" onClick={playAudio} disabled={!audioUrl} className="secondary-button !min-h-10 !px-3 !py-2 text-xs">
                <Volume2 size={15} /> {audioPlaying ? 'Sedang diputar' : 'Putar bacaan qari'}
              </button>
              <span className="text-[11px] text-slate-500">Bacaan ayat lengkap · Mishary Alafasy</span>
            </div>
            <audio
              ref={audioRef}
              key={audioUrl}
              src={audioUrl || undefined}
              controls
              preload="none"
              onPlay={() => {
                setAudioPlaying(true)
                setAudioNotice('Bacaan ayat sedang diputar.')
              }}
              onPause={() => setAudioPlaying(false)}
              onEnded={() => {
                setAudioPlaying(false)
                setAudioNotice('Bacaan ayat selesai.')
              }}
              onError={() => {
                setAudioPlaying(false)
                setAudioNotice('Audio tidak dapat dimuat. Periksa koneksi internet, lalu coba lagi.')
              }}
              className="mt-4 h-10 w-full"
              aria-label={`Bacaan Al-Qur’an ${selectedExample.reference}`}
            />
            {audioNotice && <p role="status" className="mt-3 text-xs text-slate-300">{audioNotice}</p>}
          </section>

          <div className="flex items-start gap-3 rounded-2xl border border-cyan-300/10 bg-cyan-300/[.035] p-4 text-xs leading-6 text-slate-400">
            <Info size={16} className="mt-0.5 shrink-0 text-cyan-300" />
            <p>Contoh dan panduan ini untuk belajar dasar. Pelafalan, sifat huruf, dan penerapan hukum perlu ditashih langsung kepada guru Al-Qur’an.</p>
          </div>
        </main>

        <aside className="space-y-4">
          <section className="glass-panel rounded-3xl p-4">
            <p className="eyebrow px-2 py-1">MATERI DALAM BAB</p>
            <div className="mt-2 max-h-[360px] space-y-1 overflow-y-auto">
              {chapter.rules.map((rule, index) => (
                <button
                  type="button"
                  key={rule.id}
                  onClick={() => selectRule(rule)}
                  aria-current={selectedRule.id === rule.id ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition ${selectedRule.id === rule.id ? 'border border-cyan-300/15 bg-cyan-300/[.07] text-cyan-100' : 'border border-transparent text-slate-400 hover:bg-white/[.035] hover:text-slate-200'}`}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white/[.04] text-[10px]">{index + 1}</span>
                  <span>{rule.title}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="glass-panel rounded-3xl p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-300/15 bg-emerald-300/[.06] text-emerald-200"><GraduationCap size={19} /></span>
            <h2 className="mt-4 font-display text-base font-semibold text-white">Sudah siap berlatih?</h2>
            <p className="mt-2 text-xs leading-5 text-slate-400">Uji pemahamanmu dengan 10 soal dari bab ini.</p>
            <button type="button" onClick={onStartQuiz} className="primary-button mt-4 w-full justify-center !text-xs">Coba kuis bab <ArrowRight size={14} /></button>
          </section>
          <div className="glass-panel flex items-center gap-3 rounded-2xl p-4 text-xs text-slate-400"><AudioLines size={17} className="shrink-0 text-cyan-300" /><span>Audio merupakan rekaman qari untuk satu ayat lengkap. Contoh yang ditandai adalah potongan dari bacaan.</span></div>
        </aside>
      </div>
    </div>
  )
}
