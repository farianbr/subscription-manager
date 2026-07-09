import { useMemo, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  HiOutlineCollection,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineReceiptRefund,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

import { GET_SUBSCRIPTIONS } from "../graphql/queries/subscription.queries";
import { GET_MONTHLY_HISTORY } from "../graphql/queries/transaction.queries";
import { useCurrency } from "../context/CurrencyContext";
import { buildDashboardModel, relativeDueLabel, titleCase } from "../lib/dashboard";
import { usePlan, FEATURES } from "../lib/plan";

import TransactionForm from "../components/TransactionForm";
import Modal from "../components/ui/Modal";
import DashboardHero from "../components/dashboard/DashboardHero";
import MonthlyOutlookCard from "../components/dashboard/MonthlyOutlookCard";
import MetricCard from "../components/dashboard/MetricCard";
import UpcomingPayments from "../components/dashboard/UpcomingPayments";
import SpendingInsights from "../components/dashboard/SpendingInsights";
import GoogleCalendarPrompt from "../components/dashboard/GoogleCalendarPrompt";
import SubscriptionLibrary from "../components/dashboard/SubscriptionLibrary";
import SubscriptionDetailDrawer from "../components/dashboard/SubscriptionDetailDrawer";
import EmptyDashboardState from "../components/dashboard/EmptyDashboardState";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";

const HomePage = () => {
  const {
    data: subscriptionData,
    loading: subsLoading,
    error: subsError,
    refetch: refetchSubs,
  } = useQuery(GET_SUBSCRIPTIONS);
  const {
    data: historyData,
    loading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery(GET_MONTHLY_HISTORY);

  const { formatCurrency } = useCurrency();
  const { hasFeature } = usePlan();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [drawerTarget, setDrawerTarget] = useState(null); // { id, editing }
  const upcomingRef = useRef(null);
  const libraryRef = useRef(null);

  const subscriptions = useMemo(
    () => subscriptionData?.subscriptions || [],
    [subscriptionData]
  );
  const model = useMemo(
    () => buildDashboardModel(subscriptions, historyData?.monthlyHistory || []),
    [subscriptions, historyData]
  );

  const loading = (subsLoading && !subscriptionData) || (historyLoading && !historyData);
  const error = subsError || historyError;

  // The drawer reads fresh data by id so edits reflect immediately.
  const drawerSubscription = drawerTarget
    ? subscriptions.find((s) => s._id === drawerTarget.id) || null
    : null;

  const openDrawer = (sub, editing = false) => setDrawerTarget({ id: sub._id, editing });
  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const metricCards = model.activeCount > 0 && (
    <>
      <MetricCard
        icon={HiOutlineCollection}
        label="Active subscriptions"
        value={model.activeCount}
        context={`across ${model.categories.length} categor${model.categories.length === 1 ? "y" : "ies"}`}
      />
      <MetricCard
        icon={HiOutlineClock}
        label="Next payment"
        value={model.nextPayment ? formatCurrency(model.nextPayment.sub.costInDollar) : "—"}
        context={
          model.nextPayment
            ? `${titleCase(model.nextPayment.sub.serviceName)} · ${relativeDueLabel(model.nextPayment.date).toLowerCase()}`
            : "No upcoming bills"
        }
      />
      <MetricCard
        icon={HiOutlineCalendar}
        label="Annual commitment"
        value={formatCurrency(model.annualUSD)}
        context="projected over 12 months"
      />
      <MetricCard
        icon={HiOutlineReceiptRefund}
        label="Last month"
        value={model.lastMonthUSD === null ? "—" : formatCurrency(model.lastMonthUSD)}
        context={model.lastMonthUSD === null ? "No billing history yet" : "as billed"}
      />
    </>
  );

  return (
    <>
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <DashboardSkeleton />
          ) : error ? (
            <div className="pt-24 text-center max-w-md mx-auto">
              <HiOutlineExclamationCircle className="w-10 h-10 text-danger mx-auto mb-4" aria-hidden="true" />
              <h1 className="text-xl font-semibold tracking-tight text-foreground mb-2">
                Couldn't load your dashboard
              </h1>
              <p className="text-sm text-muted mb-6">{error.message}</p>
              <button
                onClick={() => {
                  refetchSubs();
                  refetchHistory();
                }}
                className="px-6 py-2.5 min-h-[44px] rounded-full bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium transition-colors"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <DashboardHero
                model={model}
                onAdd={() => setIsAddOpen(true)}
                onReviewUpcoming={() => scrollTo(upcomingRef)}
              />

              {model.activeCount === 0 ? (
                <EmptyDashboardState onAdd={() => setIsAddOpen(true)} />
              ) : (
                <div className="space-y-5 sm:space-y-6">
                  {/* Premium: nudge to connect Google Calendar */}
                  {hasFeature(FEATURES.CALENDAR_INTEGRATION) && <GoogleCalendarPrompt />}

                  {/* Financial summary */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <MonthlyOutlookCard model={model} />
                    {metricCards}
                  </div>

                  {/* Upcoming payments */}
                  <div ref={upcomingRef} className="scroll-mt-24">
                    <UpcomingPayments
                      items={model.upcoming}
                      onSelect={(sub) => openDrawer(sub)}
                      onViewAll={() => scrollTo(libraryRef)}
                    />
                  </div>

                  {/* Insights */}
                  <SpendingInsights model={model} />

                  {/* Library */}
                  <div ref={libraryRef} className="scroll-mt-24">
                    <SubscriptionLibrary
                      subscriptions={subscriptions}
                      onOpen={(sub) => openDrawer(sub)}
                      onEdit={(sub) => openDrawer(sub, true)}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <SubscriptionDetailDrawer
        subscription={drawerSubscription}
        initialEditing={drawerTarget?.editing || false}
        onClose={() => setDrawerTarget(null)}
      />

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add subscription">
        <TransactionForm onSuccess={() => setIsAddOpen(false)} />
      </Modal>
    </>
  );
};

export default HomePage;
