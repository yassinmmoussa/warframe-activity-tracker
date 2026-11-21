import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { CATEGORIES, STATUS_OPTIONS } from '../../data/options.js';
import { QuickAddBar } from '../../components/QuickAddBar.jsx';
import { ItemCard } from '../../components/ItemCard.jsx';
import { useFilteredJournal } from '../../hooks/useFilteredJournal.js';
import { getTagSuggestions } from '../../selectors/ledgerSelectors.js';

export function JournalPage({ state, selectedTag, setSelectedTag, onAddItem, onUpdateItem, onDeleteItem, onAddDefaultTag, onRemoveDefaultTag, onResetDefaultTags }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('updated');
  const tagSuggestions = getTagSuggestions(state.items, state.defaultTags);
  const { allTags, filteredItems: items } = useFilteredJournal(state.items, {
    search,
    category,
    status,
    selectedTag,
    sort,
  });

  return (
    <div className="space-y-5">
      <QuickAddBar onAddItem={onAddItem} defaultCategory="activity" existingItems={state.items} defaultTags={state.defaultTags} onAddDefaultTag={onAddDefaultTag} onRemoveDefaultTag={onRemoveDefaultTag} onResetDefaultTags={onResetDefaultTags} />
      <div className="rounded-xl border border-[#263144] bg-[#131822]/90 p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search titles, drop locations, notes, checklist steps, or tags..." className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2 text-xs text-slate-200"><option value="all">All Categories</option>{CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2 text-xs text-slate-200"><option value="all">All Statuses</option>{STATUS_OPTIONS.filter((item) => item.id !== 'done').map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2 text-xs text-slate-200"><option value="updated">Sort: Recently Updated</option><option value="priority">Sort: Priority</option><option value="alpha">Sort: A → Z</option></select>
          </div>
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1">Filter by tag:</span>
            {allTags.map((tag) => {
              const active = selectedTag === tag;
              return <button key={tag} type="button" onClick={() => setSelectedTag(active ? '' : tag)} className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${active ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#f5c451]' : 'border-[#263144] bg-[#0b0e14] text-slate-400'}`}>#{tag}{active && <X className="w-3 h-3" />}</button>;
            })}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5">
        {items.map((item) => <ItemCard key={item.id} item={item} onUpdateItem={onUpdateItem} onDeleteItem={onDeleteItem} tagSuggestions={tagSuggestions} onTagClick={(tag) => setSelectedTag(selectedTag === tag ? '' : tag)} />)}
      </div>
    </div>
  );
}
