import { test } from "node:test";
import assert from "node:assert/strict";
import { getPlanConfig, planHasFeature, PLANS, FEATURES, DEFAULT_PLAN } from "../config/plans.js";
import { assertWithinSubscriptionLimit, requireFeature, userHasFeature } from "../utils/planGuard.js";

test("free plan caps subscriptions at 10", () => {
  assert.equal(getPlanConfig("free").maxSubscriptions, 10);
});

test("premium is unlimited", () => {
  assert.equal(getPlanConfig("premium").maxSubscriptions, null);
});

test("only free and premium plans exist (no family/membership tier)", () => {
  assert.deepEqual(Object.keys(PLANS).sort(), ["free", "premium"]);
});

test("unknown plan id falls back to the default plan", () => {
  assert.equal(getPlanConfig("bogus").id, DEFAULT_PLAN);
  // Legacy users still on the removed "family" plan resolve safely to the default.
  assert.equal(getPlanConfig("family").id, DEFAULT_PLAN);
});

test("feature gating reflects plan tier", () => {
  assert.equal(planHasFeature("free", FEATURES.ANALYTICS), false);
  assert.equal(planHasFeature("premium", FEATURES.ANALYTICS), true);
  assert.equal(planHasFeature("premium", FEATURES.AI_INSIGHTS), true);
  assert.equal(planHasFeature("premium", FEATURES.CALENDAR_INTEGRATION), true);
  assert.equal(planHasFeature("premium", FEATURES.ADVANCED_REMINDERS), true);
});

test("free user at the cap is blocked from adding more", () => {
  assert.throws(() => assertWithinSubscriptionLimit({ plan: "free" }, 10), /limit/);
});

test("free user below the cap is allowed", () => {
  assert.doesNotThrow(() => assertWithinSubscriptionLimit({ plan: "free" }, 9));
});

test("unlimited plan never blocks", () => {
  assert.doesNotThrow(() => assertWithinSubscriptionLimit({ plan: "premium" }, 9999));
});

test("requireFeature gates on the plan", () => {
  assert.throws(() => requireFeature({ plan: "free" }, FEATURES.ANALYTICS), /Premium/);
  assert.doesNotThrow(() => requireFeature({ plan: "premium" }, FEATURES.ANALYTICS));
});

test("userHasFeature is a non-throwing check", () => {
  assert.equal(userHasFeature({ plan: "premium" }, FEATURES.AI_INSIGHTS), true);
  assert.equal(userHasFeature({ plan: "free" }, FEATURES.AI_INSIGHTS), false);
  assert.equal(userHasFeature(null, FEATURES.AI_INSIGHTS), false);
});
