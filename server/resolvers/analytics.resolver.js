import Subscription from "../models/subscription.model.js";
import Transaction from "../models/transaction.model.js";
import { requireFeature } from "../utils/planGuard.js";
import { FEATURES } from "../config/plans.js";
import { calculateNextBillingDate } from "../utils/billing.js";
import { monthlyCostOf, round2 } from "../utils/subscriptionMath.js";
import logger from "../utils/logger.js";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const FORECAST_MONTHS = 6;

// Projected spend per calendar month for the next FORECAST_MONTHS, by walking
// each subscription's real billing schedule forward within the window.
function buildForecast(subscriptions) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const windowStart = new Date(start.getFullYear(), start.getMonth(), 1);
  const windowEnd = new Date(start.getFullYear(), start.getMonth() + FORECAST_MONTHS, 1);

  // Seed the buckets so months with no charges still appear.
  const buckets = new Map();
  for (let i = 0; i < FORECAST_MONTHS; i++) {
    const d = new Date(windowStart.getFullYear(), windowStart.getMonth() + i, 1);
    buckets.set(`${d.getFullYear()}-${d.getMonth()}`, {
      label: `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      projectedUSD: 0,
    });
  }

  for (const sub of subscriptions) {
    if (!sub.nextBillingDate) continue;
    let occurrence = new Date(sub.nextBillingDate);
    let guard = 0;
    while (occurrence < windowEnd && guard < 400) {
      guard += 1;
      if (occurrence >= windowStart) {
        const key = `${occurrence.getFullYear()}-${occurrence.getMonth()}`;
        const bucket = buckets.get(key);
        if (bucket) bucket.projectedUSD += sub.costInDollar || 0;
      }
      occurrence = calculateNextBillingDate(occurrence, sub.billingCycle);
    }
  }

  return [...buckets.values()].map((b) => ({ ...b, projectedUSD: round2(b.projectedUSD) }));
}

// Detect the most recent charged-amount change per subscription from its
// transaction history (USD-normalized to stay currency-agnostic).
async function buildPriceChanges(userId) {
  const groups = await Transaction.aggregate([
    { $match: { userId, subscriptionId: { $ne: null } } },
    { $sort: { billingDate: 1 } },
    {
      $group: {
        _id: "$subscriptionId",
        service: { $last: "$serviceName" },
        provider: { $last: "$provider" },
        history: { $push: { cost: "$costInDollar", at: "$billingDate" } },
      },
    },
  ]);

  const changes = [];
  for (const g of groups) {
    const hist = g.history || [];
    if (hist.length < 2) continue;

    // Find the last point where the cost differs from the previous one.
    let lastChangeIdx = -1;
    for (let i = 1; i < hist.length; i++) {
      if (Math.abs((hist[i].cost || 0) - (hist[i - 1].cost || 0)) > 0.005) {
        lastChangeIdx = i;
      }
    }
    if (lastChangeIdx === -1) continue;

    const fromUSD = round2(hist[lastChangeIdx - 1].cost || 0);
    const toUSD = round2(hist[lastChangeIdx].cost || 0);
    if (fromUSD === 0) continue;

    changes.push({
      service: g.service,
      provider: g.provider,
      fromUSD,
      toUSD,
      changePct: round2(((toUSD - fromUSD) / fromUSD) * 100),
      direction: toUSD > fromUSD ? "increase" : "decrease",
      changedAt: new Date(hist[lastChangeIdx].at).toISOString(),
    });
  }

  // Largest relative moves first.
  return changes.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
}

const analyticsResolver = {
  Query: {
    advancedAnalytics: async (_, __, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      requireFeature(user, FEATURES.ANALYTICS);

      try {
        const subscriptions = await Subscription.find({ userId: user._id });
        const forecast = buildForecast(subscriptions);
        const priceChanges = await buildPriceChanges(user._id);

        const totalMonthly = subscriptions.reduce((sum, s) => sum + monthlyCostOf(s), 0);
        const averageMonthlyPerSubUSD = subscriptions.length
          ? round2(totalMonthly / subscriptions.length)
          : 0;

        return {
          forecast,
          priceChanges,
          averageMonthlyPerSubUSD,
          // forecast[0] is the current (partial) month; the "next month" tile
          // reflects the next full calendar month's scheduled renewals.
          projectedNextMonthUSD: forecast[1]?.projectedUSD ?? forecast[0]?.projectedUSD ?? 0,
        };
      } catch (err) {
        logger.error("advancedAnalytics failed:", err);
        throw new Error("Failed to compute analytics");
      }
    },
  },
};

export default analyticsResolver;
