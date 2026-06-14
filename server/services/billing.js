// Billing abstraction. Today it applies plan changes directly (mock mode).
// When Stripe is added, `startPlanChange` becomes the single place that creates
// a Checkout session for paid upgrades and returns its URL — callers and the
// GraphQL layer stay unchanged.

import User from "../models/user.model.js";
import { getPlanConfig, DEFAULT_PLAN } from "../config/plans.js";

const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

/**
 * Begin a plan change for a user.
 * - Free/downgrades: applied immediately.
 * - Paid upgrades with Stripe configured: would return a Checkout URL (TODO).
 * - Paid upgrades without Stripe (dev): applied immediately in "mock" mode.
 *
 * @returns {{ mode: string, checkoutUrl: string|null, user: object }}
 */
export async function startPlanChange(user, planId) {
  const target = getPlanConfig(planId);
  const isPaidUpgrade = target.priceMonthly > 0;

  if (isPaidUpgrade && stripeEnabled) {
    // TODO: create a Stripe Checkout session for `target` and return its URL.
    // The webhook handler will flip user.plan + user.billing on payment success.
    throw new Error("Stripe checkout is not yet implemented");
  }

  // Mock mode (no Stripe) or free/downgrade: apply the change now.
  const updated = await User.findByIdAndUpdate(
    user._id,
    {
      plan: target.id,
      "billing.status": target.id === DEFAULT_PLAN ? "none" : "active",
    },
    { new: true }
  );

  return { mode: stripeEnabled ? "immediate" : "mock", checkoutUrl: null, user: updated };
}
