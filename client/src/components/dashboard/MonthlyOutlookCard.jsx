import { useMemo } from "react";
import { useCurrency } from "../../context/CurrencyContext";
import { useTheme } from "../../context/ThemeContext";
import { CHART_CHROME } from "../../lib/palette";
import { formatMonthLabel } from "../../lib/dashboard";

/** Minimal inline sparkline: 2px line, soft area wash, end dot with surface ring. */
const Sparkline = ({ points, color, surface }) => {
  const W = 220;
  const H = 56;
  const PAD = 5;

  const path = useMemo(() => {
    if (points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const coords = points.map((v, i) => [
      PAD + (i / (points.length - 1)) * (W - PAD * 2),
      PAD + (1 - (v - min) / range) * (H - PAD * 2),
    ]);
    const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${H - 1} L${coords[0][0].toFixed(1)},${H - 1} Z`;
    return { line, area, end: coords[coords.length - 1] };
  }, [points]);

  if (!path) return null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14" aria-hidden="true" focusable="false">
      <path d={path.area} fill={color} opacity="0.1" />
      <path d={path.line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={path.end[0]} cy={path.end[1]} r="4" fill={color} stroke={surface} strokeWidth="2" />
    </svg>
  );
};

/**
 * The primary focal card: projected spend this month, change vs last month,
 * and a compact trend of recent billed months.
 */
const MonthlyOutlookCard = ({ model }) => {
  const { formatCurrency, convertFromUSD } = useCurrency();
  const { theme } = useTheme();
  const chrome = CHART_CHROME[theme] || CHART_CHROME.light;

  const { projectedMonthlyUSD, deltaUSD, lastMonthUSD, trend } = model;
  const sparkPoints = useMemo(
    () => trend.slice(-8).map((m) => convertFromUSD(m.totalUSD)),
    [trend, convertFromUSD]
  );

  const now = new Date();
  const lastMonthName = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toLocaleDateString(undefined, { month: "long" });

  let deltaLine = null;
  if (deltaUSD !== null && lastMonthUSD > 0) {
    const pct = Math.abs((deltaUSD / lastMonthUSD) * 100);
    const rising = deltaUSD > 0.005;
    const falling = deltaUSD < -0.005;
    deltaLine = (
      <p className="text-sm mt-2 flex items-center gap-1.5 flex-wrap">
        <span
          className={`inline-flex items-center gap-1 font-medium tnum ${
            rising ? "text-warning" : falling ? "text-success" : "text-muted"
          }`}
        >
          {rising ? "↑" : falling ? "↓" : "—"} {formatCurrency(Math.abs(deltaUSD))} ({pct.toFixed(0)}%)
        </span>
        <span className="text-muted">
          {rising ? `up from ${lastMonthName}` : falling ? `down from ${lastMonthName}` : `unchanged from ${lastMonthName}`}
        </span>
      </p>
    );
  }

  return (
    <section
      aria-label="Monthly outlook"
      className="col-span-2 lg:col-span-2 lg:row-span-2 bg-surface rounded-3xl border border-border p-6 sm:p-7 shadow-[var(--shadow-card)] flex flex-col justify-between gap-6"
    >
      <div>
        <p className="text-[13px] font-medium text-muted">
          Monthly outlook · {formatMonthLabel(now)}
        </p>
        <p className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground mt-3">
          {formatCurrency(projectedMonthlyUSD)}
        </p>
        <p className="text-sm text-muted mt-1.5">projected recurring spend</p>
        {deltaLine}
      </div>

      {sparkPoints.length >= 2 ? (
        <div>
          <Sparkline points={sparkPoints} color={chrome.accent} surface={chrome.surface} />
          <p className="text-xs text-muted mt-2">
            Billed per month, {trend.slice(-8)[0]?.label} – {trend[trend.length - 1]?.label}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted">
          A monthly trend will appear here once you have a few months of billing history.
        </p>
      )}
    </section>
  );
};

export default MonthlyOutlookCard;
