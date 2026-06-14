// Single source of truth for SaaS plans, limits, and feature gating.
// Prices are placeholders until Stripe products/prices are wired up.

export const FEATURES = {
  UNLIMITED_SUBSCRIPTIONS: "unlimited_subscriptions",
  ANALYTICS: "analytics",
  ADVANCED_REMINDERS: "advanced_reminders",
  AI_INSIGHTS: "ai_insights",
  CALENDAR_INTEGRATION: "calendar_integration",
  SHARED_SUBSCRIPTIONS: "shared_subscriptions",
  COST_SPLITTING: "cost_splitting",
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
    maxMembers: 1,
    features: [],
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceMonthly: 4.99,
    maxSubscriptions: null, // null = unlimited
    maxMembers: 1,
    features: PREMIUM_FEATURES,
  },
  family: {
    id: "family",
    name: "Family",
    priceMonthly: 7.99,
    maxSubscriptions: null,
    maxMembers: 5,
    features: [
      ...PREMIUM_FEATURES,
      FEATURES.SHARED_SUBSCRIPTIONS,
      FEATURES.COST_SPLITTING,
    ],
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
