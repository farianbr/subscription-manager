import cron from "node-cron";
import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";

function getTomorrowBounds() {
  const now = new Date();
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  const start = new Date(tomorrow);
  const end = new Date(tomorrow);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

export function scheduleDailyReminders() {
  cron.schedule(
    "0 9 * * *",
    async () => {
      // 9:00 AM every day
      try {
        const { start, end } = getTomorrowBounds();

        // Find active subscriptions with nextBillingDate tomorrow and alerts enabled
        const subscriptions = await Subscription.find({
          nextBillingDate: { $gte: start, $lt: end },
          alertEnabled: true,
          alertSentForCurrentCycle: { $ne: true },
        }).lean();

        if (!subscriptions.length) return;

        // Email reminders are disabled - SendGrid subscription ended
        console.log(`Found ${subscriptions.length} subscriptions due tomorrow, but email reminders are disabled.`);

        // Mark that alert has been sent for this billing cycle
        await Subscription.updateMany(
          { _id: { $in: subscriptions.map((s) => s._id) } },
          { $set: { alertSentForCurrentCycle: true } }
        );
      } catch (err) {
        console.error("Reminder job error:", err);
      }
    },
    { timezone: "Asia/Dhaka" }
  );
}
