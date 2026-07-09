// Plan restriction / feature-gating helpers. Throw user-facing errors that the
// frontend surfaces as upgrade prompts.

import { getPlanConfig, planHasFeature } from "../config/plans.js";

/**
 * Enforce the plan's subscription cap before creating a new subscription.
 * Plans with maxSubscriptions === null are unlimited.
 */
export function assertWithinSubscriptionLimit(user, currentCount) {
  const plan = getPlanConfig(user.plan);
  if (plan.maxSubscriptions !== null && currentCount >= plan.maxSubscriptions) {
    throw new Error(
      `You've reached the ${plan.name} plan limit of ${plan.maxSubscriptions} subscriptions. Upgrade to add more.`
    );
  }
}

/** Non-throwing check: does the user's plan include a feature? */
export function userHasFeature(user, feature) {
  return planHasFeature(user?.plan, feature);
}

/** Enforce that the user's plan includes a feature, else prompt to upgrade. */
export function requireFeature(user, feature) {
  if (!userHasFeature(user, feature)) {
    throw new Error("This feature requires a Premium plan.");
  }
}
