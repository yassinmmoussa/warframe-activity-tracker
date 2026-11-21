import { LayoutDashboard, CalendarClock, Swords, Gem, BookOpen, Archive } from 'lucide-react';
import { VIEWS } from '../../constants/views.js';

const NAV_ITEMS = [
  { id: VIEWS.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { id: VIEWS.RESETS, label: 'Daily & Weekly', icon: CalendarClock },
  { id: VIEWS.ARSENAL, label: 'Arsenal & Fodder', icon: Swords },
  { id: VIEWS.MODS_RELICS, label: 'Mods & Relics', icon: Gem },
  { id: VIEWS.JOURNAL, label: 'Journal', icon: BookOpen },
  { id: VIEWS.COMPLETED, label: 'Completed', icon: Archive },
];

export function AppNavigation({ activeView, setActiveView }) {
  return (
    <nav className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto pb-2">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = activeView === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveView(item.id)}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              active
                ? 'bg-[#1a2130] text-[#f5c451] border border-[#d4af37]/40'
                : 'text-slate-400 hover:bg-[#131822] hover:text-slate-200 border border-transparent'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
