import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { CATEGORIES } from '../../data/options.js';
import { ItemCard } from '../../components/ItemCard.jsx';
import { useFilteredJournal } from '../../hooks/useFilteredJournal.js';
import { getTagSuggestions } from '../../selectors/ledgerSelectors.js';

export function CompletedPage({ state, onUpdateItem, onRestoreItem }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('updated');
  const [selectedTag, setSelectedTag] = useState('');
  const completedItems = useMemo(
    () => state.items.filter((item) => item.status === 'done'),
    [state.items]
  );
  const { allTags, filteredItems } = useFilteredJournal(completedItems, {
    search,
    category,
    selectedTag,
    sort,
    includeCompleted: true,
  });
  const tagSuggestions = getTagSuggestions(state.items, state.defaultTags);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Completed Tasks</h2>
        <p className="mt-1 text-xs text-slate-400">Completed entries are kept here until you restore them.</p>
      </div>
      <div className="rounded-xl border border-[#263144] bg-[#131822]/90 p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search completed titles, notes, locations, checklist steps, or tags..."
              className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2 text-xs text-slate-200">
              <option value="all">All Categories</option>
              {CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2 text-xs text-slate-200">
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
                  #{tag}{active && <X className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onUpdateItem={onUpdateItem}
              onRestoreItem={onRestoreItem}
              tagSuggestions={tagSuggestions}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-[#263144] bg-[#131822]/70 p-6 text-center text-sm text-slate-400">
          {completedItems.length ? 'No completed tasks match these filters.' : 'No completed tasks yet.'}
        </p>
      )}
    </div>
  );
}
