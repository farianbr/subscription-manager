import { Link } from "react-router-dom";
import { HiLockClosed } from "react-icons/hi";

import { usePlan, FEATURES } from "../lib/plan";
import AdvancedAnalytics from "../components/dashboard/AdvancedAnalytics";
import AiInsightsCard from "../components/dashboard/AiInsightsCard";

/** Faint, non-interactive preview shown behind the upgrade lock for free users. */
const LockedPreview = () => (
  <div aria-hidden="true" className="pointer-events-none select-none blur-[3px] opacity-50 space-y-6">
    <div className="bg-surface rounded-3xl border border-border p-6">
      <div className="h-4 w-40 bg-surface-2 rounded mb-5" />
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="h-20 bg-surface-2 rounded-2xl" />
        <div className="h-20 bg-surface-2 rounded-2xl" />
      </div>
      <div className="flex items-end gap-3 h-40">
        {[60, 85, 45, 95, 70, 80].map((h, i) => (
          <div key={i} className="flex-1 bg-accent/30 rounded-t-lg" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
    <div className="bg-surface rounded-3xl border border-border p-6 space-y-3">
      <div className="h-4 w-32 bg-surface-2 rounded mb-4" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-12 bg-surface-2 rounded-xl" />
      ))}
    </div>
  </div>
);

const LockedInsights = () => (
  <div className="relative">
    <LockedPreview />
    <div className="absolute inset-0 flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div className="max-w-sm text-center bg-surface/95 backdrop-blur rounded-3xl border border-border shadow-[var(--shadow-card)] p-6 sm:p-8">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <HiLockClosed className="w-6 h-6 text-accent" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground mb-2">
          Insights are a Premium feature
        </h2>
        <p className="text-sm text-muted mb-6">
          Unlock AI-powered analysis of your spending, a 6-month renewal forecast, and price-change
          detection.
        </p>
        <Link
          to="/settings?tab=plan"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium transition-colors"
        >
          Upgrade to Premium
        </Link>
      </div>
    </div>
  </div>
);

const InsightsPage = () => {
  const { loading, hasFeature } = usePlan();
  const premium = hasFeature(FEATURES.ANALYTICS);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Insights</h1>
          <p className="text-sm text-muted mt-1">
            AI analysis, spending forecast, and price changes across your subscriptions.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-3 border-border border-t-accent rounded-full animate-spin" />
          </div>
        ) : premium ? (
          <div className="space-y-5 sm:space-y-6">
            <AdvancedAnalytics />
            <AiInsightsCard />
          </div>
        ) : (
          <LockedInsights />
        )}
      </div>
    </div>
  );
};

export default InsightsPage;
