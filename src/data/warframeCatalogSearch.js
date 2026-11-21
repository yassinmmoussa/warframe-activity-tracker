export function searchWarframeCatalog(catalog, query, limit = 8) {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) return [];

  return catalog
    .map((entry) => {
      const name = entry.name.toLowerCase();
      const slug = entry.slug.toLowerCase();
      let score = 0;

      if (name === normalized) score = 100;
      else if (name.startsWith(normalized)) score = 80;
      else if (slug.startsWith(normalized.replace(/\s+/g, '_'))) score = 70;
      else if (name.includes(normalized)) score = 50;
      else if (entry.tags.some((tag) => tag.toLowerCase().includes(normalized))) score = 20;

      return score ? { entry, score } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, limit)
    .map(({ entry }) => entry);
}

export function getCatalogAutoFill(entry) {
  const autoFill = {
    title: entry.name,
    category: entry.category,
  };

  if (entry.tags?.length) autoFill.tags = [...entry.tags];
  if (entry.category === 'relic' && entry.era) autoFill.relicEra = entry.era;
  if (entry.category === 'mod' && Number.isInteger(entry.maxRank)) autoFill.modRankMax = entry.maxRank;

  return autoFill;
}

let catalogPromise = null;

export function loadWarframeCatalog() {
  if (!catalogPromise) {
    catalogPromise = import('./warframeCatalog.json').then((module) => module.default);
  }
  return catalogPromise;
}
