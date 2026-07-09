import { cn } from "../../lib/utils";

/** Accessible switch for renewal reminders. */
const ReminderToggle = ({ enabled, onToggle, loading = false, label = "Renewal reminders" }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      disabled={loading}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-200",
        "disabled:opacity-60 disabled:cursor-wait",
        enabled ? "bg-success" : "bg-border-strong"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          enabled ? "translate-x-[18px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
};

export default ReminderToggle;
