import { STORAGE_KEY, SUGGESTED_TAGS } from './data/options.js';
import { SAMPLE_ITEMS } from './data/sampleItems.js';
import { DEFAULT_DAILY_TASKS, DEFAULT_WEEKLY_TASKS } from './data/resetTasks.js';

export function getMondayUtcKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function createInitialState(withSamples = true) {
  return {
    version: 1,
    items: withSamples ? SAMPLE_ITEMS : [],
    defaultTags: [...SUGGESTED_TAGS],
    resets: {
      daily: DEFAULT_DAILY_TASKS.map((t) => ({ ...t, done: false, hidden: false, custom: false })),
      weekly: DEFAULT_WEEKLY_TASKS.map((t) => ({ ...t, done: false, hidden: false, custom: false })),
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
      daily: Array.isArray(parsed.resets?.daily) && parsed.resets.daily.length > 0 ? parsed.resets.daily : base.resets.daily,
      weekly: Array.isArray(parsed.resets?.weekly) && parsed.resets.weekly.length > 0 ? parsed.resets.weekly : base.resets.weekly,
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

export function getResetCountdowns() {
  const now = new Date();
  const nextDaily = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const dailyMs = nextDaily - now;
  const day = now.getUTCDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const nextWeekly = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday, 0, 0, 0));
  const weeklyMs = nextWeekly - now;

  const fmt = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`;
  };

  return {
    dailyText: fmt(dailyMs),
    weeklyText: fmt(weeklyMs),
    utcTodayKey: now.toISOString().slice(0, 10),
    utcMondayKey: getMondayUtcKey(now),
  };
}

