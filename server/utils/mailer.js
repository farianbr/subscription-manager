import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();


export const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false, // TLS is auto-upgraded
  auth: {
    user: process.env.SENDGRID_USER, 
    pass: process.env.SENDGRID_PASS, 
  },
});

export async function sendMail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: '"Subscription Manager" <farianrahman1000@gmail.com>', // use a verified sender
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}
