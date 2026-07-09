import { HiPlus, HiOutlineCalendar } from "react-icons/hi";
import { useCurrency } from "../../context/CurrencyContext";
import { formatMonthLabel } from "../../lib/dashboard";

/** Page heading with a data-aware subtitle and the primary add action. */
const DashboardHero = ({ model, onAdd, onReviewUpcoming }) => {
  const { formatCurrency } = useCurrency();
  const hasSubs = model.activeCount > 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-8 sm:pt-12 pb-7">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-muted mb-1.5">{formatMonthLabel(new Date())}</p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted mt-2 text-sm sm:text-[15px]">
          {hasSubs
            ? <>You're projected to spend <span className="font-medium text-foreground tnum">{formatCurrency(model.projectedMonthlyUSD)}</span> this month across {model.activeCount} subscription{model.activeCount > 1 ? "s" : ""}.</>
            : "Track your recurring spending in one calm place."}
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {hasSubs && model.upcoming.length > 0 && (
          <button
            onClick={onReviewUpcoming}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium text-foreground bg-surface border border-border hover:border-border-strong hover:bg-surface-2 transition-colors"
          >
            <HiOutlineCalendar className="w-4 h-4" aria-hidden="true" />
            Upcoming bills
          </button>
        )}
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full text-sm font-medium bg-accent hover:bg-accent-hover text-accent-fg transition-colors active:scale-[0.98]"
        >
          <HiPlus className="w-4 h-4" aria-hidden="true" />
          Add subscription
        </button>
      </div>
    </div>
  );
};

export default DashboardHero;
