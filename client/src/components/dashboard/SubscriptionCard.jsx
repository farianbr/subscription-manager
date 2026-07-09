import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from "react-icons/hi";
import { useTheme } from "../../context/ThemeContext";
import { useCurrency } from "../../context/CurrencyContext";
import ProviderLogo from "./ProviderLogo";
import ReminderToggle from "./ReminderToggle";
import OverflowMenu from "./OverflowMenu";
import { getCategoryColor } from "../../lib/palette";
import { parseBillingDate, relativeDueLabel, titleCase } from "../../lib/dashboard";

/** One subscription as a compact mobile card. */
const SubscriptionCard = ({ subscription, onOpen, onEdit, onDelete, onToggleReminder, reminderUpdating }) => {
  const { theme } = useTheme();
  const { formatCurrency } = useCurrency();

  const nextDate = parseBillingDate(subscription.nextBillingDate);
  const name = titleCase(subscription.serviceName);

  return (
    <li className="md:hidden relative bg-surface border border-border rounded-2xl p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onOpen(subscription)}
          className="flex items-start gap-3 flex-1 min-w-0 text-left"
          aria-label={`View details for ${name}`}
        >
          <span className="absolute inset-0 rounded-2xl" aria-hidden="true" />
          <ProviderLogo provider={subscription.provider} name={name} size="md" />
          <span className="min-w-0">
            <span className="block text-[15px] font-medium text-foreground truncate">{name}</span>
            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: getCategoryColor(subscription.category, theme) }}
              />
              <span className="capitalize truncate">{subscription.category}</span>
            </span>
          </span>
        </button>

        <div className="relative shrink-0">
          <OverflowMenu
            label={`Actions for ${name}`}
            items={[
              { label: "View details", icon: HiOutlineEye, onClick: () => onOpen(subscription) },
              { label: "Edit", icon: HiOutlinePencil, onClick: () => onEdit(subscription) },
              { label: "Delete", icon: HiOutlineTrash, danger: true, onClick: () => onDelete(subscription) },
            ]}
          />
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 mt-3 pt-3 border-t border-border">
        <div>
          <p className="text-lg font-semibold tracking-tight text-foreground tnum">
            {formatCurrency(subscription.costInDollar)}
            <span className="text-xs font-normal text-muted capitalize"> / {subscription.billingCycle}</span>
          </p>
          <p className="text-xs text-muted mt-0.5">Renews {relativeDueLabel(nextDate).toLowerCase()}</p>
        </div>
        <div className="relative">
          <ReminderToggle
            enabled={subscription.alertEnabled}
            loading={reminderUpdating}
            onToggle={() => onToggleReminder(subscription)}
            label={`Renewal reminders for ${name}`}
          />
        </div>
      </div>
    </li>
  );
};

export default SubscriptionCard;
