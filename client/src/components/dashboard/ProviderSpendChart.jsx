import { useCurrency } from "../../context/CurrencyContext";
import ProviderLogo from "./ProviderLogo";
import { titleCase } from "../../lib/dashboard";

const MAX_ROWS = 6;

/**
 * Providers ranked by normalized monthly cost. A single measure, so a single
 * hue: thin accent bars with the value always visible in text.
 */
const ProviderSpendChart = ({ providers }) => {
  const { formatCurrency } = useCurrency();
  const visible = providers.slice(0, MAX_ROWS);
  const restCount = providers.length - visible.length;
  const max = visible[0]?.monthlyUSD || 1;

  return (
    <div>
      <ul className="space-y-4">
        {visible.map((p) => (
          <li key={p.provider} className="flex items-center gap-3">
            <ProviderLogo provider={p.provider} name={p.provider} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <p className="text-sm font-medium text-foreground truncate">{titleCase(p.provider)}</p>
                <p className="text-sm text-foreground tnum shrink-0">
                  {formatCurrency(p.monthlyUSD)}
                  <span className="text-muted text-xs">/mo</span>
                </p>
              </div>
              <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-viz-accent transition-[width] duration-500 ease-out"
                  style={{ width: `${Math.max((p.monthlyUSD / max) * 100, 2)}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      {restCount > 0 && (
        <p className="text-xs text-muted mt-3">+ {restCount} more provider{restCount > 1 ? "s" : ""}</p>
      )}
    </div>
  );
};

export default ProviderSpendChart;
