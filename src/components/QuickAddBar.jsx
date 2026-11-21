import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ChevronDown, ChevronUp, Search, Tag, X, Minus, Sparkles, ListChecks, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES, STATUS_OPTIONS, PRIORITY_OPTIONS, RELIC_ERAS, RELIC_REFINEMENTS } from '../data/options.js';
import { CHECKLIST_TEMPLATES } from '../data/checklists.js';
import { STATUS_STYLES } from '../constants/uiStyles.js';
import { getCatalogAutoFill, loadWarframeCatalog, searchWarframeCatalog } from '../data/warframeCatalogSearch.js';

export function QuickAddBar({
  onAddItem,
  defaultCategory = 'warframe',
  existingItems = [],
  defaultTags = SUGGESTED_TAGS,
  onAddDefaultTag,
  onRemoveDefaultTag,
  onResetDefaultTags,
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [status, setStatus] = useState('queued');
  const [priority, setPriority] = useState('medium');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [editingDefaultTags, setEditingDefaultTags] = useState(false);
  const [newDefaultTagInput, setNewDefaultTagInput] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [newStep, setNewStep] = useState('');
  const [relicEra, setRelicEra] = useState('Axi');
  const [relicRefinement, setRelicRefinement] = useState('Intact');
  const [relicQty, setRelicQty] = useState(1);
  const [modRankCurrent, setModRankCurrent] = useState(0);
  const [modRankMax, setModRankMax] = useState(10);
  const [fodderRank, setFodderRank] = useState(0);
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    let active = true;
    loadWarframeCatalog().then((entries) => {
      if (active) setCatalog(entries);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!categoryTouched && !title.trim()) {
      setCategory(defaultCategory);
    }
  }, [defaultCategory, categoryTouched, title]);

  const knownTagPool = useMemo(() => {
    const counts = new Map();
    existingItems.forEach((item) => {
      (item.tags || []).forEach((t) => {
        counts.set(t, (counts.get(t) || 0) + 1);
      });
    });
    defaultTags.forEach((t) => {
      if (!counts.has(t)) counts.set(t, 0);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({ tag, count }));
  }, [existingItems, defaultTags]);

  const predictedTags = useMemo(() => {
    const q = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (!q) return [];
    return knownTagPool
      .filter(({ tag }) => !tags.some((selected) => selected.toLowerCase() === tag.toLowerCase()))
      .filter(({ tag }) => tag.toLowerCase().includes(q))
      .slice(0, 6);
  }, [tagInput, knownTagPool, tags]);

  const titlePredictions = useMemo(() => {
    const q = title.trim().toLowerCase();
    if (q.length < 2) return null;

    const matchingItems = existingItems.filter((item) => {
      const hay = [item.title, item.source, ...(item.tags || [])].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
    const catalogMatches = searchWarframeCatalog(catalog, q, 6);

    const suggestedTagSet = new Set();
    const categoryScores = new Map();

    matchingItems.forEach((item) => {
      categoryScores.set(item.category, (categoryScores.get(item.category) || 0) + 2);
      (item.tags || []).forEach((t) => suggestedTagSet.add(t));
    });

    catalogMatches.forEach((entry, index) => {
      const weight = index === 0 ? 5 : 3;
      categoryScores.set(entry.category, (categoryScores.get(entry.category) || 0) + weight);
      (entry.tags || []).forEach((tag) => suggestedTagSet.add(tag));
    });

    if (/\bprime\b/i.test(q)) suggestedTagSet.add('Prime');
    if (/\b(lith|meso|neo|axi|requiem|omnia)\b/i.test(q)) {
      categoryScores.set('relic', (categoryScores.get('relic') || 0) + 3);
      suggestedTagSet.add('Radshare');
    }
    if (/\b(galvanized|primed|archon|amalgam|riven|umbral)\b/i.test(q)) {
      categoryScores.set('mod', (categoryScores.get('mod') || 0) + 3);
      suggestedTagSet.add('Endo');
    }
    if (/\bincarnon\b/i.test(q)) {
      categoryScores.set('weapon', (categoryScores.get('weapon') || 0) + 2);
      suggestedTagSet.add('Incarnon');
    }
    if (/\b(helminth|subsume)\b/i.test(q)) {
      categoryScores.set('warframe', (categoryScores.get('warframe') || 0) + 2);
      suggestedTagSet.add('Helminth');
    }
    if (/\bfodder\b/i.test(q)) {
      categoryScores.set('fodder', (categoryScores.get('fodder') || 0) + 3);
    }

    const bestCategory = Array.from(categoryScores.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const filteredSuggestedTags = Array.from(suggestedTagSet)
      .filter((t) => !tags.some((selected) => selected.toLowerCase() === t.toLowerCase()))
      .slice(0, 5);

    const similarEntries = matchingItems.slice(0, 3);

    if (!bestCategory && filteredSuggestedTags.length === 0 && similarEntries.length === 0 && catalogMatches.length === 0) {
      return null;
    }

    return {
      bestCategory: bestCategory && bestCategory !== category ? bestCategory : null,
      suggestedTags: filteredSuggestedTags,
      similarEntries,
      catalogMatches,
    };
  }, [title, existingItems, tags, category, catalog]);

  const addTag = (raw) => {
    const clean = raw.trim().replace(/^#/, '');
    if (!clean) return;
    if (!tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setTags((prev) => [...prev, clean]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (
        predictedTags.length > 0 &&
        tagInput.trim() &&
        predictedTags[0].tag.toLowerCase().startsWith(tagInput.trim().replace(/^#/, '').toLowerCase())
      ) {
        addTag(predictedTags[0].tag);
      } else {
        addTag(tagInput);
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleCreateDefaultTag = () => {
    const clean = newDefaultTagInput.trim().replace(/^#/, '');
    if (!clean) return;
    onAddDefaultTag?.(clean);
    setNewDefaultTagInput('');
  };

  const applySimilarEntryTemplate = (entry) => {
    setTitle(entry.title);
    setCategory(entry.category);
    setCategoryTouched(true);
    setPriority(entry.priority || 'medium');
    if (entry.source && !source) setSource(entry.source);
    if (Array.isArray(entry.tags)) {
      setTags((prev) => {
        const merged = [...prev];
        entry.tags.forEach((t) => {
          if (!merged.some((m) => m.toLowerCase() === t.toLowerCase())) merged.push(t);
        });
        return merged;
      });
    }
    if (entry.category === 'relic') {
      if (entry.relicEra) setRelicEra(entry.relicEra);
      if (entry.relicRefinement) setRelicRefinement(entry.relicRefinement);
    }
  };

  const applyCatalogMatch = (entry) => {
    const autoFill = getCatalogAutoFill(entry);
    setTitle(autoFill.title);
    setCategory(autoFill.category);
    setCategoryTouched(true);

    if (autoFill.tags?.length) {
      setTags((previous) => {
        const merged = [...previous];
        autoFill.tags.forEach((tag) => {
          if (!merged.some((selected) => selected.toLowerCase() === tag.toLowerCase())) merged.push(tag);
        });
        return merged;
      });
    }
    if (autoFill.relicEra) setRelicEra(autoFill.relicEra);
    if (autoFill.modRankMax) setModRankMax(autoFill.modRankMax);
  };

  const addChecklistStep = () => {
    const text = newStep.trim();
    if (!text) return;
    setChecklist((prev) => [
      ...prev,
      { id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text, done: false },
    ]);
    setNewStep('');
  };

  const loadTemplate = () => {
    const template = CHECKLIST_TEMPLATES[category] || [];
    setChecklist(template.map((text, idx) => ({ id: `tpl-${Date.now()}-${idx}`, text, done: false })));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    const pendingTag = tagInput.trim().replace(/^#/, '');
    const finalTags =
      pendingTag && !tags.some((t) => t.toLowerCase() === pendingTag.toLowerCase())
        ? [...tags, pendingTag]
        : tags;
    const now = new Date().toISOString();

    onAddItem({
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: trimmedTitle,
      category,
      status,
      priority,
      tags: finalTags,
      notes: notes.trim(),
      source: source.trim(),
      checklist,
      ...(category === 'relic' ? { relicEra, relicRefinement, relicQty: Number(relicQty) || 1 } : {}),
      ...(category === 'mod' ? { modRankCurrent: Number(modRankCurrent) || 0, modRankMax: Number(modRankMax) || 10 } : {}),
      ...(category === 'fodder' ? { fodderRank: Number(fodderRank) || 0 } : {}),
      createdAt: now,
      updatedAt: now,
    });

    setTitle('');
    setCategoryTouched(false);
    setTags([]);
    setTagInput('');
    setNotes('');
    setSource('');
    setChecklist([]);
    setNewStep('');
    setExpanded(false);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#263144] bg-[#131822]/95 shadow-lg">
      <div className="p-3 sm:p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-2.5">
          <div className="flex-1 space-y-1.5">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quick add a frame, mod, relic, fodder weapon, or farm goal..."
              className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#d4af37] focus:outline-none"
            />

            {titlePredictions && (
              <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#263144]/90 bg-[#0b0e14]/90 px-2.5 py-1.5 text-[11px]">
                <span className="inline-flex items-center gap-1 text-slate-400 mr-0.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Suggestions:</span>
                </span>

                {titlePredictions.bestCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategory(titlePredictions.bestCategory);
                      setCategoryTouched(true);
                    }}
                    className="inline-flex items-center gap-1 rounded border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 text-cyan-300 hover:bg-cyan-500/25"
                  >
                    Set Category: {CATEGORIES.find((c) => c.id === titlePredictions.bestCategory)?.label}
                  </button>
                )}

                {titlePredictions.suggestedTags.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => addTag(st)}
                    className="rounded border border-[#d4af37]/40 bg-[#d4af37]/10 px-1.5 py-0.5 text-[#f5c451] hover:bg-[#d4af37]/20"
                  >
                    +#{st}
                  </button>
                ))}

                {titlePredictions.similarEntries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => applySimilarEntryTemplate(entry)}
                    title="Copy title, category, source & tags from existing item"
                    className="inline-flex items-center gap-1 rounded border border-[#263144] bg-[#131822] px-2 py-0.5 text-slate-300 hover:border-slate-500 hover:text-white"
                  >
                    <span className="truncate max-w-[180px]">{entry.title}</span>
                    <span className="text-[10px] text-slate-500">({CATEGORIES.find((c) => c.id === entry.category)?.label})</span>
                  </button>
                ))}

                {titlePredictions.catalogMatches.map((entry) => (
                  <button
                    key={entry.slug}
                    type="button"
                    onClick={() => applyCatalogMatch(entry)}
                    title="Use name and applicable fields from the bundled Warframe catalog"
                    className="inline-flex items-center gap-1 rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-cyan-200 hover:border-cyan-400/60 hover:bg-cyan-500/20"
                  >
                    <span className="truncate max-w-[180px]">{entry.name}</span>
                    <span className="text-[10px] text-slate-500">Catalog</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-start gap-2">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCategoryTouched(true);
              }}
              className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2.5 text-sm text-slate-200 focus:border-[#d4af37] focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <select
              value={status}
              style={{ colorScheme: 'dark' }}
              onChange={(e) => setStatus(e.target.value)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium bg-[#0b0e14] focus:border-[#d4af37] focus:outline-none ${
                STATUS_STYLES[status] || 'border-[#263144] text-slate-200'
              }`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0b0e14] text-slate-200">{s.label}</option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2.5 text-sm text-slate-200 focus:border-[#d4af37] focus:outline-none"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>{p.label} Priority</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setExpanded((p) => !p)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                expanded
                  ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-300'
                  : 'border-[#263144] bg-[#1a2130] text-slate-300 hover:border-slate-500 hover:text-white'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              <span className="hidden sm:inline">Checklist</span>
              {checklist.length > 0 && (
                <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.5 text-xs text-cyan-300">
                  {checklist.length}
                </span>
              )}
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#d4af37] px-4 py-2.5 text-sm font-semibold text-[#07090d] hover:bg-[#f5c451] disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Tag className="w-3.5 h-3.5 text-[#f5c451]" />
              <span>Tags:</span>
            </div>
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-md border border-[#d4af37]/40 bg-[#d4af37]/15 px-2 py-0.5 text-xs font-medium text-[#f5c451]"
              >
                #{t}
                <button type="button" onClick={() => setTags((p) => p.filter((x) => x !== t))}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <div className="relative">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type tag + Enter..."
                className="w-40 rounded-md border border-[#263144] bg-[#0b0e14]/80 px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {defaultTags
                .filter((st) => !tags.some((t) => t.toLowerCase() === st.toLowerCase()))
                .map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => addTag(st)}
                    className="rounded-md border border-[#263144] bg-[#0b0e14]/60 px-2 py-0.5 text-[11px] text-slate-400 hover:border-slate-500 hover:text-slate-200"
                  >
                    +{st}
                  </button>
                ))}
              <button
                type="button"
                onClick={() => setEditingDefaultTags((p) => !p)}
                title="Customize default quick-pick tags"
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] transition-colors ${
                  editingDefaultTags
                    ? 'border-[#d4af37]/60 bg-[#d4af37]/15 text-[#f5c451]'
                    : 'border-[#263144] bg-[#1a2130]/80 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{editingDefaultTags ? 'Done Editing Tags' : 'Edit Defaults'}</span>
              </button>
            </div>
          </div>

          {predictedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#263144]/90 bg-[#0b0e14]/90 px-2.5 py-1.5 text-[11px]">
              <span className="text-slate-400">Matching tags:</span>
              {predictedTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="inline-flex items-center gap-1 rounded border border-cyan-500/35 bg-cyan-500/10 px-2 py-0.5 text-cyan-300 hover:bg-cyan-500/20"
                >
                  <span>+#{tag}</span>
                  {count > 0 && <span className="text-[10px] text-cyan-400/70">({count})</span>}
                </button>
              ))}
            </div>
          )}

          {editingDefaultTags && (
            <div className="rounded-lg border border-[#d4af37]/35 bg-[#0b0e14]/90 p-2.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#f5c451]">
                  Default Quick-Pick Tags
                </span>
                <button
                  type="button"
                  onClick={onResetDefaultTags}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                >
                  Restore Built-in Defaults
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {defaultTags.map((dt) => (
                  <span
                    key={dt}
                    className="inline-flex items-center gap-1 rounded border border-[#263144] bg-[#131822] px-2 py-0.5 text-[11px] text-slate-200"
                  >
                    #{dt}
                    <button
                      type="button"
                      onClick={() => onRemoveDefaultTag?.(dt)}
                      title={`Remove ${dt} from defaults`}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {defaultTags.length === 0 && (
                  <span className="text-[11px] text-slate-500 italic">No default tags configured.</span>
                )}
              </div>
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  value={newDefaultTagInput}
                  onChange={(e) => setNewDefaultTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateDefaultTag();
                    }
                  }}
                  placeholder="New default tag..."
                  className="flex-1 rounded-md border border-[#263144] bg-[#131822] px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-[#d4af37] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateDefaultTag}
                  disabled={!newDefaultTagInput.trim()}
                  className="inline-flex items-center gap-1 rounded-md bg-[#d4af37] px-2.5 py-1 text-xs font-semibold text-[#07090d] hover:bg-[#f5c451] disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Default
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#263144] bg-[#0b0e14]/60 p-3 sm:p-4 space-y-4 rounded-b-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Sub-tasks / Parts Checklist
                </span>
                <button
                  type="button"
                  onClick={loadTemplate}
                  className="inline-flex items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Load {CATEGORIES.find((c) => c.id === category)?.label} Template
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addChecklistStep();
                    }
                  }}
                  placeholder="Add part or step..."
                  className="flex-1 rounded-lg border border-[#263144] bg-[#131822] px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addChecklistStep}
                  className="rounded-lg border border-[#263144] bg-[#1a2130] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-[#263144]"
                >
                  Add Step
                </button>
              </div>
              {checklist.length > 0 ? (
                <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {checklist.map((step) => (
                    <li
                      key={step.id}
                      className="flex items-center justify-between rounded-md border border-[#263144] bg-[#131822] px-2.5 py-1.5 text-xs text-slate-200"
                    >
                      <span>{step.text}</span>
                      <button type="button" onClick={() => setChecklist((p) => p.filter((s) => s.id !== step.id))} className="text-slate-500 hover:text-rose-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">No checklist steps yet. Add steps or load a template.</p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Drop Source / Location
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Lua Apollo Rot B/C, Arbiters of Hexis..."
                  className="w-full rounded-lg border border-[#263144] bg-[#131822] px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              {category === 'relic' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Era</label>
                    <select value={relicEra} onChange={(e) => setRelicEra(e.target.value)} className="w-full rounded-lg border border-[#263144] bg-[#131822] px-2 py-1.5 text-xs text-slate-200">
                      {RELIC_ERAS.map((era) => <option key={era} value={era}>{era}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Refinement</label>
                    <select value={relicRefinement} onChange={(e) => setRelicRefinement(e.target.value)} className="w-full rounded-lg border border-[#263144] bg-[#131822] px-2 py-1.5 text-xs text-slate-200">
                      {RELIC_REFINEMENTS.map((ref) => <option key={ref} value={ref}>{ref}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Qty Owned</label>
                    <input type="number" min="0" value={relicQty} onChange={(e) => setRelicQty(e.target.value)} className="w-full rounded-lg border border-[#263144] bg-[#131822] px-2 py-1.5 text-xs text-slate-200" />
                  </div>
                </div>
              )}

              {category === 'mod' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Current Rank</label>
                    <input type="number" min="0" max="10" value={modRankCurrent} onChange={(e) => setModRankCurrent(e.target.value)} className="w-full rounded-lg border border-[#263144] bg-[#131822] px-2.5 py-1.5 text-xs text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Target Max Rank</label>
                    <input type="number" min="1" max="10" value={modRankMax} onChange={(e) => setModRankMax(e.target.value)} className="w-full rounded-lg border border-[#263144] bg-[#131822] px-2.5 py-1.5 text-xs text-slate-200" />
                  </div>
                </div>
              )}

              {category === 'fodder' && (
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Current Gear Rank (0–40)</label>
                  <input type="number" min="0" max="40" value={fodderRank} onChange={(e) => setFodderRank(e.target.value)} className="w-full rounded-lg border border-[#263144] bg-[#131822] px-2.5 py-1.5 text-xs text-slate-200" />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional reminders..."
                  className="w-full rounded-lg border border-[#263144] bg-[#131822] px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

