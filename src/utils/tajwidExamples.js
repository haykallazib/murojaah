import { surahs } from './quranData.js'

const MARKS = /[\p{M}\u0640]/gu
const IZHHAR_LETTERS = new Set(['ا', 'ه', 'ع', 'ح', 'غ', 'خ'])
const IDGHAM_WITH_GHUNNAH = new Set(['ي', 'ن', 'م', 'و'])
const IDGHAM_WITHOUT_GHUNNAH = new Set(['ل', 'ر'])
const IKHFA_LETTERS = new Set(['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'])
const SUN_LETTERS = new Set(['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن'])

function stripMarks(text) {
  return String(text)
    .replace(MARKS, '')
    .replace(/[\u0622\u0623\u0625\u0671]/gu, '\u0627')
    .replace(/\u0649/gu, '\u064A')
    .replace(/[۞۩۝،؛؟.,:!]/gu, '')
}

function getBaseLetter(text) {
  const letter = Array.from(stripMarks(text))[0] ?? ''
  return letter === 'ء' ? 'ا' : letter
}

function getLetterSequence(text) {
  return stripMarks(text).replace(/\u0621/gu, '\u0627')
}

function getWords(verse) {
  return verse.text
    .replace(/[۞۩۝،؛؟.,:!]/gu, '')
    .split(/\s+/u)
    .filter(Boolean)
}

const quranVerses = surahs.flatMap((surah) => surah.verses.map((verse) => {
  const words = getWords(verse)
  return {
    surah,
    verse,
    words,
    baseWords: words.map((word) => Array.from(stripMarks(word))),
  }
}))

function matchesNunSukunRule(ruleId, previousWord, nextWord, letter) {
  if (!/نْ|[ًٌٍ]/u.test(previousWord) || getBaseLetter(nextWord) !== letter) return false
  if (ruleId === 'izhar-halqi') return IZHHAR_LETTERS.has(letter)
  if (ruleId === 'idgham-bighunnah') return IDGHAM_WITH_GHUNNAH.has(letter)
  if (ruleId === 'idgham-bilaghunnah') return IDGHAM_WITHOUT_GHUNNAH.has(letter)
  if (ruleId === 'iqlab') return letter === 'ب'
  if (ruleId === 'ikhfa-haqiqi') return IKHFA_LETTERS.has(letter)
  return false
}

function matchesMimSukunRule(ruleId, previousWord, nextWord, letter) {
  if (!/مْ/u.test(previousWord) || getBaseLetter(nextWord) !== letter) return false
  if (ruleId === 'ikhfa-syafawi') return letter === 'ب'
  if (ruleId === 'idgham-mimi') return letter === 'م'
  if (ruleId === 'izhar-syafawi') return !['ب', 'م'].includes(letter)
  return false
}

function getVerseReference(surah, verse) {
  return `${surah.transliteration} · ${surah.number}:${verse.number}`
}

function createExample(surah, verse, words, letter, breakdown) {
  return {
    example: words.join(' '),
    reference: getVerseReference(surah, verse),
    breakdown,
    highlightedWords: words,
    selectedLetter: letter,
    matchedRule: true,
  }
}

function findRuleExample(rule, letter) {
  for (const { surah, verse, words, baseWords } of quranVerses) {
    for (let index = 0; index < words.length - 1; index += 1) {
      const previousWord = words[index]
      const nextWord = words[index + 1]

      if (matchesNunSukunRule(rule.id, previousWord, nextWord, letter)) {
        return createExample(
          surah,
          verse,
          [previousWord, nextWord],
          letter,
          `Huruf ${letter} datang setelah nun sukun atau tanwin; contoh ini sesuai dengan hukum ${rule.title}.`,
        )
      }

      if (matchesMimSukunRule(rule.id, previousWord, nextWord, letter)) {
        return createExample(
          surah,
          verse,
          [previousWord, nextWord],
          letter,
          `Mim sukun bertemu huruf ${letter}; contoh ini sesuai dengan hukum ${rule.title}.`,
        )
      }
    }

    for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
      const word = words[wordIndex]
      const baseLetters = baseWords[wordIndex]
      if (rule.id === 'ghunnah-musaddadah' && word.includes(`${letter}ّ`)) {
        return createExample(surah, verse, [word], letter, `Huruf ${letter} bertasydid dibaca dengan ghunnah sekitar dua harakat.`)
      }

      if (rule.id === 'qamariyah' || rule.id === 'syamsiyah') {
        const articleOffset = ['و', 'ف', 'ب', 'ك'].includes(baseLetters[0]) ? 1 : 0
        const articleLetter = baseLetters[articleOffset + 2]
        const isArticle = baseLetters[articleOffset] === 'ا' && baseLetters[articleOffset + 1] === 'ل'
        const isSunLetter = SUN_LETTERS.has(articleLetter) && word.includes('ّ')
        if (
          isArticle
          && articleLetter === letter
          && ((rule.id === 'syamsiyah' && isSunLetter) || (rule.id === 'qamariyah' && !SUN_LETTERS.has(articleLetter)))
        ) {
          return createExample(
            surah,
            verse,
            [word],
            letter,
            rule.id === 'syamsiyah'
              ? `Huruf ${letter} bertasydid setelah ال; lam ta’rif melebur pada huruf syamsiyah.`
              : `Huruf ${letter} setelah ال termasuk huruf qamariyah; lam ta’rif dibaca jelas.`,
          )
        }
      }

      if (rule.id.startsWith('qalqalah-')) {
        const hasLetterSukun = word.includes(`${letter}ْ`)
        const isFinalLetter = baseLetters[baseLetters.length - 1] === letter
        const isKubra = rule.id === 'qalqalah-kubra' && isFinalLetter
        const isSugra = rule.id === 'qalqalah-sughra' && hasLetterSukun && !isFinalLetter
        if (isKubra || isSugra) {
          return createExample(
            surah,
            verse,
            [word],
            letter,
            isKubra
              ? `Jika berhenti pada kata ini, huruf ${letter} menjadi sukun dan dibaca qalqalah kubra.`
              : `Huruf ${letter} bersukun di tengah kata dan dibaca qalqalah sugra.`,
          )
        }
      }
    }
  }
  return null
}

function findLetterInQuran(rule, letter) {
  const sequence = getLetterSequence(letter)
  for (const { surah, verse, words, baseWords } of quranVerses) {
    const matchingWordIndex = baseWords.findIndex((baseLetters) => baseLetters.join('').includes(sequence))
    if (matchingWordIndex >= 0) {
      return createExample(
        surah,
        verse,
        [words[matchingWordIndex]],
        letter,
        `Kata ini memuat huruf ${letter}. Perhatikan makhraj dan sifat huruf tersebut saat membaca.`,
      )
    }
  }
  return null
}

function findWaqfExample(rule, selectedSign) {
  for (const { surah, verse, words } of quranVerses) {
    const markedWordIndex = words.findIndex((word) => word.includes(selectedSign))
    if (markedWordIndex >= 0) {
      const start = Math.max(0, markedWordIndex - 2)
      const end = Math.min(words.length, markedWordIndex + 2)
      const exampleWords = words.slice(start, end)
      return createExample(
        surah,
        verse,
        exampleWords,
        selectedSign,
        `Tanda waqaf ${selectedSign} terdapat pada potongan ayat ini. Ikuti petunjuk mushaf dan jaga agar makna bacaan tetap utuh.`,
      )
    }
  }
  return null
}

export function getTajwidExampleForLetter(rule, selectedLetter) {
  if (rule.id === 'waqaf') {
    return findWaqfExample(rule, selectedLetter)
      ?? { ...rule, breakdown: `Tanda waqaf ${selectedLetter} tidak ditemukan di data mushaf lokal.` }
  }

  const letter = getBaseLetter(selectedLetter)
  if (!letter) return rule

  return findRuleExample(rule, letter)
    ?? findLetterInQuran(rule, selectedLetter)
    ?? {
      example: selectedLetter,
      reference: rule.reference,
      breakdown: `Belum ditemukan contoh ayat yang memuat huruf ${selectedLetter} di data lokal.`,
      highlightedWords: [selectedLetter],
      selectedLetter,
    }
}
