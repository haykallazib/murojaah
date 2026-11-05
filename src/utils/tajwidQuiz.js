import { allTajwidRules } from './tajwidData.js'

const QUESTION_COUNT = 10
const questionPrompts = [
  (rule) => `Apa hukum tajwid pada contoh ${rule.example}?`,
  (rule) => `Kaidah apa yang berlaku pada contoh ${rule.example}?`,
  (rule) => `Huruf atau tanda ${rule.letters.join(' ')} menjadi petunjuk hukum yang mana?`,
  (rule) => `Hukum apa yang memiliki ciri berikut: ${rule.definition}`,
  (rule) => `Bagaimana penerapan yang tepat pada ${rule.example}? ${rule.breakdown}`,
  (rule) => `Pilih nama hukum untuk contoh bacaan ${rule.example}.`,
  (rule) => `Dalam pembahasan bab ini, kaidah mana yang ditandai oleh ${rule.letters.join(' ')}?`,
  (rule) => `Pernyataan mana yang menjelaskan hukum ${rule.title}? ${rule.definition}`,
  (rule) => `Apa yang perlu diperhatikan saat melafalkan ${rule.example}?`,
  (rule) => `Pilih hukum yang sesuai dengan panduan: ${rule.breakdown}`,
]

export function createQuestions(chapter, random = Math.random) {
  const rules = chapter.rules
  let previousCorrectIndex = -1
  return Array.from({ length: QUESTION_COUNT }, (_, index) => {
    const answer = rules[index % rules.length]
    const source = rules.length >= 4 ? rules : allTajwidRules
    const options = [answer]
    for (let offset = 1; options.length < 4; offset += 1) {
      const candidate = source[(index + offset) % source.length]
      if (candidate.id !== answer.id && !options.some((option) => option.id === candidate.id)) {
        options.push(candidate)
      }
    }

    for (let optionIndex = options.length - 1; optionIndex > 0; optionIndex -= 1) {
      const swapIndex = Math.floor(random() * (optionIndex + 1))
      const currentOption = options[optionIndex]
      options[optionIndex] = options[swapIndex]
      options[swapIndex] = currentOption
    }

    let correctIndex = options.findIndex((option) => option.id === answer.id)
    if (correctIndex === previousCorrectIndex) {
      const nextIndex = (correctIndex + 1 + Math.floor(random() * (options.length - 1))) % options.length
      const currentOption = options[correctIndex]
      options[correctIndex] = options[nextIndex]
      options[nextIndex] = currentOption
      correctIndex = nextIndex
    }
    previousCorrectIndex = correctIndex

    return {
      answer,
      options,
      prompt: questionPrompts[index](answer),
    }
  })
}
