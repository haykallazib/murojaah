import { Check, RotateCcw, X } from 'lucide-react'
import { useMurojaahStore } from '../../store/useMurojaahStore.js'
import { getSurah } from '../../utils/quranData.js'

export function ResultScreen({ onRestart }) {
  const verseResults = useMurojaahStore((store) => store.verseResults)
  const config = useMurojaahStore((store) => store.config)
  const surah = getSurah(config.surahNumber)
  const score = verseResults.length ? Math.round(verseResults.reduce((total, item) => total + item.score, 0) / verseResults.length) : 0
  const passed = score >= config.threshold

  return (
    <section className="glass-panel animate-card-rise mx-auto max-w-3xl overflow-hidden rounded-3xl">
      <div className="relative overflow-hidden border-b border-white/[.06] px-6 py-9 text-center sm:px-10">
        <div className="absolute left-1/2 top-[-100px] h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/[.1] blur-3xl" />
        <span className={`relative mx-auto grid h-14 w-14 place-items-center rounded-2xl border ${passed ? 'border-emerald-300/20 bg-emerald-300/[.08] text-emerald-300' : 'border-amber-300/20 bg-amber-300/[.08] text-amber-300'}`}>{passed ? <Check size={25} /> : <RotateCcw size={23} />}</span>
        <p className="eyebrow relative mt-5">SESI SELESAI · {surah.transliteration.toUpperCase()}</p>
        <h2 className="relative mt-2 font-display text-2xl font-semibold text-white">{passed ? 'MasyaAllah, hafalan terjaga.' : 'Terus berlatih, kamu semakin dekat.'}</h2>
        <p className="relative mt-2 text-sm text-slate-400">Kamu telah menyelesaikan {verseResults.length} ayat.</p>
        <div className="relative mx-auto mt-6 flex h-28 w-28 flex-col items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/[.04] shadow-[inset_0_0_25px_rgba(6,182,212,.08)]"><span className="font-display text-3xl font-semibold text-white">{score}%</span><span className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">akurasi</span></div>
        <p className="relative mt-3 text-xs text-slate-500">Ambang kelulusan {config.threshold}%</p>
      </div>
      <div className="p-5 sm:p-7">
        <div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-semibold text-white">Rincian ayat</h3><span className="text-xs text-slate-500">{verseResults.filter((item) => item.passed).length} benar · {verseResults.filter((item) => !item.passed).length} perlu diulang</span></div>
        <div className="space-y-2">
          {verseResults.map((item, index) => (
            <div key={`${item.verse.number}-${index}`} className="flex items-center gap-3 rounded-xl border border-white/[.05] bg-white/[.02] px-3 py-3">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${item.passed ? 'bg-emerald-400/[.08] text-emerald-300' : 'bg-rose-400/[.08] text-rose-300'}`}>{item.passed ? <Check size={15} /> : <X size={15} />}</span>
              <div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-200">Ayat {item.verse.number}</p><p dir="rtl" className="arabic-text truncate text-right text-base text-slate-500">{item.verse.text}</p></div>
              <span className={`text-xs font-medium ${item.passed ? 'text-emerald-300' : 'text-rose-300'}`}>{item.score}%</span>
            </div>
          ))}
        </div>
        <button type="button" onClick={onRestart} className="primary-button mt-6 w-full justify-center"><RotateCcw size={15} /> Mulai sesi baru</button>
      </div>
    </section>
  )
}
