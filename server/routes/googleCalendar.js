// Google Calendar OAuth routes (redirect-based, so they live outside GraphQL).
//
// The user identity is carried in a signed `state` token rather than the
// session cookie, because the OAuth callback is a cross-site navigation from
// Google and our session cookie is sameSite=strict in production — it would not
// be sent. The signed state is also the CSRF defense.

import User from "../models/user.model.js";
import { planHasFeature, FEATURES } from "../config/plans.js";
import { signState, verifyState } from "../utils/crypto.js";
import {
  isGoogleConfigured,
  buildAuthUrl,
  exchangeCode,
  fetchAccountEmail,
  encryptRefreshToken,
} from "../services/googleCalendar.js";
import { backfillAll } from "../services/calendarSync.js";
import { publicRouteLimiter } from "../middleware/rateLimit.js";
import logger from "../utils/logger.js";

function clientUrl() {
  return (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
}

// Always bounce back to the app's plan settings with a status flag.
function settingsRedirect(res, status) {
  res.redirect(`${clientUrl()}/settings?tab=plan&gcal=${status}`);
}

export function registerGoogleCalendarRoutes(app) {
  // Step 1 — begin the OAuth flow. Requires an authenticated Premium user
  // (this request is same-site, so the session cookie is present).
  app.get("/auth/google/calendar", publicRouteLimiter, (req, res) => {
    if (!isGoogleConfigured()) return settingsRedirect(res, "unconfigured");

    const user = req.user;
    if (!user) return res.redirect(`${clientUrl()}/login`);
    if (!planHasFeature(user.plan, FEATURES.CALENDAR_INTEGRATION)) {
      return settingsRedirect(res, "forbidden");
    }

    const state = signState({ uid: String(user._id) });
    return res.redirect(buildAuthUrl(state));
  });

  // Step 2 — OAuth callback. No session reliance: identity comes from `state`.
  app.get("/auth/google/calendar/callback", publicRouteLimiter, async (req, res) => {
    try {
      if (req.query.error) return settingsRedirect(res, "denied");

      const { code, state } = req.query;
      if (!code || !state) return settingsRedirect(res, "error");

      let payload;
      try {
        payload = verifyState(state);
      } catch {
        return settingsRedirect(res, "error");
      }

      const user = await User.findById(payload.uid);
      if (!user || !planHasFeature(user.plan, FEATURES.CALENDAR_INTEGRATION)) {
        return settingsRedirect(res, "forbidden");
      }

      const tokens = await exchangeCode(code);
      if (!tokens.refresh_token) {
        // Google only returns a refresh token on first consent; prompt=consent
        // forces it, but guard anyway.
        logger.error("Google OAuth returned no refresh_token");
        return settingsRedirect(res, "error");
      }

      const email = await fetchAccountEmail(tokens.access_token);
      user.googleCalendar = {
        connected: true,
        refreshToken: encryptRefreshToken(tokens.refresh_token),
        calendarId: "primary",
        email: email || undefined,
        connectedAt: new Date(),
      };
      await user.save();

      // Backfill existing subscriptions so the calendar is populated immediately.
      const fresh = await User.findById(user._id);
      backfillAll(fresh).catch((err) => logger.error("Backfill after connect failed:", err.message));

      return settingsRedirect(res, "connected");
    } catch (err) {
      logger.error("Google Calendar callback error:", err.message);
      return settingsRedirect(res, "error");
    }
  });
}
