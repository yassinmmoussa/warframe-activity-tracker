export function getMondayUtcKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function getResetCountdowns(now = new Date()) {
  const nextDaily = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const dailyMs = nextDaily - now;
  const day = now.getUTCDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const nextWeekly = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday, 0, 0, 0));
  const weeklyMs = nextWeekly - now;

  const format = (ms) => {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m`;
  };

  return {
    dailyText: format(dailyMs),
    weeklyText: format(weeklyMs),
    utcTodayKey: now.toISOString().slice(0, 10),
    utcMondayKey: getMondayUtcKey(now),
  };
}
