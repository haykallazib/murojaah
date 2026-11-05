const SUKUN = '\u0652'
const SHADDA = '\u0651'
const TANWIN = new Set(['\u064B', '\u064C', '\u064D'])
const HALQI = new Set(['ء', 'ه', 'ع', 'ح', 'غ', 'خ'])
const IDGHAM_WITH_GHUNNAH = new Set(['ي', 'ن', 'م', 'و'])
const IDGHAM_WITHOUT_GHUNNAH = new Set(['ل', 'ر'])
const IKHFA = new Set(['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'])
const SUN_LETTERS = new Set(['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن'])

const COLORS = {
  iqlab: { label: 'Iqlab', color: '#fb923c' },
  idghamWithGhunnah: { label: 'Idgham bighunnah', color: '#34d399' },
  idghamWithoutGhunnah: { label: 'Idgham bilaghunnah', color: '#22d3ee' },
  ikhfa: { label: 'Ikhfa haqiqi', color: '#c4b5fd' },
  izhar: { label: 'Izhar halqi', color: '#67e8f9' },
  ikhfaShafawi: { label: 'Ikhfa syafawi', color: '#c4b5fd' },
  idghamMimi: { label: 'Idgham mimi', color: '#34d399' },
  izharShafawi: { label: 'Izhar syafawi', color: '#67e8f9' },
  ghunnah: { label: 'Ghunnah musyaddadah', color: '#34d399' },
  qamariyah: { label: 'Alif lam qamariyah', color: '#67e8f9' },
  syamsiyah: { label: 'Alif lam syamsiyah', color: '#fb7185' },
  qalqalah: { label: 'Qalqalah', color: '#fbbf24' },
}

function normalizeLetter(letter = '') {
  return ({ آ: 'ا', أ: 'ا', إ: 'ا', ٱ: 'ا', ؤ: 'و', ئ: 'ي' })[letter] ?? letter
}

function getClusters(word) {
  const clusters = []
  for (const character of Array.from(word)) {
    if (/\p{M}/u.test(character) && clusters.length) {
      clusters[clusters.length - 1].text += character
      clusters[clusters.length - 1].marks.push(character)
    } else {
      clusters.push({
        text: character,
        letter: normalizeLetter(character),
        marks: [],
      })
    }
  }
  return clusters
}

function getFollowingLetterRule(letter) {
  if (letter === 'ب') return COLORS.iqlab
  if (IDGHAM_WITH_GHUNNAH.has(letter)) return COLORS.idghamWithGhunnah
  if (IDGHAM_WITHOUT_GHUNNAH.has(letter)) return COLORS.idghamWithoutGhunnah
  if (HALQI.has(letter)) return COLORS.izhar
  if (IKHFA.has(letter)) return COLORS.ikhfa
  return null
}

function addHighlight(highlights, index, rule) {
  if (rule && !highlights.has(index)) highlights.set(index, rule)
}

function findNunAndMimRules(clusters, nextClusters, highlights, nextHighlights) {
  clusters.forEach((cluster, index) => {
    const nextInWord = clusters[index + 1]
    const nextAcrossWords = !nextInWord && nextClusters[0]
    const followingCluster = nextInWord ?? nextAcrossWords
    const followingIndex = nextInWord ? index + 1 : nextAcrossWords ? 0 : -1

    if (cluster.letter === 'ن' && cluster.marks.includes(SUKUN)) {
      const rule = getFollowingLetterRule(followingCluster?.letter)
      const isIntraWordIdghamException = nextInWord && ['ي', 'و'].includes(nextInWord.letter)
      if (rule && !isIntraWordIdghamException) {
        addHighlight(highlights, index, rule)
        if (nextAcrossWords) addHighlight(nextHighlights, 0, rule)
        else if (followingIndex >= 0) addHighlight(highlights, followingIndex, rule)
      }
    }

    if (cluster.marks.some((mark) => TANWIN.has(mark)) && !nextInWord && nextClusters[0]) {
      const rule = getFollowingLetterRule(nextClusters[0].letter)
      if (rule) {
        addHighlight(highlights, index, rule)
        addHighlight(nextHighlights, 0, rule)
      }
    }

    if (cluster.letter === 'م' && cluster.marks.includes(SUKUN) && followingCluster) {
      const rule = followingCluster.letter === 'ب'
        ? COLORS.ikhfaShafawi
        : followingCluster.letter === 'م'
          ? COLORS.idghamMimi
          : COLORS.izharShafawi
      addHighlight(highlights, index, rule)
      if (nextAcrossWords) addHighlight(nextHighlights, 0, rule)
      else if (followingIndex >= 0) addHighlight(highlights, followingIndex, rule)
    }
  })
}

function findWordRules(clusters, highlights) {
  const letters = clusters.map(({ letter }) => letter)
  const articleOffset = ['و', 'ف', 'ب', 'ك'].includes(letters[0]) ? 1 : 0
  const isAllahName = letters[articleOffset] === 'ا'
    && letters[articleOffset + 1] === 'ل'
    && letters[articleOffset + 2] === 'ل'
    && letters[articleOffset + 3] === 'ه'
  const articleLetterIndex = articleOffset + 2
  const articleLetter = letters[articleLetterIndex]

  if (!isAllahName && letters[articleOffset] === 'ا' && letters[articleOffset + 1] === 'ل' && articleLetter) {
    if (SUN_LETTERS.has(articleLetter) && clusters[articleLetterIndex].marks.includes(SHADDA)) {
      addHighlight(highlights, articleLetterIndex, COLORS.syamsiyah)
    } else if (!SUN_LETTERS.has(articleLetter)) {
      addHighlight(highlights, articleOffset + 1, COLORS.qamariyah)
    }
  }

  clusters.forEach((cluster, index) => {
    if (['ن', 'م'].includes(cluster.letter) && cluster.marks.includes(SHADDA)) {
      addHighlight(highlights, index, COLORS.ghunnah)
    }
    if (['ق', 'ط', 'ب', 'ج', 'د'].includes(cluster.letter) && cluster.marks.includes(SUKUN)) {
      addHighlight(highlights, index, COLORS.qalqalah)
    }
  })
}

export function TajwidColoredText({ text }) {
  const tokens = String(text).split(/(\s+)/u)
  const tokenClusters = tokens.map((token) => (token.trim() ? getClusters(token) : []))
  const highlights = tokenClusters.map(() => new Map())

  tokenClusters.forEach((clusters, tokenIndex) => {
    if (!clusters.length) return
    findWordRules(clusters, highlights[tokenIndex])
    const nextWordTokenIndex = tokenClusters.findIndex((nextClusters, index) => index > tokenIndex && nextClusters.length > 0)
    const nextClusters = nextWordTokenIndex >= 0 ? tokenClusters[nextWordTokenIndex] : []
    const nextHighlights = nextWordTokenIndex >= 0 ? highlights[nextWordTokenIndex] : new Map()
    findNunAndMimRules(clusters, nextClusters, highlights[tokenIndex], nextHighlights)
  })

  return tokens.map((token, tokenIndex) => {
    if (!tokenClusters[tokenIndex].length) return token
    return (
      <span key={`${tokenIndex}-${token}`}>
        {tokenClusters[tokenIndex].map((cluster, clusterIndex) => {
          const rule = highlights[tokenIndex].get(clusterIndex)
          return (
            <span
              key={`${clusterIndex}-${cluster.text}`}
              title={rule?.label}
              style={rule ? { color: rule.color } : undefined}
            >
              {cluster.text}
            </span>
          )
        })}
      </span>
    )
  })
}
