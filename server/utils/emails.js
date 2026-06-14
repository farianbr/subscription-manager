// Transactional email templates built on top of the generic mailer.

import { sendMail } from "./mailer.js";

const wrapper = (inner) => `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
    ${inner}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
    <p style="color:#64748b;font-size:12px;">Subscription Manager</p>
  </div>
`;

export async function sendVerificationEmail({ to, name, verifyUrl }) {
  return sendMail({
    to,
    subject: "Verify your email",
    html: wrapper(`
      <h2 style="margin:0 0 12px;">Confirm your email</h2>
      <p>Hi ${name},</p>
      <p>Tap the button below to verify your email address. This link expires in 24 hours.</p>
      <a href="${verifyUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Verify Email</a>
      <p style="color:#64748b;font-size:13px;">If you didn't create an account, you can ignore this email.</p>
    `),
    text: `Verify your email: ${verifyUrl}\n\nThis link expires in 24 hours.`,
  });
}

export async function sendRenewalReminderEmail({ to, name, serviceName, amountLabel, renewalDate }) {
  return sendMail({
    to,
    subject: `Reminder: ${serviceName} renews soon`,
    html: wrapper(`
      <h2 style="margin:0 0 12px;">Upcoming renewal</h2>
      <p>Hi ${name},</p>
      <p>Your <strong>${serviceName}</strong> subscription (${amountLabel}) renews on <strong>${renewalDate}</strong>.</p>
      <p style="color:#64748b;font-size:13px;">You're receiving this because reminders are enabled for this subscription. You can turn them off in Settings.</p>
    `),
    text: `Reminder: your ${serviceName} subscription (${amountLabel}) renews on ${renewalDate}.`,
  });
}
