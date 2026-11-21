import { useMemo } from 'react';
import { filterJournalItems, getAllTags } from '../selectors/ledgerSelectors.js';

export function useFilteredJournal(items, filters) {
  const allTags = useMemo(() => getAllTags(items), [items]);
  const filteredItems = useMemo(
    () => filterJournalItems(items, filters),
    [items, filters.search, filters.category, filters.status, filters.selectedTag, filters.sort]
  );
  return { allTags, filteredItems };
}
