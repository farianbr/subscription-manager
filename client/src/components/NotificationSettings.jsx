import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import toast from "react-hot-toast";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";
import {
  UPDATE_NOTIFICATION_PREFERENCES,
  RESEND_VERIFICATION,
} from "../graphql/mutations/user.mutation";
import { usePlan, FEATURES } from "../lib/plan";

// Preset lead times (days before renewal) offered for advanced reminders.
const LEAD_PRESETS = [
  { days: 14, label: "2 weeks" },
  { days: 7, label: "1 week" },
  { days: 3, label: "3 days" },
  { days: 1, label: "1 day" },
  { days: 0, label: "Day of" },
];

const NotificationSettings = () => {
  const { data } = useQuery(GET_AUTHENTICATED_USER);
  const [updatePrefs, { loading }] = useMutation(UPDATE_NOTIFICATION_PREFERENCES);
  const [resend, { loading: resending }] = useMutation(RESEND_VERIFICATION);
  const { hasFeature } = usePlan();
  const advanced = hasFeature(FEATURES.ADVANCED_REMINDERS);

  const user = data?.authUser;
  const [prefs, setPrefs] = useState({
    emailReminders: true,
    reminderDaysBefore: 1,
    reminderLeadDays: [],
    productUpdates: false,
  });

  useEffect(() => {
    if (user?.notificationPreferences) {
      const { emailReminders, reminderDaysBefore, reminderLeadDays, productUpdates } =
        user.notificationPreferences;
      setPrefs({
        emailReminders,
        reminderDaysBefore,
        reminderLeadDays: reminderLeadDays || [],
        productUpdates,
      });
    }
  }, [user]);

  const toggleLead = (days) => {
    setPrefs((p) => {
      const has = p.reminderLeadDays.includes(days);
      const next = has
        ? p.reminderLeadDays.filter((d) => d !== days)
        : [...p.reminderLeadDays, days];
      return { ...p, reminderLeadDays: next.sort((a, b) => b - a) };
    });
  };

  const handleSave = async () => {
    try {
      // Only send fields the current plan is allowed to change. reminderLeadDays
      // is gated server-side; free users never include it.
      const input = {
        emailReminders: prefs.emailReminders,
        reminderDaysBefore: prefs.reminderDaysBefore,
        productUpdates: prefs.productUpdates,
      };
      if (advanced) input.reminderLeadDays = prefs.reminderLeadDays;
      await updatePrefs({ variables: { input } });
      toast.success("Notification preferences saved");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResend = async () => {
    try {
      const { data: res } = await resend();
      toast.success(res?.resendVerificationEmail?.message || "Verification email sent");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-xl">
      {/* Email verification status */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Email Verification</h3>
        {user?.emailVerified ? (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-100 rounded-lg">
            <span className="text-green-600 font-medium text-sm">✓ Your email is verified</span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 p-4 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-sm text-amber-800">Your email address isn't verified yet.</p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend"}
            </button>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Preferences</h3>

        <label className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
          <div>
            <p className="text-sm font-medium text-foreground">Email renewal reminders</p>
            <p className="text-xs text-muted">Get an email before a subscription renews</p>
          </div>
          <input
            type="checkbox"
            checked={prefs.emailReminders}
            onChange={(e) => setPrefs({ ...prefs, emailReminders: e.target.checked })}
            className="w-4 h-4 text-accent border-border rounded focus:ring-accent"
          />
        </label>

        {advanced ? (
          <div className="p-4 bg-surface-2 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-foreground">
                Remind me before each renewal
              </label>
              <span className="text-[11px] font-medium text-accent uppercase tracking-wide">
                Premium
              </span>
            </div>
            <p className="text-xs text-muted mb-3">
              Pick one or more lead times — you'll get a reminder at each.
            </p>
            <div className="flex flex-wrap gap-2">
              {LEAD_PRESETS.map((preset) => {
                const selected = prefs.reminderLeadDays.includes(preset.days);
                return (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => toggleLead(preset.days)}
                    aria-pressed={selected}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      selected
                        ? "bg-accent text-accent-fg border-accent"
                        : "bg-surface text-muted border-border hover:text-foreground"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            {prefs.reminderLeadDays.length === 0 && (
              <p className="text-xs text-muted mt-3">
                No lead times selected — falls back to a single reminder {prefs.reminderDaysBefore}{" "}
                day{prefs.reminderDaysBefore === 1 ? "" : "s"} before.
              </p>
            )}
          </div>
        ) : (
          <div className="p-4 bg-surface-2 rounded-xl border border-border">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Remind me this many days before renewal
            </label>
            <input
              type="number"
              min="0"
              max="30"
              value={prefs.reminderDaysBefore}
              onChange={(e) => setPrefs({ ...prefs, reminderDaysBefore: Number(e.target.value) })}
              className="w-24 px-3 py-2 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-xs text-muted mt-2">
              Upgrade to Premium to set multiple reminders — e.g. a week before and the day before.
            </p>
          </div>
        )}

        <label className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
          <div>
            <p className="text-sm font-medium text-foreground">Product updates</p>
            <p className="text-xs text-muted">Occasional news about new features</p>
          </div>
          <input
            type="checkbox"
            checked={prefs.productUpdates}
            onChange={(e) => setPrefs({ ...prefs, productUpdates: e.target.checked })}
            className="w-4 h-4 text-accent border-border rounded focus:ring-accent"
          />
        </label>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-hover text-accent-fg py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
