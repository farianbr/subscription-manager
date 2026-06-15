import nodemailer from "nodemailer";
import dotenv from "dotenv";
import logger from "./logger.js";
dotenv.config();


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // use an App Password if 2FA is enabled
  },
});

export async function sendMail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"Subscription Manager" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    logger.info("Email sent:", info.messageId);
  } catch (err) {
    logger.error("Error sending email:", err);
  }
}