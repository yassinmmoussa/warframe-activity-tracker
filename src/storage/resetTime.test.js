import { describe, expect, it } from 'vitest';
import { getMondayUtcKey, getResetCountdowns } from './resetTime.js';

describe('reset time utilities', () => {
  it('returns Monday UTC keys across Sunday and Monday', () => {
    expect(getMondayUtcKey(new Date('2026-11-22T12:00:00Z'))).toBe('2026-11-16');
    expect(getMondayUtcKey(new Date('2026-11-23T12:00:00Z'))).toBe('2026-11-23');
  });

  it('calculates countdowns at a UTC boundary', () => {
    const result = getResetCountdowns(new Date('2026-11-21T23:30:00Z'));
    expect(result.dailyText).toBe('0h 30m');
    expect(result.weeklyText).toBe('1d 0h 30m');
    expect(result.utcTodayKey).toBe('2026-11-21');
  });
});
