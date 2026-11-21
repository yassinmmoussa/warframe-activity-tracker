import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LayoutDashboard,
  CalendarClock,
  Swords,
  Gem,
  BookOpen,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Tag,
  ListChecks,
  Sparkles,
  X,
  Trash2,
  Pencil,
  Check,
  CheckSquare,
  Square,
  MapPin,
  Minus,
  Clock,
  Circle,
  ArrowRight,
  Flame,
  Shield,
  Eye,
  EyeOff,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { QuickAddBar } from './components/QuickAddBar.jsx';
import { ItemCard } from './components/ItemCard.jsx';
import { CATEGORIES, STATUS_OPTIONS, RELIC_ERAS } from './data/options.js';
import { SUGGESTED_TAGS } from './data/options.js';
import { SAMPLE_ITEMS } from './data/sampleItems.js';
import { createInitialState, normalizeState, loadState, saveState, clearStoredState } from './storage/resetStorage.js';
import { getResetCountdowns } from './storage/resetTime.js';

export default function App() {
  const [state, setState] = useState(() => loadState());
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedTag, setSelectedTag] = useState('');
  const [countdowns, setCountdowns] = useState(() => getResetCountdowns());
  const [toast, setToast] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmFullWipe, setConfirmFullWipe] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isFirstRender = useRef(true);
  const toastTimeoutRef = useRef(null);

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

  const fileInputRef = useRef(null);

  const notify = (message, type = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    saveState(state);
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      setHasUnsavedChanges(true);
    }
  }, [state]);

  useEffect(() => {
    const checkResets = () => {
      const cd = getResetCountdowns();
      setCountdowns(cd);
      setState((prev) => {
        let changed = false;
        const nextResets = { ...prev.resets };
        if (prev.resets.lastDailyReset !== cd.utcTodayKey) {
          nextResets.daily = prev.resets.daily.map((t) => ({ ...t, done: false }));
          nextResets.lastDailyReset = cd.utcTodayKey;
          changed = true;
        }
        if (prev.resets.lastWeeklyReset !== cd.utcMondayKey) {
          nextResets.weekly = prev.resets.weekly.map((t) => ({ ...t, done: false }));
          nextResets.lastWeeklyReset = cd.utcMondayKey;
          changed = true;
        }
        return changed ? { ...prev, resets: nextResets } : prev;
      });
    };
    checkResets();
    const timer = setInterval(checkResets, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleAddItem = (newItem) => {
    setState((prev) => ({ ...prev, items: [newItem, ...prev.items] }));
    notify(`Added "${newItem.title}"`);
  };

  const handleUpdateItem = (id, patch) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item
      ),
    }));
  };

  const handleDeleteItem = (id) => {
    setState((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }));
    notify('Item removed');
  };

  const handleAddDefaultTag = (tag) => {
    const clean = tag.trim().replace(/^#/, '');
    if (!clean) return;
    setState((prev) => {
      const existing = prev.defaultTags || [];
      if (existing.some((t) => t.toLowerCase() === clean.toLowerCase())) return prev;
      return { ...prev, defaultTags: [...existing, clean] };
    });
    notify(`Added #${clean} to default tags`);
  };

  const handleRemoveDefaultTag = (tag) => {
    setState((prev) => ({
      ...prev,
      defaultTags: (prev.defaultTags || []).filter((t) => t !== tag),
    }));
  };

  const handleResetDefaultTags = () => {
    setState((prev) => ({
      ...prev,
      defaultTags: [...SUGGESTED_TAGS],
    }));
    notify('Restored built-in default tags');
  };

  const handleToggleResetTask = (cadence, taskId) => {
    setState((prev) => ({
      ...prev,
      resets: {
        ...prev.resets,
        [cadence]: prev.resets[cadence].map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
      },
    }));
  };

  const handleDeleteResetTask = (cadence, taskId) => {
    setState((prev) => ({
      ...prev,
      resets: {
        ...prev.resets,
        [cadence]: prev.resets[cadence].filter((t) => t.id !== taskId),
      },
    }));
    notify('Deleted custom reset task');
  };

  const handleResetCadence = (cadence) => {
    setState((prev) => ({
      ...prev,
      resets: {
        ...prev.resets,
        [cadence]: prev.resets[cadence].map((t) => ({ ...t, done: false })),
      },
    }));
    notify(`Unchecked all ${cadence} tasks`);
  };

  const handleExportJson = () => {
    const payload = { app: 'Tenno Ledger', exportedAt: new Date().toISOString(), ...state };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenno-ledger-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setHasUnsavedChanges(false);
    notify('Exported JSON backup');
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const normalized = normalizeState(JSON.parse(event.target.result));
        setState(normalized);
        setTimeout(() => setHasUnsavedChanges(false), 0);
        notify(`Imported ${normalized.items.length} items from JSON backup`);
      } catch {
        notify('Invalid JSON backup file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resets', label: 'Daily & Weekly', icon: CalendarClock },
    { id: 'arsenal', label: 'Arsenal & Fodder', icon: Swords },
    { id: 'mods-relics', label: 'Mods & Relics', icon: Gem },
    { id: 'all', label: 'Journal', icon: BookOpen },
  ];

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
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            resets: {
                              ...prev.resets,
                              [cadenceKey]: prev.resets[cadenceKey].map((t) =>
                                t.id === task.id ? { ...t, hidden: !t.hidden } : t
                              ),
                            },
                          }))
                        }
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
      <header className="sticky top-0 z-30 border-b border-[#263144] bg-[#0b0e14]/95 backdrop-blur">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#d4af37]/80 via-cyan-400/70 to-[#d4af37]/80" />
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none" aria-hidden="true">
              <path d="M18 3L23.5 12.5L33 18L23.5 23.5L18 33L12.5 23.5L3 18L12.5 12.5L18 3Z" stroke="#d4af37" strokeWidth="1.5" fill="rgba(212, 175, 55, 0.1)" />
              <path d="M18 8.5L21 15L27.5 18L21 21L18 27.5L15 21L8.5 18L15 15L18 8.5Z" stroke="#22d3ee" strokeWidth="1.25" fill="rgba(34, 211, 238, 0.12)" />
              <circle cx="18" cy="18" r="2.2" fill="#f5c451" />
            </svg>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-wider uppercase text-slate-100 leading-none">Tenno Ledger</h1>
                {hasUnsavedChanges ? (
                  <button
                    type="button"
                    onClick={handleExportJson}
                    title="Click to export JSON backup"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300 hover:bg-amber-500/25"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Unsaved Changes
                  </button>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Up to Date
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setActiveView('resets')}
                  className={`hidden md:inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                    visibleDaily.length > 0 && dailyDone === visibleDaily.length
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                      : 'border-cyan-500/35 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
                  }`}
                >
                  Dailies {dailyDone}/{visibleDaily.length}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('resets')}
                  className={`hidden md:inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                    visibleWeekly.length > 0 && weeklyDone === visibleWeekly.length
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                      : 'border-[#d4af37]/35 bg-[#d4af37]/10 text-[#f5c451] hover:bg-[#d4af37]/20'
                  }`}
                >
                  Weeklies {weeklyDone}/{visibleWeekly.length}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Warframe Mission, Arsenal & Relic Command Terminal</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/15 px-3 py-1.5 text-xs font-semibold text-[#f5c451] hover:bg-[#d4af37]/25"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#263144] bg-[#131822] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-500/50 hover:text-cyan-300"
            >
              <Upload className="w-3.5 h-3.5" />
              Import JSON
            </button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleImportJson} className="hidden" />
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              title="Reset or clear local data"
              className="inline-flex items-center gap-1 rounded-lg border border-[#263144] bg-[#131822] px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <nav className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto pb-2">
          {NAV_ITEMS.map((nav) => {
            const Icon = nav.icon;
            const active = activeView === nav.id;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => setActiveView(nav.id)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-[#1a2130] text-[#f5c451] border border-[#d4af37]/40'
                    : 'text-slate-400 hover:bg-[#131822] hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {nav.label}
              </button>
            );
          })}
        </nav>
      </header>

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
                setState((prev) => ({
                  ...prev,
                  resets: {
                    ...prev.resets,
                    [newResetCadence]: [
                      ...prev.resets[newResetCadence],
                      { id: `custom-${Date.now()}`, title: newResetTitle.trim(), group: 'Custom', cadence: newResetCadence, note: newResetNote.trim(), done: false, hidden: false, custom: true },
                    ],
                  },
                }));
                setNewResetTitle('');
                setNewResetNote('');
                notify('Added custom reset task');
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

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-[#263144] bg-[#131822] px-4 py-2.5 text-xs font-medium text-slate-100 shadow-xl">
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#263144] bg-[#131822] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100">Manage Local Ledger Data</h3>
              <button type="button" onClick={closeResetModal} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Your data is stored locally in this browser. Export a JSON backup first if you want to keep your current entries.
            </p>

            {!confirmFullWipe ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setState((prev) => ({ ...prev, items: [] }));
                    closeResetModal();
                    notify('Cleared all items (kept reset checklists & default tags)');
                  }}
                  className="w-full rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/25"
                >
                  Flush Items List Only (Keep Resets & Default Tags)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setState((prev) => ({ ...prev, items: SAMPLE_ITEMS }));
                    closeResetModal();
                    notify('Loaded sample items (kept reset checklists & default tags)');
                  }}
                  className="w-full rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/15 px-3 py-2 text-xs font-semibold text-[#f5c451] hover:bg-[#d4af37]/25"
                >
                  Load Sample Items (Replaces Current Items)
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmFullWipe(true)}
                  className="w-full rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/25"
                >
                  Complete Fresh Wipe (New User Experience)...
                </button>
                <button
                  type="button"
                  onClick={closeResetModal}
                  className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3.5 space-y-3">
                <div className="flex items-start gap-2 text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold">Confirm Complete Fresh Wipe</p>
                    <p className="text-rose-200/80">
                      This will erase all items, custom daily/weekly reset tasks, hidden task settings, and custom default tags back to a clean new-user state.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      clearStoredState();
                      setState(createInitialState(false));
                      setTimeout(() => setHasUnsavedChanges(false), 0);
                      closeResetModal();
                      notify('Completed full fresh wipe');
                    }}
                    className="flex-1 rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-600"
                  >
                    Yes, Wipe Everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmFullWipe(false)}
                    className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2 text-xs font-medium text-slate-300 hover:text-white"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}