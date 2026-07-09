import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
} from "chart.js";

import { useCurrency } from "../../context/CurrencyContext";
import { useTheme } from "../../context/ThemeContext";
import { CHART_CHROME } from "../../lib/palette";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Filler);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Billed spend per month — single series, thin line, soft area wash. */
const SpendingTrendChart = ({ trend }) => {
  const { formatCurrency, convertFromUSD, getCurrencySymbol } = useCurrency();
  const { theme } = useTheme();
  const chrome = CHART_CHROME[theme] || CHART_CHROME.light;

  const data = useMemo(
    () => ({
      labels: trend.map((m) => m.label),
      datasets: [
        {
          data: trend.map((m) => convertFromUSD(m.totalUSD)),
          borderColor: chrome.accent,
          backgroundColor: chrome.accentSoft,
          fill: true,
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 2.5,
          pointBackgroundColor: chrome.accent,
          pointBorderColor: chrome.surface,
          pointBorderWidth: 2,
          pointHoverRadius: 5,
          pointHitRadius: 16,
        },
      ],
    }),
    [trend, convertFromUSD, chrome]
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
          titleFont: { weight: "600" },
          callbacks: {
            label: (c) => `Billed ${formatCurrency(trend[c.dataIndex]?.totalUSD || 0)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { color: chrome.grid },
          ticks: { color: chrome.axis, font: { size: 11 }, maxRotation: 0, autoSkipPadding: 12 },
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
    [chrome, trend, formatCurrency, getCurrencySymbol]
  );

  return (
    <div>
      <div className="h-56 sm:h-64" role="img" aria-label="Monthly spending trend chart">
        <Line data={data} options={options} />
      </div>
      {/* Text twin of the chart for screen readers */}
      <ul className="sr-only">
        {trend.map((m) => (
          <li key={`${m.month}-${m.year}`}>
            {m.month} {m.year}: {formatCurrency(m.totalUSD)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SpendingTrendChart;
