import { describe, expect, it } from 'vitest';
import { getCatalogAutoFill, searchWarframeCatalog } from './warframeCatalogSearch.js';
import catalog from './warframeCatalog.json';

describe('Warframe catalog search', () => {
  it('returns exact matches first', () => {
    const matches = searchWarframeCatalog(catalog, 'Galvanized Chamber', 5);
    expect(matches[0].name).toBe('Galvanized Chamber');
  });

  it('supports prefix and partial name searches', () => {
    expect(searchWarframeCatalog(catalog, 'gauss', 20).some((entry) => entry.name.includes('Gauss'))).toBe(true);
    expect(searchWarframeCatalog(catalog, 'axi g12', 20).some((entry) => entry.name === 'Axi G12 Relic')).toBe(true);
  });

  it('auto-fills relevant fields for relics and mods', () => {
    const relic = searchWarframeCatalog(catalog, 'Axi G12 Relic', 1)[0];
    expect(getCatalogAutoFill(relic)).toEqual({
      title: 'Axi G12 Relic',
      category: 'relic',
      tags: ['Radshare'],
      relicEra: 'Axi',
    });

    const mod = searchWarframeCatalog(catalog, 'Galvanized Chamber', 1)[0];
    expect(getCatalogAutoFill(mod)).toEqual({
      title: 'Galvanized Chamber',
      category: 'mod',
      tags: ['Endo'],
      modRankMax: 10,
    });
  });
});
