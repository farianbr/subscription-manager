// Pure derivations for the dashboard. Everything takes raw query data
// (subscriptions + monthlyHistory) and returns plain serializable shapes,
// so components can memoize on the query references.

// Matches the multipliers used elsewhere in the app (server reminders, history).
export const CYCLE_TO_MONTHLY = { weekly: 4, monthly: 1, yearly: 1 / 12 };
export const CYCLE_TO_YEARLY = { weekly: 52, monthly: 12, yearly: 1 };

const MONTH_INDEX = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

export function monthlyCostOf(sub) {
  return (sub.costInDollar || 0) * (CYCLE_TO_MONTHLY[sub.billingCycle] || 1);
}

export function yearlyCostOf(sub) {
  return (sub.costInDollar || 0) * (CYCLE_TO_YEARLY[sub.billingCycle] || 12);
}

export function parseBillingDate(timestamp) {
  if (!timestamp) return null;
  const ms = typeof timestamp === "string" && /^\d+$/.test(timestamp)
    ? parseInt(timestamp, 10)
    : timestamp;
  const date = new Date(ms);
  return isNaN(date.getTime()) ? null : date;
}

export function titleCase(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Whole days from today (local midnight) to the given date. Negative = past. */
export function daysUntil(date) {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

export function relativeDueLabel(date) {
  const days = daysUntil(date);
  if (days === null) return "";
  if (days < 0) return days === -1 ? "Yesterday" : `${Math.abs(days)} days ago`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export function formatFullDate(date, locale) {
  if (!date) return "—";
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function formatMonthLabel(date, locale) {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
}

/** Subscriptions sorted by next billing date, soonest first. */
export function upcomingPayments(subscriptions = [], count = 5) {
  return subscriptions
    .map((sub) => ({ sub, date: parseBillingDate(sub.nextBillingDate) }))
    .filter((item) => item.date !== null)
    .sort((a, b) => a.date - b.date)
    .slice(0, count);
}

const MONTH_NAMES = Object.keys(MONTH_INDEX);

/**
 * Chronological month series (oldest → newest) from monthlyHistory, capped at
 * `limit`. Months with no transactions are filled with zero so the time axis
 * stays honest.
 */
export function monthlyTrendSeries(monthlyHistory = [], limit = 12) {
  if (monthlyHistory.length === 0) return [];
  const bySortKey = new Map(
    monthlyHistory.map((m) => [m.year * 12 + (MONTH_INDEX[m.month] ?? 0), m.totalSpent || 0])
  );
  const keys = [...bySortKey.keys()];
  const last = Math.max(...keys);
  const first = Math.max(Math.min(...keys), last - (limit - 1));

  const series = [];
  for (let key = first; key <= last; key++) {
    const month = MONTH_NAMES[key % 12];
    const year = Math.floor(key / 12);
    series.push({
      label: `${month.slice(0, 3)} ${String(year).slice(2)}`,
      month,
      year,
      totalUSD: bySortKey.get(key) || 0,
    });
  }
  return series;
}

/** Active subscriptions ranked by normalized monthly cost, highest first. */
export function providerRanking(subscriptions = []) {
  const byProvider = new Map();
  subscriptions.forEach((sub) => {
    const key = sub.provider?.toLowerCase() || "unknown";
    const entry = byProvider.get(key) || { provider: key, monthlyUSD: 0, services: [] };
    entry.monthlyUSD += monthlyCostOf(sub);
    entry.services.push(sub.serviceName);
    byProvider.set(key, entry);
  });
  return [...byProvider.values()].sort((a, b) => b.monthlyUSD - a.monthlyUSD);
}

/** Category allocation of normalized monthly spend, with share of total. */
export function categoryAllocation(subscriptions = []) {
  const byCategory = new Map();
  let total = 0;
  subscriptions.forEach((sub) => {
    const key = sub.category?.toLowerCase() || "other";
    const cost = monthlyCostOf(sub);
    total += cost;
    byCategory.set(key, (byCategory.get(key) || 0) + cost);
  });
  return [...byCategory.entries()]
    .map(([category, monthlyUSD]) => ({
      category,
      monthlyUSD,
      share: total > 0 ? monthlyUSD / total : 0,
    }))
    .sort((a, b) => b.monthlyUSD - a.monthlyUSD);
}

/** Last month's billed total (USD) from monthlyHistory, or null when absent. */
export function lastMonthTotal(monthlyHistory = []) {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const match = monthlyHistory.find(
    (m) => MONTH_INDEX[m.month] === last.getMonth() && m.year === last.getFullYear()
  );
  return match ? match.totalSpent : null;
}

/** The full derived dashboard model. */
export function buildDashboardModel(subscriptions = [], monthlyHistory = []) {
  const projectedMonthlyUSD = subscriptions.reduce((sum, sub) => sum + monthlyCostOf(sub), 0);
  const annualUSD = subscriptions.reduce((sum, sub) => sum + yearlyCostOf(sub), 0);
  const lastMonthUSD = lastMonthTotal(monthlyHistory);
  const upcoming = upcomingPayments(subscriptions, 5);
  const trend = monthlyTrendSeries(monthlyHistory, 12);
  const providers = providerRanking(subscriptions);
  const categories = categoryAllocation(subscriptions);

  return {
    projectedMonthlyUSD,
    annualUSD,
    lastMonthUSD,
    deltaUSD: lastMonthUSD === null ? null : projectedMonthlyUSD - lastMonthUSD,
    upcoming,
    trend,
    providers,
    categories,
    activeCount: subscriptions.length,
    nextPayment: upcoming[0] || null,
  };
}

/** Short written insights derived from real data (no filler when data is thin). */
export function buildInsights(model, formatCurrency) {
  const insights = [];
  const topCategory = model.categories[0];
  if (topCategory && topCategory.share >= 0.3) {
    insights.push(
      `${titleCase(topCategory.category)} accounts for ${Math.round(topCategory.share * 100)}% of your monthly spend.`
    );
  }
  const topProvider = model.providers[0];
  if (topProvider && model.providers.length > 1) {
    insights.push(
      `${titleCase(topProvider.provider)} is your largest recurring cost at ${formatCurrency(topProvider.monthlyUSD)} per month.`
    );
  }
  if (model.upcoming.length >= 2) {
    const nextThree = model.upcoming.slice(0, 3);
    const total = nextThree.reduce((sum, item) => sum + (item.sub.costInDollar || 0), 0);
    insights.push(`Your next ${nextThree.length} payments total ${formatCurrency(total)}.`);
  }
  return insights;
}
