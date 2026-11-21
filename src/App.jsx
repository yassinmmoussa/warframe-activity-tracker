import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LayoutDashboard,
  CalendarClock,
  Swords,
  Gem,
  BookOpen,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Tag,
  ListChecks,
  Sparkles,
  X,
  Trash2,
  Pencil,
  Check,
  CheckSquare,
  Square,
  MapPin,
  Minus,
  Clock,
  Circle,
  ArrowRight,
  Flame,
  Shield,
  Eye,
  EyeOff,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

const STORAGE_KEY = 'tenno_ledger_state_v1';

const CATEGORIES = [
  { id: 'warframe', label: 'Warframe' },
  { id: 'weapon', label: 'Weapon' },
  { id: 'fodder', label: 'Mastery Fodder' },
  { id: 'mod', label: 'Mod' },
  { id: 'relic', label: 'Relic' },
  { id: 'activity', label: 'Activity / Note' },
];

const STATUS_OPTIONS = [
  { id: 'want', label: 'Want' },
  { id: 'queued', label: 'Queued' },
  { id: 'farming', label: 'Farming' },
  { id: 'crafting', label: 'Crafting' },
  { id: 'leveling', label: 'Leveling' },
  { id: 'ready_to_sell', label: 'Ready to Sell' },
  { id: 'done', label: 'Completed' },
];

const PRIORITY_OPTIONS = [
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

const RELIC_ERAS = ['Lith', 'Meso', 'Neo', 'Axi', 'Requiem', 'Omnia'];
const RELIC_REFINEMENTS = ['Intact', 'Exceptional', 'Flawless', 'Radiant'];

const SUGGESTED_TAGS = [
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

const CHECKLIST_TEMPLATES = {
  warframe: ['Blueprint', 'Neuroptics', 'Chassis', 'Systems', 'Build & Level to 30'],
  weapon: ['Blueprint', 'Component 1', 'Component 2', 'Craft in Foundry'],
  fodder: ['Acquire / Craft', 'Claim from Foundry', 'Level to 30 (SO/Hydron)', 'Sell for Slot'],
  mod: ['Acquire Mod', 'Farm Endo & Credits', 'Rank to Target'],
  relic: ['Farm Relic', 'Refine (Void Traces)', 'Run Fissure / Radshare'],
  activity: ['Step 1', 'Step 2'],
};

const DEFAULT_DAILY_TASKS = [
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

const DEFAULT_WEEKLY_TASKS = [
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

const SAMPLE_ITEMS = [
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

const CATEGORY_BADGES = {
  warframe: 'border-amber-400/50 bg-amber-500/20 text-amber-200',
  weapon: 'border-sky-400/50 bg-sky-500/20 text-sky-200',
  fodder: 'border-pink-500/50 bg-pink-500/20 text-pink-200',
  mod: 'border-fuchsia-500/50 bg-fuchsia-500/20 text-fuchsia-200',
  relic: 'border-teal-400/50 bg-teal-500/20 text-teal-200',
  activity: 'border-orange-500/45 bg-orange-500/15 text-orange-200',
};

const STATUS_STYLES = {
  want: 'border-fuchsia-400/50 bg-fuchsia-500/20 text-fuchsia-200',
  queued: 'border-indigo-400/50 bg-indigo-500/20 text-indigo-200',
  farming: 'border-cyan-400/50 bg-cyan-500/20 text-cyan-200',
  crafting: 'border-amber-400/50 bg-amber-500/20 text-amber-200',
  leveling: 'border-violet-400/50 bg-violet-500/20 text-violet-200',
  ready_to_sell: 'border-rose-400/50 bg-rose-500/20 text-rose-200',
  done: 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200',
};

const PRIORITY_DOT = {
  high: 'bg-rose-400',
  medium: 'bg-amber-400',
  low: 'bg-slate-400',
};

function getMondayUtcKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

function createInitialState(withSamples = true) {
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

function normalizeState(parsed) {
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

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState(true);
    return normalizeState(JSON.parse(raw));
  } catch {
    return createInitialState(true);
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage restrictions
  }
}

function getResetCountdowns() {
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

function QuickAddBar({
  onAddItem,
  defaultCategory = 'warframe',
  existingItems = [],
  defaultTags = SUGGESTED_TAGS,
  onAddDefaultTag,
  onRemoveDefaultTag,
  onResetDefaultTags,
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [status, setStatus] = useState('queued');
  const [priority, setPriority] = useState('medium');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [editingDefaultTags, setEditingDefaultTags] = useState(false);
  const [newDefaultTagInput, setNewDefaultTagInput] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [newStep, setNewStep] = useState('');
  const [relicEra, setRelicEra] = useState('Axi');
  const [relicRefinement, setRelicRefinement] = useState('Intact');
  const [relicQty, setRelicQty] = useState(1);
  const [modRankCurrent, setModRankCurrent] = useState(0);
  const [modRankMax, setModRankMax] = useState(10);
  const [fodderRank, setFodderRank] = useState(0);

  useEffect(() => {
    if (!categoryTouched && !title.trim()) {
      setCategory(defaultCategory);
    }
  }, [defaultCategory, categoryTouched, title]);

  const knownTagPool = useMemo(() => {
    const counts = new Map();
    existingItems.forEach((item) => {
      (item.tags || []).forEach((t) => {
        counts.set(t, (counts.get(t) || 0) + 1);
      });
    });
    defaultTags.forEach((t) => {
      if (!counts.has(t)) counts.set(t, 0);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({ tag, count }));
  }, [existingItems, defaultTags]);

  const predictedTags = useMemo(() => {
    const q = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (!q) return [];
    return knownTagPool
      .filter(({ tag }) => !tags.some((selected) => selected.toLowerCase() === tag.toLowerCase()))
      .filter(({ tag }) => tag.toLowerCase().includes(q))
      .slice(0, 6);
  }, [tagInput, knownTagPool, tags]);

  const titlePredictions = useMemo(() => {
    const q = title.trim().toLowerCase();
    if (q.length < 2) return null;

    const matchingItems = existingItems.filter((item) => {
      const hay = [item.title, item.source, ...(item.tags || [])].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });

    const suggestedTagSet = new Set();
    const categoryScores = new Map();

    matchingItems.forEach((item) => {
      categoryScores.set(item.category, (categoryScores.get(item.category) || 0) + 2);
      (item.tags || []).forEach((t) => suggestedTagSet.add(t));
    });

    if (/\bprime\b/i.test(q)) suggestedTagSet.add('Prime');
    if (/\b(lith|meso|neo|axi|requiem|omnia)\b/i.test(q)) {
      categoryScores.set('relic', (categoryScores.get('relic') || 0) + 3);
      suggestedTagSet.add('Radshare');
    }
    if (/\b(galvanized|primed|archon|amalgam|riven|umbral)\b/i.test(q)) {
      categoryScores.set('mod', (categoryScores.get('mod') || 0) + 3);
      suggestedTagSet.add('Endo');
    }
    if (/\bincarnon\b/i.test(q)) {
      categoryScores.set('weapon', (categoryScores.get('weapon') || 0) + 2);
      suggestedTagSet.add('Incarnon');
    }
    if (/\b(helminth|subsume)\b/i.test(q)) {
      categoryScores.set('warframe', (categoryScores.get('warframe') || 0) + 2);
      suggestedTagSet.add('Helminth');
    }
    if (/\bfodder\b/i.test(q)) {
      categoryScores.set('fodder', (categoryScores.get('fodder') || 0) + 3);
    }

    const bestCategory = Array.from(categoryScores.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const filteredSuggestedTags = Array.from(suggestedTagSet)
      .filter((t) => !tags.some((selected) => selected.toLowerCase() === t.toLowerCase()))
      .slice(0, 5);

    const similarEntries = matchingItems.slice(0, 3);

    if (!bestCategory && filteredSuggestedTags.length === 0 && similarEntries.length === 0) {
      return null;
    }

    return {
      bestCategory: bestCategory && bestCategory !== category ? bestCategory : null,
      suggestedTags: filteredSuggestedTags,
      similarEntries,
    };
  }, [title, existingItems, tags, category]);

  const addTag = (raw) => {
    const clean = raw.trim().replace(/^#/, '');
    if (!clean) return;
    if (!tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setTags((prev) => [...prev, clean]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (
        predictedTags.length > 0 &&
        tagInput.trim() &&
        predictedTags[0].tag.toLowerCase().startsWith(tagInput.trim().replace(/^#/, '').toLowerCase())
      ) {
        addTag(predictedTags[0].tag);
      } else {
        addTag(tagInput);
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleCreateDefaultTag = () => {
    const clean = newDefaultTagInput.trim().replace(/^#/, '');
    if (!clean) return;
    onAddDefaultTag?.(clean);
    setNewDefaultTagInput('');
  };

  const applySimilarEntryTemplate = (entry) => {
    setTitle(entry.title);
    setCategory(entry.category);
    setCategoryTouched(true);
    setPriority(entry.priority || 'medium');
    if (entry.source && !source) setSource(entry.source);
    if (Array.isArray(entry.tags)) {
      setTags((prev) => {
        const merged = [...prev];
        entry.tags.forEach((t) => {
          if (!merged.some((m) => m.toLowerCase() === t.toLowerCase())) merged.push(t);
        });
        return merged;
      });
    }
    if (entry.category === 'relic') {
      if (entry.relicEra) setRelicEra(entry.relicEra);
      if (entry.relicRefinement) setRelicRefinement(entry.relicRefinement);
    }
  };

  const addChecklistStep = () => {
    const text = newStep.trim();
    if (!text) return;
    setChecklist((prev) => [
      ...prev,
      { id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text, done: false },
    ]);
    setNewStep('');
  };

  const loadTemplate = () => {
    const template = CHECKLIST_TEMPLATES[category] || [];
    setChecklist(template.map((text, idx) => ({ id: `tpl-${Date.now()}-${idx}`, text, done: false })));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    const pendingTag = tagInput.trim().replace(/^#/, '');
    const finalTags =
      pendingTag && !tags.some((t) => t.toLowerCase() === pendingTag.toLowerCase())
        ? [...tags, pendingTag]
        : tags;
    const now = new Date().toISOString();

    onAddItem({
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: trimmedTitle,
      category,
      status,
      priority,
      tags: finalTags,
      notes: notes.trim(),
      source: source.trim(),
      checklist,
      ...(category === 'relic' ? { relicEra, relicRefinement, relicQty: Number(relicQty) || 1 } : {}),
      ...(category === 'mod' ? { modRankCurrent: Number(modRankCurrent) || 0, modRankMax: Number(modRankMax) || 10 } : {}),
      ...(category === 'fodder' ? { fodderRank: Number(fodderRank) || 0 } : {}),
      createdAt: now,
      updatedAt: now,
    });

    setTitle('');
    setCategoryTouched(false);
    setTags([]);
    setTagInput('');
    setNotes('');
    setSource('');
    setChecklist([]);
    setNewStep('');
    setExpanded(false);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#263144] bg-[#131822]/95 shadow-lg">
      <div className="p-3 sm:p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-2.5">
          <div className="flex-1 space-y-1.5">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quick add a frame, mod, relic, fodder weapon, or farm goal..."
              className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#d4af37] focus:outline-none"
            />

            {titlePredictions && (
              <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#263144]/90 bg-[#0b0e14]/90 px-2.5 py-1.5 text-[11px]">
                <span className="inline-flex items-center gap-1 text-slate-400 mr-0.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Suggestions:</span>
                </span>

                {titlePredictions.bestCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategory(titlePredictions.bestCategory);
                      setCategoryTouched(true);
                    }}
                    className="inline-flex items-center gap-1 rounded border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 text-cyan-300 hover:bg-cyan-500/25"
                  >
                    Set Category: {CATEGORIES.find((c) => c.id === titlePredictions.bestCategory)?.label}
                  </button>
                )}

                {titlePredictions.suggestedTags.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => addTag(st)}
                    className="rounded border border-[#d4af37]/40 bg-[#d4af37]/10 px-1.5 py-0.5 text-[#f5c451] hover:bg-[#d4af37]/20"
                  >
                    +#{st}
                  </button>
                ))}

                {titlePredictions.similarEntries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => applySimilarEntryTemplate(entry)}
                    title="Copy title, category, source & tags from existing item"
                    className="inline-flex items-center gap-1 rounded border border-[#263144] bg-[#131822] px-2 py-0.5 text-slate-300 hover:border-slate-500 hover:text-white"
                  >
                    <span className="truncate max-w-[180px]">{entry.title}</span>
                    <span className="text-[10px] text-slate-500">({CATEGORIES.find((c) => c.id === entry.category)?.label})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-start gap-2">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCategoryTouched(true);
              }}
              className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2.5 text-sm text-slate-200 focus:border-[#d4af37] focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <select
              value={status}
              style={{ colorScheme: 'dark' }}
              onChange={(e) => setStatus(e.target.value)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium bg-[#0b0e14] focus:border-[#d4af37] focus:outline-none ${
                STATUS_STYLES[status] || 'border-[#263144] text-slate-200'
              }`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0b0e14] text-slate-200">{s.label}</option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2.5 text-sm text-slate-200 focus:border-[#d4af37] focus:outline-none"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>{p.label} Priority</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setExpanded((p) => !p)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                expanded
                  ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-300'
                  : 'border-[#263144] bg-[#1a2130] text-slate-300 hover:border-slate-500 hover:text-white'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              <span className="hidden sm:inline">Checklist</span>
              {checklist.length > 0 && (
                <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.5 text-xs text-cyan-300">
                  {checklist.length}
                </span>
              )}
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#d4af37] px-4 py-2.5 text-sm font-semibold text-[#07090d] hover:bg-[#f5c451] disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Tag className="w-3.5 h-3.5 text-[#f5c451]" />
              <span>Tags:</span>
            </div>
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-md border border-[#d4af37]/40 bg-[#d4af37]/15 px-2 py-0.5 text-xs font-medium text-[#f5c451]"
              >
                #{t}
                <button type="button" onClick={() => setTags((p) => p.filter((x) => x !== t))}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <div className="relative">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type tag + Enter..."
                className="w-40 rounded-md border border-[#263144] bg-[#0b0e14]/80 px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {defaultTags
                .filter((st) => !tags.some((t) => t.toLowerCase() === st.toLowerCase()))
                .map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => addTag(st)}
                    className="rounded-md border border-[#263144] bg-[#0b0e14]/60 px-2 py-0.5 text-[11px] text-slate-400 hover:border-slate-500 hover:text-slate-200"
                  >
                    +{st}
                  </button>
                ))}
              <button
                type="button"
                onClick={() => setEditingDefaultTags((p) => !p)}
                title="Customize default quick-pick tags"
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] transition-colors ${
                  editingDefaultTags
                    ? 'border-[#d4af37]/60 bg-[#d4af37]/15 text-[#f5c451]'
                    : 'border-[#263144] bg-[#1a2130]/80 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{editingDefaultTags ? 'Done Editing Tags' : 'Edit Defaults'}</span>
              </button>
            </div>
          </div>

          {predictedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#263144]/90 bg-[#0b0e14]/90 px-2.5 py-1.5 text-[11px]">
              <span className="text-slate-400">Matching tags:</span>
              {predictedTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="inline-flex items-center gap-1 rounded border border-cyan-500/35 bg-cyan-500/10 px-2 py-0.5 text-cyan-300 hover:bg-cyan-500/20"
                >
                  <span>+#{tag}</span>
                  {count > 0 && <span className="text-[10px] text-cyan-400/70">({count})</span>}
                </button>
              ))}
            </div>
          )}

          {editingDefaultTags && (
            <div className="rounded-lg border border-[#d4af37]/35 bg-[#0b0e14]/90 p-2.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#f5c451]">
                  Default Quick-Pick Tags
                </span>
                <button
                  type="button"
                  onClick={onResetDefaultTags}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                >
                  Restore Built-in Defaults
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {defaultTags.map((dt) => (
                  <span
                    key={dt}
                    className="inline-flex items-center gap-1 rounded border border-[#263144] bg-[#131822] px-2 py-0.5 text-[11px] text-slate-200"
                  >
                    #{dt}
                    <button
                      type="button"
                      onClick={() => onRemoveDefaultTag?.(dt)}
                      title={`Remove ${dt} from defaults`}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {defaultTags.length === 0 && (
                  <span className="text-[11px] text-slate-500 italic">No default tags configured.</span>
                )}
              </div>
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  value={newDefaultTagInput}
                  onChange={(e) => setNewDefaultTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateDefaultTag();
                    }
                  }}
                  placeholder="New default tag..."
                  className="flex-1 rounded-md border border-[#263144] bg-[#131822] px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-[#d4af37] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateDefaultTag}
                  disabled={!newDefaultTagInput.trim()}
                  className="inline-flex items-center gap-1 rounded-md bg-[#d4af37] px-2.5 py-1 text-xs font-semibold text-[#07090d] hover:bg-[#f5c451] disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Default
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#263144] bg-[#0b0e14]/60 p-3 sm:p-4 space-y-4 rounded-b-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Sub-tasks / Parts Checklist
                </span>
                <button
                  type="button"
                  onClick={loadTemplate}
                  className="inline-flex items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Load {CATEGORIES.find((c) => c.id === category)?.label} Template
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addChecklistStep();
                    }
                  }}
                  placeholder="Add part or step..."
                  className="flex-1 rounded-lg border border-[#263144] bg-[#131822] px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addChecklistStep}
                  className="rounded-lg border border-[#263144] bg-[#1a2130] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-[#263144]"
                >
                  Add Step
                </button>
              </div>
              {checklist.length > 0 ? (
                <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {checklist.map((step) => (
                    <li
                      key={step.id}
                      className="flex items-center justify-between rounded-md border border-[#263144] bg-[#131822] px-2.5 py-1.5 text-xs text-slate-200"
                    >
                      <span>{step.text}</span>
                      <button type="button" onClick={() => setChecklist((p) => p.filter((s) => s.id !== step.id))} className="text-slate-500 hover:text-rose-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">No checklist steps yet. Add steps or load a template.</p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Drop Source / Location
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Lua Apollo Rot B/C, Arbiters of Hexis..."
                  className="w-full rounded-lg border border-[#263144] bg-[#131822] px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              {category === 'relic' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Era</label>
                    <select value={relicEra} onChange={(e) => setRelicEra(e.target.value)} className="w-full rounded-lg border border-[#263144] bg-[#131822] px-2 py-1.5 text-xs text-slate-200">
                      {RELIC_ERAS.map((era) => <option key={era} value={era}>{era}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Refinement</label>
                    <select value={relicRefinement} onChange={(e) => setRelicRefinement(e.target.value)} className="w-full rounded-lg border border-[#263144] bg-[#131822] px-2 py-1.5 text-xs text-slate-200">
                      {RELIC_REFINEMENTS.map((ref) => <option key={ref} value={ref}>{ref}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Qty Owned</label>
                    <input type="number" min="0" value={relicQty} onChange={(e) => setRelicQty(e.target.value)} className="w-full rounded-lg border border-[#263144] bg-[#131822] px-2 py-1.5 text-xs text-slate-200" />
                  </div>
                </div>
              )}

              {category === 'mod' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Current Rank</label>
                    <input type="number" min="0" max="10" value={modRankCurrent} onChange={(e) => setModRankCurrent(e.target.value)} className="w-full rounded-lg border border-[#263144] bg-[#131822] px-2.5 py-1.5 text-xs text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Target Max Rank</label>
                    <input type="number" min="1" max="10" value={modRankMax} onChange={(e) => setModRankMax(e.target.value)} className="w-full rounded-lg border border-[#263144] bg-[#131822] px-2.5 py-1.5 text-xs text-slate-200" />
                  </div>
                </div>
              )}

              {category === 'fodder' && (
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Current Gear Rank (0–40)</label>
                  <input type="number" min="0" max="40" value={fodderRank} onChange={(e) => setFodderRank(e.target.value)} className="w-full rounded-lg border border-[#263144] bg-[#131822] px-2.5 py-1.5 text-xs text-slate-200" />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional reminders..."
                  className="w-full rounded-lg border border-[#263144] bg-[#131822] px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

function ItemCard({ item, onUpdateItem, onDeleteItem, onTagClick, compact = false }) {
  const [expanded, setExpanded] = useState(false);
  const [newStep, setNewStep] = useState('');
  const [editingStepId, setEditingStepId] = useState(null);
  const [editingStepText, setEditingStepText] = useState('');
  const [templateCategory, setTemplateCategory] = useState(item.category || 'warframe');

  const [isEditing, setIsEditing] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    setTemplateCategory(item.category || 'warframe');
  }, [item.category]);

  const catInfo = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[5];
  const checklist = item.checklist || [];
  const doneCount = checklist.filter((s) => s.done).length;
  const totalCount = checklist.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const startEditing = () => {
    setDraft({
      title: item.title || '',
      category: item.category || 'activity',
      status: item.status || 'want',
      priority: item.priority || 'medium',
      source: item.source || '',
      notes: item.notes || '',
      tags: Array.isArray(item.tags) ? [...item.tags] : [],
      relicEra: item.relicEra || 'Axi',
      relicRefinement: item.relicRefinement || 'Intact',
      relicQty: item.relicQty ?? 1,
      modRankCurrent: item.modRankCurrent ?? 0,
      modRankMax: item.modRankMax ?? 10,
      fodderRank: item.fodderRank ?? 0,
    });
    setTagDraft('');
    setIsEditing(true);
  };

  const handleAddDraftTag = (raw) => {
    if (!draft) return;
    const clean = raw.trim().replace(/^#/, '');
    if (!clean) return;
    if (!draft.tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setDraft((prev) => ({ ...prev, tags: [...prev.tags, clean] }));
    }
    setTagDraft('');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!draft || !draft.title.trim()) return;

    const pendingTag = tagDraft.trim().replace(/^#/, '');
    const finalTags =
      pendingTag && !draft.tags.some((t) => t.toLowerCase() === pendingTag.toLowerCase())
        ? [...draft.tags, pendingTag]
        : draft.tags;

    const patch = {
      title: draft.title.trim(),
      category: draft.category,
      status: draft.status,
      priority: draft.priority,
      source: draft.source.trim(),
      notes: draft.notes.trim(),
      tags: finalTags,
    };

    if (draft.category === 'relic') {
      patch.relicEra = draft.relicEra;
      patch.relicRefinement = draft.relicRefinement;
      patch.relicQty = Number(draft.relicQty) || 0;
    } else if (draft.category === 'mod') {
      patch.modRankCurrent = Number(draft.modRankCurrent) || 0;
      patch.modRankMax = Number(draft.modRankMax) || 10;
    } else if (draft.category === 'fodder') {
      patch.fodderRank = Number(draft.fodderRank) || 0;
    }

    onUpdateItem(item.id, patch);
    setIsEditing(false);
    setDraft(null);
    setTagDraft('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDraft(null);
    setTagDraft('');
  };

  const toggleStep = (stepId) => {
    onUpdateItem(item.id, {
      checklist: checklist.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)),
    });
  };

  const startEditingStep = (step) => {
    setEditingStepId(step.id);
    setEditingStepText(step.text);
  };

  const saveEditingStep = (stepId) => {
    const trimmed = editingStepText.trim();
    if (!trimmed) return;
    onUpdateItem(item.id, {
      checklist: checklist.map((s) => (s.id === stepId ? { ...s, text: trimmed } : s)),
    });
    setEditingStepId(null);
    setEditingStepText('');
  };

  const deleteStep = (stepId) => {
    if (editingStepId === stepId) {
      setEditingStepId(null);
      setEditingStepText('');
    }
    onUpdateItem(item.id, {
      checklist: checklist.filter((s) => s.id !== stepId),
    });
  };

  const applyTemplateToExisting = (mode = 'append') => {
    const tpl = CHECKLIST_TEMPLATES[templateCategory] || [];
    if (tpl.length === 0) return;

    if (mode === 'replace') {
      onUpdateItem(item.id, {
        checklist: tpl.map((text, idx) => ({
          id: `tpl-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
          text,
          done: false,
        })),
      });
      setEditingStepId(null);
      setEditingStepText('');
      return;
    }

    const existingTexts = new Set(checklist.map((s) => s.text.trim().toLowerCase()));
    const additions = tpl
      .filter((text) => !existingTexts.has(text.trim().toLowerCase()))
      .map((text, idx) => ({
        id: `tpl-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
        text,
        done: false,
      }));

    if (additions.length > 0) {
      onUpdateItem(item.id, {
        checklist: [...checklist, ...additions],
      });
    }
  };

  const addStep = (e) => {
    e.preventDefault();
    const text = newStep.trim();
    if (!text) return;
    onUpdateItem(item.id, {
      checklist: [...checklist, { id: `step-${Date.now()}`, text, done: false }],
    });
    setNewStep('');
  };

  const fodderMaxRank = (item.fodderRank ?? 0) > 30 ? 40 : 30;

  return (
    <div className="rounded-xl border border-[#263144] bg-[#131822]/90 p-3.5 transition-colors hover:border-slate-500/70">
      {isEditing && draft ? (
        <form onSubmit={handleSaveEdit} className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#263144] pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#f5c451]">
              Edit Entry
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="submit"
                disabled={!draft.title.trim()}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-40"
              >
                <Check className="w-3.5 h-3.5" />
                Save
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1 rounded-md border border-[#263144] bg-[#0b0e14] px-2 py-1 text-xs font-medium text-slate-300 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Title</label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2.5 py-1.5 text-sm text-slate-100 focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Category</label>
              <select
                value={draft.category}
                onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1.5 text-xs text-slate-200"
              >
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Status</label>
              <select
                value={draft.status}
                onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1.5 text-xs text-slate-200"
              >
                {STATUS_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Priority</label>
              <select
                value={draft.priority}
                onChange={(e) => setDraft((prev) => ({ ...prev, priority: e.target.value }))}
                className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1.5 text-xs text-slate-200"
              >
                {PRIORITY_OPTIONS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Drop Source / Location</label>
            <input
              type="text"
              value={draft.source}
              onChange={(e) => setDraft((prev) => ({ ...prev, source: e.target.value }))}
              placeholder="e.g. Lua Apollo Rot B/C..."
              className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500"
            />
          </div>

          {draft.category === 'relic' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Era</label>
                <select
                  value={draft.relicEra}
                  onChange={(e) => setDraft((prev) => ({ ...prev, relicEra: e.target.value }))}
                  className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1 text-xs text-slate-200"
                >
                  {RELIC_ERAS.map((era) => <option key={era} value={era}>{era}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Refinement</label>
                <select
                  value={draft.relicRefinement}
                  onChange={(e) => setDraft((prev) => ({ ...prev, relicRefinement: e.target.value }))}
                  className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1 text-xs text-slate-200"
                >
                  {RELIC_REFINEMENTS.map((ref) => <option key={ref} value={ref}>{ref}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Qty Owned</label>
                <input
                  type="number"
                  min="0"
                  value={draft.relicQty}
                  onChange={(e) => setDraft((prev) => ({ ...prev, relicQty: e.target.value }))}
                  className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1 text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          {draft.category === 'mod' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Current Rank</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={draft.modRankCurrent}
                  onChange={(e) => setDraft((prev) => ({ ...prev, modRankCurrent: e.target.value }))}
                  className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Target Max Rank</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={draft.modRankMax}
                  onChange={(e) => setDraft((prev) => ({ ...prev, modRankMax: e.target.value }))}
                  className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1 text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          {draft.category === 'fodder' && (
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Current Gear Rank (0–40)</label>
              <input
                type="number"
                min="0"
                max="40"
                value={draft.fodderRank}
                onChange={(e) => setDraft((prev) => ({ ...prev, fodderRank: e.target.value }))}
                className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2 py-1 text-xs text-slate-200"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[11px] text-slate-400">Tags</label>
            <div className="flex flex-wrap gap-1">
              {draft.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded border border-[#d4af37]/40 bg-[#d4af37]/15 px-1.5 py-0.5 text-[11px] text-[#f5c451]"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddDraftTag(tagDraft);
                  }
                }}
                placeholder="Add tag + Enter..."
                className="flex-1 rounded-md border border-[#263144] bg-[#0b0e14] px-2 py-1 text-xs text-slate-200 placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => handleAddDraftTag(tagDraft)}
                className="rounded-md border border-[#263144] bg-[#1a2130] px-2 py-1 text-xs text-slate-200 hover:bg-[#263144]"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Notes</label>
            <textarea
              rows={2}
              value={draft.notes}
              onChange={(e) => setDraft((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional reminders..."
              className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500"
            />
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[item.priority] || PRIORITY_DOT.medium}`} />
                <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${CATEGORY_BADGES[item.category] || CATEGORY_BADGES.activity}`}>
                  {catInfo.label}
                </span>
                {item.category === 'relic' && item.relicEra && (
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">
                    {item.relicEra} • {item.relicRefinement || 'Intact'} (x{item.relicQty ?? 1})
                  </span>
                )}
                {item.category === 'mod' && typeof item.modRankMax === 'number' && (
                  <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[11px] text-violet-300">
                    Rank {item.modRankCurrent ?? 0} / {item.modRankMax}
                  </span>
                )}
                {item.category === 'fodder' && typeof item.fodderRank === 'number' && (
                  <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-300">
                    Rank {item.fodderRank}/{fodderMaxRank}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-semibold text-slate-100 truncate">{item.title}</h4>
              {!compact && item.notes && <p className="text-xs text-slate-400 line-clamp-2">{item.notes}</p>}
              {item.source && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{item.source}</span>
                </div>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {item.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => onTagClick && onTagClick(tag)}
                      className="rounded bg-[#0b0e14] px-1.5 py-0.5 text-[11px] text-[#f5c451] border border-[#263144] hover:border-[#d4af37]/50"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <select
                value={item.status}
                onChange={(e) => onUpdateItem(item.id, { status: e.target.value })}
                className={`rounded-lg border px-2 py-1 text-xs font-medium focus:border-[#d4af37] focus:outline-none ${
                  STATUS_STYLES[item.status] || 'border-[#263144] bg-[#0b0e14] text-slate-200'
                }`}
              >
                {STATUS_OPTIONS.map((s) => <option key={s.id} value={s.id} className="bg-[#0b0e14] text-slate-200">{s.label}</option>)}
              </select>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setExpanded((p) => !p)}
                  className="inline-flex items-center gap-1 rounded-md border border-[#263144] bg-[#0b0e14] px-2 py-1 text-[11px] text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300"
                >
                  {totalCount > 0 ? (
                    <>
                      {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      {doneCount}/{totalCount}
                    </>
                  ) : (
                    <span>{expanded ? 'Hide' : '+Steps'}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={startEditing}
                  title="Edit card"
                  className="rounded-md p-1 text-slate-400 hover:bg-[#1a2130] hover:text-[#f5c451]"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  title="Delete card"
                  className="rounded-md p-1 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {totalCount > 0 && (
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#0b0e14]">
              <div
                className={`h-full transition-all duration-300 ${progressPct === 100 ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}

          {expanded && (
            <div className="mt-3 border-t border-[#263144] pt-3 space-y-2.5">
              {item.category === 'relic' && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#0b0e14]/70 px-2.5 py-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Refinement:</span>
                    <select
                      value={item.relicRefinement || 'Intact'}
                      onChange={(e) => onUpdateItem(item.id, { relicRefinement: e.target.value })}
                      className="rounded border border-[#263144] bg-[#131822] px-2 py-0.5 text-xs text-slate-200"
                    >
                      {RELIC_REFINEMENTS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Owned:</span>
                    <button type="button" onClick={() => onUpdateItem(item.id, { relicQty: Math.max(0, (item.relicQty ?? 1) - 1) })} className="rounded border border-[#263144] bg-[#131822] p-0.5 text-slate-300">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-semibold text-emerald-300">{item.relicQty ?? 1}</span>
                    <button type="button" onClick={() => onUpdateItem(item.id, { relicQty: (item.relicQty ?? 1) + 1 })} className="rounded border border-[#263144] bg-[#131822] p-0.5 text-slate-300">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {item.category === 'mod' && (
                <div className="flex items-center justify-between rounded-lg bg-[#0b0e14]/70 px-2.5 py-1.5 text-xs">
                  <span className="text-slate-400">Mod Rank Progress:</span>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => onUpdateItem(item.id, { modRankCurrent: Math.max(0, (item.modRankCurrent ?? 0) - 1) })} className="rounded border border-[#263144] bg-[#131822] p-0.5 text-slate-300">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-semibold text-violet-300">{item.modRankCurrent ?? 0} / {item.modRankMax ?? 10}</span>
                    <button type="button" onClick={() => onUpdateItem(item.id, { modRankCurrent: Math.min(item.modRankMax ?? 10, (item.modRankCurrent ?? 0) + 1) })} className="rounded border border-[#263144] bg-[#131822] p-0.5 text-slate-300">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Load Checklist Template into Existing Item */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-[#0b0e14]/60 px-2 py-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="rounded border border-[#263144] bg-[#131822] px-2 py-0.5 text-[11px] text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label} Template</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => applyTemplateToExisting('append')}
                  className="rounded border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 font-medium text-cyan-300 hover:bg-cyan-500/20"
                >
                  + Add Steps
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplateToExisting('replace')}
                  title="Replace current checklist with this template"
                  className="rounded border border-[#263144] bg-[#131822] px-2 py-0.5 text-slate-300 hover:border-amber-500/40 hover:text-amber-300"
                >
                  Replace
                </button>
              </div>

              <ul className="space-y-1">
                {checklist.map((step) => (
                  <li key={step.id} className="flex items-center justify-between gap-1.5 rounded-md px-1.5 py-0.5 hover:bg-[#1a2130]/60">
                    {editingStepId === step.id ? (
                      <div className="flex flex-1 items-center gap-1.5">
                        <input
                          type="text"
                          value={editingStepText}
                          onChange={(e) => setEditingStepText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              saveEditingStep(step.id);
                            } else if (e.key === 'Escape') {
                              setEditingStepId(null);
                              setEditingStepText('');
                            }
                          }}
                          className="flex-1 rounded border border-cyan-500/50 bg-[#0b0e14] px-2 py-0.5 text-xs text-slate-100 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => saveEditingStep(step.id)}
                          disabled={!editingStepText.trim()}
                          title="Save step"
                          className="rounded p-1 text-emerald-400 hover:bg-emerald-500/15 disabled:opacity-40"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStepId(null);
                            setEditingStepText('');
                          }}
                          title="Cancel edit"
                          className="rounded p-1 text-slate-400 hover:bg-[#1a2130] hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleStep(step.id)}
                          className="flex items-center gap-2 text-left text-xs flex-1 min-w-0 py-0.5"
                        >
                          {step.done ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-500 shrink-0" />}
                          <span className={`truncate ${step.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>{step.text}</span>
                        </button>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditingStep(step)}
                            title="Edit step"
                            className="rounded p-1 text-slate-500 hover:bg-[#1a2130] hover:text-[#f5c451]"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteStep(step.id)}
                            title="Delete step"
                            className="rounded p-1 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>

              <form onSubmit={addStep} className="flex gap-1.5">
                <input
                  type="text"
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  placeholder="Add checklist step..."
                  className="flex-1 rounded-md border border-[#263144] bg-[#0b0e14] px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
                <button type="submit" className="rounded-md border border-[#263144] bg-[#1a2130] px-2.5 py-1 text-xs text-slate-200 hover:bg-[#263144]">
                  Add
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function App() {
  const [state, setState] = useState(() => loadState());
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedTag, setSelectedTag] = useState('');
  const [countdowns, setCountdowns] = useState(() => getResetCountdowns());
  const [toast, setToast] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmFullWipe, setConfirmFullWipe] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isFirstRender = useRef(true);
  const toastTimeoutRef = useRef(null);

  const [resetsTab, setResetsTab] = useState('all');
  const [resetsFilter, setResetsFilter] = useState('all');
  const [showHiddenResets, setShowHiddenResets] = useState(false);
  const [newResetTitle, setNewResetTitle] = useState('');
  const [newResetCadence, setNewResetCadence] = useState('daily');
  const [newResetNote, setNewResetNote] = useState('');

  const [arsenalTab, setArsenalTab] = useState('all');
  const [hideDoneArsenal, setHideDoneArsenal] = useState(false);

  const [mrTab, setMrTab] = useState('all');
  const [eraFilter, setEraFilter] = useState('all');

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');

  const fileInputRef = useRef(null);

  const notify = (message, type = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
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
      const cd = getResetCountdowns();
      setCountdowns(cd);
      setState((prev) => {
        let changed = false;
        const nextResets = { ...prev.resets };
        if (prev.resets.lastDailyReset !== cd.utcTodayKey) {
          nextResets.daily = prev.resets.daily.map((t) => ({ ...t, done: false }));
          nextResets.lastDailyReset = cd.utcTodayKey;
          changed = true;
        }
        if (prev.resets.lastWeeklyReset !== cd.utcMondayKey) {
          nextResets.weekly = prev.resets.weekly.map((t) => ({ ...t, done: false }));
          nextResets.lastWeeklyReset = cd.utcMondayKey;
          changed = true;
        }
        return changed ? { ...prev, resets: nextResets } : prev;
      });
    };
    checkResets();
    const timer = setInterval(checkResets, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleAddItem = (newItem) => {
    setState((prev) => ({ ...prev, items: [newItem, ...prev.items] }));
    notify(`Added "${newItem.title}"`);
  };

  const handleUpdateItem = (id, patch) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item
      ),
    }));
  };

  const handleDeleteItem = (id) => {
    setState((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }));
    notify('Item removed');
  };

  const handleAddDefaultTag = (tag) => {
    const clean = tag.trim().replace(/^#/, '');
    if (!clean) return;
    setState((prev) => {
      const existing = prev.defaultTags || [];
      if (existing.some((t) => t.toLowerCase() === clean.toLowerCase())) return prev;
      return { ...prev, defaultTags: [...existing, clean] };
    });
    notify(`Added #${clean} to default tags`);
  };

  const handleRemoveDefaultTag = (tag) => {
    setState((prev) => ({
      ...prev,
      defaultTags: (prev.defaultTags || []).filter((t) => t !== tag),
    }));
  };

  const handleResetDefaultTags = () => {
    setState((prev) => ({
      ...prev,
      defaultTags: [...SUGGESTED_TAGS],
    }));
    notify('Restored built-in default tags');
  };

  const handleToggleResetTask = (cadence, taskId) => {
    setState((prev) => ({
      ...prev,
      resets: {
        ...prev.resets,
        [cadence]: prev.resets[cadence].map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
      },
    }));
  };

  const handleDeleteResetTask = (cadence, taskId) => {
    setState((prev) => ({
      ...prev,
      resets: {
        ...prev.resets,
        [cadence]: prev.resets[cadence].filter((t) => t.id !== taskId),
      },
    }));
    notify('Deleted custom reset task');
  };

  const handleResetCadence = (cadence) => {
    setState((prev) => ({
      ...prev,
      resets: {
        ...prev.resets,
        [cadence]: prev.resets[cadence].map((t) => ({ ...t, done: false })),
      },
    }));
    notify(`Unchecked all ${cadence} tasks`);
  };

  const handleExportJson = () => {
    const payload = { app: 'Tenno Ledger', exportedAt: new Date().toISOString(), ...state };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenno-ledger-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setHasUnsavedChanges(false);
    notify('Exported JSON backup');
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const normalized = normalizeState(JSON.parse(event.target.result));
        setState(normalized);
        setTimeout(() => setHasUnsavedChanges(false), 0);
        notify(`Imported ${normalized.items.length} items from JSON backup`);
      } catch {
        notify('Invalid JSON backup file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setConfirmFullWipe(false);
  };

  const visibleDaily = state.resets.daily.filter((t) => !t.hidden);
  const visibleWeekly = state.resets.weekly.filter((t) => !t.hidden);
  const dailyDone = visibleDaily.filter((t) => t.done).length;
  const weeklyDone = visibleWeekly.filter((t) => t.done).length;

  const activeItems = state.items.filter((i) => i.status !== 'done');
  const activeFarms = activeItems.filter((i) => i.category === 'warframe' || i.category === 'weapon');
  const fodderItems = activeItems.filter((i) => i.category === 'fodder');
  const modsAndRelics = activeItems.filter((i) => i.category === 'mod' || i.category === 'relic');

  const allTags = useMemo(() => {
    const set = new Set();
    state.items.forEach((item) => (item.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [state.items]);

  const filteredJournal = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = state.items.filter((item) => {
      if (catFilter !== 'all' && item.category !== catFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (selectedTag && !(item.tags || []).includes(selectedTag)) return false;
      if (q) {
        const hay = [item.title, item.notes, item.source, ...(item.tags || []), ...(item.checklist || []).map((c) => c.text)]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const pr = { high: 0, medium: 1, low: 2 };
    return [...list].sort((a, b) => {
      if (sortBy === 'priority') return (pr[a.priority] ?? 1) - (pr[b.priority] ?? 1);
      if (sortBy === 'alpha') return a.title.localeCompare(b.title);
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
  }, [state.items, search, catFilter, statusFilter, selectedTag, sortBy]);

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resets', label: 'Daily & Weekly', icon: CalendarClock },
    { id: 'arsenal', label: 'Arsenal & Fodder', icon: Swords },
    { id: 'mods-relics', label: 'Mods & Relics', icon: Gem },
    { id: 'all', label: 'Journal', icon: BookOpen },
  ];

  const renderResetSection = (cadenceKey, title, resetText, accentClass) => {
    const list = state.resets[cadenceKey] || [];
    const visible = list.filter((t) => (showHiddenResets ? true : !t.hidden));
    const filtered = visible.filter((t) => {
      if (resetsFilter === 'incomplete') return !t.done;
      if (resetsFilter === 'completed') return t.done;
      return true;
    });
    const activeTotal = list.filter((t) => !t.hidden).length;
    const activeDone = list.filter((t) => !t.hidden && t.done).length;
    const groups = filtered.reduce((acc, task) => {
      const g = task.group || 'General';
      if (!acc[g]) acc[g] = [];
      acc[g].push(task);
      return acc;
    }, {});

    return (
      <div className="rounded-xl border border-[#263144] bg-[#131822]/80 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#263144] pb-3.5">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className={`text-base font-bold ${accentClass}`}>{title}</h3>
              <span className="rounded-full border border-[#263144] bg-[#0b0e14] px-2.5 py-0.5 text-xs font-semibold text-slate-200">
                {activeDone} / {activeTotal}
              </span>
            </div>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              Next reset in <span className="font-medium text-slate-200">{resetText}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleResetCadence(cadenceKey)}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-[#d4af37]/60 hover:text-[#f5c451]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Uncheck All {cadenceKey === 'daily' ? 'Dailies' : 'Weeklies'}
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(groups).map(([groupName, tasks]) => (
            <div key={groupName} className="space-y-1.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{groupName}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start justify-between gap-2 rounded-lg border px-3 py-2.5 ${
                      task.done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[#263144] bg-[#0b0e14]/70'
                    } ${task.hidden ? 'opacity-50' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleResetTask(cadenceKey, task.id)}
                      className="flex items-start gap-2.5 text-left flex-1 min-w-0"
                    >
                      {task.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <div className={`text-xs font-medium ${task.done ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                          {task.title}
                        </div>
                        {task.note && <div className="text-[11px] text-slate-400 mt-0.5">{task.note}</div>}
                      </div>
                    </button>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            resets: {
                              ...prev.resets,
                              [cadenceKey]: prev.resets[cadenceKey].map((t) =>
                                t.id === task.id ? { ...t, hidden: !t.hidden } : t
                              ),
                            },
                          }))
                        }
                        title={task.hidden ? 'Unhide task' : 'Hide task'}
                        className="rounded p-1 text-slate-500 hover:bg-[#1a2130] hover:text-slate-300"
                      >
                        {task.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      {task.custom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteResetTask(cadenceKey, task.id)}
                          title="Delete custom task"
                          className="rounded p-1 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at top center, rgba(212, 175, 55, 0.06) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(34, 211, 238, 0.05) 0%, transparent 50%), linear-gradient(rgba(38, 49, 68, 0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(38, 49, 68, 0.14) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px',
      }}
    >
      <header className="sticky top-0 z-30 border-b border-[#263144] bg-[#0b0e14]/95 backdrop-blur">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#d4af37]/80 via-cyan-400/70 to-[#d4af37]/80" />
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0" fill="none" aria-hidden="true">
              <path d="M18 3L23.5 12.5L33 18L23.5 23.5L18 33L12.5 23.5L3 18L12.5 12.5L18 3Z" stroke="#d4af37" strokeWidth="1.5" fill="rgba(212, 175, 55, 0.1)" />
              <path d="M18 8.5L21 15L27.5 18L21 21L18 27.5L15 21L8.5 18L15 15L18 8.5Z" stroke="#22d3ee" strokeWidth="1.25" fill="rgba(34, 211, 238, 0.12)" />
              <circle cx="18" cy="18" r="2.2" fill="#f5c451" />
            </svg>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-wider uppercase text-slate-100 leading-none">Tenno Ledger</h1>
                {hasUnsavedChanges ? (
                  <button
                    type="button"
                    onClick={handleExportJson}
                    title="Click to export JSON backup"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-300 hover:bg-amber-500/25"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Unsaved Changes
                  </button>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Up to Date
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setActiveView('resets')}
                  className={`hidden md:inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                    visibleDaily.length > 0 && dailyDone === visibleDaily.length
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                      : 'border-cyan-500/35 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
                  }`}
                >
                  Dailies {dailyDone}/{visibleDaily.length}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('resets')}
                  className={`hidden md:inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                    visibleWeekly.length > 0 && weeklyDone === visibleWeekly.length
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                      : 'border-[#d4af37]/35 bg-[#d4af37]/10 text-[#f5c451] hover:bg-[#d4af37]/20'
                  }`}
                >
                  Weeklies {weeklyDone}/{visibleWeekly.length}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Warframe Mission, Arsenal & Relic Command Terminal</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/15 px-3 py-1.5 text-xs font-semibold text-[#f5c451] hover:bg-[#d4af37]/25"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#263144] bg-[#131822] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-500/50 hover:text-cyan-300"
            >
              <Upload className="w-3.5 h-3.5" />
              Import JSON
            </button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleImportJson} className="hidden" />
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              title="Reset or clear local data"
              className="inline-flex items-center gap-1 rounded-lg border border-[#263144] bg-[#131822] px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <nav className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto pb-2">
          {NAV_ITEMS.map((nav) => {
            const Icon = nav.icon;
            const active = activeView === nav.id;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => setActiveView(nav.id)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-[#1a2130] text-[#f5c451] border border-[#d4af37]/40'
                    : 'text-slate-400 hover:bg-[#131822] hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {nav.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="w-full max-w-[1920px] mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <button type="button" onClick={() => setActiveView('resets')} className="text-left rounded-xl border border-[#263144] bg-[#131822]/90 p-4 hover:border-cyan-500/50">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium uppercase tracking-wider">Daily Resets</span>
                  <span className="inline-flex items-center gap-1 text-cyan-300"><Clock className="w-3.5 h-3.5" />{countdowns.dailyText}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-100">{dailyDone} <span className="text-sm font-normal text-slate-400">/ {visibleDaily.length}</span></span>
                  <span className="text-xs text-cyan-400 inline-flex items-center gap-1">Open <ArrowRight className="w-3 h-3" /></span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#0b0e14]">
                  <div className="h-full bg-cyan-400 transition-all" style={{ width: `${visibleDaily.length ? (dailyDone / visibleDaily.length) * 100 : 0}%` }} />
                </div>
              </button>

              <button type="button" onClick={() => setActiveView('resets')} className="text-left rounded-xl border border-[#263144] bg-[#131822]/90 p-4 hover:border-[#d4af37]/50">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium uppercase tracking-wider">Weekly Resets</span>
                  <span className="inline-flex items-center gap-1 text-[#f5c451]"><Clock className="w-3.5 h-3.5" />{countdowns.weeklyText}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-100">{weeklyDone} <span className="text-sm font-normal text-slate-400">/ {visibleWeekly.length}</span></span>
                  <span className="text-xs text-[#f5c451] inline-flex items-center gap-1">Open <ArrowRight className="w-3 h-3" /></span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#0b0e14]">
                  <div className="h-full bg-[#f5c451] transition-all" style={{ width: `${visibleWeekly.length ? (weeklyDone / visibleWeekly.length) * 100 : 0}%` }} />
                </div>
              </button>

              <button type="button" onClick={() => setActiveView('arsenal')} className="text-left rounded-xl border border-[#263144] bg-[#131822]/90 p-4 hover:border-amber-500/50">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium uppercase tracking-wider">Active Farms & Fodder</span>
                  <Shield className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-100">{activeFarms.length + fodderItems.length}</span>
                  <span className="text-xs text-rose-300">{fodderItems.filter((f) => f.status === 'ready_to_sell').length} ready to sell</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">{activeFarms.length} frames/weapons • {fodderItems.length} mastery fodder</p>
              </button>

              <button type="button" onClick={() => setActiveView('mods-relics')} className="text-left rounded-xl border border-[#263144] bg-[#131822]/90 p-4 hover:border-emerald-500/50">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium uppercase tracking-wider">Mods & Relics</span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-100">{modsAndRelics.length}</span>
                  <span className="text-xs text-emerald-400 inline-flex items-center gap-1">Open <ArrowRight className="w-3 h-3" /></span>
                </div>
                <p className="mt-2 text-xs text-slate-400">{activeItems.filter((i) => i.category === 'mod').length} mods • {activeItems.filter((i) => i.category === 'relic').length} relic goals</p>
              </button>
            </div>

            <QuickAddBar
              onAddItem={handleAddItem}
              existingItems={state.items}
              defaultTags={state.defaultTags}
              onAddDefaultTag={handleAddDefaultTag}
              onRemoveDefaultTag={handleRemoveDefaultTag}
              onResetDefaultTags={handleResetDefaultTags}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5 items-start">
              <div className="space-y-5">
                <div className="rounded-xl border border-[#263144] bg-[#131822]/70 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#f5c451]" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Next Resets To Do</h3>
                    </div>
                    <button type="button" onClick={() => setActiveView('resets')} className="text-xs font-medium text-cyan-400 hover:text-cyan-300">
                      View all resets →
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Daily ({dailyDone}/{visibleDaily.length})</p>
                    <ul className="space-y-1">
                      {visibleDaily.filter((t) => !t.done).slice(0, 5).map((task) => (
                        <li key={task.id}>
                          <button type="button" onClick={() => handleToggleResetTask('daily', task.id)} className="flex w-full items-center gap-2.5 rounded-lg border border-[#263144] bg-[#0b0e14]/70 px-3 py-2 text-left text-xs text-slate-200 hover:border-cyan-500/40">
                            <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="truncate flex-1">{task.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#f5c451]">Weekly ({weeklyDone}/{visibleWeekly.length})</p>
                    <ul className="space-y-1">
                      {visibleWeekly.filter((t) => !t.done).slice(0, 5).map((task) => (
                        <li key={task.id}>
                          <button type="button" onClick={() => handleToggleResetTask('weekly', task.id)} className="flex w-full items-center gap-2.5 rounded-lg border border-[#263144] bg-[#0b0e14]/70 px-3 py-2 text-left text-xs text-slate-200 hover:border-[#d4af37]/40">
                            <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="truncate flex-1">{task.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-[#263144] bg-[#131822]/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Mastery Fodder (Level & Sell)</h3>
                    <button type="button" onClick={() => setActiveView('arsenal')} className="text-xs font-medium text-cyan-400">Arsenal →</button>
                  </div>
                  <div className="space-y-2.5">
                    {fodderItems.slice(0, 4).map((item) => (
                      <ItemCard key={item.id} item={item} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} onTagClick={(t) => { setSelectedTag(t); setActiveView('all'); }} compact />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-xl border border-[#263144] bg-[#131822]/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Active Warframe & Weapon Farms</h3>
                    <button type="button" onClick={() => setActiveView('arsenal')} className="text-xs font-medium text-cyan-400">View all ({activeFarms.length}) →</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeFarms.slice(0, 4).map((item) => (
                      <ItemCard key={item.id} item={item} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} onTagClick={(t) => { setSelectedTag(t); setActiveView('all'); }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 2xl:col-span-1 space-y-5">
                <div className="rounded-xl border border-[#263144] bg-[#131822]/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Mods & Relics Focus</h3>
                    <button type="button" onClick={() => setActiveView('mods-relics')} className="text-xs font-medium text-cyan-400">View all ({modsAndRelics.length}) →</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {modsAndRelics.slice(0, 4).map((item) => (
                      <ItemCard key={item.id} item={item} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} onTagClick={(t) => { setSelectedTag(t); setActiveView('all'); }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'resets' && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-[#263144] bg-[#131822]/90 p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                {[{ id: 'all', label: 'Daily & Weekly' }, { id: 'daily', label: 'Daily Only' }, { id: 'weekly', label: 'Weekly & Bi-Weekly' }].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setResetsTab(t.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${resetsTab === t.id ? 'bg-[#d4af37] text-[#07090d]' : 'bg-[#0b0e14] text-slate-300'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={resetsFilter} onChange={(e) => setResetsFilter(e.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-2.5 py-1.5 text-xs text-slate-200">
                  <option value="all">Show All</option>
                  <option value="incomplete">Incomplete Only</option>
                  <option value="completed">Completed Only</option>
                </select>
                <button
                  type="button"
                  onClick={() => setShowHiddenResets((p) => !p)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#263144] bg-[#0b0e14] px-2.5 py-1.5 text-xs text-slate-300"
                >
                  {showHiddenResets ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {showHiddenResets ? 'Showing Hidden' : 'Show Hidden'}
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newResetTitle.trim()) return;
                setState((prev) => ({
                  ...prev,
                  resets: {
                    ...prev.resets,
                    [newResetCadence]: [
                      ...prev.resets[newResetCadence],
                      { id: `custom-${Date.now()}`, title: newResetTitle.trim(), group: 'Custom', cadence: newResetCadence, note: newResetNote.trim(), done: false, hidden: false, custom: true },
                    ],
                  },
                }));
                setNewResetTitle('');
                setNewResetNote('');
                notify('Added custom reset task');
              }}
              className="flex flex-col sm:flex-row gap-2 rounded-xl border border-[#263144] bg-[#131822]/70 p-3"
            >
              <input type="text" value={newResetTitle} onChange={(e) => setNewResetTitle(e.target.value)} placeholder="Add custom daily or weekly reminder..." className="flex-1 rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500" />
              <input type="text" value={newResetNote} onChange={(e) => setNewResetNote(e.target.value)} placeholder="Optional note..." className="sm:w-52 rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500" />
              <select value={newResetCadence} onChange={(e) => setNewResetCadence(e.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-1.5 text-sm text-slate-200">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <button type="submit" disabled={!newResetTitle.trim()} className="inline-flex items-center justify-center gap-1 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-[#07090d] disabled:opacity-40">
                <Plus className="w-4 h-4" /> Add Reset Task
              </button>
            </form>

            {(resetsTab === 'all' || resetsTab === 'daily') && renderResetSection('daily', 'Daily Reset Checklist (00:00 UTC)', countdowns.dailyText, 'text-cyan-300')}
            {(resetsTab === 'all' || resetsTab === 'weekly') && renderResetSection('weekly', 'Weekly & Bi-Weekly Resets (Monday 00:00 UTC)', countdowns.weeklyText, 'text-[#f5c451]')}
          </div>
        )}

        {activeView === 'arsenal' && (
          <div className="space-y-5">
            <QuickAddBar
              onAddItem={handleAddItem}
              defaultCategory={arsenalTab === 'all' ? 'warframe' : arsenalTab}
              existingItems={state.items}
              defaultTags={state.defaultTags}
              onAddDefaultTag={handleAddDefaultTag}
              onRemoveDefaultTag={handleRemoveDefaultTag}
              onResetDefaultTags={handleResetDefaultTags}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#263144] bg-[#131822]/90 p-3">
              <div className="flex flex-wrap items-center gap-2">
                {[{ id: 'all', label: 'All Arsenal' }, { id: 'warframe', label: 'Warframes' }, { id: 'weapon', label: 'Weapons to Get' }, { id: 'fodder', label: 'Mastery Fodder' }].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setArsenalTab(t.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${arsenalTab === t.id ? 'bg-[#d4af37] text-[#07090d]' : 'bg-[#0b0e14] text-slate-300'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input type="checkbox" checked={hideDoneArsenal} onChange={(e) => setHideDoneArsenal(e.target.checked)} />
                Hide Completed
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5">
              {state.items
                .filter((i) => ['warframe', 'weapon', 'fodder'].includes(i.category))
                .filter((i) => (arsenalTab === 'all' ? true : i.category === arsenalTab))
                .filter((i) => (hideDoneArsenal ? i.status !== 'done' : true))
                .map((item) => (
                  <ItemCard key={item.id} item={item} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} onTagClick={(t) => { setSelectedTag(t); setActiveView('all'); }} />
                ))}
            </div>
          </div>
        )}

        {activeView === 'mods-relics' && (
          <div className="space-y-5">
            <QuickAddBar
              onAddItem={handleAddItem}
              defaultCategory={mrTab === 'mod' ? 'mod' : 'relic'}
              existingItems={state.items}
              defaultTags={state.defaultTags}
              onAddDefaultTag={handleAddDefaultTag}
              onRemoveDefaultTag={handleRemoveDefaultTag}
              onResetDefaultTags={handleResetDefaultTags}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#263144] bg-[#131822]/90 p-3">
              <div className="flex flex-wrap items-center gap-2">
                {[{ id: 'all', label: 'All' }, { id: 'relic', label: 'Void Relics' }, { id: 'mod', label: 'Mods' }].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setMrTab(t.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${mrTab === t.id ? 'bg-emerald-500 text-[#07090d]' : 'bg-[#0b0e14] text-slate-300'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {mrTab !== 'mod' && (
                <select value={eraFilter} onChange={(e) => setEraFilter(e.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-1.5 text-xs text-slate-200">
                  <option value="all">All Relic Eras</option>
                  {RELIC_ERAS.map((era) => <option key={era} value={era}>{era}</option>)}
                </select>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5">
              {state.items
                .filter((i) => i.category === 'mod' || i.category === 'relic')
                .filter((i) => (mrTab === 'all' ? true : i.category === mrTab))
                .filter((i) => (eraFilter === 'all' ? true : i.category === 'relic' && i.relicEra === eraFilter))
                .map((item) => (
                  <ItemCard key={item.id} item={item} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} onTagClick={(t) => { setSelectedTag(t); setActiveView('all'); }} />
                ))}
            </div>
          </div>
        )}

        {activeView === 'all' && (
          <div className="space-y-5">
            <QuickAddBar
              onAddItem={handleAddItem}
              defaultCategory="activity"
              existingItems={state.items}
              defaultTags={state.defaultTags}
              onAddDefaultTag={handleAddDefaultTag}
              onRemoveDefaultTag={handleRemoveDefaultTag}
              onResetDefaultTags={handleResetDefaultTags}
            />
            <div className="rounded-xl border border-[#263144] bg-[#131822]/90 p-3.5 space-y-3">
              <div className="flex flex-col md:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search titles, drop locations, notes, checklist steps, or tags..." className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2 text-xs text-slate-200">
                    <option value="all">All Categories</option>
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2 text-xs text-slate-200">
                    <option value="all">All Statuses</option>
                    {STATUS_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2 text-xs text-slate-200">
                    <option value="updated">Sort: Recently Updated</option>
                    <option value="priority">Sort: Priority</option>
                    <option value="alpha">Sort: A → Z</option>
                  </select>
                </div>
              </div>
              {allTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 mr-1">Filter by tag:</span>
                  {allTags.map((tag) => {
                    const active = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(active ? '' : tag)}
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${active ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#f5c451]' : 'border-[#263144] bg-[#0b0e14] text-slate-400'}`}
                      >
                        #{tag}
                        {active && <X className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5">
              {filteredJournal.map((item) => (
                <ItemCard key={item.id} item={item} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} onTagClick={(t) => setSelectedTag(selectedTag === t ? '' : t)} />
              ))}
            </div>
          </div>
        )}
      </main>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-[#263144] bg-[#131822] px-4 py-2.5 text-xs font-medium text-slate-100 shadow-xl">
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#263144] bg-[#131822] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100">Manage Local Ledger Data</h3>
              <button type="button" onClick={closeResetModal} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Your data is stored locally in this browser. Export a JSON backup first if you want to keep your current entries.
            </p>

            {!confirmFullWipe ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setState((prev) => ({ ...prev, items: [] }));
                    closeResetModal();
                    notify('Cleared all items (kept reset checklists & default tags)');
                  }}
                  className="w-full rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/25"
                >
                  Flush Items List Only (Keep Resets & Default Tags)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setState((prev) => ({ ...prev, items: SAMPLE_ITEMS }));
                    closeResetModal();
                    notify('Loaded sample items (kept reset checklists & default tags)');
                  }}
                  className="w-full rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/15 px-3 py-2 text-xs font-semibold text-[#f5c451] hover:bg-[#d4af37]/25"
                >
                  Load Sample Items (Replaces Current Items)
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmFullWipe(true)}
                  className="w-full rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/25"
                >
                  Complete Fresh Wipe (New User Experience)...
                </button>
                <button
                  type="button"
                  onClick={closeResetModal}
                  className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3.5 space-y-3">
                <div className="flex items-start gap-2 text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold">Confirm Complete Fresh Wipe</p>
                    <p className="text-rose-200/80">
                      This will erase all items, custom daily/weekly reset tasks, hidden task settings, and custom default tags back to a clean new-user state.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem(STORAGE_KEY);
                      setState(createInitialState(false));
                      setTimeout(() => setHasUnsavedChanges(false), 0);
                      closeResetModal();
                      notify('Completed full fresh wipe');
                    }}
                    className="flex-1 rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-600"
                  >
                    Yes, Wipe Everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmFullWipe(false)}
                    className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2 text-xs font-medium text-slate-300 hover:text-white"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}