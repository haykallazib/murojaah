import { describe, expect, it } from 'vitest'
import { getPendingFinalResults, getPendingTranscript } from './speechRecognition.js'

function recognitionResult(transcript, isFinal) {
  return Object.assign([{ transcript }], { isFinal })
}

describe('speech recognition result processing', () => {
  it('only returns final results that have not already been handled', () => {
    const results = [
      recognitionResult('بسم الله', true),
      recognitionResult('الرحمن', true),
    ]
    const handledIndexes = new Set([0])

    expect(getPendingFinalResults(results, handledIndexes)).toEqual([
      { index: 1, transcript: 'الرحمن' },
    ])
  })

  it('does not re-add a final result when the browser repeats its result list', () => {
    const results = [recognitionResult('بسم الله', true)]
    const handledIndexes = new Set()
    const firstBatch = getPendingFinalResults(results, handledIndexes)

    firstBatch.forEach(({ index }) => handledIndexes.add(index))

    expect(getPendingFinalResults(results, handledIndexes)).toEqual([])
  })

  it('shows pending final and interim text without duplicating handled results', () => {
    const results = [
      recognitionResult('بسم الله', true),
      recognitionResult('الرحمن', false),
    ]

    expect(getPendingTranscript(results, new Set([0]))).toBe('الرحمن')
    expect(getPendingTranscript(results, new Set())).toBe('بسم الله الرحمن')
  })
})
