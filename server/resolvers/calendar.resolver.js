import crypto from "crypto";
import User from "../models/user.model.js";
import { requireFeature } from "../utils/planGuard.js";
import { FEATURES } from "../config/plans.js";
import { isGoogleConfigured, revokeToken, clearAccessCache } from "../services/googleCalendar.js";
import { backfillAll } from "../services/calendarSync.js";
import logger from "../utils/logger.js";

// Public base URL the .ics route is reachable at. In production the API and SPA
// share an origin; in dev the Express server (PORT) serves the feed.
function appBaseUrl() {
  return (
    process.env.APP_URL ||
    process.env.CLIENT_URL ||
    `http://localhost:${process.env.PORT || 4000}`
  ).replace(/\/$/, "");
}

function feedFor(token) {
  const base = appBaseUrl();
  const url = `${base}/calendar/${token}.ics`;
  return {
    token,
    url,
    webcalUrl: url.replace(/^https?:\/\//, "webcal://"),
  };
}

async function ensureToken(user) {
  if (user.calendarToken) return user.calendarToken;
  const token = crypto.randomBytes(24).toString("hex");
  await User.findByIdAndUpdate(user._id, { calendarToken: token });
  return token;
}

// Light per-user cooldown so a manual re-sync can't be spammed into the Google
// API (each call writes every subscription). In-memory; single-process app.
const SYNC_COOLDOWN_MS = 5000;
const lastSyncAt = new Map();
function assertSyncNotThrottled(userId) {
  const key = String(userId);
  const now = Date.now();
  if (now - (lastSyncAt.get(key) || 0) < SYNC_COOLDOWN_MS) {
    throw new Error("Please wait a few seconds before syncing again.");
  }
  lastSyncAt.set(key, now);
}

function statusOf(user) {
  const gc = user.googleCalendar || {};
  return {
    configured: isGoogleConfigured(),
    connected: Boolean(gc.connected),
    email: gc.email || null,
    connectedAt: gc.connectedAt ? new Date(gc.connectedAt).toISOString() : null,
  };
}

const calendarResolver = {
  Query: {
    calendarFeed: async (_, __, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      requireFeature(user, FEATURES.CALENDAR_INTEGRATION);

      const token = await ensureToken(user);
      return feedFor(token);
    },

    googleCalendarStatus: async (_, __, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      requireFeature(user, FEATURES.CALENDAR_INTEGRATION);
      return statusOf(user);
    },
  },

  Mutation: {
    regenerateCalendarToken: async (_, __, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      requireFeature(user, FEATURES.CALENDAR_INTEGRATION);

      const token = crypto.randomBytes(24).toString("hex");
      await User.findByIdAndUpdate(user._id, { calendarToken: token });
      logger.info(`Calendar token regenerated for user ${user._id}`);
      return feedFor(token);
    },

    syncGoogleCalendar: async (_, __, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      requireFeature(user, FEATURES.CALENDAR_INTEGRATION);
      if (!user.googleCalendar?.connected) {
        throw new Error("Connect Google Calendar first.");
      }
      assertSyncNotThrottled(user._id);
      const synced = await backfillAll(user);
      return { synced };
    },

    disconnectGoogleCalendar: async (_, __, context) => {
      const user = await context.getUser();
      if (!user) throw new Error("Unauthorized");
      requireFeature(user, FEATURES.CALENDAR_INTEGRATION);

      if (user.googleCalendar?.refreshToken) {
        await revokeToken(user.googleCalendar.refreshToken);
      }
      clearAccessCache(user._id);
      // Replacing the whole subdoc clears refreshToken/email/connectedAt.
      await User.findByIdAndUpdate(user._id, {
        googleCalendar: { connected: false },
      });

      const fresh = await User.findById(user._id);
      return statusOf(fresh);
    },
  },
};

export default calendarResolver;
