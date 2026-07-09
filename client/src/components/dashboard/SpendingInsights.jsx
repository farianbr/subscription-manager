import { useMemo, useState } from "react";
import { HiOutlineLightBulb } from "react-icons/hi";

import SpendingTrendChart from "./SpendingTrendChart";
import ProviderSpendChart from "./ProviderSpendChart";
import CategoryBreakdown from "./CategoryBreakdown";
import { useCurrency } from "../../context/CurrencyContext";
import { buildInsights } from "../../lib/dashboard";

const RANGES = [
  { key: 6, label: "6M" },
  { key: 12, label: "12M" },
];

/** Trend + provider ranking + category allocation, with written takeaways. */
const SpendingInsights = ({ model }) => {
  const { formatCurrency } = useCurrency();
  const [range, setRange] = useState(12);

  const scopedTrend = useMemo(() => model.trend.slice(-range), [model.trend, range]);
  const insights = useMemo(() => buildInsights(model, formatCurrency), [model, formatCurrency]);

  const hasTrend = scopedTrend.length >= 2;
  const hasBreakdown = model.providers.length > 0;

  if (!hasTrend && !hasBreakdown) return null;

  return (
    <section aria-labelledby="insights-heading" className="bg-surface rounded-3xl border border-border shadow-[var(--shadow-card)] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 id="insights-heading" className="text-[17px] font-semibold tracking-tight text-foreground">
          Spending insights
        </h2>
        {hasTrend && model.trend.length > 6 && (
          <div className="flex items-center rounded-lg bg-surface-2 p-0.5" role="group" aria-label="Trend range">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                aria-pressed={range === r.key}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  range === r.key
                    ? "bg-surface text-foreground shadow-[var(--shadow-card)]"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {insights.length > 0 && (
        <ul className="flex flex-col sm:flex-row flex-wrap gap-2 mb-6">
          {insights.map((text) => (
            <li
              key={text}
              className="inline-flex items-start gap-2 text-[13px] text-foreground bg-surface-2 rounded-xl px-3 py-2"
            >
              <HiOutlineLightBulb className="w-4 h-4 text-muted mt-px shrink-0" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      )}

      {hasTrend && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted mb-4">Billed per month</h3>
          <SpendingTrendChart trend={scopedTrend} />
        </div>
      )}

      {hasBreakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-medium text-muted mb-4">Top providers, normalized monthly</h3>
            <ProviderSpendChart providers={model.providers} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted mb-4">By category</h3>
            <CategoryBreakdown categories={model.categories} />
          </div>
        </div>
      )}
    </section>
  );
};

export default SpendingInsights;
