import { test } from "node:test";
import assert from "node:assert/strict";
import { getPlanConfig, planHasFeature, FEATURES, DEFAULT_PLAN } from "../config/plans.js";
import { assertWithinSubscriptionLimit, requireFeature } from "../utils/planGuard.js";

test("free plan caps subscriptions at 10", () => {
  assert.equal(getPlanConfig("free").maxSubscriptions, 10);
});

test("premium and family are unlimited", () => {
  assert.equal(getPlanConfig("premium").maxSubscriptions, null);
  assert.equal(getPlanConfig("family").maxSubscriptions, null);
});

test("unknown plan id falls back to the default plan", () => {
  assert.equal(getPlanConfig("bogus").id, DEFAULT_PLAN);
});

test("feature gating reflects plan tier", () => {
  assert.equal(planHasFeature("free", FEATURES.ANALYTICS), false);
  assert.equal(planHasFeature("premium", FEATURES.ANALYTICS), true);
  assert.equal(planHasFeature("family", FEATURES.SHARED_SUBSCRIPTIONS), true);
  assert.equal(planHasFeature("premium", FEATURES.SHARED_SUBSCRIPTIONS), false);
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
  assert.throws(() => requireFeature({ plan: "free" }, FEATURES.ANALYTICS), /upgrade/);
  assert.doesNotThrow(() => requireFeature({ plan: "premium" }, FEATURES.ANALYTICS));
});
