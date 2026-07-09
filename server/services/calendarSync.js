// Bridges subscription changes to Google Calendar. Every function is
// best-effort: a calendar failure is logged but never breaks the underlying
// subscription mutation. Guarded so it no-ops unless the user has connected.

import Subscription from "../models/subscription.model.js";
import {
  isGoogleConfigured,
  upsertEvent,
  deleteEvent,
} from "./googleCalendar.js";
import logger from "../utils/logger.js";

function syncEnabled(user) {
  return isGoogleConfigured() && user?.googleCalendar?.connected;
}

export async function syncOnCreate(user, sub) {
  if (!syncEnabled(user)) return;
  try {
    const eventId = await upsertEvent(user, sub);
    if (eventId && eventId !== sub.googleEventId) {
      await Subscription.updateOne({ _id: sub._id }, { googleEventId: eventId });
    }
  } catch (err) {
    logger.error(`Calendar sync (create) failed for sub ${sub._id}:`, err.message);
  }
}

export async function syncOnUpdate(user, sub) {
  if (!syncEnabled(user)) return;
  try {
    const eventId = await upsertEvent(user, sub);
    if (eventId && eventId !== sub.googleEventId) {
      await Subscription.updateOne({ _id: sub._id }, { googleEventId: eventId });
    }
  } catch (err) {
    logger.error(`Calendar sync (update) failed for sub ${sub._id}:`, err.message);
  }
}

export async function syncOnDelete(user, sub) {
  if (!syncEnabled(user)) return;
  try {
    await deleteEvent(user, sub);
  } catch (err) {
    logger.error(`Calendar sync (delete) failed for sub ${sub._id}:`, err.message);
  }
}

/**
 * Push all of a user's subscriptions to their calendar (used right after they
 * connect, and for a manual re-sync). Returns how many events were written.
 */
export async function backfillAll(user) {
  if (!syncEnabled(user)) return 0;
  const subscriptions = await Subscription.find({ userId: user._id });
  let synced = 0;
  for (const sub of subscriptions) {
    try {
      const eventId = await upsertEvent(user, sub);
      if (eventId && eventId !== sub.googleEventId) {
        await Subscription.updateOne({ _id: sub._id }, { googleEventId: eventId });
      }
      synced += 1;
    } catch (err) {
      logger.error(`Calendar backfill failed for sub ${sub._id}:`, err.message);
    }
  }
  return synced;
}
