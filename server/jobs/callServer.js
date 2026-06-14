import cron from "node-cron";
import https from "https";

// Keep-alive self-ping for free-tier hosts that sleep on inactivity (e.g. Render).
// Configure SELF_PING_URL to enable; it is a no-op otherwise.
const URL = process.env.SELF_PING_URL;

const task = cron.schedule(
  "*/14 * * * *",
  function () {
    if (!URL) return;
    https
      .get(URL, (res) => {
        if (res.statusCode === 200) {
          console.log("Keep-alive ping sent successfully");
        } else {
          console.log("Keep-alive ping failed", res.statusCode);
        }
      })
      .on("error", (e) => {
        console.error("Error while sending keep-alive ping", e);
      });
  },
  { timezone: "Asia/Dhaka", scheduled: false }
);

export default {
  start() {
    if (!URL) {
      console.log("SELF_PING_URL not set — keep-alive ping disabled.");
      return;
    }
    task.start();
    console.log("Keep-alive ping job started");
  },
};
