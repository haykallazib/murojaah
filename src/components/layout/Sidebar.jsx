import { BookOpen, BookOpenText, CalendarDays, Headphones, Mic2, X } from 'lucide-react'
import { AuthProfile } from './AuthProfile.jsx'

const navigation = [
  { label: 'Quran', icon: BookOpen },
  { label: 'Tes Hafalan', icon: Mic2 },
  { label: 'Hadist', icon: Headphones },
  { label: 'Belajar Tajwid', icon: BookOpenText },
  { label: 'Jadwal', icon: CalendarDays },
]

export function Sidebar({ activeTab, onNavigate, open, onClose }) {
  return (
    <>
      {open && <button type="button" aria-label="Tutup menu" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/65 backdrop-blur-sm md:hidden" />}
      <aside className={`sidebar-glass fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/[.07] px-4 pb-5 pt-5 transition-transform duration-300 md:z-30 md:w-[272px] md:px-5 md:pt-6 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="mb-8 flex items-center justify-between">
          <button type="button" onClick={() => onNavigate('Tes Hafalan')} className="flex items-center gap-3 text-left">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient shadow-glow-sm"><span className="font-arabic text-2xl text-white">م</span></span>
            <span><span className="block font-display text-base font-semibold tracking-wide text-white">murojaah</span><span className="block text-[10px] tracking-[.19em] text-slate-500">HAFALAN AL-QUR'AN</span></span>
          </button>
          <button type="button" onClick={onClose} aria-label="Tutup menu" className="icon-button md:hidden"><X size={17} /></button>
        </div>

        <p className="mb-3 px-3 text-[10px] font-semibold tracking-[.18em] text-slate-600">MENU UTAMA</p>
        <nav className="space-y-1">
          {navigation.map(({ label, icon: Icon }) => {
            const active = activeTab === label
            return (
              <button type="button" key={label} onClick={() => onNavigate(label)} className={`nav-item ${active ? 'nav-item-active' : ''}`}>
                <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#06b6d4]" />}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto">
          <AuthProfile />
        </div>
      </aside>
    </>
  )
}
