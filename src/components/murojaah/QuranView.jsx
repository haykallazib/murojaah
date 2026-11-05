import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  LoaderCircle,
  Search,
} from 'lucide-react'
import { juzs, surahs } from '../../utils/quranData.js'
import { TajwidColoredText } from './TajwidColoredText.jsx'
import { TAJWID_COLOR_KEY } from '../../utils/tajwidData.js'

const API_URL = 'https://equran.id/api/v2'
const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'

function getJuzRange(juzNumber) {
  const juz = juzs.find((item) => item.number === Number(juzNumber))
  if (!juz) return null
  return {
    startSurah: juz.startSurah,
    startAyah: Number(juz.startInfo.match(/-\s*(\d+)$/)?.[1] ?? 1),
    endSurah: juz.endSurah,
    endAyah: Number(juz.endInfo.match(/-\s*(\d+)$/)?.[1] ?? Infinity),
  }
}

async function fetchApiData(url, signal) {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Layanan Al-Qur’an gagal merespons (${response.status}).`)
  const result = await response.json()
  if (result.code !== 200 || !result.data) throw new Error(result.message || 'Data Al-Qur’an tidak tersedia.')
  return result.data
}

function createFallbackIndex() {
  return surahs.map((surah) => ({
    nomor: surah.number,
    nama: surah.arabic,
    namaLatin: surah.transliteration,
    jumlahAyat: surah.verses.length,
    tempatTurun: '',
    arti: '',
  }))
}

export function QuranView({ tajwidColor = true, onTajwidColorChange = () => {} }) {
  const [surahIndex, setSurahIndex] = useState(createFallbackIndex)
  const [indexError, setIndexError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedJuz, setSelectedJuz] = useState('')
  const [selectedSurahNumber, setSelectedSurahNumber] = useState(null)
  const [surahDetail, setSurahDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [detailRetry, setDetailRetry] = useState(0)
  const [showTransliteration, setShowTransliteration] = useState(false)
  const [tajwidColorError, setTajwidColorError] = useState('')

  const selectedJuzRange = useMemo(() => getJuzRange(selectedJuz), [selectedJuz])
  const selectedSurah = surahIndex.find((surah) => surah.nomor === selectedSurahNumber)

  useEffect(() => {
    const controller = new AbortController()
    fetchApiData(`${API_URL}/surat`, controller.signal)
      .then((data) => {
        if (!Array.isArray(data) || data.length !== 114) throw new Error('Daftar surah tidak lengkap.')
        setSurahIndex(data)
        setIndexError('')
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setIndexError(`${error.message} Menampilkan daftar lokal.`)
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!selectedSurahNumber) {
      setSurahDetail(null)
      setDetailLoading(false)
      setDetailError('')
      return undefined
    }

    const controller = new AbortController()
    setSurahDetail(null)
    setDetailLoading(true)
    setDetailError('')
    fetchApiData(`${API_URL}/surat/${selectedSurahNumber}`, controller.signal)
      .then((data) => {
        if (!Array.isArray(data.ayat) || data.ayat.length === 0) throw new Error('Ayat surah tidak tersedia.')
        setSurahDetail(data)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setDetailError(error.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailLoading(false)
      })
    return () => controller.abort()
  }, [detailRetry, selectedSurahNumber])

  const visibleSurahs = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('id')
    return surahIndex.filter((surah) => {
      const matchesSearch = !query
        || String(surah.nomor).includes(query)
        || `${surah.namaLatin} ${surah.nama} ${surah.arti ?? ''}`.toLocaleLowerCase('id').includes(query)
      const matchesJuz = !selectedJuzRange
        || (surah.nomor >= selectedJuzRange.startSurah && surah.nomor <= selectedJuzRange.endSurah)
      return matchesSearch && matchesJuz
    })
  }, [search, selectedJuzRange, surahIndex])

  const retryDetail = () => {
    setDetailError('')
    setDetailRetry((attempt) => attempt + 1)
  }

  const toggleTajwidColor = (enabled) => {
    try {
      window.localStorage.setItem(TAJWID_COLOR_KEY, String(enabled))
    } catch {
      setTajwidColorError('Pengaturan Tajwid Berwarna tidak dapat disimpan di browser.')
      return
    }
    setTajwidColorError('')
    onTajwidColorChange(enabled)
  }

  const openSurah = (surahNumber) => {
    setSelectedSurahNumber(surahNumber)
    setShowTransliteration(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const backToList = () => {
    setSelectedSurahNumber(null)
    setSurahDetail(null)
    setDetailError('')
  }

  if (selectedSurahNumber && selectedSurah) {
    return (
      <section className="space-y-5">
        <button type="button" onClick={backToList} className="secondary-button !min-h-10 !px-3 !py-2 text-xs">
          <ArrowLeft size={15} /> Daftar surah
        </button>

        <header className="glass-panel relative overflow-hidden rounded-3xl p-6 text-center sm:p-8">
          <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full bg-cyan-400/[.07] blur-3xl" />
          <div className="relative">
            <p className="eyebrow mb-3">{selectedJuz ? `JUZ ${selectedJuz}` : 'AL-QUR’AN'}</p>
            <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              {selectedSurah.namaLatin}
            </h1>
            <p className="mt-1 text-sm text-slate-400">{selectedSurah.arti || 'Surah'} · {selectedSurah.jumlahAyat} ayat</p>
            <p dir="rtl" lang="ar" className="font-arabic mt-5 text-4xl text-cyan-100">{selectedSurah.nama}</p>
            {selectedSurahNumber !== 1 && selectedSurahNumber !== 9 && (
              <p dir="rtl" lang="ar" className="font-arabic mt-5 border-t border-white/[.07] pt-5 text-2xl leading-loose text-slate-100">
                {BISMILLAH}
              </p>
            )}
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {selectedJuzRange
              ? `Bagian juz ${selectedJuz} · ayat yang termasuk dalam juz ditampilkan`
              : 'Teks Arab dan terjemahan Bahasa Indonesia'}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[.04] px-3 py-2 text-xs text-cyan-100">
              <input
                type="checkbox"
                role="switch"
                checked={tajwidColor}
                onChange={(event) => toggleTajwidColor(event.target.checked)}
                className="accent-cyan-400"
                aria-label="Aktifkan Tajwid Berwarna"
              />
              Tajwid Berwarna
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/[.08] bg-white/[.025] px-3 py-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={showTransliteration}
                onChange={(event) => setShowTransliteration(event.target.checked)}
                className="accent-cyan-400"
              />
              Tampilkan latin
            </label>
          </div>
        </div>
        {tajwidColorError && <p role="alert" className="rounded-xl border border-amber-300/15 bg-amber-300/[.05] px-3 py-2 text-xs text-amber-100">{tajwidColorError}</p>}

        {detailLoading && (
          <div role="status" className="glass-panel flex min-h-48 items-center justify-center gap-3 rounded-2xl p-6 text-sm text-slate-400">
            <LoaderCircle size={18} className="animate-spin text-cyan-300" /> Memuat ayat dan terjemahan...
          </div>
        )}
        {detailError && (
          <div role="alert" className="rounded-2xl border border-rose-300/20 bg-rose-300/[.06] p-5 text-sm text-rose-100">
            <p>{detailError}</p>
            <button type="button" onClick={retryDetail} className="secondary-button mt-4 !min-h-9 !px-3 !py-1.5 text-xs">Coba lagi</button>
          </div>
        )}
        {surahDetail && (
          <div className="space-y-3">
            {tajwidColor && (
              <div aria-label="Legenda warna tajwid dasar" className="flex flex-wrap gap-x-4 gap-y-2 rounded-2xl border border-white/[.06] bg-white/[.02] px-4 py-3 text-[10px]">
                <span style={{ color: '#c4b5fd' }}>Ungu · Ikhfa</span>
                <span style={{ color: '#34d399' }}>Hijau · Idgham bighunnah / ghunnah</span>
                <span style={{ color: '#fb7185' }}>Merah muda · Iqlab / lam syamsiyah</span>
                <span style={{ color: '#67e8f9' }}>Sian · Izhar / lam qamariyah</span>
                <span style={{ color: '#22d3ee' }}>Biru muda · Idgham bilaghunnah</span>
                <span style={{ color: '#fbbf24' }}>Kuning · Qalqalah</span>
              </div>
            )}
            {surahDetail.ayat
              .filter((ayah) => {
                if (!selectedJuzRange) return true
                const inSurahRange = selectedSurahNumber >= selectedJuzRange.startSurah
                  && selectedSurahNumber <= selectedJuzRange.endSurah
                if (!inSurahRange) return false
                if (selectedSurahNumber === selectedJuzRange.startSurah && ayah.nomorAyat < selectedJuzRange.startAyah) return false
                if (selectedSurahNumber === selectedJuzRange.endSurah && ayah.nomorAyat > selectedJuzRange.endAyah) return false
                return true
              })
              .map((ayah) => (
                <article key={ayah.nomorAyat} className="glass-panel rounded-2xl p-5 shadow-[0_20px_45px_-30px_rgba(0,0,0,.9),inset_0_1px_rgba(255,255,255,.04)] transition hover:border-white/[.13] sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[.06] px-2 text-xs font-medium text-cyan-200">
                      {ayah.nomorAyat}
                    </span>
                    <span className="text-[10px] tracking-wide text-slate-600">{selectedSurah.namaLatin} · {ayah.nomorAyat}</span>
                  </div>
                  <p dir="rtl" lang="ar" className="arabic-text text-right text-[1.8rem] leading-[2.1] text-slate-100 sm:text-[2.2rem]">
                    {tajwidColor ? <TajwidColoredText text={ayah.teksArab} /> : ayah.teksArab}
                  </p>
                  {showTransliteration && ayah.teksLatin && (
                    <p className="mt-4 text-sm italic leading-6 text-cyan-100/70">{ayah.teksLatin}</p>
                  )}
                  <div className="mt-5 border-t border-white/[.06] pt-4">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.15em] text-slate-500">Terjemahan Indonesia</p>
                    <p className="text-sm leading-7 text-slate-200">{ayah.teksIndonesia}</p>
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="eyebrow mb-2">BACAAN AL-QUR’AN</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-[2.1rem]">
          Al-Qur’an <span className="text-gradient">Al-Karim</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">Jelajahi 114 surah dan 30 juz beserta terjemahan Indonesia.</p>
        {tajwidColor && <p className="mt-3 inline-flex rounded-full border border-cyan-300/15 bg-cyan-300/[.05] px-3 py-1.5 text-[10px] text-cyan-100">Tajwid Berwarna aktif · penanda beberapa hukum dasar</p>}
        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[.04] px-3 py-2 text-xs text-cyan-100">
          <input
            type="checkbox"
            role="switch"
            checked={tajwidColor}
            onChange={(event) => toggleTajwidColor(event.target.checked)}
            className="accent-cyan-400"
            aria-label="Aktifkan Tajwid Berwarna"
          />
          Tajwid Berwarna
        </label>
        {tajwidColorError && <p role="alert" className="mt-3 rounded-xl border border-amber-300/15 bg-amber-300/[.05] px-3 py-2 text-xs text-amber-100">{tajwidColorError}</p>}
      </header>

      {indexError && (
        <p role="status" className="rounded-2xl border border-amber-300/20 bg-amber-300/[.06] px-4 py-3 text-xs leading-5 text-amber-100">
          {indexError} Arti dan klasifikasi surah akan tersedia saat koneksi API kembali.
        </p>
      )}

      <div className="glass-panel rounded-2xl p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, arti, atau nomor surah..."
              aria-label="Cari surah"
              className="field-control !mt-0 !pl-10"
            />
          </label>
          <label className="relative block min-w-44">
            <BookOpen size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <select
              value={selectedJuz}
              onChange={(event) => { setSelectedJuz(event.target.value); setSearch('') }}
              aria-label="Filter berdasarkan juz"
              className="field-control !mt-0 appearance-none !pl-10 !pr-9"
            >
              <option value="">Semua juz · 114 surah</option>
              {juzs.map((juz) => <option key={juz.number} value={juz.number}>Juz {juz.number}</option>)}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">{selectedJuz ? `JUZ ${selectedJuz}` : 'DAFTAR BACAAN'}</p>
          <h2 className="font-display text-xl font-semibold text-white">{selectedJuz ? 'Surah dalam juz ini' : 'Daftar surah'}</h2>
        </div>
        <span className="rounded-full border border-white/[.08] bg-white/[.03] px-3 py-1.5 text-[11px] text-slate-400">{visibleSurahs.length} surah</span>
      </div>

      {visibleSurahs.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleSurahs.map((surah) => (
            <button
              key={surah.nomor}
              type="button"
              onClick={() => openSurah(surah.nomor)}
              className="glass-panel group flex min-h-28 items-center gap-4 rounded-2xl p-4 text-left shadow-[0_18px_40px_-32px_rgba(0,0,0,.95),inset_0_1px_rgba(255,255,255,.04)] transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-white/[.045]"
            >
              <span className="grid h-11 w-11 shrink-0 rotate-45 place-items-center rounded-xl border border-white/[.09] bg-white/[.025] text-xs font-medium text-slate-300 transition group-hover:border-cyan-300/20 group-hover:text-cyan-200">
                <span className="-rotate-45">{surah.nomor}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-display text-sm font-semibold text-white">{surah.namaLatin}</span>
                  <span dir="rtl" lang="ar" className="font-arabic shrink-0 text-lg text-cyan-100">{surah.nama}</span>
                </span>
                <span className="mt-1 block truncate text-[11px] text-slate-500">
                  {surah.arti || 'Surah'} · {surah.jumlahAyat} ayat
                </span>
                <span className="mt-2 inline-flex rounded-full border border-white/[.07] bg-white/[.025] px-2 py-0.5 text-[9px] text-slate-400">
                  {surah.tempatTurun === 'Mekah' ? 'Makkiyah' : surah.tempatTurun === 'Madinah' ? 'Madaniyah' : 'Surah'}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="glass-panel flex min-h-48 flex-col items-center justify-center rounded-2xl p-6 text-center">
          <Search size={20} className="mb-3 text-slate-500" />
          <h3 className="font-display font-semibold text-white">Surah tidak ditemukan</h3>
          <p className="mt-2 text-xs text-slate-500">Coba kata kunci atau nomor surah lainnya.</p>
        </div>
      )}
    </section>
  )
}
