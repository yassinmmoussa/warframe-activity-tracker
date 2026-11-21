import { useState } from 'react';
import { Eye, EyeOff, Plus } from 'lucide-react';
import { ResetSection } from './ResetSection.jsx';

export function ResetsPage({
  state,
  countdowns,
  onToggleTask,
  onToggleVisibility,
  onDeleteTask,
  onResetCadence,
  onAddResetTask,
}) {
  const [tab, setTab] = useState('all');
  const [filter, setFilter] = useState('all');
  const [showHidden, setShowHidden] = useState(false);
  const [title, setTitle] = useState('');
  const [cadence, setCadence] = useState('daily');
  const [note, setNote] = useState('');

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-[#263144] bg-[#131822]/90 p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Daily & Weekly' },
            { id: 'daily', label: 'Daily Only' },
            { id: 'weekly', label: 'Weekly & Bi-Weekly' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${tab === item.id ? 'bg-[#d4af37] text-[#07090d]' : 'bg-[#0b0e14] text-slate-300'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-2.5 py-1.5 text-xs text-slate-200">
            <option value="all">Show All</option>
            <option value="incomplete">Incomplete Only</option>
            <option value="completed">Completed Only</option>
          </select>
          <button
            type="button"
            onClick={() => setShowHidden((previous) => !previous)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#263144] bg-[#0b0e14] px-2.5 py-1.5 text-xs text-slate-300"
          >
            {showHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showHidden ? 'Showing Hidden' : 'Show Hidden'}
          </button>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) return;
          onAddResetTask(cadence, title, note);
          setTitle('');
          setNote('');
        }}
        className="flex flex-col sm:flex-row gap-2 rounded-xl border border-[#263144] bg-[#131822]/70 p-3"
      >
        <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Add custom daily or weekly reminder..." className="flex-1 rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500" />
        <input type="text" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note..." className="sm:w-52 rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500" />
        <select value={cadence} onChange={(event) => setCadence(event.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-1.5 text-sm text-slate-200">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <button type="submit" disabled={!title.trim()} className="inline-flex items-center justify-center gap-1 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-[#07090d] disabled:opacity-40">
          <Plus className="w-4 h-4" /> Add Reset Task
        </button>
      </form>

      {(tab === 'all' || tab === 'daily') && (
        <ResetSection
          cadenceKey="daily"
          title="Daily Reset Checklist (00:00 UTC)"
          resetText={countdowns.dailyText}
          accentClass="text-cyan-300"
          tasks={state.resets.daily}
          filter={filter}
          showHidden={showHidden}
          onResetCadence={onResetCadence}
          onToggleTask={onToggleTask}
          onToggleVisibility={onToggleVisibility}
          onDeleteTask={onDeleteTask}
        />
      )}
      {(tab === 'all' || tab === 'weekly') && (
        <ResetSection
          cadenceKey="weekly"
          title="Weekly & Bi-Weekly Resets (Monday 00:00 UTC)"
          resetText={countdowns.weeklyText}
          accentClass="text-[#f5c451]"
          tasks={state.resets.weekly}
          filter={filter}
          showHidden={showHidden}
          onResetCadence={onResetCadence}
          onToggleTask={onToggleTask}
          onToggleVisibility={onToggleVisibility}
          onDeleteTask={onDeleteTask}
        />
      )}
    </div>
  );
}
