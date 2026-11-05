import { useEffect, useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { useMurojaahStore } from '../../store/useMurojaahStore.js'
import { juzs } from '../../utils/quranData.js'

const modes = [
  { value: 'text', label: 'Teks tampil', description: 'Baca sambil melafalkan' },
  { value: 'initial', label: 'Huruf pertama saja', description: 'Petunjuk awal setiap kata' },
  { value: 'hidden', label: 'Teks disembunyikan', description: 'Uji hafalan sepenuhnya' },
]

export function SetupModal({ surahs, onClose, onStart }) {
  const existing = useMurojaahStore((store) => store.config)
  const startTest = useMurojaahStore((store) => store.startTest)
  const [surahNumber, setSurahNumber] = useState(existing.surahNumber)
  const [juzNumber, setJuzNumber] = useState(() => {
    const currentJuz = juzs.find((juz) => juz.startSurah <= existing.surahNumber && existing.surahNumber <= juz.endSurah)
    return currentJuz ? currentJuz.number : 1
  })
  const selectedSurah = surahs.find((surah) => surah.number === Number(surahNumber)) ?? surahs[0]
  const [startAyah, setStartAyah] = useState(existing.startAyah)
  const [endAyah, setEndAyah] = useState(Math.min(existing.endAyah, selectedSurah.verses.length))
  const [mode, setMode] = useState(existing.mode)
  const [threshold, setThreshold] = useState(existing.threshold)
  const [rangeError, setRangeError] = useState('')

  useEffect(() => {
    const currentJuz = juzs.find((juz) => juz.startSurah <= Number(surahNumber) && Number(surahNumber) <= juz.endSurah)
    if (currentJuz) setJuzNumber(currentJuz.number)
  }, [surahNumber])

  const changeSurah = (value) => {
    const nextSurahNumber = Number(value)
    setSurahNumber(nextSurahNumber)
    setStartAyah(1)
    setEndAyah(surahs.find((surah) => surah.number === nextSurahNumber).verses.length)
    setRangeError('')
  }

  const changeJuz = (value) => {
    const nextJuz = Number(value)
    const targetJuz = juzs.find((juz) => juz.number === nextJuz) ?? juzs[0]
    const targetSurah = surahs.find((surah) => surah.number === targetJuz.startSurah) ?? surahs[0]
    setJuzNumber(nextJuz)
    setSurahNumber(targetSurah.number)
    setStartAyah(1)
    setEndAyah(Math.min(targetSurah.verses.length, 10))
    setRangeError('')
  }

  const applyQuickPreset = (preset) => {
    if (preset === 'random') {
      const randomSurah = surahs[Math.floor(Math.random() * surahs.length)]
      setSurahNumber(randomSurah.number)
      setStartAyah(1)
      setEndAyah(Math.min(7, randomSurah.verses.length))
      return
    }

    if (preset === 'juz') {
      const randomJuz = juzs[Math.floor(Math.random() * juzs.length)]
      const targetSurah = surahs.find((surah) => surah.number === randomJuz.startSurah) ?? surahs[0]
      setJuzNumber(randomJuz.number)
      setSurahNumber(targetSurah.number)
      setStartAyah(1)
      setEndAyah(Math.min(targetSurah.verses.length, 10))
      return
    }

    if (preset === 'page') {
      setStartAyah(1)
      setEndAyah(Math.min(5, selectedSurah.verses.length))
    }
  }

  const submit = (event) => {
    event.preventDefault()
    if (startAyah < 1 || endAyah < startAyah || endAyah > selectedSurah.verses.length) {
      setRangeError(`Pilih rentang ayat 1–${selectedSurah.verses.length} yang valid.`)
      return
    }
    startTest({ surahNumber: Number(surahNumber), startAyah: Number(startAyah), endAyah: Number(endAyah), mode, threshold: Number(threshold) })
    onStart()
  }

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <form onSubmit={submit} className="glass-panel animate-card-rise my-auto w-full max-w-[560px] rounded-3xl p-5 sm:p-7">
        <div className="mb-6 flex items-start justify-between">
          <div><p className="eyebrow mb-2">PERSIAPAN SESI</p><h2 className="font-display text-2xl font-semibold text-white">Atur tes hafalan</h2><p className="mt-1 text-xs text-slate-500">Pilih ayat dan tingkat tantanganmu.</p></div>
          <button type="button" onClick={onClose} className="icon-button"><X size={18} /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="field-label">Juz
            <span className="relative block w-full"><select className="field-control appearance-none pr-9" value={juzNumber} onChange={(event) => changeJuz(event.target.value)}>{juzs.map((juz) => <option key={juz.number} value={juz.number}>Juz {juz.number}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" /></span>
          </label>
          <label className="field-label">Surah
            <span className="relative block"><select className="field-control appearance-none" value={surahNumber} onChange={(event) => changeSurah(event.target.value)}>{surahs.map((surah) => <option key={surah.number} value={surah.number}>{surah.transliteration} — {surah.arabic}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" /></span>
          </label>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="field-label">Mulai ayat<input type="number" min="1" max={selectedSurah.verses.length} className="field-control" value={startAyah} onChange={(event) => { setStartAyah(Number(event.target.value)); setRangeError('') }} /></label>
          <label className="field-label">Sampai ayat<input type="number" min={startAyah} max={selectedSurah.verses.length} className="field-control" value={endAyah} onChange={(event) => { setEndAyah(Number(event.target.value)); setRangeError('') }} /></label>
        </div>
        {rangeError && <p role="alert" className="mt-2 text-xs text-rose-300">{rangeError}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => applyQuickPreset('random')} className="secondary-button px-3 py-2 text-xs">Surah acak</button>
          <button type="button" onClick={() => applyQuickPreset('juz')} className="secondary-button px-3 py-2 text-xs">1 juz</button>
          <button type="button" onClick={() => applyQuickPreset('page')} className="secondary-button px-3 py-2 text-xs">1 halaman</button>
        </div>
        <fieldset className="mt-5">
          <legend className="field-label mb-2">Mode tes</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {modes.map((item) => <button key={item.value} type="button" onClick={() => setMode(item.value)} className={`mode-option ${mode === item.value ? 'mode-option-active' : ''}`}><span className="block text-xs font-medium text-slate-200">{item.label}</span><span className="mt-1 block text-[10px] text-slate-500">{item.description}</span></button>)}
          </div>
        </fieldset>
        <label className="field-label mt-5">Ambang kelulusan <span className="ml-auto font-medium text-cyan-300">{threshold}%</span><input type="range" min="60" max="100" step="5" className="threshold-slider mt-3 block w-full" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} /></label>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="secondary-button justify-center">Batal</button>
          <button type="submit" className="primary-button justify-center">Mulai murojaah <span>→</span></button>
        </div>
      </form>
    </div>
  )
}
