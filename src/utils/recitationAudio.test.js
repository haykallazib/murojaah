import { describe, expect, it } from 'vitest'
import { getRecitationAudioUrl } from './recitationAudio.js'

describe('Quran recitation audio URLs', () => {
  it('resolves a surah and ayah reference to the global recitation number', () => {
    expect(getRecitationAudioUrl('Al-Fatihah · 1:2'))
      .toBe('https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3')
    expect(getRecitationAudioUrl('Al-Baqarah · 2:11'))
      .toBe('https://cdn.islamic.network/quran/audio/128/ar.alafasy/18.mp3')
  })

  it('rejects references that do not point to a valid verse', () => {
    expect(getRecitationAudioUrl('An-Nas · 114:7')).toBe('')
    expect(getRecitationAudioUrl('Not a verse reference')).toBe('')
  })
})
