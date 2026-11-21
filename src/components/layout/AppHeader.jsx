import { useRef } from 'react';
import { Download, Upload, RotateCcw } from 'lucide-react';
import { AppNavigation } from './AppNavigation.jsx';
import { VIEWS } from '../../constants/views.js';

export function AppHeader({
  activeView,
  setActiveView,
  hasUnsavedChanges,
  handleExportJson,
  handleImportJson,
  openResetModal,
  dailyDone,
  visibleDailyCount,
  weeklyDone,
  visibleWeeklyCount,
}) {
  const fileInputRef = useRef(null);

  return (
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
                onClick={() => setActiveView(VIEWS.RESETS)}
                className={`hidden md:inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                  visibleDailyCount > 0 && dailyDone === visibleDailyCount
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                    : 'border-cyan-500/35 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
                }`}
              >
                Dailies {dailyDone}/{visibleDailyCount}
              </button>
              <button
                type="button"
                onClick={() => setActiveView(VIEWS.RESETS)}
                className={`hidden md:inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                  visibleWeeklyCount > 0 && weeklyDone === visibleWeeklyCount
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                    : 'border-[#d4af37]/35 bg-[#d4af37]/10 text-[#f5c451] hover:bg-[#d4af37]/20'
                }`}
              >
                Weeklies {weeklyDone}/{visibleWeeklyCount}
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
            onClick={openResetModal}
            title="Reset or clear local data"
            className="inline-flex items-center gap-1 rounded-lg border border-[#263144] bg-[#131822] px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <AppNavigation activeView={activeView} setActiveView={setActiveView} />
    </header>
  );
}
