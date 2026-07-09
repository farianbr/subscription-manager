import { HiOutlineCalendar } from "react-icons/hi";
import { useCurrency } from "../../context/CurrencyContext";
import ProviderLogo from "./ProviderLogo";
import {
  relativeDueLabel,
  formatFullDate,
  daysUntil,
  titleCase,
} from "../../lib/dashboard";

const DueBadge = ({ date }) => {
  const days = daysUntil(date);
  const urgent = days !== null && days <= 3;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
        urgent ? "bg-warning-soft text-warning" : "bg-surface-2 text-muted"
      }`}
    >
      {relativeDueLabel(date)}
    </span>
  );
};

/** The next few bills in chronological order — what will I be charged next? */
const UpcomingPayments = ({ items, onSelect, onViewAll }) => {
  const { formatCurrency } = useCurrency();

  return (
    <section aria-labelledby="upcoming-heading" className="bg-surface rounded-3xl border border-border shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-3">
        <h2 id="upcoming-heading" className="text-[17px] font-semibold tracking-tight text-foreground">
          Upcoming payments
        </h2>
        {items.length > 0 && (
          <button
            onClick={onViewAll}
            className="text-[13px] font-medium text-muted hover:text-foreground transition-colors"
          >
            View all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="px-6 pb-8 pt-4 text-center">
          <HiOutlineCalendar className="w-8 h-8 text-muted/50 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-muted">No upcoming payments scheduled.</p>
        </div>
      ) : (
        <ul className="pb-2">
          {items.map(({ sub, date }) => (
            <li key={sub._id}>
              <button
                onClick={() => onSelect(sub)}
                className="w-full flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-3 text-left hover:bg-surface-2/60 transition-colors min-h-[56px]"
              >
                <ProviderLogo provider={sub.provider} name={sub.serviceName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {titleCase(sub.serviceName)}
                  </p>
                  <p className="text-xs text-muted mt-0.5 tnum">
                    {formatFullDate(date)} · <span className="capitalize">{sub.billingCycle}</span>
                  </p>
                </div>
                <div className="hidden sm:block">
                  <DueBadge date={date} />
                </div>
                <p className="text-sm font-semibold text-foreground tnum shrink-0">
                  {formatCurrency(sub.costInDollar)}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default UpcomingPayments;
