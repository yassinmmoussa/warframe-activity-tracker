import fs from 'node:fs/promises';

const API_URL = 'https://api.warframe.market/v2/items';
const OUTPUT_PATH = new URL('../src/data/warframeCatalog.json', import.meta.url);

const RELIC_ERAS = new Set(['lith', 'meso', 'neo', 'axi', 'requiem', 'omnia']);

function getCategory(item) {
  const tags = item.tags || [];
  if (tags.includes('relic')) return 'relic';
  if (tags.includes('mod')) return 'mod';
  if (tags.includes('warframe')) return 'warframe';
  if (tags.includes('weapon')) return 'weapon';
  return null;
}

function getRelevantTags(item, category) {
  const tags = item.tags || [];
  const name = item.i18n?.en?.name || '';
  const relevant = [];

  if (tags.includes('prime') || /\bprime\b/i.test(name)) relevant.push('Prime');
  if (category === 'relic') relevant.push('Radshare');
  if (/\b(incarnon|incarnon adapter)\b/i.test(name)) relevant.push('Incarnon');
  if (category === 'mod' && /\b(galvanized|primed|archon|umbral|amalgam)\b/i.test(name)) relevant.push('Endo');

  return relevant;
}

const response = await fetch(API_URL, {
  headers: {
    Accept: 'application/json',
    'User-Agent': 'tenno-ledger-catalog-generator/1.0',
  },
});

if (!response.ok) {
  throw new Error(`Warframe.market request failed: ${response.status} ${response.statusText}`);
}

const payload = await response.json();
if (!payload?.data || !Array.isArray(payload.data)) {
  throw new Error('Warframe.market returned an unexpected response');
}

const catalog = payload.data
  .map((item) => {
    const name = item.i18n?.en?.name?.trim();
    if (!name || typeof item.slug !== 'string') return null;

    const category = getCategory(item);
    if (!category) return null;

    const tags = item.tags || [];
    const era = category === 'relic'
      ? [...tags].find((tag) => RELIC_ERAS.has(tag)) || null
      : null;

    const record = {
      name,
      slug: item.slug,
      category,
      tags: getRelevantTags(item, category),
    };

    if (era) record.era = era[0].toUpperCase() + era.slice(1);
    if (category === 'mod' && Number.isInteger(item.maxRank)) record.maxRank = item.maxRank;

    return record;
  })
  .filter(Boolean)
  .sort((a, b) => a.name.localeCompare(b.name));

await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(catalog)}\n`);
console.log(`Generated ${catalog.length} catalog entries at ${OUTPUT_PATH.pathname}`);
