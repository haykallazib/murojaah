import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Search } from 'lucide-react'

const PAGE_SIZE = 20
const MAX_TRANSLATION_LENGTH = 320

export function HadithPage() {
  const [query, setQuery] = useState('')
  const [hadiths, setHadiths] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${import.meta.env.BASE_URL}hadith-bukhari.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Gagal memuat data hadist (${response.status}).`)
        return response.json()
      })
      .then((data) => {
        if (!Array.isArray(data) || data.length !== 1000) throw new Error('Data hadist tidak lengkap. Muat ulang halaman untuk mencoba lagi.')
        const hasAllNumbers = data.every((hadith, index) => hadith.number === index + 1)
        if (!hasAllNumbers) throw new Error('Nomor hadist tidak lengkap atau tidak berurutan. Muat ulang halaman untuk mencoba lagi.')
        setHadiths(data)
      })
      .catch((fetchError) => {
        if (fetchError.name !== 'AbortError') setError(fetchError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  const conciseHadiths = useMemo(
    () => hadiths.filter((hadith) => hadith.meaning.length <= MAX_TRANSLATION_LENGTH),
    [hadiths],
  )
  const filteredHadiths = useMemo(() => {
    const searchTerm = query.trim().toLocaleLowerCase('id')
    return conciseHadiths.filter((hadith) => `${hadith.arabic} ${hadith.meaning} ${hadith.collection} ${hadith.number}`.toLocaleLowerCase('id').includes(searchTerm))
  }, [conciseHadiths, query])
  const pageCount = Math.ceil(filteredHadiths.length / PAGE_SIZE)
  const visibleHadiths = filteredHadiths.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <section className="space-y-6">
      <div className="glass-panel relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-cyan-500/[.08] blur-3xl" />
        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[.06] px-3 py-1.5 text-xs font-medium text-cyan-200">
            HADIST PILIHAN
          </div>
          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">Teladan dalam keseharian</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Tersedia 1.000 hadist Sahih al-Bukhari.
          </p>
          <p className="mt-4 inline-flex rounded-full border border-emerald-300/15 bg-emerald-300/[.05] px-3 py-1.5 text-[11px] text-emerald-200">
            Terjemahan maksimal {MAX_TRANSLATION_LENGTH} karakter · penjelasan bisa lihat referensi
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <label className="relative block flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            className="field-control !mt-0 !pl-10"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setPage(1) }}
            placeholder="Cari teks Arab, terjemahan, atau nomor hadis..."
            aria-label="Cari hadis"
          />
        </label>
        <p className="text-xs text-slate-500" aria-live="polite">
          {loading ? 'Memuat 1.000 hadist...' : `${hadiths.length} hadist tersedia · ${filteredHadiths.length} ringkas${query.trim() ? ` cocok dari ${conciseHadiths.length}` : ''}`}
        </p>
      </div>

      {loading && (
        <div className="glass-panel flex min-h-56 items-center justify-center rounded-2xl p-6 text-sm text-slate-400" role="status">
          Memuat hadist ringkas...
        </div>
      )}
      {!loading && error && (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[.07] p-5 text-sm text-rose-200" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && visibleHadiths.length ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
          {visibleHadiths.map((hadith) => (
            <article key={hadith.id} className="glass-panel flex h-full flex-col rounded-2xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[.06] px-2.5 py-1 text-[10px] font-medium text-cyan-200">t {hadith.number}</span>
                <span className="text-right text-[10px] text-slate-500">{hadith.collection} · No. {hadith.number}</span>
              </div>
              <p dir="rtl" lang="ar" className="arabic-text mt-5 text-right text-2xl leading-[2.1] text-slate-100">{hadith.arabic}</p>
              <div className="mt-5 border-t border-white/[.06] pt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.15em] text-slate-500">Makna Indonesia</p>
                <p className="text-sm leading-6 text-slate-200">{hadith.meaning}</p>
              </div>
              <a
                href={`https://sunnah.com/bukhari:${hadith.number}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1 self-start text-xs text-cyan-300 transition hover:text-cyan-100"
              >
                Lihat referensi <ArrowUpRight size={13} />
              </a>
            </article>
          ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">Halaman {page} dari {pageCount || 1}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} className="secondary-button !min-h-9 !px-3 !py-1.5 text-xs disabled:opacity-40">
                <ArrowLeft size={14} /> Sebelumnya
              </button>
              <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page >= pageCount} className="secondary-button !min-h-9 !px-3 !py-1.5 text-xs disabled:opacity-40">
                Berikutnya <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </>
      ) : !loading && !error ? (
        <div className="glass-panel flex min-h-56 flex-col items-center justify-center rounded-2xl p-6 text-center">
          <Search size={22} className="mb-3 text-slate-500" />
          <h3 className="font-display text-lg font-semibold text-white">Hadist tidak ditemukan</h3>
          <p className="mt-2 text-sm text-slate-400">Coba kata kunci atau tema yang berbeda.</p>
        </div>
      ) : null}
    </section>
  )
}
