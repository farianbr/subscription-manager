import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client/react";
import { HiOutlineSearch } from "react-icons/hi";

import { UPDATE_SUBSCRIPTION, DELETE_SUBSCRIPTION } from "../../graphql/mutations/subscription.mutation";
import SubscriptionFilters from "./SubscriptionFilters";
import SubscriptionRow, { ROW_GRID } from "./SubscriptionRow";
import SubscriptionCard from "./SubscriptionCard";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import { parseBillingDate, titleCase } from "../../lib/dashboard";

const DEFAULT_FILTERS = { query: "", category: "all", cycle: "all", sort: "renewal" };

const SORTERS = {
  renewal: (a, b) => (parseBillingDate(a.nextBillingDate) || 0) - (parseBillingDate(b.nextBillingDate) || 0),
  "price-desc": (a, b) => b.costInDollar - a.costInDollar,
  "price-asc": (a, b) => a.costInDollar - b.costInDollar,
  name: (a, b) => a.serviceName.localeCompare(b.serviceName),
};

/** The full subscription list: search, filters, desktop rows / mobile cards. */
const SubscriptionLibrary = ({ subscriptions, onOpen, onEdit }) => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const [updateSubscription] = useMutation(UPDATE_SUBSCRIPTION, {
    refetchQueries: ["GetSubscriptions", "GetMonthlyHistory"],
  });
  const [deleteSubscription, { loading: deleteLoading }] = useMutation(DELETE_SUBSCRIPTION, {
    refetchQueries: ["GetSubscriptions", "GetMonthlyHistory"],
  });

  const categories = useMemo(
    () => [...new Set(subscriptions.map((s) => s.category?.toLowerCase()).filter(Boolean))].sort(),
    [subscriptions]
  );
  const cycles = useMemo(
    () => [...new Set(subscriptions.map((s) => s.billingCycle).filter(Boolean))],
    [subscriptions]
  );

  const visible = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return subscriptions
      .filter((s) => {
        if (filters.category !== "all" && s.category?.toLowerCase() !== filters.category) return false;
        if (filters.cycle !== "all" && s.billingCycle !== filters.cycle) return false;
        if (query && !s.serviceName.toLowerCase().includes(query) && !s.provider?.toLowerCase().includes(query))
          return false;
        return true;
      })
      .sort(SORTERS[filters.sort] || SORTERS.renewal);
  }, [subscriptions, filters]);

  const handleToggleReminder = async (sub) => {
    setTogglingId(sub._id);
    try {
      await updateSubscription({
        variables: { input: { subscriptionId: sub._id, alertEnabled: !sub.alertEnabled } },
      });
      toast.success(`Reminders ${!sub.alertEnabled ? "enabled" : "disabled"} for ${titleCase(sub.serviceName)}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update reminder setting");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSubscription({ variables: { subscriptionId: deleteTarget._id } });
      toast.success("Subscription deleted");
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const rowHandlers = {
    onOpen,
    onEdit,
    onDelete: (sub) => setDeleteTarget(sub),
    onToggleReminder: handleToggleReminder,
  };

  const isFiltered =
    filters.query.trim() !== "" || filters.category !== "all" || filters.cycle !== "all";

  return (
    <section aria-labelledby="library-heading" className="scroll-mt-24" id="subscriptions">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 id="library-heading" className="text-[17px] font-semibold tracking-tight text-foreground">
          Subscriptions
        </h2>
        <p className="text-[13px] text-muted tnum">
          {visible.length === subscriptions.length
            ? `${subscriptions.length} active`
            : `${visible.length} of ${subscriptions.length}`}
        </p>
      </div>

      <SubscriptionFilters
        filters={filters}
        onChange={setFilters}
        categories={categories}
        cycles={cycles}
      />

      {visible.length === 0 ? (
        <div className="mt-4 bg-surface rounded-3xl border border-border py-14 px-6 text-center">
          <HiOutlineSearch className="w-8 h-8 text-muted/50 mx-auto mb-3" aria-hidden="true" />
          <p className="text-[15px] font-medium text-foreground mb-1">No matching subscriptions</p>
          <p className="text-sm text-muted mb-4">Try a different search or clear the filters.</p>
          {isFiltered && (
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop list */}
          <div className="hidden md:block mt-4 bg-surface rounded-3xl border border-border shadow-[var(--shadow-card)] px-2 py-2">
            <div
              aria-hidden="true"
              className={`${ROW_GRID} px-4 lg:px-5 pt-3 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted`}
            >
              <span>Service</span>
              <span>Category</span>
              <span>Amount</span>
              <span>Next renewal</span>
              <span className="text-center">Reminder</span>
              <span />
            </div>
            <ul className="divide-y divide-border/60">
              {visible.map((sub) => (
                <SubscriptionRow
                  key={sub._id}
                  subscription={sub}
                  reminderUpdating={togglingId === sub._id}
                  {...rowHandlers}
                />
              ))}
            </ul>
          </div>

          {/* Mobile cards */}
          <ul className="md:hidden mt-4 space-y-3">
            {visible.map((sub) => (
              <SubscriptionCard
                key={sub._id}
                subscription={sub}
                reminderUpdating={togglingId === sub._id}
                {...rowHandlers}
              />
            ))}
          </ul>
        </>
      )}

      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        serviceName={deleteTarget ? titleCase(deleteTarget.serviceName) : ""}
        provider={deleteTarget?.provider}
      />
    </section>
  );
};

export default SubscriptionLibrary;
