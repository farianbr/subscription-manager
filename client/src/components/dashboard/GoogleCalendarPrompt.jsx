import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { HiOutlineCalendar, HiX } from "react-icons/hi";
import { GOOGLE_CALENDAR_STATUS } from "../../graphql/queries/calendar.queries";
import { GOOGLE_CALENDAR_CONNECT_URL } from "../../lib/apiBase";

const DISMISS_KEY = "gcal-prompt-dismissed";

/**
 * Nudges a Premium user to connect Google Calendar when they haven't yet.
 * Covers both "just went Premium" and "already had subscriptions" — both are
 * simply the not-connected state. Dismissible; only shown when the server has
 * Google configured. Render only when the user has subscriptions.
 */
const GoogleCalendarPrompt = () => {
  const { data } = useQuery(GOOGLE_CALENDAR_STATUS);
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY) === "1"
  );

  const status = data?.googleCalendarStatus;
  if (dismissed || !status?.configured || status.connected) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="flex items-start gap-3 bg-accent/10 border border-accent/20 rounded-2xl p-4">
      <HiOutlineCalendar className="w-5 h-5 text-accent mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">Sync renewals to Google Calendar</p>
        <p className="text-[13px] text-muted mt-0.5">
          Connect your Google Calendar to automatically track every subscription renewal —
          your existing ones are added right away.
        </p>
        <a
          href={GOOGLE_CALENDAR_CONNECT_URL}
          className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-accent-fg rounded-lg transition-colors"
        >
          Connect Google Calendar
        </a>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="p-1 text-muted hover:text-foreground transition-colors shrink-0"
      >
        <HiX className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default GoogleCalendarPrompt;
