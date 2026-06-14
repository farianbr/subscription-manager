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

/** Enforce that the user's plan includes a feature, else prompt to upgrade. */
export function requireFeature(user, feature) {
  if (!planHasFeature(user.plan, feature)) {
    throw new Error("This feature requires a plan upgrade.");
  }
}
