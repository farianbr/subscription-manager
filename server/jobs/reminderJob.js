import cron from "node-cron";
import Transaction from "../models/transaction.model.js";
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
  console.log("bounds", start, end);

  return { start, end };
}

export function scheduleDailyReminders() {
  cron.schedule(
    "* * * * *",
    async () => {
      // 9:00 AM every day
      try {
        const { start, end } = getTomorrowBounds();

        const txns = await Transaction.find({
          endDate: { $gte: start, $lt: end },
          alertEnabled: true,
          alertSentForDateMinus1: { $ne: true },
        }).lean();

        console.log("txns", txns);

        if (!txns.length) return;

        for (const txn of txns) {
          const user = await User.findById(txn.userId).lean();
          if (!user?.email) continue;

          await sendMail({
            to: user.email,
            subject: `Reminder: ${txn.description} renews tomorrow`,
            text: `Hi ${user.name || "there"},

Your ${txn.description} of $${txn.amount} is due tomorrow.

---
You are receiving this email because you enabled alerts in Subscription Manager.
If you no longer wish to receive these, you can disable alerts in your account settings.
Subscription Manager • yourdomain.com
`,

            html: `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333">
      <p>Hi ${user.name || "there"},</p>
      <p>Your <strong>${txn.description}</strong> of <strong>$${
              txn.amount
            }</strong> is due tomorrow.</p>

      <hr style="margin:20px 0; border:none; border-top:1px solid #ddd;" />

      <footer style="font-size:12px; color:#777">
        <p>You are receiving this email because you enabled alerts in Subscription Manager.</p>
        <p>If you no longer wish to receive these, you can disable alerts in your account settings.</p>
        <p>Subscription Manager • <a href="https://yourdomain.com" style="color:#555">yourdomain.com</a></p>
      </footer>
    </div>
  `,
          });
        }

        await Transaction.updateMany(
          { _id: { $in: txns.map((t) => t._id) } },
          { $set: { alertSentForDateMinus1: true } }
        );
      } catch (err) {
        console.error("Reminder job error:", err);
      }
    },
    { timezone: "Asia/Dhaka" }
  );
}
