import { describe, expect, it } from 'vitest';
import { createInitialState, normalizeState } from './resetStorage.js';

describe('reset storage state', () => {
  it('creates a sample or empty initial state', () => {
    expect(createInitialState(true).items.length).toBeGreaterThan(0);
    expect(createInitialState(false).items).toEqual([]);
  });

  it('normalizes missing or invalid imports', () => {
    expect(normalizeState(null).items.length).toBeGreaterThan(0);
    expect(normalizeState({ items: 'invalid', resets: null }).items).toEqual([]);
  });

  it('preserves valid imported items and reset lists', () => {
    const daily = [{ id: 'custom', title: 'Check', done: true, hidden: false, custom: true }];
    const weekly = [{ id: 'weekly', title: 'Weekly', done: false, hidden: true, custom: false }];
    const normalized = normalizeState({
      items: [{ id: 'item', title: 'Gauss' }],
      defaultTags: ['Prime'],
      resets: { daily, weekly, lastDailyReset: '2026-11-21', lastWeeklyReset: '2026-11-16' },
    });
    expect(normalized.items).toEqual([{ id: 'item', title: 'Gauss' }]);
    expect(normalized.defaultTags).toEqual(['Prime']);
    expect(normalized.resets.daily).toEqual(daily);
    expect(normalized.resets.weekly).toEqual(weekly);
  });
});
