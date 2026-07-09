// Single source of truth for SaaS plans, limits, and feature gating.
// Prices are placeholders until Stripe products/prices are wired up.
//
// This is a single-user product, so there is no membership/sharing tier —
// every real capability lives on Premium.

export const FEATURES = {
  UNLIMITED_SUBSCRIPTIONS: "unlimited_subscriptions",
  ANALYTICS: "analytics",
  ADVANCED_REMINDERS: "advanced_reminders",
  AI_INSIGHTS: "ai_insights",
  CALENDAR_INTEGRATION: "calendar_integration",
};

const PREMIUM_FEATURES = [
  FEATURES.UNLIMITED_SUBSCRIPTIONS,
  FEATURES.ANALYTICS,
  FEATURES.ADVANCED_REMINDERS,
  FEATURES.AI_INSIGHTS,
  FEATURES.CALENDAR_INTEGRATION,
];

export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    maxSubscriptions: 10,
    features: [],
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceMonthly: 4.99,
    maxSubscriptions: null, // null = unlimited
    features: PREMIUM_FEATURES,
  },
};

export const DEFAULT_PLAN = "free";
export const PLAN_IDS = Object.keys(PLANS);

/** Resolve a plan config, falling back to the default for unknown ids. */
export function getPlanConfig(planId) {
  return PLANS[planId] || PLANS[DEFAULT_PLAN];
}

/** Whether a plan includes a given feature flag. */
export function planHasFeature(planId, feature) {
  return getPlanConfig(planId).features.includes(feature);
}
