const HARAKAT = /[\u064B-\u065F\u0670]/g
const WORD_MATCH_THRESHOLD = 0.65

function tajwidHintsForWord(word = '', nextWord = '') {
  const cleanWord = word.replace(/^\uFEFF/u, '')
  const cleanNextWord = nextWord.replace(/^\uFEFF/u, '')
  const hints = []
  const addHint = (label, detail) => {
    if (!hints.some((hint) => hint.label === label)) hints.push({ label, detail })
  }

  if (/َا|ٰ|ُوْ?(?![\u064B-\u065F\u0670])|ِيْ?(?![\u064B-\u065F\u0670])/u.test(cleanWord)) {
    addHint('Mad thabii', 'Terlihat huruf mad pada lafaz ini; jaga panjang bacaan dua harakat.')
  }

  if (/[قطبجد](?:ْ|ۡ)/u.test(cleanWord)) {
    addHint('Qalqalah sughra', 'Huruf qalqalah bertanda sukun di tengah lafaz; pantulkan suara dengan ringan.')
  }

  if (/[نم]ّ/u.test(cleanWord)) {
    addHint('Ghunnah', 'Nun atau mim bertasydid dibaca dengung sekitar dua harakat.')
  }

  const nextInitial = normalize(cleanNextWord)[0] ?? ''
  const nunSakinahOrTanwin = /نْ|[ًٌٍ]$/u.test(cleanWord)
  if (nunSakinahOrTanwin && nextInitial) {
    if (nextInitial === 'ب') {
      addHint('Iqlab', 'Nun sukun atau tanwin bertemu ba; bunyikan seperti mim samar dengan dengung.')
    } else if (/[يرملون]/u.test(nextInitial)) {
      addHint('Idgham', 'Nun sukun atau tanwin bertemu huruf idgham; leburkan sesuai huruf berikutnya.')
    } else if (/[تثجددذزسشصضطظفقك]/u.test(nextInitial)) {
      addHint('Ikhfa haqiqi', 'Nun sukun atau tanwin bertemu huruf ikhfa; samarkan nun disertai dengung.')
    } else if (/[ءهعحغخ]/u.test(nextInitial)) {
      addHint('Izhar halqi', 'Nun sukun atau tanwin bertemu huruf halqi; bacakan nun dengan jelas.')
    }
  }

  const meemSakinah = /مْ$/u.test(cleanWord)
  if (meemSakinah && nextInitial === 'ب') {
    addHint('Ikhfa syafawi', 'Mim sukun bertemu ba; samarkan mim dengan dengung.')
  } else if (meemSakinah && nextInitial === 'م') {
    addHint('Idgham mimi', 'Mim sukun bertemu mim; leburkan dengan dengung.')
  } else if (/مْ/u.test(cleanWord) && nextInitial && !/[بم]/u.test(nextInitial)) {
    addHint('Izhar syafawi', 'Mim sukun bertemu selain mim atau ba; bacakan mim dengan jelas.')
  }

  if (hints.length === 0) {
    addHint(
      'Belum terdeteksi',
      'Tidak ada pola tajwid dasar yang dapat dipastikan dari potongan teks ini. Pencocokan suara hanya menilai lafaz, bukan makhraj atau kualitas tajwid.'
    )
  }

  return hints
}

export function normalize(text = '') {
  return String(text)
    .normalize('NFC')
    .replace(HARAKAT, '')
    .replace(/\u0640/g, '')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function levenshteinDistance(left, right) {
  const a = Array.from(left)
  const b = Array.from(right)
  const row = Array.from({ length: b.length + 1 }, (_, index) => index)

  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const above = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1))
      diagonal = above
    }
  }
  return row[b.length]
}

function wordSimilarity(left, right) {
  if (!left && !right) return 1
  const longest = Math.max(Array.from(left).length, Array.from(right).length)
  return longest === 0 ? 1 : 1 - levenshteinDistance(left, right) / longest
}

export function evaluate(spoken, target) {
  const spokenWords = normalize(spoken).split(' ').filter(Boolean)
  const targetWords = normalize(target).split(' ').filter(Boolean)
  const targetOrthographyWords = String(target).normalize('NFC').replace(/^\uFEFF/u, '').split(/\s+/u).filter(Boolean)
  if (targetWords.length === 0) return { score: 0, passed: false, words: [], incorrectIndexes: [], mistakes: [] }

  const rows = targetWords.length + 1
  const columns = spokenWords.length + 1
  const costs = Array.from({ length: rows }, () => Array(columns).fill(0))
  const steps = Array.from({ length: rows }, () => Array(columns).fill(''))

  for (let i = 1; i < rows; i += 1) {
    costs[i][0] = i
    steps[i][0] = 'delete'
  }
  for (let j = 1; j < columns; j += 1) {
    costs[0][j] = j
    steps[0][j] = 'insert'
  }
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < columns; j += 1) {
      const substitution = costs[i - 1][j - 1] + (wordSimilarity(targetWords[i - 1], spokenWords[j - 1]) >= WORD_MATCH_THRESHOLD ? 0 : 1)
      const deletion = costs[i - 1][j] + 1
      const insertion = costs[i][j - 1] + 1
      const minimum = Math.min(substitution, deletion, insertion)
      costs[i][j] = minimum
      steps[i][j] = minimum === substitution ? 'match' : minimum === deletion ? 'delete' : 'insert'
    }
  }

  const matched = Array(targetWords.length).fill(false)
  let i = targetWords.length
  let j = spokenWords.length
  while (i > 0 || j > 0) {
    const step = steps[i][j]
    if (step === 'match') {
      matched[i - 1] = wordSimilarity(targetWords[i - 1], spokenWords[j - 1]) >= WORD_MATCH_THRESHOLD
      i -= 1
      j -= 1
    } else if (step === 'delete') {
      i -= 1
    } else if (step === 'insert') {
      j -= 1
    } else {
      break
    }
  }

  const incorrectIndexes = matched.flatMap((correct, index) => (correct ? [] : [index]))
  const mistakes = incorrectIndexes.map((index) => ({
    wordIndex: index,
    targetWord: targetOrthographyWords[index] ?? targetWords[index],
    spokenWord: spokenWords[index] ?? '',
    tajwidHints: tajwidHintsForWord(targetOrthographyWords[index], targetOrthographyWords[index + 1]),
  }))

  const correctCount = matched.filter(Boolean).length
  const score = Math.round((correctCount / Math.max(targetWords.length, spokenWords.length)) * 100)
  return {
    score,
    passed: score >= 80,
    words: targetWords.map((word, index) => ({
      word: targetOrthographyWords[index] ?? word,
      correct: matched[index],
    })),
    incorrectIndexes,
    mistakes,
  }
}
