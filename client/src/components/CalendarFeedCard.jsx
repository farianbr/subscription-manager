import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import toast from "react-hot-toast";
import {
  HiOutlineCalendar,
  HiOutlineClipboardCopy,
  HiOutlineRefresh,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import {
  GET_CALENDAR_FEED,
  REGENERATE_CALENDAR_TOKEN,
  GOOGLE_CALENDAR_STATUS,
  SYNC_GOOGLE_CALENDAR,
  DISCONNECT_GOOGLE_CALENDAR,
} from "../graphql/queries/calendar.queries";
import { GOOGLE_CALENDAR_CONNECT_URL } from "../lib/apiBase";

/** Premium calendar integration: Google Calendar sync + a private .ics feed. */
const CalendarFeedCard = () => {
  const { data: statusData, loading: statusLoading } = useQuery(GOOGLE_CALENDAR_STATUS);
  const status = statusData?.googleCalendarStatus;

  return (
    <div className="space-y-4">
      {status?.configured && <GoogleCalendarSection status={status} loading={statusLoading} />}
      <IcsFeedSection googleConfigured={status?.configured} />
    </div>
  );
};

const GoogleCalendarSection = ({ status }) => {
  const [sync, { loading: syncing }] = useMutation(SYNC_GOOGLE_CALENDAR);
  const [disconnect, { loading: disconnecting }] = useMutation(DISCONNECT_GOOGLE_CALENDAR, {
    update: (cache, { data }) => {
      if (data?.disconnectGoogleCalendar) {
        cache.writeQuery({
          query: GOOGLE_CALENDAR_STATUS,
          data: { googleCalendarStatus: data.disconnectGoogleCalendar },
        });
      }
    },
  });
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const handleSync = async () => {
    try {
      const { data } = await sync();
      toast.success(`Synced ${data?.syncGoogleCalendar?.synced ?? 0} subscription(s) to Google Calendar`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDisconnect = async () => {
    if (!confirmDisconnect) {
      setConfirmDisconnect(true);
      return;
    }
    try {
      await disconnect();
      setConfirmDisconnect(false);
      toast.success("Google Calendar disconnected");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-1">
        <HiOutlineCalendar className="w-5 h-5 text-accent" aria-hidden="true" />
        <h3 className="text-base font-semibold text-foreground">Google Calendar</h3>
      </div>

      {status.connected ? (
        <>
          <div className="flex items-center gap-2 mb-4 text-sm text-foreground">
            <HiOutlineCheckCircle className="w-5 h-5 text-green-600 shrink-0" aria-hidden="true" />
            <span>
              Connected{status.email ? ` as ${status.email}` : ""}. New, edited, and removed
              subscriptions sync automatically.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-accent-fg rounded-lg transition-colors disabled:opacity-50"
            >
              <HiOutlineRefresh className="w-4 h-4" aria-hidden="true" />
              {syncing ? "Syncing..." : "Sync existing subscriptions"}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="text-sm font-medium text-danger hover:underline transition-colors disabled:opacity-50"
            >
              {disconnecting
                ? "Disconnecting..."
                : confirmDisconnect
                ? "Click again to confirm disconnect"
                : "Disconnect"}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted mb-4">
            Automatically add, update, and remove your subscription renewals in your Google
            Calendar. Existing subscriptions are added the moment you connect.
          </p>
          <a
            href={GOOGLE_CALENDAR_CONNECT_URL}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-accent-fg rounded-lg transition-colors"
          >
            <HiOutlineCalendar className="w-4 h-4" aria-hidden="true" />
            Connect Google Calendar
          </a>
        </>
      )}
    </div>
  );
};

const IcsFeedSection = ({ googleConfigured }) => {
  const { data, loading, error } = useQuery(GET_CALENDAR_FEED);
  const [regenerate, { loading: regenerating }] = useMutation(REGENERATE_CALENDAR_TOKEN, {
    update: (cache, { data: res }) => {
      if (res?.regenerateCalendarToken) {
        cache.writeQuery({
          query: GET_CALENDAR_FEED,
          data: { calendarFeed: res.regenerateCalendarToken },
        });
      }
    },
  });
  const [confirming, setConfirming] = useState(false);

  const feed = data?.calendarFeed;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(feed.url);
      toast.success("Feed URL copied");
    } catch {
      toast.error("Couldn't copy — select and copy manually");
    }
  };

  const handleRegenerate = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    try {
      await regenerate();
      setConfirming(false);
      toast.success("New calendar link generated");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-1">
        <HiOutlineCalendar className="w-5 h-5 text-muted" aria-hidden="true" />
        <h3 className="text-base font-semibold text-foreground">
          {googleConfigured ? "Or subscribe from any calendar app" : "Calendar feed"}
        </h3>
      </div>
      <p className="text-sm text-muted mb-4">
        Subscribe in Apple, Outlook, or Google Calendar to see every renewal. Keep this link
        private — anyone with it can view your renewals.
      </p>

      {loading ? (
        <div className="h-10 rounded-lg bg-surface-2 animate-pulse" />
      ) : error ? (
        <p className="text-sm text-danger">{error.message}</p>
      ) : (
        <>
          <div className="flex items-stretch gap-2">
            <input
              readOnly
              value={feed.url}
              onFocus={(e) => e.target.select()}
              className="flex-1 min-w-0 px-3 py-2 text-sm bg-surface-2 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={copy}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-surface-2 hover:bg-border text-foreground rounded-lg transition-colors"
            >
              <HiOutlineClipboardCopy className="w-4 h-4" aria-hidden="true" />
              Copy
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <a href={feed.webcalUrl} className="text-sm font-medium text-accent hover:underline">
              Add to calendar
            </a>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              <HiOutlineRefresh className="w-4 h-4" aria-hidden="true" />
              {regenerating
                ? "Generating..."
                : confirming
                ? "Click again to confirm — old link stops working"
                : "Regenerate link"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarFeedCard;
