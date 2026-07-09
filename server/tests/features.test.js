import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSubscriptionCalendar } from "../utils/ical.js";
import { resolveLeadDays } from "../jobs/reminderJob.js";
import { monthlyCostOf, yearlyCostOf } from "../utils/subscriptionMath.js";

test("iCal feed emits a VEVENT per subscription with the right recurrence", () => {
  const ics = buildSubscriptionCalendar([
    {
      _id: "abc123",
      serviceName: "Netflix",
      provider: "Netflix",
      billingCycle: "monthly",
      costInDollar: 15.49,
      nextBillingDate: new Date("2026-08-10T00:00:00Z"),
    },
  ]);

  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /BEGIN:VEVENT/);
  assert.match(ics, /UID:subscription-abc123@subscription-manager/);
  assert.match(ics, /DTSTART;VALUE=DATE:20260810/);
  assert.match(ics, /RRULE:FREQ=MONTHLY/);
  assert.match(ics, /SUMMARY:Netflix renews/);
  assert.match(ics, /END:VCALENDAR/);
});

test("iCal escapes special characters and skips undated subscriptions", () => {
  const ics = buildSubscriptionCalendar([
    { _id: "1", serviceName: "A; B, C", provider: "X", billingCycle: "yearly", costInDollar: 1, nextBillingDate: new Date("2026-01-01T00:00:00Z") },
    { _id: "2", serviceName: "No date", provider: "Y", billingCycle: "monthly", costInDollar: 1, nextBillingDate: null },
  ]);
  assert.match(ics, /SUMMARY:A\\; B\\, C renews/);
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 1);
});

test("resolveLeadDays uses advanced lead days only for entitled users", () => {
  const prefs = { reminderDaysBefore: 2, reminderLeadDays: [7, 1] };

  // Premium with advanced reminders → the configured multi-lead list.
  assert.deepEqual(
    resolveLeadDays({ plan: "premium", notificationPreferences: prefs }),
    [7, 1]
  );

  // Free plan ignores the lead list and falls back to the single value.
  assert.deepEqual(
    resolveLeadDays({ plan: "free", notificationPreferences: prefs }),
    [2]
  );

  // Premium but no lead list configured → single value.
  assert.deepEqual(
    resolveLeadDays({ plan: "premium", notificationPreferences: { reminderDaysBefore: 3, reminderLeadDays: [] } }),
    [3]
  );

  // Missing prefs default to 1 day.
  assert.deepEqual(resolveLeadDays({ plan: "free", notificationPreferences: {} }), [1]);
});

test("subscription cost normalization matches the client multipliers", () => {
  assert.equal(monthlyCostOf({ costInDollar: 10, billingCycle: "monthly" }), 10);
  assert.equal(monthlyCostOf({ costInDollar: 10, billingCycle: "weekly" }), 40);
  assert.equal(yearlyCostOf({ costInDollar: 12, billingCycle: "monthly" }), 144);
  assert.equal(yearlyCostOf({ costInDollar: 10, billingCycle: "weekly" }), 520);
});
