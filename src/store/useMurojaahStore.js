import { create } from 'zustand'
import { getSurah } from '../utils/quranData.js'
import { evaluate } from '../utils/matcher.js'

const initialConfig = { surahNumber: 1, startAyah: 1, endAyah: 7, mode: 'hidden', threshold: 85 }

export const useMurojaahStore = create((set, get) => ({
  state: 'IDLE',
  config: initialConfig,
  verses: [],
  currentIndex: 0,
  attempts: 0,
  transcript: '',
  result: null,
  verseResults: [],
  alignmentNotice: '',
  error: '',
  visible: false,
  setConfig: (config) => set((store) => ({ config: { ...store.config, ...config } })),
  startTest: (config = get().config) => {
    const surah = getSurah(config.surahNumber)
    const verses = surah.verses.filter((verse) => verse.number >= Number(config.startAyah) && verse.number <= Number(config.endAyah))
    if (!verses.length) {
      set({ error: 'Rentang ayat tidak tersedia untuk surah ini.' })
      return
    }
    set({
      config: { ...config },
      verses,
      currentIndex: 0,
      attempts: 0,
      transcript: '',
      result: null,
      verseResults: [],
      alignmentNotice: '',
      error: '',
      visible: config.mode === 'text',
      state: 'REQUEST_MIC',
    })
  },
  setState: (state) => set({ state }),
  setError: (error) => set({ error, state: 'REQUEST_MIC' }),
  setTranscript: (transcript) => set({ transcript }),
  toggleVisible: () => set((store) => ({ visible: !store.visible })),
  evaluateTranscript: (spoken) => {
    const { verses, currentIndex, attempts, config, verseResults } = get()
    const verse = verses[currentIndex]
    if (!verse) return
    set({ state: 'EVALUATING', transcript: spoken })
    const result = evaluate(spoken, verse.text)
    if (result.score >= config.threshold) {
      const updatedResults = [...verseResults, { verse, ...result, passed: true }]
      const isLast = currentIndex >= verses.length - 1
      set({ result, verseResults: updatedResults, alignmentNotice: '', state: isLast ? 'FINISHED' : 'CORRECT', attempts: 0 })
      return
    }

    let bestMatch = null
    for (let index = currentIndex + 1; index < verses.length; index += 1) {
      const candidateResult = evaluate(spoken, verses[index].text)
      if (candidateResult.score >= config.threshold && candidateResult.score >= result.score + 15
        && (!bestMatch || candidateResult.score > bestMatch.result.score)) {
        bestMatch = { index, result: candidateResult }
      }
    }
    if (bestMatch) {
      const skippedResults = verses.slice(currentIndex, bestMatch.index)
        .map((skippedVerse) => ({ verse: skippedVerse, score: 0, passed: false }))
      const matchedVerse = verses[bestMatch.index]
      const updatedResults = [
        ...verseResults,
        ...skippedResults,
        { verse: matchedVerse, ...bestMatch.result, passed: true },
      ]
      const isLast = bestMatch.index >= verses.length - 1
      set({
        currentIndex: bestMatch.index,
        result: bestMatch.result,
        verseResults: updatedResults,
        alignmentNotice: `Bacaan cocok dengan ayat ${matchedVerse.number}. Ayat ${verse.number} belum tertangkap dan ditandai untuk diulang.`,
        state: isLast ? 'FINISHED' : 'CORRECT',
        attempts: 0,
      })
      return
    }

    const nextAttempt = attempts + 1
    set({
      result,
      attempts: nextAttempt,
      state: nextAttempt >= 3 ? 'WRONG' : 'WRONG',
      verseResults: nextAttempt >= 3 ? [...verseResults, { verse, ...result, passed: false }] : verseResults,
    })
  },
  retry: () => set({ state: 'REQUEST_MIC', transcript: '', error: '' }),
  advance: (keepListening = false) => {
    const { verses, currentIndex } = get()
    if (currentIndex >= verses.length - 1) {
      set({ state: 'FINISHED' })
      return
    }
    set({ currentIndex: currentIndex + 1, attempts: 0, transcript: '', result: null, alignmentNotice: '', state: keepListening ? 'LISTENING' : 'REQUEST_MIC' })
  },
  stopTest: () => set({ state: 'FINISHED' }),
  reset: () => set({ state: 'IDLE', verses: [], currentIndex: 0, attempts: 0, transcript: '', result: null, verseResults: [], alignmentNotice: '', error: '', visible: false }),
}))
