import { ArrowRight, Circle, Clock, Flame, Shield, Sparkles } from 'lucide-react';
import { QuickAddBar } from '../../components/QuickAddBar.jsx';
import { ItemCard } from '../../components/ItemCard.jsx';
import { getDashboardData, getTagSuggestions } from '../../selectors/ledgerSelectors.js';
import { VIEWS } from '../../constants/views.js';

export function DashboardPage({
  state,
  countdowns,
  onSetView,
  onToggleResetTask,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddDefaultTag,
  onRemoveDefaultTag,
  onResetDefaultTags,
  onTagClick,
}) {
  const dashboard = getDashboardData(state.items, state.resets);
  const tagSuggestions = getTagSuggestions(state.items, state.defaultTags);
  const visibleDaily = dashboard.daily.visible;
  const visibleWeekly = dashboard.weekly.visible;
  const dailyDone = dashboard.daily.done;
  const weeklyDone = dashboard.weekly.done;
  const activeItems = dashboard.activeItems;
  const activeFarms = dashboard.activeFarms;
  const fodderItems = dashboard.fodderItems;
  const modsAndRelics = dashboard.modsAndRelics;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button type="button" onClick={() => onSetView(VIEWS.RESETS)} className="text-left rounded-xl border border-[#263144] bg-[#131822]/90 p-4 hover:border-cyan-500/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium uppercase tracking-wider">Daily Resets</span>
            <span className="inline-flex items-center gap-1 text-cyan-300"><Clock className="w-3.5 h-3.5" />{countdowns.dailyText}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100">{dailyDone} <span className="text-sm font-normal text-slate-400">/ {visibleDaily.length}</span></span>
            <span className="text-xs text-cyan-400 inline-flex items-center gap-1">Open <ArrowRight className="w-3 h-3" /></span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#0b0e14]">
            <div className="h-full bg-cyan-400 transition-all" style={{ width: `${visibleDaily.length ? (dailyDone / visibleDaily.length) * 100 : 0}%` }} />
          </div>
        </button>
        <button type="button" onClick={() => onSetView(VIEWS.RESETS)} className="text-left rounded-xl border border-[#263144] bg-[#131822]/90 p-4 hover:border-[#d4af37]/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium uppercase tracking-wider">Weekly Resets</span>
            <span className="inline-flex items-center gap-1 text-[#f5c451]"><Clock className="w-3.5 h-3.5" />{countdowns.weeklyText}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100">{weeklyDone} <span className="text-sm font-normal text-slate-400">/ {visibleWeekly.length}</span></span>
            <span className="text-xs text-[#f5c451] inline-flex items-center gap-1">Open <ArrowRight className="w-3 h-3" /></span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#0b0e14]">
            <div className="h-full bg-[#f5c451] transition-all" style={{ width: `${visibleWeekly.length ? (weeklyDone / visibleWeekly.length) * 100 : 0}%` }} />
          </div>
        </button>
        <button type="button" onClick={() => onSetView(VIEWS.ARSENAL)} className="text-left rounded-xl border border-[#263144] bg-[#131822]/90 p-4 hover:border-amber-500/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium uppercase tracking-wider">Active Farms & Fodder</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100">{activeFarms.length + fodderItems.length}</span>
            <span className="text-xs text-rose-300">{fodderItems.filter((item) => item.status === 'ready_to_sell').length} ready to sell</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">{activeFarms.length} frames/weapons • {fodderItems.length} mastery fodder</p>
        </button>
        <button type="button" onClick={() => onSetView(VIEWS.MODS_RELICS)} className="text-left rounded-xl border border-[#263144] bg-[#131822]/90 p-4 hover:border-emerald-500/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium uppercase tracking-wider">Mods & Relics</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100">{modsAndRelics.length}</span>
            <span className="text-xs text-emerald-400 inline-flex items-center gap-1">Open <ArrowRight className="w-3 h-3" /></span>
          </div>
          <p className="mt-2 text-xs text-slate-400">{activeItems.filter((item) => item.category === 'mod').length} mods • {activeItems.filter((item) => item.category === 'relic').length} relic goals</p>
        </button>
      </div>

      <QuickAddBar onAddItem={onAddItem} existingItems={state.items} defaultTags={state.defaultTags} onAddDefaultTag={onAddDefaultTag} onRemoveDefaultTag={onRemoveDefaultTag} onResetDefaultTags={onResetDefaultTags} />

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5 items-start">
        <div className="space-y-5">
          <div className="rounded-xl border border-[#263144] bg-[#131822]/70 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Flame className="w-4 h-4 text-[#f5c451]" /><h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Next Resets To Do</h3></div>
              <button type="button" onClick={() => onSetView(VIEWS.RESETS)} className="text-xs font-medium text-cyan-400 hover:text-cyan-300">View all resets →</button>
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Daily ({dailyDone}/{visibleDaily.length})</p>
              <ul className="space-y-1">{visibleDaily.filter((task) => !task.done).slice(0, 5).map((task) => (
                <li key={task.id}><button type="button" onClick={() => onToggleResetTask('daily', task.id)} className="flex w-full items-center gap-2.5 rounded-lg border border-[#263144] bg-[#0b0e14]/70 px-3 py-2 text-left text-xs text-slate-200 hover:border-cyan-500/40"><Circle className="w-4 h-4 text-slate-500 shrink-0" /><span className="truncate flex-1">{task.title}</span></button></li>
              ))}</ul>
            </div>
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#f5c451]">Weekly ({weeklyDone}/{visibleWeekly.length})</p>
              <ul className="space-y-1">{visibleWeekly.filter((task) => !task.done).slice(0, 5).map((task) => (
                <li key={task.id}><button type="button" onClick={() => onToggleResetTask('weekly', task.id)} className="flex w-full items-center gap-2.5 rounded-lg border border-[#263144] bg-[#0b0e14]/70 px-3 py-2 text-left text-xs text-slate-200 hover:border-[#d4af37]/40"><Circle className="w-4 h-4 text-slate-500 shrink-0" /><span className="truncate flex-1">{task.title}</span></button></li>
              ))}</ul>
            </div>
          </div>
          <div className="rounded-xl border border-[#263144] bg-[#131822]/70 p-4 space-y-3">
            <div className="flex items-center justify-between"><h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Mastery Fodder (Level & Sell)</h3><button type="button" onClick={() => onSetView(VIEWS.ARSENAL)} className="text-xs font-medium text-cyan-400">Arsenal →</button></div>
            <div className="space-y-2.5">{fodderItems.slice(0, 4).map((item) => <ItemCard key={item.id} item={item} onUpdateItem={onUpdateItem} onDeleteItem={onDeleteItem} tagSuggestions={tagSuggestions} onTagClick={onTagClick} compact />)}</div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="rounded-xl border border-[#263144] bg-[#131822]/70 p-4 space-y-3">
            <div className="flex items-center justify-between"><h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Active Warframe & Weapon Farms</h3><button type="button" onClick={() => onSetView(VIEWS.ARSENAL)} className="text-xs font-medium text-cyan-400">View all ({activeFarms.length}) →</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{activeFarms.slice(0, 4).map((item) => <ItemCard key={item.id} item={item} onUpdateItem={onUpdateItem} onDeleteItem={onDeleteItem} tagSuggestions={tagSuggestions} onTagClick={onTagClick} />)}</div>
          </div>
        </div>
        <div className="lg:col-span-2 2xl:col-span-1 space-y-5">
          <div className="rounded-xl border border-[#263144] bg-[#131822]/70 p-4 space-y-3">
            <div className="flex items-center justify-between"><h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Mods & Relics Focus</h3><button type="button" onClick={() => onSetView(VIEWS.MODS_RELICS)} className="text-xs font-medium text-cyan-400">View all ({modsAndRelics.length}) →</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{modsAndRelics.slice(0, 4).map((item) => <ItemCard key={item.id} item={item} onUpdateItem={onUpdateItem} onDeleteItem={onDeleteItem} tagSuggestions={tagSuggestions} onTagClick={onTagClick} />)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
