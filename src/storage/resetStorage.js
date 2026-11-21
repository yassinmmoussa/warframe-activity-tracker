import { STORAGE_KEY, SUGGESTED_TAGS } from '../data/options.js';
import { SAMPLE_ITEMS } from '../data/sampleItems.js';
import { DEFAULT_DAILY_TASKS, DEFAULT_WEEKLY_TASKS } from '../data/resetTasks.js';
import { getMondayUtcKey } from './resetTime.js';

export function createInitialState(withSamples = true) {
  return {
    version: 1,
    items: withSamples ? SAMPLE_ITEMS : [],
    defaultTags: [...SUGGESTED_TAGS],
    resets: {
      daily: DEFAULT_DAILY_TASKS.map((task) => ({ ...task, done: false, hidden: false, custom: false })),
      weekly: DEFAULT_WEEKLY_TASKS.map((task) => ({ ...task, done: false, hidden: false, custom: false })),
      lastDailyReset: new Date().toISOString().slice(0, 10),
      lastWeeklyReset: getMondayUtcKey(new Date()),
    },
  };
}

export function normalizeState(parsed) {
  if (!parsed || typeof parsed !== 'object') return createInitialState(true);

  const base = createInitialState(false);
  return {
    version: 1,
    items: Array.isArray(parsed.items) ? parsed.items : [],
    defaultTags: Array.isArray(parsed.defaultTags) ? parsed.defaultTags : [...SUGGESTED_TAGS],
    resets: {
      daily: Array.isArray(parsed.resets?.daily) && parsed.resets.daily.length > 0
        ? parsed.resets.daily
        : base.resets.daily,
      weekly: Array.isArray(parsed.resets?.weekly) && parsed.resets.weekly.length > 0
        ? parsed.resets.weekly
        : base.resets.weekly,
      lastDailyReset: parsed.resets?.lastDailyReset || base.resets.lastDailyReset,
      lastWeeklyReset: parsed.resets?.lastWeeklyReset || base.resets.lastWeeklyReset,
    },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState(true);
    return normalizeState(JSON.parse(raw));
  } catch {
    return createInitialState(true);
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage restrictions
  }
}

export function clearStoredState() {
  localStorage.removeItem(STORAGE_KEY);
}
