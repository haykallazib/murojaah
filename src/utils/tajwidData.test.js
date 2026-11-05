import { describe, expect, it } from 'vitest'
import { tajwidChapters } from './tajwidData.js'

describe('Tajwid learning curriculum', () => {
  it('includes all nine requested learning chapters', () => {
    expect(tajwidChapters).toHaveLength(9)
    expect(tajwidChapters.map(({ title }) => title)).toContain('Nun Sukun & Tanwin')
    expect(tajwidChapters.map(({ title }) => title)).toContain('Hukum Mad')
    expect(tajwidChapters.map(({ title }) => title)).toContain('Hukum Ra & Waqaf/Ibtida’')
  })

  it('covers four nun sukun rules plus ikhfa and all 14 mad lessons', () => {
    const nunChapter = tajwidChapters.find(({ id }) => id === 'nun-sukun')
    const madChapter = tajwidChapters.find(({ id }) => id === 'mad')

    expect(nunChapter.rules.map(({ id }) => id)).toEqual([
      'izhar-halqi',
      'idgham-bighunnah',
      'idgham-bilaghunnah',
      'iqlab',
      'ikhfa-haqiqi',
    ])
    expect(madChapter.rules).toHaveLength(14)
  })

  it('provides a text example and explanation for each lesson', () => {
    expect(tajwidChapters.flatMap(({ rules }) => rules).every((rule) => (
      rule.example && rule.reference && rule.definition && rule.breakdown && rule.letters.length
    ))).toBe(true)
  })
})
