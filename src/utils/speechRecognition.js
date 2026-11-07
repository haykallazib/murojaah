import { normalize } from './matcher.js'

export function getPendingFinalResults(results, handledIndexes) {
  const pending = []

  for (let index = 0; index < results.length; index += 1) {
    const result = results[index]
    if (result.isFinal && !handledIndexes.has(index)) {
      pending.push({ index, transcript: result[0].transcript.trim() })
    }
  }

  return pending.filter((result) => result.transcript)
}

export function getPendingTranscript(results, handledIndexes) {
  const transcript = []

  for (let index = 0; index < results.length; index += 1) {
    const result = results[index]
    if (!result.isFinal || !handledIndexes.has(index)) {
      transcript.push(result[0].transcript.trim())
    }
  }

  return transcript
    .filter(Boolean)
    .reduce((merged, segment) => mergeSpeechTranscript(merged, segment), '')
}

export function mergeSpeechTranscript(previous, incoming) {
  const previousWords = previous.trim().split(/\s+/u).filter(Boolean)
  const incomingWords = incoming.trim().split(/\s+/u).filter(Boolean)
  if (!previousWords.length) return incomingWords.join(' ')
  if (!incomingWords.length) return previousWords.join(' ')

  const previousNormalized = previousWords.map((word) => normalize(word))
  const incomingNormalized = incomingWords.map((word) => normalize(word))
  const isContained = (words, container) => {
    for (let start = 0; start <= container.length - words.length; start += 1) {
      if (words.every((word, index) => word === container[start + index])) return true
    }
    return false
  }

  if (isContained(incomingNormalized, previousNormalized)) return previousWords.join(' ')

  let overlap = Math.min(previousNormalized.length, incomingNormalized.length)
  while (overlap > 0) {
    const previousSuffix = previousNormalized.slice(-overlap)
    const incomingPrefix = incomingNormalized.slice(0, overlap)
    if (previousSuffix.every((word, index) => word === incomingPrefix[index])) break
    overlap -= 1
  }

  return [...previousWords, ...incomingWords.slice(overlap)].join(' ')
}
