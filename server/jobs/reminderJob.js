import cron from "node-cron";
import Subscription from "../models/subscription.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { sendRenewalReminderEmail } from "../utils/emails.js";
import logger from "../utils/logger.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_LEAD_DAYS = 30; // upper bound on any user's reminderDaysBefore

function startOfTodayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function daysUntil(date) {
  return Math.ceil((new Date(date).getTime() - startOfTodayUTC().getTime()) / DAY_MS);
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

  const subscriptions = await Subscription.find({
    nextBillingDate: { $gte: today, $lt: horizon },
    alertEnabled: true,
    alertSentForCurrentCycle: { $ne: true },
  });

  if (!subscriptions.length) return 0;

  let sent = 0;
  for (const sub of subscriptions) {
    try {
      const user = await User.findById(sub.userId);
      if (!user) continue;

      const prefs = user.notificationPreferences || {};
      const leadDays = prefs.reminderDaysBefore ?? 1;
      if (daysUntil(sub.nextBillingDate) > leadDays) continue; // not yet within the window

      const renewalDate = new Date(sub.nextBillingDate).toLocaleDateString();
      const amountLabel = formatAmount(sub);

      // In-app notification (always created when a reminder fires).
      await Notification.create({
        userId: user._id,
        type: "reminder",
        title: `${sub.serviceName} renews soon`,
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
