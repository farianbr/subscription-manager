// Error-tracking seam. Today it just routes exceptions to the logger; when a
// SENTRY_DSN (or similar) is provided this is the single place to wire a real
// provider so the rest of the app keeps calling captureException() unchanged.
//
// Mirrors the Stripe seam in services/billing.js: mock-by-default, with one
// obvious integration point.

import logger from "../utils/logger.js";

const dsn = process.env.SENTRY_DSN;
let provider = null; // becomes the real client once a provider is wired up

/** Call once at startup. Safe to call when no DSN is configured. */
export function initErrorTracking() {
  if (!dsn) {
    logger.info("Error tracking: disabled (SENTRY_DSN unset) — exceptions go to logs only.");
    return;
  }

  // TODO: integrate a provider, e.g.
  //   import * as Sentry from "@sentry/node";
  //   Sentry.init({ dsn, environment: process.env.NODE_ENV });
  //   provider = Sentry;
  logger.warn(
    "Error tracking: SENTRY_DSN is set but no provider SDK is wired yet — capturing to logs only."
  );
}

/**
 * Record an exception. Always logs; forwards to the provider when configured.
 * @param {unknown} error
 * @param {Record<string, unknown>} [context] extra tags/metadata
 */
export function captureException(error, context = {}) {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error(`Captured exception: ${err.message}`, { ...context, stack: err.stack });

  if (provider) {
    try {
      provider.captureException(err, { extra: context });
    } catch (forwardErr) {
      logger.error("Failed to forward exception to tracking provider:", forwardErr);
    }
  }
}
