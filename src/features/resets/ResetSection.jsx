import { CheckCircle2, Circle, Clock, Eye, EyeOff, RotateCcw, Trash2 } from 'lucide-react';
import { filterResetTasks, getResetProgress } from '../../selectors/ledgerSelectors.js';

export function ResetSection({
  cadenceKey,
  title,
  resetText,
  accentClass,
  tasks,
  filter,
  showHidden,
  onResetCadence,
  onToggleTask,
  onToggleVisibility,
  onDeleteTask,
}) {
  const filtered = filterResetTasks(tasks, { filter, showHidden });
  const progress = getResetProgress(tasks);
  const activeTotal = progress.visible.length;
  const activeDone = progress.done;
  const groups = filtered.reduce((acc, task) => {
    const group = task.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(task);
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
          onClick={() => onResetCadence(cadenceKey)}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-[#d4af37]/60 hover:text-[#f5c451]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Uncheck All {cadenceKey === 'daily' ? 'Dailies' : 'Weeklies'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(groups).map(([groupName, tasksInGroup]) => (
          <div key={groupName} className="space-y-1.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{groupName}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {tasksInGroup.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start justify-between gap-2 rounded-lg border px-3 py-2.5 ${
                    task.done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[#263144] bg-[#0b0e14]/70'
                  } ${task.hidden ? 'opacity-50' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => onToggleTask(cadenceKey, task.id)}
                    className="flex items-start gap-2.5 text-left flex-1 min-w-0"
                  >
                    {task.done
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      : <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />}
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
                      onClick={() => onToggleVisibility(cadenceKey, task.id)}
                      title={task.hidden ? 'Unhide task' : 'Hide task'}
                      className="rounded p-1 text-slate-500 hover:bg-[#1a2130] hover:text-slate-300"
                    >
                      {task.hidden
                        ? <Eye className="w-3.5 h-3.5" />
                        : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    {task.custom && (
                      <button
                        type="button"
                        onClick={() => onDeleteTask(cadenceKey, task.id)}
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
}
