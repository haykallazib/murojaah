import { describe, expect, it } from 'vitest'
import { evaluate, levenshteinDistance, normalize } from './matcher.js'

describe('Arabic recitation matcher', () => {
  it('normalizes diacritics, tatweel, and common letter variants', () => {
    expect(normalize('آإأٱعَلَىٰـة')).toBe('ااااعليه')
  })

  it('calculates character-level Levenshtein distance', () => {
    expect(levenshteinDistance('كتاب', 'كتابة')).toBe(1)
  })

  it('accepts a fully matching recitation without harakat', () => {
    expect(evaluate('بسم الله الرحمن الرحيم', 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')).toMatchObject({
      score: 100,
      passed: true,
      incorrectIndexes: [],
    })
  })

  it('tolerates a small transcription variation in a short Arabic word', () => {
    expect(evaluate('ربي', 'رَبِّ')).toMatchObject({
      score: 100,
      passed: true,
      incorrectIndexes: [],
    })
  })

  it('returns word-level mistakes and an accuracy score', () => {
    expect(evaluate('الحمد لله رب الناس', 'الحمد لله رب العالمين')).toMatchObject({
      score: 75,
      passed: false,
      incorrectIndexes: [3],
    })
  })

  it('penalizes extra transcribed words', () => {
    expect(evaluate('بسم الله الرحمن الرحيم السلام', 'بسم الله الرحمن الرحيم').score).toBe(80)
  })

  it('identifies tajwid cues from the target word rather than guessing from its letters', () => {
    const result = evaluate('خطأ', 'مِنْ شَرِّ')

    expect(result.mistakes[0]).toMatchObject({
      wordIndex: 0,
      targetWord: 'مِنْ',
      tajwidHints: [{ label: 'Ikhfa haqiqi' }],
    })
  })

  it('reports the written madd and qalqalah patterns when present', () => {
    expect(evaluate('خطأ', 'قَالَ').mistakes[0].tajwidHints).toContainEqual(
      expect.objectContaining({ label: 'Mad thabii' }),
    )
    expect(evaluate('خطأ', 'أَقْبَلَ').mistakes[0].tajwidHints).toContainEqual(
      expect.objectContaining({ label: 'Qalqalah sughra' }),
    )
  })

  it('does not claim a tajwid rule when it cannot identify one from the text', () => {
    expect(evaluate('خطأ', 'هُوَ').mistakes[0].tajwidHints).toContainEqual(
      expect.objectContaining({ label: 'Belum terdeteksi' }),
    )
  })
})
