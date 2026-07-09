// Public, token-authenticated .ics feed. Calendar apps poll this URL without
// cookies, so it authenticates via the opaque calendarToken rather than a
// session. Entitlement is re-checked here so a downgrade stops the feed.

import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import { planHasFeature, FEATURES } from "../config/plans.js";
import { buildSubscriptionCalendar } from "../utils/ical.js";
import { publicRouteLimiter } from "../middleware/rateLimit.js";
import logger from "../utils/logger.js";

export function registerCalendarFeed(app) {
  app.get("/calendar/:file", publicRouteLimiter, async (req, res) => {
    try {
      const token = String(req.params.file || "").replace(/\.ics$/i, "");
      if (!token) return res.status(404).send("Not found");

      const user = await User.findOne({ calendarToken: token });
      if (!user || !planHasFeature(user.plan, FEATURES.CALENDAR_INTEGRATION)) {
        return res.status(404).send("Calendar not found");
      }

      const subscriptions = await Subscription.find({ userId: user._id });
      const ics = buildSubscriptionCalendar(subscriptions, {
        name: `${user.name}'s subscriptions`,
      });

      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.setHeader("Content-Disposition", 'inline; filename="subscriptions.ics"');
      res.setHeader("Cache-Control", "no-cache");
      return res.status(200).send(ics);
    } catch (err) {
      logger.error("Calendar feed error:", err);
      return res.status(500).send("Failed to build calendar");
    }
  });
}
