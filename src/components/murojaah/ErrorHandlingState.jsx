import { AlertTriangle, Lightbulb, RotateCcw, SkipForward } from 'lucide-react'
import { useMurojaahStore } from '../../store/useMurojaahStore.js'
import { getSurah } from '../../utils/quranData.js'

export function ErrorHandlingState({ onRetry, onContinue }) {
  const attempts = useMurojaahStore((store) => store.attempts)
  const result = useMurojaahStore((store) => store.result)
  const verses = useMurojaahStore((store) => store.verses)
  const currentIndex = useMurojaahStore((store) => store.currentIndex)
  const config = useMurojaahStore((store) => store.config)
  const verse = verses[currentIndex]
  const exhausted = attempts >= 3
  const incorrect = result?.incorrectIndexes ?? []
  const mistakes = result?.mistakes ?? []
  const firstWrong = incorrect[0]
  const targetWord = result?.words?.[firstWrong]?.word
  const firstLetter = targetWord ? Array.from(targetWord)[0] : '—'
  const surah = getSurah(config.surahNumber)
  const fallbackMistakes = (result?.words ?? [])
    .filter(({ correct }) => !correct)
    .map(({ word }, index) => ({
      wordIndex: index,
      targetWord: word,
      spokenWord: '',
      tajwidHints: [{ label: 'Belum terdeteksi', detail: 'Pencocokan suara hanya menilai lafaz, bukan makhraj atau kualitas tajwid.' }],
    }))
  const shownMistakes = mistakes.length ? mistakes : fallbackMistakes

  return (
    <section className="glass-panel animate-card-rise mx-auto max-w-2xl rounded-3xl p-5 sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-amber-300/15 bg-amber-300/[.08] text-amber-300"><AlertTriangle size={21} /></span>
        <div><p className="eyebrow mb-1">AYAT {verse?.number} · {surah.transliteration.toUpperCase()}</p><h2 className="font-display text-xl font-semibold text-white">{exhausted ? 'Tetap semangat, ulangi perlahan.' : 'Ada bagian yang perlu diperbaiki.'}</h2><p className="mt-1 text-sm text-slate-400">Kesempatan {Math.min(attempts, 3)} dari 3 · Akurasi {result?.score ?? 0}%</p></div>
      </div>
      <div className="rounded-2xl border border-white/[.06] bg-[#080d16]/70 p-5">
        <div className="mb-3 flex items-center gap-2 text-xs text-slate-500"><Lightbulb size={14} className="text-amber-300" /> Petunjuk hafalan & tajwid</div>
        <p className="mb-4 text-sm text-slate-400">
          {exhausted ? 'Kata yang keliru sudah ditandai. Dengarkan kembali dan baca ayat lengkapnya.' : `Salah pada kata ke-${firstWrong + 1}. Huruf awalnya: ${firstLetter}.`}
        </p>
        <div className="space-y-3">
          {shownMistakes.slice(0, 3).map((mistake, index) => (
            <div key={`${mistake.targetWord}-${mistake.wordIndex ?? index}`} className="rounded-xl border border-rose-400/15 bg-rose-400/[.04] p-3">
              <p className="text-xs uppercase tracking-[.12em] text-rose-300">Salah pada kata {mistake.wordIndex !== undefined ? `${mistake.wordIndex + 1}` : `${index + 1}`}</p>
              <p dir="rtl" className="arabic-text mt-1 text-right text-xl text-slate-100">{mistake.targetWord}</p>
              <p dir="rtl" className="mt-1 text-right text-sm text-slate-400">Terdengar: {mistake.spokenWord || 'tidak terdeteksi'}</p>
              <div className="mt-2 space-y-1">
                {mistake.tajwidHints.map((hint) => (
                  <p key={hint.label} className="text-sm text-amber-200">Petunjuk {hint.label}: {hint.detail}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p dir="rtl" className="arabic-text mt-5 text-right text-2xl leading-[2.1] text-slate-200">{(result?.words ?? []).map(({ word, correct }, index) => <span key={`${word}-${index}`} className={`${correct ? 'text-emerald-200' : 'rounded-md bg-rose-400/10 px-1 text-rose-300 underline decoration-rose-400/50 decoration-dotted underline-offset-4'} ml-1`}>{word}</span>)}</p>
        {exhausted && <p dir="rtl" className="arabic-text mt-4 border-t border-white/[.06] pt-4 text-right text-lg leading-9 text-slate-500">{verse?.text}</p>}
      </div>
      {!exhausted ? (
        <button type="button" onClick={onRetry} className="primary-button mt-5 w-full justify-center"><RotateCcw size={15} /> Coba lagi</button>
      ) : (
        <button type="button" onClick={onContinue} className="secondary-button mt-5 w-full justify-center">Lanjutkan ke ayat berikutnya <SkipForward size={15} /></button>
      )}
      {!exhausted && <p className="mt-3 text-center text-[11px] text-slate-600">Tarik napas, fokus pada setiap kata, lalu coba lagi.</p>}
    </section>
  )
}
