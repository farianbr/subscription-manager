import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import toast from "react-hot-toast";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";
import {
  UPDATE_NOTIFICATION_PREFERENCES,
  RESEND_VERIFICATION,
} from "../graphql/mutations/user.mutation";

const NotificationSettings = () => {
  const { data } = useQuery(GET_AUTHENTICATED_USER);
  const [updatePrefs, { loading }] = useMutation(UPDATE_NOTIFICATION_PREFERENCES);
  const [resend, { loading: resending }] = useMutation(RESEND_VERIFICATION);

  const user = data?.authUser;
  const [prefs, setPrefs] = useState({
    emailReminders: true,
    reminderDaysBefore: 1,
    productUpdates: false,
  });

  useEffect(() => {
    if (user?.notificationPreferences) {
      const { emailReminders, reminderDaysBefore, productUpdates } = user.notificationPreferences;
      setPrefs({ emailReminders, reminderDaysBefore, productUpdates });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updatePrefs({ variables: { input: prefs } });
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

        <div className="p-4 bg-surface-2 rounded-xl border border-border">
          <label className="block text-sm font-medium text-foreground mb-1.5">Remind me this many days before renewal</label>
          <input
            type="number"
            min="0"
            max="30"
            value={prefs.reminderDaysBefore}
            onChange={(e) => setPrefs({ ...prefs, reminderDaysBefore: Number(e.target.value) })}
            className="w-24 px-3 py-2 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

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
