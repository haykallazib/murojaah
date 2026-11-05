import { BookOpen, BookOpenText, CalendarDays, Headphones, Mic2 } from 'lucide-react'

const navigation = [
  { label: 'Quran', icon: BookOpen },
  { label: 'Tes Hafalan', icon: Mic2 },
  { label: 'Hadist', icon: Headphones },
  { label: 'Belajar Tajwid', icon: BookOpenText },
  { label: 'Jadwal', icon: CalendarDays },
]

export function BottomNav({ activeTab, onNavigate }) {
  return (
    <nav className="bottom-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/[.08] px-1 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 md:hidden">
      {navigation.map(({ label, icon: Icon }) => (
        <button key={label} type="button" onClick={() => onNavigate(label)} className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[9px] transition ${activeTab === label ? 'text-cyan-300' : 'text-slate-500'}`}>
          <Icon size={18} strokeWidth={activeTab === label ? 2 : 1.7} />{label}
        </button>
      ))}
    </nav>
  )
}
