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
        <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
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
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Plan</h3>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Subscriptions used</span>
            <span className="text-sm font-medium text-slate-900">
              {count}
              {limit ? ` / ${limit}` : " (unlimited)"}
            </span>
          </div>
          {limit ? (
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${usagePct >= 100 ? "bg-red-500" : "bg-blue-600"}`}
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
                isCurrent ? "border-blue-600 ring-1 ring-blue-600" : "border-slate-200"
              }`}
            >
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-slate-900">{plan.name}</h4>
                <p className="mt-1">
                  <span className="text-2xl font-bold text-slate-900">
                    ${plan.priceMonthly.toFixed(2)}
                  </span>
                  <span className="text-sm text-slate-500">/mo</span>
                </p>
              </div>

              <ul className="space-y-2 text-sm text-slate-600 flex-1">
                <li>
                  {plan.maxSubscriptions ? `Up to ${plan.maxSubscriptions} subscriptions` : "Unlimited subscriptions"}
                </li>
                {BASELINE.map((b) => (
                  <li key={b}>{b}</li>
                ))}
                {plan.features
                  .filter((f) => f !== "unlimited_subscriptions")
                  .map((f) => (
                    <li key={f} className="text-slate-900">{FEATURE_LABELS[f] || f}</li>
                  ))}
                {plan.maxMembers > 1 && <li className="text-slate-900">Up to {plan.maxMembers} members</li>}
              </ul>

              <button
                onClick={() => handleChange(plan.id)}
                disabled={isCurrent || changing}
                className={`mt-5 w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isCurrent
                    ? "bg-slate-100 text-slate-500 cursor-default"
                    : "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                }`}
              >
                {isCurrent ? "Current plan" : changing ? "Updating..." : `Switch to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400">
        Payments are not yet enabled — plan changes apply immediately for now.
      </p>
    </div>
  );
};

export default PlanSettings;
