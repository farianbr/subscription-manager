import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@apollo/client/react";
import { HiOutlineX, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";

import { DELETE_SUBSCRIPTION, UPDATE_SUBSCRIPTION } from "../../graphql/mutations/subscription.mutation";
import { GET_AUTHENTICATED_USER } from "../../graphql/queries/user.queries";
import { useCurrency } from "../../context/CurrencyContext";
import { useTheme } from "../../context/ThemeContext";
import EditSubscriptionForm from "../EditSubscriptionForm";
import ProviderLogo from "./ProviderLogo";
import ReminderToggle from "./ReminderToggle";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import { getCategoryColor } from "../../lib/palette";
import {
  parseBillingDate,
  relativeDueLabel,
  formatFullDate,
  titleCase,
  monthlyCostOf,
  yearlyCostOf,
} from "../../lib/dashboard";

const DetailRow = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-b-0">
    <dt className="text-sm text-muted">{label}</dt>
    <dd className="text-sm font-medium text-foreground text-right tnum">{children}</dd>
  </div>
);

const SubscriptionDetailDrawer = ({ subscription, onClose, initialEditing = false }) => {
  const isOpen = Boolean(subscription);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const closeButtonRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const { data: userData } = useQuery(GET_AUTHENTICATED_USER);
  const { formatCurrency } = useCurrency();
  const { theme } = useTheme();

  const [deleteSubscription, { loading: deleteLoading }] = useMutation(DELETE_SUBSCRIPTION, {
    refetchQueries: ["GetSubscriptions", "GetMonthlyHistory"],
  });
  const [updateSubscription, { loading: updateLoading }] = useMutation(UPDATE_SUBSCRIPTION, {
    refetchQueries: ["GetSubscriptions", "GetMonthlyHistory"],
  });

  // Reset transient state and lock scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    setEditing(initialEditing);
    setConfirmDelete(false);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose, initialEditing]);

  if (!isOpen) {
    return <AnimatePresence />;
  }

  const {
    _id,
    serviceName,
    provider,
    category,
    costInDollar,
    originalAmount,
    originalCurrency,
    billingCycle,
    startDate,
    nextBillingDate,
    paymentMethodId,
    alertEnabled,
  } = subscription;

  const nextDate = parseBillingDate(nextBillingDate);
  const startedDate = parseBillingDate(startDate);
  const paymentMethodName =
    userData?.authUser?.paymentMethods?.find((m) => m.id === paymentMethodId)?.name || "—";

  const handleDelete = async () => {
    try {
      await deleteSubscription({ variables: { subscriptionId: _id } });
      toast.success("Subscription deleted");
      setConfirmDelete(false);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleToggleReminder = async () => {
    try {
      await updateSubscription({
        variables: { input: { subscriptionId: _id, alertEnabled: !alertEnabled } },
      });
      toast.success(`Reminders ${!alertEnabled ? "enabled" : "disabled"} for ${titleCase(serviceName)}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update reminder setting");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`${titleCase(serviceName)} details`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-black/35"
          onClick={onClose}
        />
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
          animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
          transition={{ type: "tween", duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-surface border-l border-border shadow-[var(--shadow-overlay)] flex flex-col"
        >
          {/* Drawer header */}
          <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-border">
            <div className="flex items-center gap-3 min-w-0">
              <ProviderLogo provider={provider} name={serviceName} size="lg" />
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-foreground truncate">
                  {titleCase(serviceName)}
                </h2>
                <p className="text-sm text-muted capitalize truncate">{provider}</p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close details"
              className="p-2.5 -m-1 text-muted hover:text-foreground hover:bg-surface-2 rounded-full transition-colors"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
            {editing ? (
              <EditSubscriptionForm
                subscription={subscription}
                onSuccess={() => setEditing(false)}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <>
                {/* Cost summary */}
                <div className="rounded-2xl bg-surface-2 border border-border p-5 mb-5">
                  <p className="text-[13px] text-muted mb-1 capitalize">{billingCycle || "Monthly"} cost</p>
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {formatCurrency(costInDollar)}
                  </p>
                  <p className="text-[13px] text-muted mt-2 tnum">
                    ≈ {formatCurrency(monthlyCostOf(subscription))}/mo · {formatCurrency(yearlyCostOf(subscription))}/yr
                  </p>
                </div>

                {/* Details */}
                <dl>
                  <DetailRow label="Next renewal">
                    {nextDate ? (
                      <>
                        {formatFullDate(nextDate)}
                        <span className="block text-xs text-muted font-normal">{relativeDueLabel(nextDate)}</span>
                      </>
                    ) : "—"}
                  </DetailRow>
                  <DetailRow label="Billing cycle">
                    <span className="capitalize">{billingCycle || "—"}</span>
                  </DetailRow>
                  <DetailRow label="Category">
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getCategoryColor(category, theme) }}
                      />
                      <span className="capitalize">{category || "—"}</span>
                    </span>
                  </DetailRow>
                  <DetailRow label="Payment method">
                    <span className="capitalize">{paymentMethodName}</span>
                  </DetailRow>
                  {originalAmount && originalCurrency ? (
                    <DetailRow label="Billed amount">
                      {originalAmount.toFixed(2)} {originalCurrency}
                    </DetailRow>
                  ) : null}
                  {startedDate ? (
                    <DetailRow label="Tracking since">{formatFullDate(startedDate)}</DetailRow>
                  ) : null}
                </dl>

                {/* Reminders */}
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4 mt-5">
                  <div>
                    <p className="text-sm font-medium text-foreground">Renewal reminders</p>
                    <p className="text-xs text-muted mt-0.5">Email me before this subscription renews</p>
                  </div>
                  <ReminderToggle
                    enabled={alertEnabled}
                    loading={updateLoading}
                    onToggle={handleToggleReminder}
                    label={`Renewal reminders for ${titleCase(serviceName)}`}
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer actions */}
          {!editing && (
            <div className="flex gap-3 px-5 sm:px-6 py-4 border-t border-border">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium transition-colors"
              >
                <HiOutlinePencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-danger hover:bg-danger-soft text-sm font-medium transition-colors"
              >
                <HiOutlineTrash className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </motion.div>

        <ConfirmDeleteDialog
          isOpen={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
          loading={deleteLoading}
          serviceName={titleCase(serviceName)}
          provider={provider}
        />
      </div>
    </AnimatePresence>
  );
};

export default SubscriptionDetailDrawer;
