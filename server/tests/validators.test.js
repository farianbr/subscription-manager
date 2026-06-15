import { test } from "node:test";
import assert from "node:assert/strict";
import {
  requireString,
  requireEmail,
  requirePassword,
  requireEnum,
  optionalEnum,
  requirePositiveAmount,
  requireDate,
} from "../utils/validators.js";

test("requireString trims and returns the value", () => {
  assert.equal(requireString("  Netflix  ", "Name"), "Netflix");
});

test("requireString rejects empty / non-string", () => {
  assert.throws(() => requireString("   ", "Name"), /Name is required/);
  assert.throws(() => requireString(42, "Name"), /Name is required/);
});

test("requireEmail normalizes case and validates format", () => {
  assert.equal(requireEmail("User@Example.COM"), "user@example.com");
  assert.throws(() => requireEmail("not-an-email"), /valid email/);
});

test("requirePassword enforces an 8-char minimum", () => {
  assert.throws(() => requirePassword("short"), /at least 8/);
  assert.equal(requirePassword("longenough"), "longenough");
});

test("requireEnum accepts allowed values and rejects others", () => {
  assert.equal(requireEnum("monthly", ["weekly", "monthly"], "Cycle"), "monthly");
  assert.throws(() => requireEnum("daily", ["weekly", "monthly"], "Cycle"), /one of/);
});

test("optionalEnum passes through null/undefined", () => {
  assert.equal(optionalEnum(undefined, ["a"], "X"), undefined);
  assert.equal(optionalEnum(null, ["a"], "X"), null);
  assert.throws(() => optionalEnum("b", ["a"], "X"), /one of/);
});

test("requirePositiveAmount rejects zero, negatives, and non-numbers", () => {
  assert.equal(requirePositiveAmount(9.99), 9.99);
  assert.throws(() => requirePositiveAmount(0), /positive/);
  assert.throws(() => requirePositiveAmount(-5), /positive/);
  assert.throws(() => requirePositiveAmount("5"), /positive/);
});

test("requireDate parses valid dates and rejects junk", () => {
  assert.ok(requireDate("2026-01-01") instanceof Date);
  assert.throws(() => requireDate("not-a-date"), /valid date/);
});
