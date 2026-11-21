import { useState } from 'react';
import { QuickAddBar } from '../../components/QuickAddBar.jsx';
import { ItemCard } from '../../components/ItemCard.jsx';
import { filterArsenalItems, getTagSuggestions } from '../../selectors/ledgerSelectors.js';

export function ArsenalPage({ state, onAddItem, onUpdateItem, onDeleteItem, onAddDefaultTag, onRemoveDefaultTag, onResetDefaultTags, onTagClick }) {
  const [tab, setTab] = useState('all');
  const [hideCompleted, setHideCompleted] = useState(true);
  const tabs = [
    { id: 'all', label: 'All Arsenal' },
    { id: 'warframe', label: 'Warframes' },
    { id: 'weapon', label: 'Weapons to Get' },
    { id: 'fodder', label: 'Mastery Fodder' },
  ];
  const items = filterArsenalItems(state.items, tab, hideCompleted);
  const tagSuggestions = getTagSuggestions(state.items, state.defaultTags);

  return (
    <div className="space-y-5">
      <QuickAddBar onAddItem={onAddItem} defaultCategory={tab === 'all' ? 'warframe' : tab} existingItems={state.items} defaultTags={state.defaultTags} onAddDefaultTag={onAddDefaultTag} onRemoveDefaultTag={onRemoveDefaultTag} onResetDefaultTags={onResetDefaultTags} />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#263144] bg-[#131822]/90 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((item) => (
            <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${tab === item.id ? 'bg-[#d4af37] text-[#07090d]' : 'bg-[#0b0e14] text-slate-300'}`}>{item.label}</button>
          ))}
        </div>
        <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input type="checkbox" checked={hideCompleted} onChange={(event) => setHideCompleted(event.target.checked)} /> Hide Completed
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5">
        {items.map((item) => <ItemCard key={item.id} item={item} onUpdateItem={onUpdateItem} onDeleteItem={onDeleteItem} tagSuggestions={tagSuggestions} onTagClick={onTagClick} />)}
      </div>
    </div>
  );
}
