// Authoritative source of FX rates for the whole app (backend + frontend).
// Fetches live USD-based rates from a free, no-key API, caches them in memory,
// and falls back to a static table if the network is unavailable.

import logger from "./logger.js";

export const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "INR", "BDT", "CAD", "AUD", "JPY", "CHF", "CNY",
];

// Static fallback (USD base). Only used when the live fetch fails.
const FALLBACK_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.12,
  BDT: 109.5,
};

const RATES_API_URL = "https://open.er-api.com/v6/latest/USD";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

let cache = { rates: null, fetchedAt: 0, source: "none" };

// Keep only the currencies we support, ensuring USD is always 1.
function pickSupported(rates) {
  const picked = {};
  for (const code of SUPPORTED_CURRENCIES) {
    if (typeof rates[code] === "number" && Number.isFinite(rates[code])) {
      picked[code] = rates[code];
    }
  }
  picked.USD = 1;
  return picked;
}

async function fetchLiveRates() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(RATES_API_URL, { signal: controller.signal });
    if (!res.ok) throw new Error(`Rates API responded ${res.status}`);
    const data = await res.json();
    if (data.result !== "success" || !data.rates) {
      throw new Error("Rates API returned an unexpected payload");
    }
    return pickSupported(data.rates);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Returns the current USD-based rate table, refreshing from the API when the
 * cache is stale. Never throws — falls back to cached or static rates.
 */
export async function getRates() {
  const fresh = Date.now() - cache.fetchedAt < CACHE_TTL_MS;
  if (cache.rates && fresh) return cache;

  try {
    const rates = await fetchLiveRates();
    cache = { rates, fetchedAt: Date.now(), source: "live" };
  } catch (err) {
    logger.error("Exchange rate fetch failed, using fallback:", err.message);
    if (!cache.rates) {
      cache = { rates: pickSupported(FALLBACK_RATES), fetchedAt: Date.now(), source: "fallback" };
    }
  }
  return cache;
}

/** Convert an amount between two supported currencies using current rates. */
export async function convert(amount, from, to) {
  if (!amount) return 0;
  const { rates } = await getRates();
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;
  // Normalize to USD, then to the target currency.
  return (amount / fromRate) * toRate;
}

/** Convert an amount in the given currency to USD using current rates. */
export async function toUSD(amount, from) {
  return convert(amount, from, "USD");
}
