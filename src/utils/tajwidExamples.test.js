import { describe, expect, it } from 'vitest'
import { tajwidChapters } from './tajwidData.js'
import { getTajwidExampleForLetter } from './tajwidExamples.js'

function getRule(id) {
  return tajwidChapters.flatMap(({ rules }) => rules).find((rule) => rule.id === id)
}

function normalizeArabic(text) {
  return text.replace(/[\p{M}\u0640]/gu, '').replace(/[\u0622\u0623\u0625\u0671\u0621]/gu, 'ا')
}

describe('Tajwid examples follow the selected letter', () => {
  it('finds a matching izhar example for the selected throat letter', () => {
    const example = getTajwidExampleForLetter(getRule('izhar-halqi'), 'خ')

    expect(example).toMatchObject({
      reference: expect.stringMatching(/^\S+ · \d+:\d+$/u),
      matchedRule: true,
      selectedLetter: 'خ',
    })
    expect(example.example).toContain('خ')
    expect(example.breakdown).toContain('خ')
  })

  it('finds an actual example for every nun sukun and tanwin rule letter', () => {
    for (const id of ['izhar-halqi', 'idgham-bighunnah', 'idgham-bilaghunnah', 'iqlab', 'ikhfa-haqiqi']) {
      const rule = getRule(id)
      for (const letter of rule.letters) {
        const example = getTajwidExampleForLetter(rule, letter)
        expect(example.matchedRule, `${rule.title} · ${letter}`).toBe(true)
        expect(example.example).toContain(letter === 'ء' ? 'ا' : letter)
      }
    }
  })

  it('finds matching examples for mim sukun and lam ta’rif selections', () => {
    for (const id of ['ikhfa-syafawi', 'idgham-mimi', 'izhar-syafawi', 'qamariyah', 'syamsiyah']) {
      const rule = getRule(id)
      for (const letter of rule.letters) {
        const example = getTajwidExampleForLetter(rule, letter)
        expect(example.matchedRule, `${rule.title} · ${letter}`).toBe(true)
        expect(normalizeArabic(example.example)).toContain(normalizeArabic(letter))
      }
    }
  })

  it('updates to a Quran verse containing every selectable lesson letter', () => {
    for (const rule of tajwidChapters.flatMap(({ rules }) => rules)) {
      for (const letter of rule.letters) {
        const example = getTajwidExampleForLetter(rule, letter)
        expect(example.reference, `${rule.title} · ${letter}`).toMatch(/^.+ · \d+:\d+$/u)
        if (rule.id === 'waqaf') {
          expect(example.example, `${rule.title} · ${letter}`).toContain(letter)
        } else {
          expect(normalizeArabic(example.example), `${rule.title} · ${letter}`).toContain(normalizeArabic(letter))
        }
      }
    }
  })
})
