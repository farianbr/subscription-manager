import { useQuery } from "@apollo/client/react";
import {
  HiOutlineExclamation,
  HiOutlineLightBulb,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import { AI_INSIGHTS_AVAILABLE, GET_AI_INSIGHTS } from "../../graphql/queries/ai.queries";

const SEVERITY = {
  warning: { Icon: HiOutlineExclamation, cls: "text-amber-500" },
  suggestion: { Icon: HiOutlineLightBulb, cls: "text-accent" },
  info: { Icon: HiOutlineInformationCircle, cls: "text-muted" },
};

// A custom "analyze spending" mark — a lens over a small bar chart — instead of
// the generic AI sparkle. Reads as inspecting your subscriptions.
const InsightMark = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.7" />
    <path d="M7.8 12v-1.6M10 12V8.4M12.2 12v-2.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M15.2 15.2 20 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

/**
 * Premium AI insights. Auto-loads on mount and refreshes automatically when the
 * user's subscriptions/transactions change (the server caches by a data
 * fingerprint). No manual generate button.
 */
const AiInsightsCard = () => {
  const { data: availData } = useQuery(AI_INSIGHTS_AVAILABLE);
  const { data, loading, error } = useQuery(GET_AI_INSIGHTS, {
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const configured = availData?.aiInsightsAvailable;
  const result = data?.aiInsights;
  const insights = result?.insights || [];
  const firstLoad = loading && !result;

  return (
    <section
      aria-labelledby="ai-insights-heading"
      className="bg-surface rounded-3xl border border-border shadow-[var(--shadow-card)] p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <InsightMark className="w-5 h-5 text-accent" />
          <h2 id="ai-insights-heading" className="text-[17px] font-semibold tracking-tight text-foreground">
            AI insights
          </h2>
        </div>
        {loading && result && (
          <span className="text-xs text-muted animate-pulse">Refreshing…</span>
        )}
      </div>

      {configured === false ? (
        <p className="text-sm text-muted">
          AI insights aren't configured on the server yet. Add an <code>AI_API_KEY</code> to enable
          personalized analysis of your subscriptions.
        </p>
      ) : firstLoad ? (
        <div className="space-y-2.5" aria-live="polite" aria-busy="true">
          <p className="text-sm text-muted mb-3">Analyzing your subscriptions…</p>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 bg-surface-2 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error && !result ? (
        <p className="text-sm text-danger">{error.message}</p>
      ) : !result ? (
        <p className="text-sm text-muted">
          Add a few subscriptions and we'll surface overlaps, savings opportunities, and anything
          worth a second look — automatically.
        </p>
      ) : (
        <>
          {result.summary && <p className="text-sm text-foreground mb-4">{result.summary}</p>}
          <ul className="space-y-2.5">
            {insights.map((ins, i) => {
              const { Icon, cls } = SEVERITY[ins.severity] || SEVERITY.info;
              return (
                <li key={i} className="flex items-start gap-3 bg-surface-2 rounded-xl px-3.5 py-3">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cls}`} aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{ins.title}</p>
                    {ins.detail && <p className="text-[13px] text-muted mt-0.5">{ins.detail}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
          {result.generatedAt && (
            <p className="text-xs text-muted mt-4">
              Updated {new Date(result.generatedAt).toLocaleString()} · AI-generated, verify before acting.
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default AiInsightsCard;
