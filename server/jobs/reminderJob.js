import cron from "node-cron";
import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";
import { sendMail } from "../utils/mailer.js";

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
          status: "active", // Only send reminders for active subscriptions
        }).lean();

        if (!subscriptions.length) return;

        for (const subscription of subscriptions) {
          const user = await User.findById(subscription.userId).lean();
          if (!user?.email) continue;

          await sendMail({
            to: user.email,
            subject: `Reminder: ${subscription.description} renews tomorrow`,
            text: `Hi ${user.name || "there"},

Your ${subscription.description} subscription of $${subscription.amount} is due tomorrow.

---
You are receiving this email because you enabled alerts in Subscription Manager.
If you no longer wish to receive these, you can disable alerts in your account settings.
Subscription Manager • yourdomain.com
`,

            html: `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333">
      <p>Hi ${user.name || "there"},</p>
      <p>Your <strong>${subscription.description}</strong> subscription of <strong>$${
              subscription.amount
            }</strong> is due tomorrow.</p>

      <hr style="margin:20px 0; border:none; border-top:1px solid #ddd;" />

      <footer style="font-size:12px; color:#777">
        <p>You are receiving this email because you enabled alerts in Subscription Manager.</p>
        <p>If you no longer wish to receive these, you can disable alerts in your account settings.</p>
        <p>Subscription Manager • <a href="https://subscription-manager-qgi7.onrender.com/" style="color:#555">subscription-manager.com</a></p>
      </footer>
    </div>
  `,
          });
        }

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
