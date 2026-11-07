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

  return transcript.filter(Boolean).join(' ')
}
