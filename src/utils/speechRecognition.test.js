import { describe, expect, it } from 'vitest'
import {
  getPendingFinalResults,
  getPendingTranscript,
  mergeSpeechTranscript,
} from './speechRecognition.js'

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

  it('does not duplicate repeated final chunks in the displayed transcript', () => {
    const results = [
      recognitionResult('بسم الله الرحمن الرحيم', true),
      recognitionResult('بسم الله الرحمن الرحيم', true),
    ]

    expect(getPendingTranscript(results, new Set())).toBe('بسم الله الرحمن الرحيم')
  })

  it('removes a repeated Arabic phrase from a later mobile recognition result', () => {
    expect(mergeSpeechTranscript('بسم الله الرحمن الرحيم', 'بسم الله الرحمن الرحيم'))
      .toBe('بسم الله الرحمن الرحيم')
  })

  it('does not duplicate repeated final chunks when they are evaluated together', () => {
    const finalResults = [
      { transcript: 'بسم الله الرحمن الرحيم' },
      { transcript: 'بسم الله الرحمن الرحيم' },
    ]

    const spoken = finalResults.reduce(
      (merged, { transcript }) => mergeSpeechTranscript(merged, transcript),
      ''
    )

    expect(spoken).toBe('بسم الله الرحمن الرحيم')
  })

  it('merges overlapping Arabic result chunks without repeating their shared words', () => {
    expect(mergeSpeechTranscript('بسم الله', 'الله الرحمن الرحيم'))
      .toBe('بسم الله الرحمن الرحيم')
  })

  it('keeps new words when a repeated result is extended', () => {
    expect(mergeSpeechTranscript('بسم الله', 'بسم الله الرحمن الرحيم'))
      .toBe('بسم الله الرحمن الرحيم')
  })
})
