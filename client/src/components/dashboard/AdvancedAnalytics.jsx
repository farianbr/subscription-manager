import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import { HiOutlineTrendingUp, HiOutlineArrowSmUp, HiOutlineArrowSmDown } from "react-icons/hi";

import { GET_ADVANCED_ANALYTICS } from "../../graphql/queries/analytics.queries";
import { useCurrency } from "../../context/CurrencyContext";
import { useTheme } from "../../context/ThemeContext";
import { CHART_CHROME } from "../../lib/palette";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Premium analytics: renewal forecast + detected price changes. */
const AdvancedAnalytics = () => {
  const { data, loading, error } = useQuery(GET_ADVANCED_ANALYTICS);
  const { formatCurrency, convertFromUSD, getCurrencySymbol } = useCurrency();
  const { theme } = useTheme();
  const chrome = CHART_CHROME[theme] || CHART_CHROME.light;

  const analytics = data?.advancedAnalytics;
  const forecast = useMemo(() => analytics?.forecast || [], [analytics]);

  const chartData = useMemo(
    () => ({
      labels: forecast.map((m) => m.label),
      datasets: [
        {
          data: forecast.map((m) => convertFromUSD(m.projectedUSD)),
          backgroundColor: chrome.accent,
          borderRadius: 6,
          maxBarThickness: 44,
        },
      ],
    }),
    [forecast, convertFromUSD, chrome]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: prefersReducedMotion() ? false : { duration: 450, easing: "easeOutQuart" },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: chrome.tooltipBg,
          titleColor: chrome.tooltipFg,
          bodyColor: chrome.tooltipFg,
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (c) => `Projected ${formatCurrency(forecast[c.dataIndex]?.projectedUSD || 0)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { color: chrome.grid },
          ticks: { color: chrome.axis, font: { size: 11 }, maxRotation: 0 },
        },
        y: {
          beginAtZero: true,
          grid: { color: chrome.grid, drawTicks: false },
          border: { display: false },
          ticks: {
            color: chrome.axis,
            font: { size: 11 },
            maxTicksLimit: 5,
            padding: 8,
            callback: (v) => `${getCurrencySymbol()}${Math.round(v).toLocaleString()}`,
          },
        },
      },
    }),
    [chrome, forecast, formatCurrency, getCurrencySymbol]
  );

  if (loading) {
    return (
      <section className="bg-surface rounded-3xl border border-border shadow-[var(--shadow-card)] p-5 sm:p-6">
        <div className="h-5 w-40 bg-surface-2 rounded animate-pulse mb-5" />
        <div className="h-48 bg-surface-2 rounded-2xl animate-pulse" />
      </section>
    );
  }
  if (error || !analytics) return null;

  const hasForecast = forecast.some((m) => m.projectedUSD > 0);
  const priceChanges = analytics.priceChanges || [];

  return (
    <section
      aria-labelledby="advanced-analytics-heading"
      className="bg-surface rounded-3xl border border-border shadow-[var(--shadow-card)] p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <HiOutlineTrendingUp className="w-5 h-5 text-accent" aria-hidden="true" />
        <h2
          id="advanced-analytics-heading"
          className="text-[17px] font-semibold tracking-tight text-foreground"
        >
          Advanced analytics
        </h2>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="bg-surface-2 rounded-2xl p-4">
          <p className="text-xs text-muted mb-1">Projected next month</p>
          <p className="text-xl font-semibold text-foreground">
            {formatCurrency(analytics.projectedNextMonthUSD)}
          </p>
        </div>
        <div className="bg-surface-2 rounded-2xl p-4">
          <p className="text-xs text-muted mb-1">Average per subscription</p>
          <p className="text-xl font-semibold text-foreground">
            {formatCurrency(analytics.averageMonthlyPerSubUSD)}
            <span className="text-xs text-muted font-normal">/mo</span>
          </p>
        </div>
      </div>

      {/* Forecast */}
      {hasForecast && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted mb-4">Renewal forecast, next 6 months</h3>
          <div className="h-52" role="img" aria-label="Projected spending for the next six months">
            <Bar data={chartData} options={options} />
          </div>
          <ul className="sr-only">
            {forecast.map((m) => (
              <li key={`${m.month}-${m.year}`}>
                {m.label}: {formatCurrency(m.projectedUSD)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price changes */}
      <div>
        <h3 className="text-sm font-medium text-muted mb-3">Price changes</h3>
        {priceChanges.length === 0 ? (
          <p className="text-[13px] text-muted">
            No price changes detected across your billing history.
          </p>
        ) : (
          <ul className="space-y-2">
            {priceChanges.slice(0, 5).map((c, i) => {
              const up = c.direction === "increase";
              const Icon = up ? HiOutlineArrowSmUp : HiOutlineArrowSmDown;
              return (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 bg-surface-2 rounded-xl px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.service}</p>
                    <p className="text-xs text-muted">
                      {formatCurrency(c.fromUSD)} → {formatCurrency(c.toUSD)} ·{" "}
                      {new Date(c.changedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-0.5 text-sm font-semibold shrink-0 ${
                      up ? "text-amber-500" : "text-green-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {Math.abs(c.changePct)}%
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

export default AdvancedAnalytics;
