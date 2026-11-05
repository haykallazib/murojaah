import { afterEach, describe, expect, it } from 'vitest'
import { useMurojaahStore } from './useMurojaahStore.js'

describe('Murojaah verse alignment', () => {
  afterEach(() => {
    useMurojaahStore.getState().reset()
  })

  it.each([
    {
      surahNumber: 1,
      endAyah: 7,
      spoken: 'الحمد لله رب العالمين',
      matchedVerse: 2,
    },
    {
      surahNumber: 2,
      endAyah: 3,
      spoken: 'ذلك الكتاب لا ريب فيه هدى للمتقين',
      matchedVerse: 2,
    },
  ])('aligns a clear recitation with the right verse in surah $surahNumber', ({ surahNumber, endAyah, spoken, matchedVerse }) => {
    useMurojaahStore.getState().startTest({
      surahNumber,
      startAyah: 1,
      endAyah,
      mode: 'hidden',
      threshold: 85,
    })

    useMurojaahStore.getState().evaluateTranscript(spoken)

    const state = useMurojaahStore.getState()
    expect(state.currentIndex).toBe(1)
    expect(state.state).toBe('CORRECT')
    expect(state.verseResults.map(({ verse, score, passed }) => ({ number: verse.number, score, passed }))).toEqual([
      { number: 1, score: 0, passed: false },
      { number: matchedVerse, score: 100, passed: true },
    ])
    expect(state.alignmentNotice).toContain(`ayat ${matchedVerse}`)
  })

  it('does not skip the active verse when no later verse matches', () => {
    useMurojaahStore.getState().startTest({
      surahNumber: 1,
      startAyah: 1,
      endAyah: 7,
      mode: 'hidden',
      threshold: 85,
    })

    useMurojaahStore.getState().evaluateTranscript('كلام غير مطابق')

    expect(useMurojaahStore.getState()).toMatchObject({
      currentIndex: 0,
      state: 'WRONG',
      alignmentNotice: '',
    })
  })
})
