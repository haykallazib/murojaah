import { describe, expect, it } from 'vitest'
import { createQuestions } from '../../utils/tajwidQuiz.js'
import { tajwidChapters } from '../../utils/tajwidData.js'

describe('Tajwid quiz answer order', () => {
  it('shuffles options and varies the correct answer position', () => {
    const chapter = tajwidChapters.find(({ id }) => id === 'nun-sukun')
    const questions = createQuestions(chapter, () => 0.5)
    const correctPositions = questions.map(({ answer, options }) => options.findIndex(({ id }) => id === answer.id))

    expect(questions).toHaveLength(10)
    expect(correctPositions.every((position) => position >= 0)).toBe(true)
    expect(new Set(correctPositions).size).toBeGreaterThan(1)
    expect(correctPositions.every((position, index) => index === 0 || position !== correctPositions[index - 1])).toBe(true)
    expect(questions.every(({ answer, options }) => (
      options.length === 4
      && new Set(options.map(({ id }) => id)).size === 4
      && options.some(({ id }) => id === answer.id)
    ))).toBe(true)
  })
})
