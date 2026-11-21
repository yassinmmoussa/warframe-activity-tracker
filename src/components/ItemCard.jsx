import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, ChevronRight, Tag, Check, Trash2, Pencil, Minus, CheckSquare, Square, X, MapPin, Sparkles } from 'lucide-react';
import { CATEGORIES, STATUS_OPTIONS, PRIORITY_OPTIONS, RELIC_ERAS, RELIC_REFINEMENTS, CHECKLIST_TEMPLATES, CATEGORY_BADGES, STATUS_STYLES, PRIORITY_DOT } from '../constants.js';

export function ItemCard({ item, onUpdateItem, onDeleteItem, onTagClick, compact = false }) {
  const [expanded, setExpanded] = useState(false);
  const [newStep, setNewStep] = useState('');
  const [editingStepId, setEditingStepId] = useState(null);
  const [editingStepText, setEditingStepText] = useState('');
  const [templateCategory, setTemplateCategory] = useState(item.category || 'warframe');

  const [isEditing, setIsEditing] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    setTemplateCategory(item.category || 'warframe');
  }, [item.category]);

  const catInfo = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[5];
  const checklist = item.checklist || [];
  const doneCount = checklist.filter((s) => s.done).length;
  const totalCount = checklist.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const startEditing = () => {
    setDraft({
      title: item.title || '',
      category: item.category || 'activity',
      status: item.status || 'want',
      priority: item.priority || 'medium',
      source: item.source || '',
      notes: item.notes || '',
      tags: Array.isArray(item.tags) ? [...item.tags] : [],
      relicEra: item.relicEra || 'Axi',
      relicRefinement: item.relicRefinement || 'Intact',
      relicQty: item.relicQty ?? 1,
      modRankCurrent: item.modRankCurrent ?? 0,
      modRankMax: item.modRankMax ?? 10,
      fodderRank: item.fodderRank ?? 0,
    });
    setTagDraft('');
    setIsEditing(true);
  };

  const handleAddDraftTag = (raw) => {
    if (!draft) return;
    const clean = raw.trim().replace(/^#/, '');
    if (!clean) return;
    if (!draft.tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setDraft((prev) => ({ ...prev, tags: [...prev.tags, clean] }));
    }
    setTagDraft('');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!draft || !draft.title.trim()) return;

    const pendingTag = tagDraft.trim().replace(/^#/, '');
    const finalTags =
      pendingTag && !draft.tags.some((t) => t.toLowerCase() === pendingTag.toLowerCase())
        ? [...draft.tags, pendingTag]
        : draft.tags;

    const patch = {
      title: draft.title.trim(),
      category: draft.category,
      status: draft.status,
      priority: draft.priority,
      source: draft.source.trim(),
      notes: draft.notes.trim(),
      tags: finalTags,
    };

    if (draft.category === 'relic') {
      patch.relicEra = draft.relicEra;
      patch.relicRefinement = draft.relicRefinement;
      patch.relicQty = Number(draft.relicQty) || 0;
    } else if (draft.category === 'mod') {
      patch.modRankCurrent = Number(draft.modRankCurrent) || 0;
      patch.modRankMax = Number(draft.modRankMax) || 10;
    } else if (draft.category === 'fodder') {
      patch.fodderRank = Number(draft.fodderRank) || 0;
    }

    onUpdateItem(item.id, patch);
    setIsEditing(false);
    setDraft(null);
    setTagDraft('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDraft(null);
    setTagDraft('');
  };

  const toggleStep = (stepId) => {
    onUpdateItem(item.id, {
      checklist: checklist.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)),
    });
  };

  const startEditingStep = (step) => {
    setEditingStepId(step.id);
    setEditingStepText(step.text);
  };

  const saveEditingStep = (stepId) => {
    const trimmed = editingStepText.trim();
    if (!trimmed) return;
    onUpdateItem(item.id, {
      checklist: checklist.map((s) => (s.id === stepId ? { ...s, text: trimmed } : s)),
    });
    setEditingStepId(null);
    setEditingStepText('');
  };

  const deleteStep = (stepId) => {
    if (editingStepId === stepId) {
      setEditingStepId(null);
      setEditingStepText('');
    }
    onUpdateItem(item.id, {
      checklist: checklist.filter((s) => s.id !== stepId),
    });
  };

  const applyTemplateToExisting = (mode = 'append') => {
    const tpl = CHECKLIST_TEMPLATES[templateCategory] || [];
    if (tpl.length === 0) return;

    if (mode === 'replace') {
      onUpdateItem(item.id, {
        checklist: tpl.map((text, idx) => ({
          id: `tpl-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
          text,
          done: false,
        })),
      });
      setEditingStepId(null);
      setEditingStepText('');
      return;
    }

    const existingTexts = new Set(checklist.map((s) => s.text.trim().toLowerCase()));
    const additions = tpl
      .filter((text) => !existingTexts.has(text.trim().toLowerCase()))
      .map((text, idx) => ({
        id: `tpl-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
        text,
        done: false,
      }));

    if (additions.length > 0) {
      onUpdateItem(item.id, {
        checklist: [...checklist, ...additions],
      });
    }
  };

  const addStep = (e) => {
    e.preventDefault();
    const text = newStep.trim();
    if (!text) return;
    onUpdateItem(item.id, {
      checklist: [...checklist, { id: `step-${Date.now()}`, text, done: false }],
    });
    setNewStep('');
  };

  const fodderMaxRank = (item.fodderRank ?? 0) > 30 ? 40 : 30;

  return (
    <div className="rounded-xl border border-[#263144] bg-[#131822]/90 p-3.5 transition-colors hover:border-slate-500/70">
      {isEditing && draft ? (
        <form onSubmit={handleSaveEdit} className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#263144] pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#f5c451]">
              Edit Entry
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="submit"
                disabled={!draft.title.trim()}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-40"
              >
                <Check className="w-3.5 h-3.5" />
                Save
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1 rounded-md border border-[#263144] bg-[#0b0e14] px-2 py-1 text-xs font-medium text-slate-300 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Title</label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2.5 py-1.5 text-sm text-slate-100 focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Category</label>
              <select
                value={draft.category}
                onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1.5 text-xs text-slate-200"
              >
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Status</label>
              <select
                value={draft.status}
                onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1.5 text-xs text-slate-200"
              >
                {STATUS_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Priority</label>
              <select
                value={draft.priority}
                onChange={(e) => setDraft((prev) => ({ ...prev, priority: e.target.value }))}
                className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1.5 text-xs text-slate-200"
              >
                {PRIORITY_OPTIONS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Drop Source / Location</label>
            <input
              type="text"
              value={draft.source}
              onChange={(e) => setDraft((prev) => ({ ...prev, source: e.target.value }))}
              placeholder="e.g. Lua Apollo Rot B/C..."
              className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500"
            />
          </div>

          {draft.category === 'relic' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Era</label>
                <select
                  value={draft.relicEra}
                  onChange={(e) => setDraft((prev) => ({ ...prev, relicEra: e.target.value }))}
                  className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1 text-xs text-slate-200"
                >
                  {RELIC_ERAS.map((era) => <option key={era} value={era}>{era}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Refinement</label>
                <select
                  value={draft.relicRefinement}
                  onChange={(e) => setDraft((prev) => ({ ...prev, relicRefinement: e.target.value }))}
                  className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1 text-xs text-slate-200"
                >
                  {RELIC_REFINEMENTS.map((ref) => <option key={ref} value={ref}>{ref}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Qty Owned</label>
                <input
                  type="number"
                  min="0"
                  value={draft.relicQty}
                  onChange={(e) => setDraft((prev) => ({ ...prev, relicQty: e.target.value }))}
                  className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1 text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          {draft.category === 'mod' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Current Rank</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={draft.modRankCurrent}
                  onChange={(e) => setDraft((prev) => ({ ...prev, modRankCurrent: e.target.value }))}
                  className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Target Max Rank</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={draft.modRankMax}
                  onChange={(e) => setDraft((prev) => ({ ...prev, modRankMax: e.target.value }))}
                  className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1 text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          {draft.category === 'fodder' && (
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Current Gear Rank (0–40)</label>
              <input
                type="number"
                min="0"
                max="40"
                value={draft.fodderRank}
                onChange={(e) => setDraft((prev) => ({ ...prev, fodderRank: e.target.value }))}
                className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1 text-xs text-slate-200"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[11px] text-slate-400">Tags</label>
            <div className="flex flex-wrap gap-1">
              {draft.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded border border-[#d4af37]/40 bg-[#d4af37]/15 px-1.5 py-0.5 text-[11px] text-[#f5c451]"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddDraftTag(tagDraft);
                  }
                }}
                placeholder="Add tag + Enter..."
                className="flex-1 rounded-md border border-[#263144] bg-[#0b0e14] px-2 py-1 text-xs text-slate-200 placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => handleAddDraftTag(tagDraft)}
                className="rounded-md border border-[#263144] bg-[#1a2130] px-2 py-1 text-xs text-slate-200 hover:bg-[#263144]"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Notes</label>
            <textarea
              rows={2}
              value={draft.notes}
              onChange={(e) => setDraft((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional reminders..."
              className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500"
            />
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[item.priority] || PRIORITY_DOT.medium}`} />
                <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${CATEGORY_BADGES[item.category] || CATEGORY_BADGES.activity}`}>
                  {catInfo.label}
                </span>
                {item.category === 'relic' && item.relicEra && (
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">
                    {item.relicEra} • {item.relicRefinement || 'Intact'} (x{item.relicQty ?? 1})
                  </span>
                )}
                {item.category === 'mod' && typeof item.modRankMax === 'number' && (
                  <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[11px] text-violet-300">
                    Rank {item.modRankCurrent ?? 0} / {item.modRankMax}
                  </span>
                )}
                {item.category === 'fodder' && typeof item.fodderRank === 'number' && (
                  <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-300">
                    Rank {item.fodderRank}/{fodderMaxRank}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-semibold text-slate-100 truncate">{item.title}</h4>
              {!compact && item.notes && <p className="text-xs text-slate-400 line-clamp-2">{item.notes}</p>}
              {item.source && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{item.source}</span>
                </div>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {item.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => onTagClick && onTagClick(tag)}
                      className="rounded bg-[#0b0e14] px-1.5 py-0.5 text-[11px] text-[#f5c451] border border-[#263144] hover:border-[#d4af37]/50"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <select
                value={item.status}
                onChange={(e) => onUpdateItem(item.id, { status: e.target.value })}
                className={`rounded-lg border px-2 py-1 text-xs font-medium focus:border-[#d4af37] focus:outline-none ${
                  STATUS_STYLES[item.status] || 'border-[#263144] bg-[#0b0e14] text-slate-200'
                }`}
              >
                {STATUS_OPTIONS.map((s) => <option key={s.id} value={s.id} className="bg-[#0b0e14] text-slate-200">{s.label}</option>)}
              </select>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setExpanded((p) => !p)}
                  className="inline-flex items-center gap-1 rounded-md border border-[#263144] bg-[#0b0e14] px-2 py-1 text-[11px] text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300"
                >
                  {totalCount > 0 ? (
                    <>
                      {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      {doneCount}/{totalCount}
                    </>
                  ) : (
                    <span>{expanded ? 'Hide' : '+Steps'}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={startEditing}
                  title="Edit card"
                  className="rounded-md p-1 text-slate-400 hover:bg-[#1a2130] hover:text-[#f5c451]"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  title="Delete card"
                  className="rounded-md p-1 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {totalCount > 0 && (
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#0b0e14]">
              <div
                className={`h-full transition-all duration-300 ${progressPct === 100 ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}

          {expanded && (
            <div className="mt-3 border-t border-[#263144] pt-3 space-y-2.5">
              {item.category === 'relic' && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#0b0e14]/70 px-2.5 py-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Refinement:</span>
                    <select
                      value={item.relicRefinement || 'Intact'}
                      onChange={(e) => onUpdateItem(item.id, { relicRefinement: e.target.value })}
                      className="rounded border border-[#263144] bg-[#131822] px-2 py-0.5 text-xs text-slate-200"
                    >
                      {RELIC_REFINEMENTS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Owned:</span>
                    <button type="button" onClick={() => onUpdateItem(item.id, { relicQty: Math.max(0, (item.relicQty ?? 1) - 1) })} className="rounded border border-[#263144] bg-[#131822] p-0.5 text-slate-300">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-semibold text-emerald-300">{item.relicQty ?? 1}</span>
                    <button type="button" onClick={() => onUpdateItem(item.id, { relicQty: (item.relicQty ?? 1) + 1 })} className="rounded border border-[#263144] bg-[#131822] p-0.5 text-slate-300">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {item.category === 'mod' && (
                <div className="flex items-center justify-between rounded-lg bg-[#0b0e14]/70 px-2.5 py-1.5 text-xs">
                  <span className="text-slate-400">Mod Rank Progress:</span>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => onUpdateItem(item.id, { modRankCurrent: Math.max(0, (item.modRankCurrent ?? 0) - 1) })} className="rounded border border-[#263144] bg-[#131822] p-0.5 text-slate-300">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-semibold text-violet-300">{item.modRankCurrent ?? 0} / {item.modRankMax ?? 10}</span>
                    <button type="button" onClick={() => onUpdateItem(item.id, { modRankCurrent: Math.min(item.modRankMax ?? 10, (item.modRankCurrent ?? 0) + 1) })} className="rounded border border-[#263144] bg-[#131822] p-0.5 text-slate-300">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Load Checklist Template into Existing Item */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-[#0b0e14]/60 px-2 py-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="rounded border border-[#263144] bg-[#131822] px-2 py-0.5 text-[11px] text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label} Template</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => applyTemplateToExisting('append')}
                  className="rounded border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 font-medium text-cyan-300 hover:bg-cyan-500/20"
                >
                  + Add Steps
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplateToExisting('replace')}
                  title="Replace current checklist with this template"
                  className="rounded border border-[#263144] bg-[#131822] px-2 py-0.5 text-slate-300 hover:border-amber-500/40 hover:text-amber-300"
                >
                  Replace
                </button>
              </div>

              <ul className="space-y-1">
                {checklist.map((step) => (
                  <li key={step.id} className="flex items-center justify-between gap-1.5 rounded-md px-1.5 py-0.5 hover:bg-[#1a2130]/60">
                    {editingStepId === step.id ? (
                      <div className="flex flex-1 items-center gap-1.5">
                        <input
                          type="text"
                          value={editingStepText}
                          onChange={(e) => setEditingStepText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              saveEditingStep(step.id);
                            } else if (e.key === 'Escape') {
                              setEditingStepId(null);
                              setEditingStepText('');
                            }
                          }}
                          className="flex-1 rounded border border-cyan-500/50 bg-[#0b0e14] px-2 py-0.5 text-xs text-slate-100 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => saveEditingStep(step.id)}
                          disabled={!editingStepText.trim()}
                          title="Save step"
                          className="rounded p-1 text-emerald-400 hover:bg-emerald-500/15 disabled:opacity-40"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStepId(null);
                            setEditingStepText('');
                          }}
                          title="Cancel edit"
                          className="rounded p-1 text-slate-400 hover:bg-[#1a2130] hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleStep(step.id)}
                          className="flex items-center gap-2 text-left text-xs flex-1 min-w-0 py-0.5"
                        >
                          {step.done ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-500 shrink-0" />}
                          <span className={`truncate ${step.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>{step.text}</span>
                        </button>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditingStep(step)}
                            title="Edit step"
                            className="rounded p-1 text-slate-500 hover:bg-[#1a2130] hover:text-[#f5c451]"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteStep(step.id)}
                            title="Delete step"
                            className="rounded p-1 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>

              <form onSubmit={addStep} className="flex gap-1.5">
                <input
                  type="text"
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  placeholder="Add checklist step..."
                  className="flex-1 rounded-md border border-[#263144] bg-[#0b0e14] px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
                <button type="submit" className="rounded-md border border-[#263144] bg-[#1a2130] px-2.5 py-1 text-xs text-slate-200 hover:bg-[#263144]">
                  Add
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

