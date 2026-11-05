import { surahs } from './quranData.js'

const RECITER_AUDIO_BASE_URL = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy'

export function getRecitationAudioUrl(reference) {
  const match = String(reference).match(/(\d+)\s*:\s*(\d+)\s*$/u)
  if (!match) return ''

  const [, surahNumber, ayahNumber] = match.map(Number)
  const surahIndex = surahs.findIndex((surah) => surah.number === surahNumber)
  const surah = surahs[surahIndex]
  if (!surah || ayahNumber < 1 || ayahNumber > surah.verses.length) return ''

  const firstAyahNumber = surahs
    .slice(0, surahIndex)
    .reduce((total, item) => total + item.verses.length, 0) + ayahNumber

  return `${RECITER_AUDIO_BASE_URL}/${firstAyahNumber}.mp3`
}
