import { useEffect, useRef, useState } from 'react';
import { SUGGESTED_TAGS } from '../data/options.js';
import { SAMPLE_ITEMS } from '../data/sampleItems.js';
import {
  clearStoredState,
  createInitialState,
  loadState,
  normalizeState,
  saveState,
} from '../storage/resetStorage.js';
import { getResetCountdowns } from '../storage/resetTime.js';

export function useLedger() {
  const [state, setState] = useState(() => loadState());
  const [countdowns, setCountdowns] = useState(() => getResetCountdowns());
  const [toast, setToast] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isFirstRender = useRef(true);
  const toastTimeoutRef = useRef(null);

  const notify = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
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
      const countdown = getResetCountdowns();
      setCountdowns(countdown);
      setState((previous) => {
        let changed = false;
        const nextResets = { ...previous.resets };

        if (previous.resets.lastDailyReset !== countdown.utcTodayKey) {
          nextResets.daily = previous.resets.daily.map((task) => ({ ...task, done: false }));
          nextResets.lastDailyReset = countdown.utcTodayKey;
          changed = true;
        }

        if (previous.resets.lastWeeklyReset !== countdown.utcMondayKey) {
          nextResets.weekly = previous.resets.weekly.map((task) => ({ ...task, done: false }));
          nextResets.lastWeeklyReset = countdown.utcMondayKey;
          changed = true;
        }

        return changed ? { ...previous, resets: nextResets } : previous;
      });
    };

    checkResets();
    const timer = setInterval(checkResets, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleAddItem = (newItem) => {
    setState((previous) => ({ ...previous, items: [newItem, ...previous.items] }));
    notify(`Added "${newItem.title}"`);
  };

  const handleUpdateItem = (id, patch) => {
    setState((previous) => ({
      ...previous,
      items: previous.items.map((item) =>
        item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item
      ),
    }));
  };

  const handleDeleteItem = (id) => {
    setState((previous) => ({
      ...previous,
      items: previous.items.filter((item) => item.id !== id),
    }));
    notify('Item removed');
  };

  const handleAddDefaultTag = (tag) => {
    const clean = tag.trim().replace(/^#/, '');
    if (!clean) return;
    setState((previous) => {
      const existing = previous.defaultTags || [];
      if (existing.some((existingTag) => existingTag.toLowerCase() === clean.toLowerCase())) return previous;
      return { ...previous, defaultTags: [...existing, clean] };
    });
    notify(`Added #${clean} to default tags`);
  };

  const handleRemoveDefaultTag = (tag) => {
    setState((previous) => ({
      ...previous,
      defaultTags: (previous.defaultTags || []).filter((existingTag) => existingTag !== tag),
    }));
  };

  const handleResetDefaultTags = () => {
    setState((previous) => ({ ...previous, defaultTags: [...SUGGESTED_TAGS] }));
    notify('Restored built-in default tags');
  };

  const handleToggleResetTask = (cadence, taskId) => {
    setState((previous) => ({
      ...previous,
      resets: {
        ...previous.resets,
        [cadence]: previous.resets[cadence].map((task) =>
          task.id === taskId ? { ...task, done: !task.done } : task
        ),
      },
    }));
  };

  const handleToggleResetTaskVisibility = (cadence, taskId) => {
    setState((previous) => ({
      ...previous,
      resets: {
        ...previous.resets,
        [cadence]: previous.resets[cadence].map((task) =>
          task.id === taskId ? { ...task, hidden: !task.hidden } : task
        ),
      },
    }));
  };

  const handleDeleteResetTask = (cadence, taskId) => {
    setState((previous) => ({
      ...previous,
      resets: {
        ...previous.resets,
        [cadence]: previous.resets[cadence].filter((task) => task.id !== taskId),
      },
    }));
    notify('Deleted custom reset task');
  };

  const handleAddResetTask = (cadence, title, note) => {
    setState((previous) => ({
      ...previous,
      resets: {
        ...previous.resets,
        [cadence]: [
          ...previous.resets[cadence],
          {
            id: `custom-${Date.now()}`,
            title: title.trim(),
            group: 'Custom',
            cadence,
            note: note.trim(),
            done: false,
            hidden: false,
            custom: true,
          },
        ],
      },
    }));
    notify('Added custom reset task');
  };

  const handleResetCadence = (cadence) => {
    setState((previous) => ({
      ...previous,
      resets: {
        ...previous.resets,
        [cadence]: previous.resets[cadence].map((task) => ({ ...task, done: false })),
      },
    }));
    notify(`Unchecked all ${cadence} tasks`);
  };

  const handleExportJson = () => {
    const payload = { app: 'Tenno Ledger', exportedAt: new Date().toISOString(), ...state };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `tenno-ledger-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setHasUnsavedChanges(false);
    notify('Exported JSON backup');
  };

  const handleImportJson = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const normalized = normalizeState(JSON.parse(loadEvent.target.result));
        setState(normalized);
        setTimeout(() => setHasUnsavedChanges(false), 0);
        notify(`Imported ${normalized.items.length} items from JSON backup`);
      } catch {
        notify('Invalid JSON backup file', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClearItems = () => {
    setState((previous) => ({ ...previous, items: [] }));
    notify('Cleared all items (kept reset checklists & default tags)');
  };

  const handleLoadSamples = () => {
    setState((previous) => ({ ...previous, items: SAMPLE_ITEMS }));
    notify('Loaded sample items (kept reset checklists & default tags)');
  };

  const handleFullWipe = () => {
    clearStoredState();
    setState(createInitialState(false));
    setTimeout(() => setHasUnsavedChanges(false), 0);
    notify('Completed full fresh wipe');
  };

  return {
    state,
    countdowns,
    toast,
    hasUnsavedChanges,
    notify,
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
  };
}
