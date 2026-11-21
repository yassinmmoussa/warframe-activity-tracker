import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Plus,
  Sparkles,
  X,
  Trash2,
  Clock,
  Circle,
  ArrowRight,
  Flame,
  Shield,
  Eye,
  EyeOff,
  Search
} from 'lucide-react';
import { QuickAddBar } from './components/QuickAddBar.jsx';
import { ItemCard } from './components/ItemCard.jsx';
import { CATEGORIES, STATUS_OPTIONS, RELIC_ERAS } from './data/options.js';
import { useLedger } from './hooks/useLedger.js';
import { AppHeader } from './components/layout/AppHeader.jsx';
import { Toast } from './components/layout/Toast.jsx';
import { DataResetModal } from './components/layout/DataResetModal.jsx';

export default function App() {
  const {
    state,
    countdowns,
    toast,
    hasUnsavedChanges,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
    handleAddDefaultTag,
    handleRemoveDefaultTag,
    handleResetDefaultTags,
    handleToggleResetTask,
    handleToggleResetTaskVisibility,
    handleDeleteResetTask,
    handleAddResetTask,
    handleResetCadence,
    handleExportJson,
    handleImportJson,
    handleClearItems,
    handleLoadSamples,
    handleFullWipe,
  } = useLedger();

  const [activeView, setActiveView] = useState('dashboard');
  const [selectedTag, setSelectedTag] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmFullWipe, setConfirmFullWipe] = useState(false);

  const [resetsTab, setResetsTab] = useState('all');
  const [resetsFilter, setResetsFilter] = useState('all');
  const [showHiddenResets, setShowHiddenResets] = useState(false);
  const [newResetTitle, setNewResetTitle] = useState('');
  const [newResetCadence, setNewResetCadence] = useState('daily');
  const [newResetNote, setNewResetNote] = useState('');

  const [arsenalTab, setArsenalTab] = useState('all');
  const [hideDoneArsenal, setHideDoneArsenal] = useState(false);

  const [mrTab, setMrTab] = useState('all');
  const [eraFilter, setEraFilter] = useState('all');

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');

  const closeResetModal = () => {
    setShowResetModal(false);
    setConfirmFullWipe(false);
  };

  const visibleDaily = state.resets.daily.filter((t) => !t.hidden);
  const visibleWeekly = state.resets.weekly.filter((t) => !t.hidden);
  const dailyDone = visibleDaily.filter((t) => t.done).length;
  const weeklyDone = visibleWeekly.filter((t) => t.done).length;

  const activeItems = state.items.filter((i) => i.status !== 'done');
  const activeFarms = activeItems.filter((i) => i.category === 'warframe' || i.category === 'weapon');
  const fodderItems = activeItems.filter((i) => i.category === 'fodder');
  const modsAndRelics = activeItems.filter((i) => i.category === 'mod' || i.category === 'relic');

  const allTags = useMemo(() => {
    const set = new Set();
    state.items.forEach((item) => (item.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [state.items]);

  const filteredJournal = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = state.items.filter((item) => {
      if (catFilter !== 'all' && item.category !== catFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (selectedTag && !(item.tags || []).includes(selectedTag)) return false;
      if (q) {
        const hay = [item.title, item.notes, item.source, ...(item.tags || []), ...(item.checklist || []).map((c) => c.text)]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const pr = { high: 0, medium: 1, low: 2 };
    return [...list].sort((a, b) => {
      if (sortBy === 'priority') return (pr[a.priority] ?? 1) - (pr[b.priority] ?? 1);
      if (sortBy === 'alpha') return a.title.localeCompare(b.title);
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
  }, [state.items, search, catFilter, statusFilter, selectedTag, sortBy]);

  const renderResetSection = (cadenceKey, title, resetText, accentClass) => {
    const list = state.resets[cadenceKey] || [];
    const visible = list.filter((t) => (showHiddenResets ? true : !t.hidden));
    const filtered = visible.filter((t) => {
      if (resetsFilter === 'incomplete') return !t.done;
      if (resetsFilter === 'completed') return t.done;
      return true;
    });
    const activeTotal = list.filter((t) => !t.hidden).length;
    const activeDone = list.filter((t) => !t.hidden && t.done).length;
    const groups = filtered.reduce((acc, task) => {
      const g = task.group || 'General';
      if (!acc[g]) acc[g] = [];
      acc[g].push(task);
      return acc;
    }, {});

    return (
      <div className="rounded-xl border border-[#263144] bg-[#131822]/80 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263144] pb-3.5">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className={`text-base font-bold ${accentClass}`}>{title}</h3>
              <span className="rounded-full border border-[#263144] bg-[#0b0e14] px-2.5 py-0.5 text-xs font-semibold text-slate-200">
                {activeDone} / {activeTotal}
              </span>
            </div>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              Next reset in <span className="font-medium text-slate-200">{resetText}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleResetCadence(cadenceKey)}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-[#d4af37]/60 hover:text-[#f5c451]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Uncheck All {cadenceKey === 'daily' ? 'Dailies' : 'Weeklies'}
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(groups).map(([groupName, tasks]) => (
            <div key={groupName} className="space-y-1.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{groupName}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start justify-between gap-2 rounded-lg border px-3 py-2.5 ${
                      task.done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[#263144] bg-[#0b0e14]/70'
                    } ${task.hidden ? 'opacity-50' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleResetTask(cadenceKey, task.id)}
                      className="flex items-start gap-2.5 text-left flex-1 min-w-0"
                    >
                      {task.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <div className={`text-xs font-medium ${task.done ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                          {task.title}
                        </div>
                        {task.note && <div className="text-[11px] text-slate-400 mt-0.5">{task.note}</div>}
                      </div>
                    </button>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleResetTaskVisibility(cadenceKey, task.id)}
                        title={task.hidden ? 'Unhide task' : 'Hide task'}
                        className="rounded p-1 text-slate-500 hover:bg-[#1a2130] hover:text-slate-300"
                      >
                        {task.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      {task.custom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteResetTask(cadenceKey, task.id)}
                          title="Delete custom task"
                          className="rounded p-1 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at top center, rgba(212, 175, 55, 0.06) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(34, 211, 238, 0.05) 0%, transparent 50%), linear-gradient(rgba(38, 49, 68, 0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(38, 49, 68, 0.14) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px',
      }}
    >
      <AppHeader
        activeView={activeView}
        setActiveView={setActiveView}
        hasUnsavedChanges={hasUnsavedChanges}
        handleExportJson={handleExportJson}
        handleImportJson={handleImportJson}
        openResetModal={() => setShowResetModal(true)}
        dailyDone={dailyDone}
        visibleDailyCount={visibleDaily.length}
        weeklyDone={weeklyDone}
        visibleWeeklyCount={visibleWeekly.length}
      />

      <main className="w-full max-w-[1920px] mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <button type="button" onClick={() => setActiveView('resets')} className="text-left rounded-xl border border-[#263144] bg-[#131822]/90 p-4 hover:border-cyan-500/50">
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

              <button type="button" onClick={() => setActiveView('resets')} className="text-left rounded-xl border border-[#263144] bg-[#131822]/90 p-4 hover:border-[#d4af37]/50">
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

              <button type="button" onClick={() => setActiveView('arsenal')} className="text-left rounded-xl border border-[#263144] bg-[#131822]/90 p-4 hover:border-amber-500/50">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium uppercase tracking-wider">Active Farms & Fodder</span>
                  <Shield className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-100">{activeFarms.length + fodderItems.length}</span>
                  <span className="text-xs text-rose-300">{fodderItems.filter((f) => f.status === 'ready_to_sell').length} ready to sell</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">{activeFarms.length} frames/weapons • {fodderItems.length} mastery fodder</p>
              </button>

              <button type="button" onClick={() => setActiveView('mods-relics')} className="text-left rounded-xl border border-[#263144] bg-[#131822]/90 p-4 hover:border-emerald-500/50">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium uppercase tracking-wider">Mods & Relics</span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-100">{modsAndRelics.length}</span>
                  <span className="text-xs text-emerald-400 inline-flex items-center gap-1">Open <ArrowRight className="w-3 h-3" /></span>
                </div>
                <p className="mt-2 text-xs text-slate-400">{activeItems.filter((i) => i.category === 'mod').length} mods • {activeItems.filter((i) => i.category === 'relic').length} relic goals</p>
              </button>
            </div>

            <QuickAddBar
              onAddItem={handleAddItem}
              existingItems={state.items}
              defaultTags={state.defaultTags}
              onAddDefaultTag={handleAddDefaultTag}
              onRemoveDefaultTag={handleRemoveDefaultTag}
              onResetDefaultTags={handleResetDefaultTags}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5 items-start">
              <div className="space-y-5">
                <div className="rounded-xl border border-[#263144] bg-[#131822]/70 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#f5c451]" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Next Resets To Do</h3>
                    </div>
                    <button type="button" onClick={() => setActiveView('resets')} className="text-xs font-medium text-cyan-400 hover:text-cyan-300">
                      View all resets →
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Daily ({dailyDone}/{visibleDaily.length})</p>
                    <ul className="space-y-1">
                      {visibleDaily.filter((t) => !t.done).slice(0, 5).map((task) => (
                        <li key={task.id}>
                          <button type="button" onClick={() => handleToggleResetTask('daily', task.id)} className="flex w-full items-center gap-2.5 rounded-lg border border-[#263144] bg-[#0b0e14]/70 px-3 py-2 text-left text-xs text-slate-200 hover:border-cyan-500/40">
                            <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="truncate flex-1">{task.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#f5c451]">Weekly ({weeklyDone}/{visibleWeekly.length})</p>
                    <ul className="space-y-1">
                      {visibleWeekly.filter((t) => !t.done).slice(0, 5).map((task) => (
                        <li key={task.id}>
                          <button type="button" onClick={() => handleToggleResetTask('weekly', task.id)} className="flex w-full items-center gap-2.5 rounded-lg border border-[#263144] bg-[#0b0e14]/70 px-3 py-2 text-left text-xs text-slate-200 hover:border-[#d4af37]/40">
                            <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="truncate flex-1">{task.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-[#263144] bg-[#131822]/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Mastery Fodder (Level & Sell)</h3>
                    <button type="button" onClick={() => setActiveView('arsenal')} className="text-xs font-medium text-cyan-400">Arsenal →</button>
                  </div>
                  <div className="space-y-2.5">
                    {fodderItems.slice(0, 4).map((item) => (
                      <ItemCard key={item.id} item={item} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} onTagClick={(t) => { setSelectedTag(t); setActiveView('all'); }} compact />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-xl border border-[#263144] bg-[#131822]/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Active Warframe & Weapon Farms</h3>
                    <button type="button" onClick={() => setActiveView('arsenal')} className="text-xs font-medium text-cyan-400">View all ({activeFarms.length}) →</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeFarms.slice(0, 4).map((item) => (
                      <ItemCard key={item.id} item={item} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} onTagClick={(t) => { setSelectedTag(t); setActiveView('all'); }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 2xl:col-span-1 space-y-5">
                <div className="rounded-xl border border-[#263144] bg-[#131822]/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Mods & Relics Focus</h3>
                    <button type="button" onClick={() => setActiveView('mods-relics')} className="text-xs font-medium text-cyan-400">View all ({modsAndRelics.length}) →</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {modsAndRelics.slice(0, 4).map((item) => (
                      <ItemCard key={item.id} item={item} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} onTagClick={(t) => { setSelectedTag(t); setActiveView('all'); }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'resets' && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-[#263144] bg-[#131822]/90 p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                {[{ id: 'all', label: 'Daily & Weekly' }, { id: 'daily', label: 'Daily Only' }, { id: 'weekly', label: 'Weekly & Bi-Weekly' }].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setResetsTab(t.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${resetsTab === t.id ? 'bg-[#d4af37] text-[#07090d]' : 'bg-[#0b0e14] text-slate-300'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={resetsFilter} onChange={(e) => setResetsFilter(e.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-2.5 py-1.5 text-xs text-slate-200">
                  <option value="all">Show All</option>
                  <option value="incomplete">Incomplete Only</option>
                  <option value="completed">Completed Only</option>
                </select>
                <button
                  type="button"
                  onClick={() => setShowHiddenResets((p) => !p)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#263144] bg-[#0b0e14] px-2.5 py-1.5 text-xs text-slate-300"
                >
                  {showHiddenResets ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {showHiddenResets ? 'Showing Hidden' : 'Show Hidden'}
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newResetTitle.trim()) return;
                handleAddResetTask(newResetCadence, newResetTitle, newResetNote);
                setNewResetTitle('');
                setNewResetNote('');
              }}
              className="flex flex-col sm:flex-row gap-2 rounded-xl border border-[#263144] bg-[#131822]/70 p-3"
            >
              <input type="text" value={newResetTitle} onChange={(e) => setNewResetTitle(e.target.value)} placeholder="Add custom daily or weekly reminder..." className="flex-1 rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500" />
              <input type="text" value={newResetNote} onChange={(e) => setNewResetNote(e.target.value)} placeholder="Optional note..." className="sm:w-52 rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500" />
              <select value={newResetCadence} onChange={(e) => setNewResetCadence(e.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-1.5 text-sm text-slate-200">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <button type="submit" disabled={!newResetTitle.trim()} className="inline-flex items-center justify-center gap-1 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-[#07090d] disabled:opacity-40">
                <Plus className="w-4 h-4" /> Add Reset Task
              </button>
            </form>

            {(resetsTab === 'all' || resetsTab === 'daily') && renderResetSection('daily', 'Daily Reset Checklist (00:00 UTC)', countdowns.dailyText, 'text-cyan-300')}
            {(resetsTab === 'all' || resetsTab === 'weekly') && renderResetSection('weekly', 'Weekly & Bi-Weekly Resets (Monday 00:00 UTC)', countdowns.weeklyText, 'text-[#f5c451]')}
          </div>
        )}

        {activeView === 'arsenal' && (
          <div className="space-y-5">
            <QuickAddBar
              onAddItem={handleAddItem}
              defaultCategory={arsenalTab === 'all' ? 'warframe' : arsenalTab}
              existingItems={state.items}
              defaultTags={state.defaultTags}
              onAddDefaultTag={handleAddDefaultTag}
              onRemoveDefaultTag={handleRemoveDefaultTag}
              onResetDefaultTags={handleResetDefaultTags}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#263144] bg-[#131822]/90 p-3">
              <div className="flex flex-wrap items-center gap-2">
                {[{ id: 'all', label: 'All Arsenal' }, { id: 'warframe', label: 'Warframes' }, { id: 'weapon', label: 'Weapons to Get' }, { id: 'fodder', label: 'Mastery Fodder' }].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setArsenalTab(t.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${arsenalTab === t.id ? 'bg-[#d4af37] text-[#07090d]' : 'bg-[#0b0e14] text-slate-300'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input type="checkbox" checked={hideDoneArsenal} onChange={(e) => setHideDoneArsenal(e.target.checked)} />
                Hide Completed
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5">
              {state.items
                .filter((i) => ['warframe', 'weapon', 'fodder'].includes(i.category))
                .filter((i) => (arsenalTab === 'all' ? true : i.category === arsenalTab))
                .filter((i) => (hideDoneArsenal ? i.status !== 'done' : true))
                .map((item) => (
                  <ItemCard key={item.id} item={item} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} onTagClick={(t) => { setSelectedTag(t); setActiveView('all'); }} />
                ))}
            </div>
          </div>
        )}

        {activeView === 'mods-relics' && (
          <div className="space-y-5">
            <QuickAddBar
              onAddItem={handleAddItem}
              defaultCategory={mrTab === 'mod' ? 'mod' : 'relic'}
              existingItems={state.items}
              defaultTags={state.defaultTags}
              onAddDefaultTag={handleAddDefaultTag}
              onRemoveDefaultTag={handleRemoveDefaultTag}
              onResetDefaultTags={handleResetDefaultTags}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#263144] bg-[#131822]/90 p-3">
              <div className="flex flex-wrap items-center gap-2">
                {[{ id: 'all', label: 'All' }, { id: 'relic', label: 'Void Relics' }, { id: 'mod', label: 'Mods' }].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setMrTab(t.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${mrTab === t.id ? 'bg-emerald-500 text-[#07090d]' : 'bg-[#0b0e14] text-slate-300'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {mrTab !== 'mod' && (
                <select value={eraFilter} onChange={(e) => setEraFilter(e.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-1.5 text-xs text-slate-200">
                  <option value="all">All Relic Eras</option>
                  {RELIC_ERAS.map((era) => <option key={era} value={era}>{era}</option>)}
                </select>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5">
              {state.items
                .filter((i) => i.category === 'mod' || i.category === 'relic')
                .filter((i) => (mrTab === 'all' ? true : i.category === mrTab))
                .filter((i) => (eraFilter === 'all' ? true : i.category === 'relic' && i.relicEra === eraFilter))
                .map((item) => (
                  <ItemCard key={item.id} item={item} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} onTagClick={(t) => { setSelectedTag(t); setActiveView('all'); }} />
                ))}
            </div>
          </div>
        )}

        {activeView === 'all' && (
          <div className="space-y-5">
            <QuickAddBar
              onAddItem={handleAddItem}
              defaultCategory="activity"
              existingItems={state.items}
              defaultTags={state.defaultTags}
              onAddDefaultTag={handleAddDefaultTag}
              onRemoveDefaultTag={handleRemoveDefaultTag}
              onResetDefaultTags={handleResetDefaultTags}
            />
            <div className="rounded-xl border border-[#263144] bg-[#131822]/90 p-3.5 space-y-3">
              <div className="flex flex-col md:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search titles, drop locations, notes, checklist steps, or tags..." className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2 text-xs text-slate-200">
                    <option value="all">All Categories</option>
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2 text-xs text-slate-200">
                    <option value="all">All Statuses</option>
                    {STATUS_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2 text-xs text-slate-200">
                    <option value="updated">Sort: Recently Updated</option>
                    <option value="priority">Sort: Priority</option>
                    <option value="alpha">Sort: A → Z</option>
                  </select>
                </div>
              </div>
              {allTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 mr-1">Filter by tag:</span>
                  {allTags.map((tag) => {
                    const active = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(active ? '' : tag)}
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${active ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#f5c451]' : 'border-[#263144] bg-[#0b0e14] text-slate-400'}`}
                      >
                        #{tag}
                        {active && <X className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5">
              {filteredJournal.map((item) => (
                <ItemCard key={item.id} item={item} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} onTagClick={(t) => setSelectedTag(selectedTag === t ? '' : t)} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Toast toast={toast} />

      <DataResetModal
        open={showResetModal}
        confirmFullWipe={confirmFullWipe}
        setConfirmFullWipe={setConfirmFullWipe}
        close={closeResetModal}
        handleClearItems={handleClearItems}
        handleLoadSamples={handleLoadSamples}
        handleFullWipe={handleFullWipe}
      />
    </div>
  );
}