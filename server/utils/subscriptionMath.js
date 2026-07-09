// Server-side cost normalization, mirroring client/src/lib/dashboard.js so the
// dashboard and server-computed features (AI insights, analytics) agree.

export const CYCLE_TO_MONTHLY = { weekly: 4, monthly: 1, yearly: 1 / 12 };
export const CYCLE_TO_YEARLY = { weekly: 52, monthly: 12, yearly: 1 };

export function monthlyCostOf(sub) {
  return (sub.costInDollar || 0) * (CYCLE_TO_MONTHLY[sub.billingCycle] || 1);
}

export function yearlyCostOf(sub) {
  return (sub.costInDollar || 0) * (CYCLE_TO_YEARLY[sub.billingCycle] || 12);
}

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
