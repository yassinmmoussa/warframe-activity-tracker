export const STORAGE_KEY = 'tenno_ledger_state_v1';

export const CATEGORIES = [
  { id: 'warframe', label: 'Warframe' },
  { id: 'weapon', label: 'Weapon' },
  { id: 'fodder', label: 'Mastery Fodder' },
  { id: 'mod', label: 'Mod' },
  { id: 'relic', label: 'Relic' },
  { id: 'activity', label: 'Activity / Note' },
];

export const STATUS_OPTIONS = [
  { id: 'want', label: 'Want' },
  { id: 'queued', label: 'Queued' },
  { id: 'farming', label: 'Farming' },
  { id: 'crafting', label: 'Crafting' },
  { id: 'leveling', label: 'Leveling' },
  { id: 'ready_to_sell', label: 'Ready to Sell' },
  { id: 'done', label: 'Completed' },
];

export const PRIORITY_OPTIONS = [
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

export const RELIC_ERAS = ['Lith', 'Meso', 'Neo', 'Axi', 'Requiem', 'Omnia'];
export const RELIC_REFINEMENTS = ['Intact', 'Exceptional', 'Flawless', 'Radiant'];

export const SUGGESTED_TAGS = [
  'Prime',
  'SteelPath',
  'Helminth',
  'Endo',
  'Plat',
  'Radshare',
  'Incarnon',
  'Forma',
  'Duviri',
  '1999',
];

export const CHECKLIST_TEMPLATES = {
  warframe: ['Blueprint', 'Neuroptics', 'Chassis', 'Systems', 'Build & Level to 30'],
  weapon: ['Blueprint', 'Component 1', 'Component 2', 'Craft in Foundry'],
  fodder: ['Acquire / Craft', 'Claim from Foundry', 'Level to 30 (SO/Hydron)', 'Sell for Slot'],
  mod: ['Acquire Mod', 'Farm Endo & Credits', 'Rank to Target'],
  relic: ['Farm Relic', 'Refine (Void Traces)', 'Run Fissure / Radshare'],
  activity: ['Step 1', 'Step 2'],
};

export const DEFAULT_DAILY_TASKS = [
  { id: 'daily-login', title: 'Daily Tribute (Login Reward)', group: 'Core', cadence: 'daily', note: 'Resets 00:00 UTC' },
  { id: 'daily-forma', title: 'Foundry: Claim & Start Forma', group: 'Core', cadence: 'daily', note: '23h build cycle' },
  { id: 'daily-sortie', title: 'Daily Sortie (3 Missions)', group: 'Missions', cadence: 'daily', note: 'Rivens, Kuva, Endo, Boosters' },
  { id: 'daily-sp-incursions', title: 'Steel Path Incursions (5 Alerts)', group: 'Missions', cadence: 'daily', note: '+5 Steel Essence each + Acolytes' },
  { id: 'daily-focus', title: 'Daily Focus Cap', group: 'Standing & Caps', cadence: 'daily', note: 'ESO, Eidolons, or Duviri Circuit' },
  { id: 'daily-orbiter-syndicate', title: 'Pledged Syndicate Standing Cap', group: 'Standing & Caps', cadence: 'daily', note: 'Relic packs & Augment mods' },
  { id: 'daily-openworld-standing', title: 'Hub / Open-World Standing (Cetus, Fortuna, Deimos)', group: 'Standing & Caps', cadence: 'daily', note: 'Ostron, Quills, Solaris, Vox, Entrati' },
  { id: 'daily-endgame-standing', title: 'Zariman / Cavia / The Hex (1999) Standing', group: 'Standing & Caps', cadence: 'daily', note: 'Bounties & turn-ins' },
  { id: 'daily-vendors', title: 'Daily Vendor Trades (Yonta Voidplumes, Loid Voca, Grandmother)', group: 'Vendors', cadence: 'daily', note: 'Resource-to-standing conversions' },
  { id: 'daily-nightwave', title: 'Nightwave Daily Act', group: 'Missions', cadence: 'daily', note: '1,000 NW Standing (stacks up to 3 days)' },
  { id: 'daily-simaris', title: 'Cephalon Simaris Synthesis Target', group: 'Standing & Caps', cadence: 'daily', note: 'Extra Simaris standing for mods/widgets' },
];

export const DEFAULT_WEEKLY_TASKS = [
  { id: 'weekly-archon', title: 'Archon Hunt', group: 'Shards & Endgame', cadence: 'weekly', note: 'Guaranteed Archon Shard (Tauforged chance)' },
  { id: 'weekly-netracells', title: 'Netracells (5 Weekly Search Pulses)', group: 'Shards & Endgame', cadence: 'weekly', note: 'Sanctum Anatomica — Shards & Melee Arcanes' },
  { id: 'weekly-eda', title: 'Deep Archimedea / Elite Deep Archimedea', group: 'Shards & Endgame', cadence: 'weekly', note: 'Uses 2 Search Pulses — Vosfor, Shards, Arcanes' },
  { id: 'weekly-eta', title: 'Temporal Archimedea / Elite Temporal Archimedea', group: 'Shards & Endgame', cadence: 'weekly', note: '1999 endgame — Shards, Arcanes & Stickers' },
  { id: 'weekly-1999-calendar', title: '1999 POM-2 Calendar Tasks', group: 'Shards & Endgame', cadence: 'weekly', note: 'Shards, Arcanes, Exilus, Rivens' },
  { id: 'weekly-bird3', title: 'Bird 3: Weekly Archon Shard', group: 'Vendors', cadence: 'weekly', note: 'Requires Rank 5 Cavia (30,000 Standing)' },
  { id: 'weekly-circuit-normal', title: 'Duviri Circuit (Normal) — Weekly Warframe', group: 'Duviri', cadence: 'weekly', note: 'Tier 10 reward path + Augments' },
  { id: 'weekly-circuit-sp', title: 'Duviri Circuit (Steel Path) — Incarnon Adapters', group: 'Duviri', cadence: 'weekly', note: 'Pick 2 Incarnon Genesis adapters' },
  { id: 'weekly-acrithis', title: 'Acrithis Weekly Wares (Duviri)', group: 'Vendors', cadence: 'weekly', note: 'Catalysts, Reactors, Rivens, Arcanes for Clamps' },
  { id: 'weekly-teshin', title: 'Teshin Steel Path Honors', group: 'Vendors', cadence: 'weekly', note: 'Check rotating Umbra Forma / Kuva / Riven' },
  { id: 'weekly-palladino', title: 'Iron Wake: Palladino (2 Rivens & Kuva)', group: 'Vendors', cadence: 'weekly', note: 'Trade Riven Slivers for Rivens, Kuva & Credits' },
  { id: 'weekly-yonta-kuva', title: 'Archimedian Yonta: 35,000 Kuva', group: 'Vendors', cadence: 'weekly', note: 'Trade Voidplume Pinions (Zariman)' },
  { id: 'weekly-kahl', title: "Kahl's Garrison: Break Narmer", group: 'Missions', cadence: 'weekly', note: 'Stock for Archon Mods & Styanax parts' },
  { id: 'weekly-maroo', title: "Maroo's Ayatan Treasure Hunt", group: 'Missions', cadence: 'weekly', note: 'Weekly Ayatan Sculpture for Endo' },
  { id: 'weekly-clem', title: 'Help Clem (Relay Survival)', group: 'Missions', cadence: 'weekly', note: 'Clem Clone Blueprint' },
  { id: 'weekly-nightwave', title: 'Nightwave Weekly & Elite Weekly Acts', group: 'Missions', cadence: 'weekly', note: '4,500 & 7,000 NW Standing each' },
  { id: 'weekly-descendia', title: 'The Descendia (Normal & Steel Path)', group: 'Shards & Endgame', cadence: 'weekly', note: 'Full tower descent rewards' },
  { id: 'weekly-glast-eleanor', title: 'Eleanor & Ergo Glast Rotating Stock', group: 'Vendors', cadence: 'weekly', note: 'Check high-% Coda & Tenet weapon rolls' },
  { id: 'biweekly-baro', title: "Baro Ki'Teer (Void Trader)", group: 'Bi-Weekly', cadence: 'biweekly', note: 'Arrives every other Friday 13:00 UTC' },
];

export const SAMPLE_ITEMS = [
  {
    id: 'item-gauss-prime',
    title: 'Gauss Prime',
    category: 'warframe',
    status: 'farming',
    priority: 'high',
    tags: ['Prime', 'Radshare'],
    notes: 'Missing Systems only — run Axi G12 radshares in recruit chat.',
    source: 'Lith G9 / Meso G7 / Neo G6 / Axi G12',
    checklist: [
      { id: 'c1', text: 'Blueprint', done: true },
      { id: 'c2', text: 'Neuroptics', done: true },
      { id: 'c3', text: 'Chassis', done: true },
      { id: 'c4', text: 'Systems', done: false },
      { id: 'c5', text: 'Build & Level to 30', done: false },
    ],
    createdAt: '2026-11-18T14:00:00.000Z',
    updatedAt: '2026-11-20T18:10:00.000Z',
  },
  {
    id: 'item-sevagoth-subsume',
    title: 'Sevagoth (2nd Copy for Helminth)',
    category: 'warframe',
    status: 'crafting',
    priority: 'medium',
    tags: ['Helminth'],
    notes: 'Parts finished from Void Storms; crafting chassis & systems now.',
    source: 'Veil / Pluto / Neptune Void Storms',
    checklist: [
      { id: 'c1', text: 'Blueprint (Call of the Tempestarii / Simaris)', done: true },
      { id: 'c2', text: 'Neuroptics', done: true },
      { id: 'c3', text: 'Chassis', done: true },
      { id: 'c4', text: 'Systems', done: true },
      { id: 'c5', text: 'Subsume Gloom in Helminth', done: false },
    ],
    createdAt: '2026-11-15T10:00:00.000Z',
    updatedAt: '2026-11-19T22:30:00.000Z',
  },
  {
    id: 'item-fodder-kronen',
    title: 'Kronen',
    category: 'fodder',
    status: 'ready_to_sell',
    priority: 'high',
    tags: ['Forma'],
    notes: 'Hit Rank 30 in Sanctuary Onslaught. Safe to sell for weapon slot.',
    source: 'Market Blueprint',
    fodderRank: 30,
    checklist: [
      { id: 'c1', text: 'Craft in Foundry', done: true },
      { id: 'c2', text: 'Level to 30', done: true },
      { id: 'c3', text: 'Sell for Weapon Slot', done: false },
    ],
    createdAt: '2026-11-17T09:00:00.000Z',
    updatedAt: '2026-11-20T12:00:00.000Z',
  },
  {
    id: 'item-fodder-zakti',
    title: 'Zakti',
    category: 'fodder',
    status: 'leveling',
    priority: 'medium',
    tags: ['Duviri'],
    notes: 'Currently Rank 18 — finish leveling on Hydron or ESO.',
    source: 'Dojo Tenno Lab',
    fodderRank: 18,
    checklist: [
      { id: 'c1', text: 'Craft in Foundry', done: true },
      { id: 'c2', text: 'Level to 30', done: false },
      { id: 'c3', text: 'Sell for Weapon Slot', done: false },
    ],
    createdAt: '2026-11-19T11:00:00.000Z',
    updatedAt: '2026-11-20T15:00:00.000Z',
  },
  {
    id: 'item-mod-galvanized-chamber',
    title: 'Galvanized Chamber',
    category: 'mod',
    status: 'leveling',
    priority: 'high',
    tags: ['SteelPath', 'Endo'],
    notes: 'Need ~15k more Endo to finish R9 -> R10.',
    source: 'Arbiters of Hexis (20 Vitus Essence)',
    modRankCurrent: 8,
    modRankMax: 10,
    checklist: [
      { id: 'c1', text: 'Buy from Arbitration Vendor', done: true },
      { id: 'c2', text: 'Farm Endo (Rathuum / Bounties / Ayatans)', done: false },
      { id: 'c3', text: 'Rank to 10/10', done: false },
    ],
    createdAt: '2026-11-16T08:00:00.000Z',
    updatedAt: '2026-11-20T11:00:00.000Z',
  },
  {
    id: 'item-relic-axi-g12',
    title: 'Axi G12 (Gauss Prime Systems)',
    category: 'relic',
    status: 'farming',
    priority: 'high',
    tags: ['Prime', 'Radshare'],
    notes: 'Have 4 intact relics; need 400 Void Traces to make all Radiant.',
    source: 'Lua Apollo Disruption (Rot B/C)',
    relicEra: 'Axi',
    relicRefinement: 'Exceptional',
    relicQty: 4,
    checklist: [
      { id: 'c1', text: 'Farm 4x Axi G12 on Apollo', done: true },
      { id: 'c2', text: 'Refine to Radiant (400 Traces)', done: false },
      { id: 'c3', text: 'Run 4-man Radshare', done: false },
    ],
    createdAt: '2026-11-18T16:00:00.000Z',
    updatedAt: '2026-11-20T19:00:00.000Z',
  },
  {
    id: 'item-weapon-torid',
    title: 'Torid (Incarnon Prep)',
    category: 'weapon',
    status: 'queued',
    priority: 'high',
    tags: ['Incarnon', 'SteelPath', 'Forma'],
    notes: 'Craft base Torid from Bio Lab before next Steel Path Circuit rotation.',
    source: 'Dojo Bio Lab + SP Duviri Circuit',
    checklist: [
      { id: 'c1', text: 'Replicate Blueprint from Bio Lab', done: true },
      { id: 'c2', text: 'Craft Torid (24h)', done: false },
      { id: 'c3', text: 'Install Incarnon Adapter & 5 Forma', done: false },
    ],
    createdAt: '2026-11-19T14:00:00.000Z',
    updatedAt: '2026-11-20T09:00:00.000Z',
  },
];

export const CATEGORY_BADGES = {
  warframe: 'border-amber-400/50 bg-amber-500/20 text-amber-200',
  weapon: 'border-sky-400/50 bg-sky-500/20 text-sky-200',
  fodder: 'border-pink-500/50 bg-pink-500/20 text-pink-200',
  mod: 'border-fuchsia-500/50 bg-fuchsia-500/20 text-fuchsia-200',
  relic: 'border-teal-400/50 bg-teal-500/20 text-teal-200',
  activity: 'border-orange-500/45 bg-orange-500/15 text-orange-200',
};

export const STATUS_STYLES = {
  want: 'border-fuchsia-400/50 bg-fuchsia-500/20 text-fuchsia-200',
  queued: 'border-indigo-400/50 bg-indigo-500/20 text-indigo-200',
  farming: 'border-cyan-400/50 bg-cyan-500/20 text-cyan-200',
  crafting: 'border-amber-400/50 bg-amber-500/20 text-amber-200',
  leveling: 'border-violet-400/50 bg-violet-500/20 text-violet-200',
  ready_to_sell: 'border-rose-400/50 bg-rose-500/20 text-rose-200',
  done: 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200',
};

export const PRIORITY_DOT = {
  high: 'bg-rose-400',
  medium: 'bg-amber-400',
  low: 'bg-slate-400',
};


