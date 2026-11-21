export function getResetProgress(tasks) {
  const visible = tasks.filter((task) => !task.hidden);
  return {
    visible,
    done: visible.filter((task) => task.done).length,
  };
}

export function getDashboardData(items, resets) {
  const activeItems = items.filter((item) => item.status !== 'done');
  return {
    daily: getResetProgress(resets.daily),
    weekly: getResetProgress(resets.weekly),
    activeItems,
    activeFarms: activeItems.filter((item) => item.category === 'warframe' || item.category === 'weapon'),
    fodderItems: activeItems.filter((item) => item.category === 'fodder'),
    modsAndRelics: activeItems.filter((item) => item.category === 'mod' || item.category === 'relic'),
  };
}

export function getAllTags(items) {
  const tags = new Set();
  items.forEach((item) => (item.tags || []).forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}

export function filterJournalItems(items, { search = '', category = 'all', status = 'all', selectedTag = '', sort = 'updated' } = {}) {
  const query = search.trim().toLowerCase();
  const priority = { high: 0, medium: 1, low: 2 };
  const filtered = items.filter((item) => {
    if (category !== 'all' && item.category !== category) return false;
    if (status !== 'all' && item.status !== status) return false;
    if (selectedTag && !(item.tags || []).includes(selectedTag)) return false;
    if (query) {
      const haystack = [
        item.title,
        item.notes,
        item.source,
        ...(item.tags || []),
        ...(item.checklist || []).map((step) => step.text),
      ].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sort === 'priority') return (priority[a.priority] ?? 1) - (priority[b.priority] ?? 1);
    if (sort === 'alpha') return a.title.localeCompare(b.title);
    return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
  });
}

export function filterResetTasks(tasks, { filter = 'all', showHidden = false } = {}) {
  return tasks
    .filter((task) => showHidden || !task.hidden)
    .filter((task) => {
      if (filter === 'incomplete') return !task.done;
      if (filter === 'completed') return task.done;
      return true;
    });
}

export function filterArsenalItems(items, tab, hideCompleted) {
  return items
    .filter((item) => ['warframe', 'weapon', 'fodder'].includes(item.category))
    .filter((item) => tab === 'all' || item.category === tab)
    .filter((item) => !hideCompleted || item.status !== 'done');
}

export function filterModsRelicsItems(items, tab, era) {
  return items
    .filter((item) => item.category === 'mod' || item.category === 'relic')
    .filter((item) => tab === 'all' || item.category === tab)
    .filter((item) => era === 'all' || (item.category === 'relic' && item.relicEra === era));
}
