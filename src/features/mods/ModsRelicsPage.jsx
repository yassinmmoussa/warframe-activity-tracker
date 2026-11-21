import { useState } from 'react';
import { RELIC_ERAS } from '../../data/options.js';
import { QuickAddBar } from '../../components/QuickAddBar.jsx';
import { ItemCard } from '../../components/ItemCard.jsx';
import { filterModsRelicsItems } from '../../selectors/ledgerSelectors.js';

export function ModsRelicsPage({ state, onAddItem, onUpdateItem, onDeleteItem, onAddDefaultTag, onRemoveDefaultTag, onResetDefaultTags, onTagClick }) {
  const [tab, setTab] = useState('all');
  const [era, setEra] = useState('all');
  const tabs = [{ id: 'all', label: 'All' }, { id: 'relic', label: 'Void Relics' }, { id: 'mod', label: 'Mods' }];
  const items = filterModsRelicsItems(state.items, tab, era);

  return (
    <div className="space-y-5">
      <QuickAddBar onAddItem={onAddItem} defaultCategory={tab === 'mod' ? 'mod' : 'relic'} existingItems={state.items} defaultTags={state.defaultTags} onAddDefaultTag={onAddDefaultTag} onRemoveDefaultTag={onRemoveDefaultTag} onResetDefaultTags={onResetDefaultTags} />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#263144] bg-[#131822]/90 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((item) => (
            <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${tab === item.id ? 'bg-emerald-500 text-[#07090d]' : 'bg-[#0b0e14] text-slate-300'}`}>{item.label}</button>
          ))}
        </div>
        {tab !== 'mod' && (
          <select value={era} onChange={(event) => setEra(event.target.value)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-1.5 text-xs text-slate-200">
            <option value="all">All Relic Eras</option>
            {RELIC_ERAS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5">
        {items.map((item) => <ItemCard key={item.id} item={item} onUpdateItem={onUpdateItem} onDeleteItem={onDeleteItem} onTagClick={onTagClick} />)}
      </div>
    </div>
  );
}
