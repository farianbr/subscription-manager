import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from "react-icons/hi";
import { useTheme } from "../../context/ThemeContext";
import { useCurrency } from "../../context/CurrencyContext";
import ProviderLogo from "./ProviderLogo";
import ReminderToggle from "./ReminderToggle";
import OverflowMenu from "./OverflowMenu";
import { getCategoryColor } from "../../lib/palette";
import {
  parseBillingDate,
  relativeDueLabel,
  formatFullDate,
  titleCase,
} from "../../lib/dashboard";

export const ROW_GRID =
  "md:grid md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_88px_48px] md:items-center md:gap-3";

/** One subscription as a desktop table row. */
const SubscriptionRow = ({ subscription, onOpen, onEdit, onDelete, onToggleReminder, reminderUpdating }) => {
  const { theme } = useTheme();
  const { formatCurrency } = useCurrency();

  const nextDate = parseBillingDate(subscription.nextBillingDate);
  const name = titleCase(subscription.serviceName);

  return (
    <li className={`${ROW_GRID} group relative hidden md:grid px-4 lg:px-5 py-3 rounded-xl hover:bg-surface-2/60 transition-colors`}>
      {/* Service — the row's main open action */}
      <button
        onClick={() => onOpen(subscription)}
        className="flex items-center gap-3 min-w-0 text-left"
        aria-label={`View details for ${name}`}
      >
        {/* Stretch the click target across the row; controls sit above it. */}
        <span className="absolute inset-0 rounded-xl" aria-hidden="true" />
        <ProviderLogo provider={subscription.provider} name={name} size="md" />
        <span className="min-w-0">
          <span className="block text-sm font-medium text-foreground truncate">{name}</span>
          <span className="block text-xs text-muted capitalize truncate">{subscription.provider}</span>
        </span>
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <span
          aria-hidden="true"
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: getCategoryColor(subscription.category, theme) }}
        />
        <span className="text-sm text-muted capitalize truncate">{subscription.category}</span>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground tnum">{formatCurrency(subscription.costInDollar)}</p>
        <p className="text-xs text-muted capitalize">{subscription.billingCycle}</p>
      </div>

      <div className="min-w-0">
        <p className="text-sm text-foreground tnum">{formatFullDate(nextDate)}</p>
        <p className="text-xs text-muted">{relativeDueLabel(nextDate)}</p>
      </div>

      <div className="relative flex justify-center">
        <ReminderToggle
          enabled={subscription.alertEnabled}
          loading={reminderUpdating}
          onToggle={() => onToggleReminder(subscription)}
          label={`Renewal reminders for ${name}`}
        />
      </div>

      <div className="relative flex justify-end">
        <OverflowMenu
          label={`Actions for ${name}`}
          items={[
            { label: "View details", icon: HiOutlineEye, onClick: () => onOpen(subscription) },
            { label: "Edit", icon: HiOutlinePencil, onClick: () => onEdit(subscription) },
            { label: "Delete", icon: HiOutlineTrash, danger: true, onClick: () => onDelete(subscription) },
          ]}
        />
      </div>
    </li>
  );
};

export default SubscriptionRow;
