// Shared billing helpers used by resolvers and cron jobs.

export const BILLING_CYCLES = ["weekly", "monthly", "yearly"];

/**
 * Given a date and a billing cycle, return the next billing date.
 * Defaults to monthly for unknown cycles.
 */
export function calculateNextBillingDate(fromDate, billingCycle) {
  const nextDate = new Date(fromDate);

  switch (billingCycle) {
    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "yearly":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case "monthly":
    default:
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }

  return nextDate;
}
