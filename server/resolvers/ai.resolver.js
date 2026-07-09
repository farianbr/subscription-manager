import crypto from "crypto";
import Subscription from "../models/subscription.model.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import { requireFeature } from "../utils/planGuard.js";
import { FEATURES } from "../config/plans.js";
import { monthlyCostOf, yearlyCostOf, round2 } from "../utils/subscriptionMath.js";
import { getRates } from "../utils/exchangeRates.js";
import { generateInsights, isAiConfigured } from "../services/aiInsights.js";
import logger from "../utils/logger.js";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Cap how much data we forward to the model — bounds prompt size (cost) and
// blast radius regardless of how many subscriptions a user has.
const MAX_SUBS_IN_PROMPT = 60;

// Hourly ceiling on real generations per user (cache means normal use is far
// below this; it only bites pathological churn). In-memory, single-process.
const HOURLY_CAP = 30;
const genCount = new Map(); // userId -> { windowStart, count }

function withinHourlyCap(userId) {
  const now = Date.now();
  const key = String(userId);
  const rec = genCount.get(key) || { windowStart: now, count: 0 };
  if (now - rec.windowStart >= 3600_000) {
    rec.windowStart = now;
    rec.count = 0;
  }
  if (rec.count >= HOURLY_CAP) return false;
  rec.count += 1;
  genCount.set(key, rec);
  return true;
}

// De-dupe concurrent generations for the same user (e.g. two tabs loading).
const inFlight = new Map(); // userId -> Promise

// A stable hash of everything that should invalidate cached insights: the
// user's currency plus each subscription's cost/cycle/schedule, and the
// transaction count + latest change. When any of it moves, the fingerprint
// changes and insights regenerate on next view.
async function computeFingerprint(user, subscriptions) {
  const subPart = subscriptions
    .map((s) =>
      [s._id, s.serviceName, s.provider, s.category, s.costInDollar, s.billingCycle,
        s.nextBillingDate && new Date(s.nextBillingDate).getTime()].join(":")
    )
    .sort()
    .join("|");

  const [txAgg] = await Transaction.aggregate([
    { $match: { userId: user._id } },
    { $group: { _id: null, count: { $sum: 1 }, latest: { $max: "$updatedAt" } } },
  ]);
  const txPart = `${txAgg?.count || 0}:${txAgg?.latest ? new Date(txAgg.latest).getTime() : 0}`;

  // Bump PROMPT_VERSION when the summary/prompt format changes so cached
  // insights regenerate even if the underlying data is unchanged.
  const PROMPT_VERSION = "v2-whole";
  return crypto
    .createHash("sha1")
    .update(`${PROMPT_VERSION}||${user.currency || "USD"}||${subPart}||${txPart}`)
    .digest("hex");
}

// Compact, currency-consistent (user's display currency) picture for the model.
async function buildSummary(user, subscriptions) {
  const currency = user.currency || "USD";
  const { rates } = await getRates();
  const rate = rates[currency] || 1;
  // Whole-number amounts to match the rounded display used across the app.
  const toDisplay = (usd) => Math.round((usd || 0) * rate);

  const subs = subscriptions.slice(0, MAX_SUBS_IN_PROMPT).map((s) => ({
    service: s.serviceName,
    provider: s.provider,
    category: s.category,
    cycle: s.billingCycle,
    monthly: toDisplay(monthlyCostOf(s)),
  }));

  const categories = {};
  for (const s of subscriptions) {
    const key = s.category || "other";
    categories[key] = round2((categories[key] || 0) + toDisplay(monthlyCostOf(s)));
  }

  const trendGroups = await Transaction.aggregate([
    { $match: { userId: user._id } },
    {
      $group: {
        _id: { year: { $year: "$billingDate" }, month: { $month: "$billingDate" } },
        totalUSD: { $sum: "$costInDollar" },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);
  const recentMonths = trendGroups.map((g) => ({
    month: `${MONTH_NAMES[g._id.month - 1]} ${g._id.year}`,
    billed: toDisplay(g.totalUSD),
  }));

  return {
    currency,
    subscriptionCount: subscriptions.length,
    totalMonthly: toDisplay(subscriptions.reduce((sum, s) => sum + monthlyCostOf(s), 0)),
    totalAnnual: toDisplay(subscriptions.reduce((sum, s) => sum + yearlyCostOf(s), 0)),
    categoriesMonthly: categories,
    subscriptions: subs,
    recentMonths,
  };
}

function shapeCache(cache) {
  if (!cache?.generatedAt) return null;
  return {
    generatedAt: new Date(cache.generatedAt).toISOString(),
    summary: cache.summary || "",
    insights: (cache.insights || []).map((i) => ({
      title: i.title,
      detail: i.detail,
      severity: i.severity,
    })),
  };
}

// Generate fresh insights and persist them with the current fingerprint.
async function regenerate(user, subscriptions, fingerprint) {
  const summary = await buildSummary(user, subscriptions);
  const result = await generateInsights(summary);
  const cache = {
    fingerprint,
    generatedAt: new Date(),
    summary: result.summary,
    insights: result.insights,
  };
  await User.updateOne({ _id: user._id }, { aiInsightsCache: cache });
  return shapeCache(cache);
}

const aiResolver = {
  Query: {
    aiInsightsAvailable: async (_, __, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      return isAiConfigured();
    },

    aiInsights: async (_, __, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      requireFeature(user, FEATURES.AI_INSIGHTS);
      if (!isAiConfigured()) return null;

      const subscriptions = await Subscription.find({ userId: user._id });
      if (subscriptions.length === 0) return null;

      const fingerprint = await computeFingerprint(user, subscriptions);
      const cache = user.aiInsightsCache;

      // Fresh cache for the current data → serve it, no API call.
      if (cache?.fingerprint === fingerprint && cache?.generatedAt) {
        return shapeCache(cache);
      }

      const key = String(user._id);
      if (inFlight.has(key)) return inFlight.get(key);

      // Data changed (or first run): regenerate, unless we've hit the hourly
      // ceiling — in which case fall back to any stale cache rather than error.
      if (!withinHourlyCap(user._id)) {
        return shapeCache(cache);
      }

      const promise = regenerate(user, subscriptions, fingerprint)
        .catch((err) => {
          logger.error("aiInsights generation failed:", err.message);
          // On failure, return stale cache if present; otherwise surface the error.
          const stale = shapeCache(cache);
          if (stale) return stale;
          throw new Error(err.message || "Failed to generate AI insights");
        })
        .finally(() => inFlight.delete(key));

      inFlight.set(key, promise);
      return promise;
    },
  },
};

export default aiResolver;
