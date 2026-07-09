import cron from "node-cron";
import Subscription from "../models/subscription.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { sendRenewalReminderEmail } from "../utils/emails.js";
import { userHasFeature } from "../utils/planGuard.js";
import { FEATURES } from "../config/plans.js";
import logger from "../utils/logger.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_LEAD_DAYS = 30; // upper bound on any user's reminder lead time

function startOfTodayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function daysUntil(date) {
  return Math.ceil((new Date(date).getTime() - startOfTodayUTC().getTime()) / DAY_MS);
}

/**
 * The lead times (days before renewal) at which this user should be reminded.
 * Premium users with "advanced reminders" configured get multiple; everyone
 * else gets a single reminder at reminderDaysBefore.
 */
export function resolveLeadDays(user) {
  const prefs = user.notificationPreferences || {};
  const advanced = prefs.reminderLeadDays?.length &&
    userHasFeature(user, FEATURES.ADVANCED_REMINDERS);
  if (advanced) return [...prefs.reminderLeadDays];
  return [prefs.reminderDaysBefore ?? 1];
}

function formatAmount(sub) {
  if (sub.originalAmount != null && sub.originalCurrency) {
    return `${sub.originalCurrency} ${sub.originalAmount}`;
  }
  return `$${(sub.costInDollar ?? 0).toFixed(2)}`;
}

// Process renewals due within the next MAX_LEAD_DAYS and notify per user prefs.
export async function processRenewalReminders() {
  const today = startOfTodayUTC();
  const horizon = new Date(today.getTime() + (MAX_LEAD_DAYS + 1) * DAY_MS);

  // Fetch every enabled subscription in the reminder window. We can't pre-filter
  // on "already sent" here because advanced reminders fire more than once per
  // cycle at different lead times — that decision is made per-lead below.
  const subscriptions = await Subscription.find({
    nextBillingDate: { $gte: today, $lt: horizon },
    alertEnabled: true,
  });

  if (!subscriptions.length) return 0;

  let sent = 0;
  for (const sub of subscriptions) {
    try {
      const user = await User.findById(sub.userId);
      if (!user) continue;

      const prefs = user.notificationPreferences || {};
      const leadDays = resolveLeadDays(user);
      const remaining = daysUntil(sub.nextBillingDate);
      const alreadySent = sub.remindersSentDays || [];

      // Lead thresholds that have been reached but not yet notified for this cycle.
      const dueLeads = leadDays.filter((l) => remaining <= l);
      const unsentDue = dueLeads.filter((l) => !alreadySent.includes(l));
      if (unsentDue.length === 0) continue; // nothing new to send yet

      const renewalDate = new Date(sub.nextBillingDate).toLocaleDateString();
      const amountLabel = formatAmount(sub);
      const whenLabel =
        remaining <= 0 ? "today" : remaining === 1 ? "tomorrow" : `in ${remaining} days`;

      // In-app notification (always created when a reminder fires). We send a
      // single notification even if several lead times came due at once (e.g.
      // after a missed run) to avoid spamming.
      await Notification.create({
        userId: user._id,
        type: "reminder",
        title: `${sub.serviceName} renews ${whenLabel}`,
        message: `Your ${sub.serviceName} subscription (${amountLabel}) renews on ${renewalDate}.`,
        subscriptionId: sub._id,
      });

      // Email reminder, only if enabled and the address is verified.
      if (prefs.emailReminders !== false && user.emailVerified) {
        await sendRenewalReminderEmail({
          to: user.email,
          name: user.name,
          serviceName: sub.serviceName,
          amountLabel,
          renewalDate,
        });
      }

      // Mark every lead that has come due as sent — including any missed larger
      // ones — so a late run doesn't later fire a redundant reminder.
      sub.remindersSentDays = [...new Set([...alreadySent, ...dueLeads])];
      sub.alertSentForCurrentCycle = true;
      await sub.save();
      sent += 1;
    } catch (err) {
      logger.error(`Reminder failed for subscription ${sub._id}:`, err.message);
    }
  }
  return sent;
}

export function scheduleDailyReminders() {
  cron.schedule(
    "0 9 * * *", // 9:00 AM daily
    async () => {
      try {
        const count = await processRenewalReminders();
        logger.info(`Reminder job: ${count} reminder(s) sent.`);
      } catch (err) {
        logger.error("Reminder job error:", err);
      }
    },
    { timezone: "Asia/Dhaka" }
  );
}
