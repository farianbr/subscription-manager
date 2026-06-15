import { useQuery, useMutation } from "@apollo/client/react";
import toast from "react-hot-toast";
import { GET_PLANS, GET_PLAN_USAGE } from "../graphql/queries/plan.queries";
import { CHANGE_PLAN } from "../graphql/mutations/plan.mutation";

const FEATURE_LABELS = {
  unlimited_subscriptions: "Unlimited subscriptions",
  analytics: "Advanced analytics",
  advanced_reminders: "Advanced reminders",
  ai_insights: "AI insights",
  calendar_integration: "Calendar integration",
  shared_subscriptions: "Shared subscriptions",
  cost_splitting: "Cost splitting",
};

// Baseline perks every plan includes, shown above plan-specific features.
const BASELINE = ["Track subscriptions", "Spending dashboard", "Email reminders"];

const PlanSettings = () => {
  const { data: plansData, loading: plansLoading } = useQuery(GET_PLANS);
  const { data: usageData, loading: usageLoading } = useQuery(GET_PLAN_USAGE);
  const [changePlan, { loading: changing }] = useMutation(CHANGE_PLAN, {
    refetchQueries: ["GetPlanUsage", "GetAuthenticatedUser"],
  });

  const usage = usageData?.planUsage;
  const currentPlan = usage?.plan;

  const handleChange = async (planId) => {
    try {
      const { data } = await changePlan({ variables: { plan: planId } });
      const result = data?.changePlan;
      if (result?.checkoutUrl) {
        // Stripe path: send the user to Checkout.
        window.location.href = result.checkoutUrl;
        return;
      }
      toast.success("Plan updated");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (plansLoading || usageLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-3 border-border border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  const plans = plansData?.plans || [];
  const limit = usage?.subscriptionLimit;
  const count = usage?.subscriptionCount ?? 0;
  const usagePct = limit ? Math.min(100, Math.round((count / limit) * 100)) : 0;

  return (
    <div className="space-y-8">
      {/* Current usage */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Your Plan</h3>
        <div className="p-4 bg-surface-2 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">Subscriptions used</span>
            <span className="text-sm font-medium text-foreground">
              {count}
              {limit ? ` / ${limit}` : " (unlimited)"}
            </span>
          </div>
          {limit ? (
            <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${usagePct >= 100 ? "bg-red-500" : "bg-accent"}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={`rounded-xl border p-5 flex flex-col ${
                isCurrent ? "border-accent ring-1 ring-accent" : "border-border"
              }`}
            >
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-foreground">{plan.name}</h4>
                <p className="mt-1">
                  <span className="text-2xl font-bold text-foreground">
                    ${plan.priceMonthly.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted">/mo</span>
                </p>
              </div>

              <ul className="space-y-2 text-sm text-muted flex-1">
                <li>
                  {plan.maxSubscriptions ? `Up to ${plan.maxSubscriptions} subscriptions` : "Unlimited subscriptions"}
                </li>
                {BASELINE.map((b) => (
                  <li key={b}>{b}</li>
                ))}
                {plan.features
                  .filter((f) => f !== "unlimited_subscriptions")
                  .map((f) => (
                    <li key={f} className="text-foreground">{FEATURE_LABELS[f] || f}</li>
                  ))}
                {plan.maxMembers > 1 && <li className="text-foreground">Up to {plan.maxMembers} members</li>}
              </ul>

              <button
                onClick={() => handleChange(plan.id)}
                disabled={isCurrent || changing}
                className={`mt-5 w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isCurrent
                    ? "bg-surface-2 text-muted cursor-default"
                    : "bg-accent hover:bg-accent-hover text-accent-fg disabled:opacity-50"
                }`}
              >
                {isCurrent ? "Current plan" : changing ? "Updating..." : `Switch to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted">
        Payments are not yet enabled — plan changes apply immediately for now.
      </p>
    </div>
  );
};

export default PlanSettings;
