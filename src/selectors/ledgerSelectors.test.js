import { describe, expect, it } from 'vitest';
import {
  filterArsenalItems,
  filterJournalItems,
  filterModsRelicsItems,
  filterResetTasks,
  getAllTags,
  getDashboardData,
  getResetProgress,
} from './ledgerSelectors.js';

describe('ledger selectors', () => {
  it('calculates visible reset progress', () => {
    const tasks = [
      { id: 'a', done: true, hidden: false },
      { id: 'b', done: false, hidden: false },
      { id: 'c', done: true, hidden: true },
    ];
    expect(getResetProgress(tasks)).toEqual({ visible: [tasks[0], tasks[1]], done: 1 });
  });

  it('builds dashboard category and reset summaries', () => {
    const items = [
      { id: '1', status: 'farming', category: 'warframe' },
      { id: '2', status: 'done', category: 'weapon' },
      { id: '3', status: 'leveling', category: 'fodder' },
      { id: '4', status: 'want', category: 'mod' },
      { id: '5', status: 'farming', category: 'relic' },
    ];
    const resets = { daily: [{ done: true, hidden: false }], weekly: [{ done: false, hidden: false }] };
    const dashboard = getDashboardData(items, resets);
    expect(dashboard.activeFarms).toHaveLength(1);
    expect(dashboard.fodderItems).toHaveLength(1);
    expect(dashboard.modsAndRelics).toHaveLength(2);
  });

  it('returns sorted unique tags', () => {
    expect(getAllTags([
      { tags: ['Prime', 'Endo'] },
      { tags: ['Endo', 'Forma'] },
    ])).toEqual(['Endo', 'Forma', 'Prime']);
  });

  it('filters and sorts journal items', () => {
    const items = [
      { id: '1', title: 'Gauss Prime', category: 'warframe', status: 'farming', priority: 'high', tags: ['Prime'], updatedAt: '2026-11-20T00:00:00Z' },
      { id: '2', title: 'Zakti', category: 'fodder', status: 'leveling', priority: 'medium', tags: ['Duviri'], updatedAt: '2026-11-21T00:00:00Z' },
    ];
    expect(filterJournalItems(items, { search: 'gauss' }).map((item) => item.id)).toEqual(['1']);
    expect(filterJournalItems(items, { category: 'fodder', status: 'leveling' }).map((item) => item.id)).toEqual(['2']);
    expect(filterJournalItems(items, { sort: 'alpha' }).map((item) => item.title)).toEqual(['Gauss Prime', 'Zakti']);
  });

  it('filters reset tasks by completion and hidden state', () => {
    const tasks = [
      { id: '1', done: true, hidden: false },
      { id: '2', done: false, hidden: false },
      { id: '3', done: false, hidden: true },
    ];
    expect(filterResetTasks(tasks, { filter: 'incomplete' }).map((task) => task.id)).toEqual(['2']);
    expect(filterResetTasks(tasks, { filter: 'completed', showHidden: true }).map((task) => task.id)).toEqual(['1']);
  });

  it('filters arsenal and mods/relic items', () => {
    const items = [
      { id: '1', category: 'warframe', status: 'farming' },
      { id: '2', category: 'fodder', status: 'done' },
      { id: '3', category: 'relic', status: 'farming', relicEra: 'Axi' },
      { id: '4', category: 'mod', status: 'leveling' },
    ];
    expect(filterArsenalItems(items, 'all', true).map((item) => item.id)).toEqual(['1']);
    expect(filterModsRelicsItems(items, 'relic', 'Axi').map((item) => item.id)).toEqual(['3']);
  });
});
