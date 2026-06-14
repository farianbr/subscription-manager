// Centralized input validation for GraphQL resolvers.
// Throws Error with a user-facing message on the first failure.

import validator from "validator";
import { SUPPORTED_CURRENCIES } from "./exchangeRates.js";

// Domain enums — keep in sync with the Mongoose models.
export const CATEGORIES = ["entertainment", "productivity", "utilities", "education"];
export const BILLING_CYCLES = ["weekly", "monthly", "yearly"];
export const CURRENCIES = SUPPORTED_CURRENCIES;
export const PAYMENT_TYPES = ["card", "cash", "bkash", "other"];
export const GENDERS = ["male", "female"];

export const PASSWORD_MIN_LENGTH = 8;

function fail(message) {
  throw new Error(message);
}

/** Trim and assert a non-empty string within a length bound. */
export function requireString(value, field, { min = 1, max = 200 } = {}) {
  if (typeof value !== "string") fail(`${field} is required`);
  const trimmed = value.trim();
  if (trimmed.length < min) fail(`${field} is required`);
  if (trimmed.length > max) fail(`${field} must be at most ${max} characters`);
  return trimmed;
}

export function requireEmail(value) {
  const email = requireString(value, "Email", { max: 254 }).toLowerCase();
  if (!validator.isEmail(email)) fail("Please enter a valid email address");
  return email;
}

export function requirePassword(value, field = "Password") {
  if (typeof value !== "string" || value.length < PASSWORD_MIN_LENGTH) {
    fail(`${field} must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (value.length > 200) fail(`${field} is too long`);
  return value;
}

export function requireEnum(value, allowed, field) {
  if (!allowed.includes(value)) {
    fail(`${field} must be one of: ${allowed.join(", ")}`);
  }
  return value;
}

export function optionalEnum(value, allowed, field) {
  if (value === undefined || value === null) return value;
  return requireEnum(value, allowed, field);
}

export function requirePositiveAmount(value, field = "Amount") {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    fail(`${field} must be a positive number`);
  }
  if (value > 1_000_000_000) fail(`${field} is too large`);
  return value;
}

export function requireDate(value, field = "Date") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) fail(`${field} is not a valid date`);
  return date;
}
