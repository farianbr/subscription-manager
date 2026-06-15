import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateNextBillingDate } from "../utils/billing.js";

test("weekly adds 7 days", () => {
  const next = calculateNextBillingDate("2026-01-01T00:00:00.000Z", "weekly");
  assert.equal(next.toISOString(), "2026-01-08T00:00:00.000Z");
});

test("monthly adds one month", () => {
  const next = calculateNextBillingDate("2026-01-15T00:00:00.000Z", "monthly");
  assert.equal(next.getUTCMonth(), 1); // February
  assert.equal(next.getUTCDate(), 15);
});

test("yearly adds one year", () => {
  const next = calculateNextBillingDate("2026-03-10T00:00:00.000Z", "yearly");
  assert.equal(next.getUTCFullYear(), 2027);
  assert.equal(next.getUTCMonth(), 2);
});

test("unknown cycle defaults to monthly", () => {
  const next = calculateNextBillingDate("2026-01-15T00:00:00.000Z", "quarterly");
  assert.equal(next.getUTCMonth(), 1);
});

test("does not mutate the input date", () => {
  const from = new Date("2026-01-01T00:00:00.000Z");
  calculateNextBillingDate(from, "yearly");
  assert.equal(from.toISOString(), "2026-01-01T00:00:00.000Z");
});
