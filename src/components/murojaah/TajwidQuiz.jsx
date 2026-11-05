import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, RotateCcw, Trophy, X } from 'lucide-react'
import { getTajwidAccent } from '../../utils/tajwidData.js'
import { createQuestions } from '../../utils/tajwidQuiz.js'

const QUESTION_COUNT = 10

export function TajwidQuiz({ chapter, onBack, onComplete, storageError = '' }) {
  const [questions, setQuestions] = useState(() => createQuestions(chapter))
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedId, setSelectedId] = useState('')
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const question = questions[questionIndex]
  const isCorrect = selectedId === question?.answer.id
  const accent = getTajwidAccent(question?.answer.color)

  const answerQuestion = (ruleId) => {
    if (selectedId) return
    setSelectedId(ruleId)
    if (ruleId === question.answer.id) setScore((value) => value + 1)
  }

  const nextQuestion = () => {
    if (questionIndex === QUESTION_COUNT - 1) {
      const finalScore = score
      onComplete(finalScore)
      setFinished(true)
      return
    }
    setQuestionIndex((index) => index + 1)
    setSelectedId('')
  }

  const restart = () => {
    setQuestions(createQuestions(chapter))
    setQuestionIndex(0)
    setSelectedId('')
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <section className="glass-panel mx-auto max-w-2xl rounded-3xl p-7 text-center sm:p-10">
        {storageError && <p role="alert" className="mb-5 rounded-xl border border-amber-300/15 bg-amber-300/[.05] px-3 py-2 text-left text-xs text-amber-100">{storageError}</p>}
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/[.08] text-emerald-300"><Trophy size={28} /></span>
        <p className="eyebrow mt-6">KUIS SELESAI · {chapter.title.toUpperCase()}</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-white">Alhamdulillah, latihan selesai.</h2>
        <p className="mt-3 text-sm text-slate-400">Skor kamu</p>
        <p className="mt-1 font-display text-5xl font-semibold text-gradient">{score}/{QUESTION_COUNT}</p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-400">Gunakan hasil ini sebagai bahan belajar, lalu talaqqi bacaan dengan guru untuk memastikan makhraj dan penerapan hukumnya.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={restart} className="secondary-button"><RotateCcw size={15} /> Ulangi kuis</button>
          <button type="button" onClick={onBack} className="primary-button"><ArrowLeft size={15} /> Kembali ke materi</button>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <button type="button" onClick={onBack} className="secondary-button !min-h-10 !px-3 !py-2 text-xs"><ArrowLeft size={14} /> Kembali ke materi</button>
      {storageError && <p role="alert" className="rounded-xl border border-amber-300/15 bg-amber-300/[.05] px-3 py-2 text-xs text-amber-100">{storageError}</p>}
      <div className="glass-panel rounded-3xl p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">KUIS BAB · {chapter.title.toUpperCase()}</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-white">Kenali hukum bacaannya</h2>
          </div>
          <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[.06] px-3 py-1.5 text-xs font-medium text-cyan-200">Soal {questionIndex + 1} dari {QUESTION_COUNT}</span>
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[.07]" role="progressbar" aria-valuenow={questionIndex + 1} aria-valuemin={1} aria-valuemax={QUESTION_COUNT}>
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300" style={{ width: `${((questionIndex + 1) / QUESTION_COUNT) * 100}%` }} />
        </div>
        <div className="mt-3 flex justify-between text-xs text-slate-500"><span>Progres kuis</span><span>Skor {score}</span></div>

        <div className="mt-7 rounded-2xl border border-white/[.07] bg-[#080d16]/60 p-5 sm:p-7">
          <p className="text-sm leading-6 text-slate-300">{question.prompt}</p>
          <p dir="rtl" lang="ar" className="arabic-text mt-4 text-right text-3xl leading-[2.1]" style={{ color: accent.text }}>{question.answer.example}</p>
          <p className="mt-2 text-[11px] text-slate-500">{question.answer.reference}</p>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {question.options.map((option, index) => {
            const correct = option.id === question.answer.id
            const chosen = option.id === selectedId
            const outcomeClass = selectedId && correct
              ? 'border-emerald-300/35 bg-emerald-300/[.08] text-emerald-100'
              : selectedId && chosen
                ? 'border-rose-300/30 bg-rose-300/[.06] text-rose-100'
                : 'border-white/[.08] bg-white/[.025] text-slate-200 hover:border-cyan-300/25 hover:bg-cyan-300/[.04]'
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => answerQuestion(option.id)}
                disabled={Boolean(selectedId)}
                className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 disabled:cursor-default ${outcomeClass}`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-current/15 text-xs">
                  {selectedId && correct ? <Check size={14} /> : selectedId && chosen ? <X size={14} /> : String.fromCharCode(65 + index)}
                </span>
                <span>{option.title}</span>
              </button>
            )
          })}
        </div>

        {selectedId && (
          <div role="status" className={`mt-5 rounded-2xl border p-4 ${isCorrect ? 'border-emerald-300/20 bg-emerald-300/[.05]' : 'border-amber-300/20 bg-amber-300/[.05]'}`}>
            <p className={`text-sm font-semibold ${isCorrect ? 'text-emerald-200' : 'text-amber-200'}`}>{isCorrect ? '✓ Benar' : 'Belum tepat'} · {question.answer.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{question.answer.breakdown} {question.answer.definition}</p>
            <button type="button" onClick={nextQuestion} className="primary-button mt-4 !min-h-10 !px-4 !py-2 text-xs">
              {questionIndex === QUESTION_COUNT - 1 ? 'Lihat hasil' : 'Soal berikutnya'}
              {questionIndex === QUESTION_COUNT - 1 ? <Trophy size={14} /> : <ArrowRight size={14} />}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
