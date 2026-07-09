import { useState, useRef, useEffect } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_NOTIFICATIONS } from "../graphql/queries/notification.queries";
import {
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
} from "../graphql/mutations/notification.mutation";

function timeAgo(ts) {
  const date = new Date(isNaN(ts) ? ts : parseInt(ts));
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data } = useQuery(GET_NOTIFICATIONS, {
    variables: { limit: 20 },
    pollInterval: 60000, // refresh unread count periodically
  });
  const [markRead] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ, {
    refetchQueries: ["GetNotifications"],
  });

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const notifications = data?.notifications || [];
  const unread = data?.unreadNotificationCount || 0;

  const handleOpenItem = (n) => {
    if (!n.read) markRead({ variables: { notificationId: n._id } });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-muted hover:text-foreground hover:bg-surface-2 rounded-full transition-colors duration-200"
        title="Notifications"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
      >
        <IoNotificationsOutline className="w-5 h-5" />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-foreground ring-2 ring-surface"
          />
        )}
      </button>

      {open && (
        <div className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-80 bg-surface rounded-xl shadow-lg border border-border overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-foreground text-sm">Notifications</span>
            {unread > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-xs text-accent hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">You're all caught up</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleOpenItem(n)}
                  className={`w-full text-left px-4 py-3 border-b border-border hover:bg-surface-2 transition-colors ${
                    n.read ? "" : "bg-accent/5"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0" />}
                    <div className={n.read ? "pl-4" : ""}>
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted mt-0.5">{n.message}</p>
                      <p className="text-[11px] text-muted mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
