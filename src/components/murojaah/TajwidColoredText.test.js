import { describe, expect, it } from 'vitest'
import { TajwidColoredText } from './TajwidColoredText.jsx'

function getSegments(text) {
  const segments = []
  const visit = (value) => {
    if (Array.isArray(value)) {
      value.forEach(visit)
    } else if (value && typeof value === 'object' && value.props) {
      if (value.props.title) segments.push({ title: value.props.title, text: value.props.children })
      visit(value.props.children)
    }
  }
  visit(TajwidColoredText({ text }))
  return segments
}

describe('Tajwid color markers', () => {
  it('colors only the iqlab letters, not the complete words', () => {
    expect(getSegments('مِنْ بَعْدِ')).toEqual([
      { title: 'Iqlab', text: 'نْ' },
      { title: 'Iqlab', text: 'بَ' },
    ])
  })

  it('colors only the nun and following letter for ikhfa', () => {
    expect(getSegments('مِنْ شَرِّ')).toEqual([
      { title: 'Ikhfa haqiqi', text: 'نْ' },
      { title: 'Ikhfa haqiqi', text: 'شَ' },
    ])
  })

  it('colors the lam or sun letter in alif lam rules', () => {
    expect(getSegments('الْحَمْدُ')[0]).toEqual({ title: 'Alif lam qamariyah', text: 'لْ' })
    expect(getSegments('الشَّمْسِ')[0]).toEqual({ title: 'Alif lam syamsiyah', text: 'شَّ' })
    expect(getSegments('وَالشَّمْسِ')[0]).toEqual({ title: 'Alif lam syamsiyah', text: 'شَّ' })
    expect(getSegments('اللَّهِ')).toEqual([])
  })

  it('marks the nun and following letter inside a word', () => {
    expect(getSegments('أَنْعَمْتَ')).toEqual([
      { title: 'Izhar halqi', text: 'نْ' },
      { title: 'Izhar halqi', text: 'عَ' },
      { title: 'Izhar syafawi', text: 'مْ' },
      { title: 'Izhar syafawi', text: 'تَ' },
    ])
  })

  it('marks mim sukun at the exact letter position', () => {
    expect(getSegments('أَمْوَالِهِمْ')).toEqual([
      { title: 'Izhar syafawi', text: 'مْ' },
      { title: 'Izhar syafawi', text: 'وَ' },
    ])
  })

  it('does not mark qalqalah letters without sukun', () => {
    expect(getSegments('قَالَ')).toEqual([])
    expect(getSegments('قَدْ')).toEqual([{ title: 'Qalqalah', text: 'دْ' }])
  })
})
