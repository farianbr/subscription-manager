import { useCurrency } from "../../context/CurrencyContext";
import { useTheme } from "../../context/ThemeContext";
import { getCategoryColor } from "../../lib/palette";
import { titleCase } from "../../lib/dashboard";

/**
 * Category allocation as a segmented stacked bar (2px surface gaps between
 * fills) with a legend that always carries name + amount + share in text,
 * so color never encodes alone.
 */
const CategoryBreakdown = ({ categories }) => {
  const { formatCurrency } = useCurrency();
  const { theme } = useTheme();

  if (categories.length === 0) return null;

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5" role="img" aria-label="Category allocation of monthly spend">
        {categories.map((c) => (
          <div
            key={c.category}
            className="h-full first:rounded-l-full last:rounded-r-full min-w-[6px]"
            style={{
              width: `${c.share * 100}%`,
              backgroundColor: getCategoryColor(c.category, theme),
            }}
          />
        ))}
      </div>

      <ul className="mt-5 space-y-3">
        {categories.map((c) => (
          <li key={c.category} className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: getCategoryColor(c.category, theme) }}
            />
            <span className="text-sm text-foreground flex-1 min-w-0 truncate">
              {titleCase(c.category)}
            </span>
            <span className="text-sm text-foreground tnum">{formatCurrency(c.monthlyUSD)}</span>
            <span className="text-xs text-muted tnum w-9 text-right">
              {Math.round(c.share * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryBreakdown;
