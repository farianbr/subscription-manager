// Client mirror of the server's feature flags (server/config/plans.js) plus a
// hook to read the current user's plan and gate Premium UI. The server always
// re-checks entitlements — this only decides what to show.

import { useQuery } from "@apollo/client/react";
import { GET_PLAN_USAGE } from "../graphql/queries/plan.queries";

export const FEATURES = {
  UNLIMITED_SUBSCRIPTIONS: "unlimited_subscriptions",
  ANALYTICS: "analytics",
  ADVANCED_REMINDERS: "advanced_reminders",
  AI_INSIGHTS: "ai_insights",
  CALENDAR_INTEGRATION: "calendar_integration",
};

/**
 * Current plan + feature entitlements.
 * @returns {{ loading: boolean, plan: string, features: string[], hasFeature: (f: string) => boolean }}
 */
export function usePlan() {
  const { data, loading } = useQuery(GET_PLAN_USAGE);
  const usage = data?.planUsage;
  const features = usage?.features || [];
  return {
    loading,
    plan: usage?.plan || "free",
    features,
    hasFeature: (feature) => features.includes(feature),
  };
}
