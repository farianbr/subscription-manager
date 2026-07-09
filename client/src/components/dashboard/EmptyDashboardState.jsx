import { HiPlus, HiOutlineCreditCard, HiOutlineBell, HiOutlineChartBar } from "react-icons/hi";

/** First-run state: an icon composition from existing assets, one clear action. */
const EmptyDashboardState = ({ onAdd }) => {
  return (
    <div className="bg-surface rounded-3xl border border-border shadow-[var(--shadow-card)] px-6 py-16 sm:py-20 text-center">
      <div className="flex items-center justify-center gap-3 mb-7" aria-hidden="true">
        <span className="p-3 rounded-2xl bg-surface-2 border border-border -rotate-6 translate-y-1">
          <HiOutlineChartBar className="w-6 h-6 text-muted" />
        </span>
        <span className="p-4 rounded-2xl bg-surface-2 border border-border shadow-[var(--shadow-lifted)]">
          <HiOutlineCreditCard className="w-7 h-7 text-foreground" />
        </span>
        <span className="p-3 rounded-2xl bg-surface-2 border border-border rotate-6 translate-y-1">
          <HiOutlineBell className="w-6 h-6 text-muted" />
        </span>
      </div>

      <h2 className="text-xl font-semibold tracking-tight text-foreground mb-2">
        No subscriptions yet
      </h2>
      <p className="text-sm text-muted max-w-sm mx-auto mb-7">
        Add your first subscription to see your monthly outlook, upcoming
        payments, and where your money goes.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-full bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium transition-colors active:scale-[0.98]"
      >
        <HiPlus className="w-4 h-4" aria-hidden="true" />
        Add your first subscription
      </button>
    </div>
  );
};

export default EmptyDashboardState;
