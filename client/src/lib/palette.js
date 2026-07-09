// Chart palette — must stay in sync with the viz tokens in index.css.
// Both modes are individually validated (CVD separation + surface contrast);
// light-mode category hues are sub-3:1 on white, so category color is never
// shown without a visible text label next to it.

export const CATEGORY_PALETTE = {
  light: {
    utilities: "#2a78d6",
    productivity: "#1baf7a",
    education: "#eda100",
    entertainment: "#e87ba4",
    other: "#8e8d88",
  },
  dark: {
    utilities: "#3987e5",
    productivity: "#199e70",
    education: "#c98500",
    entertainment: "#d55181",
    other: "#77767d",
  },
};

export const CHART_CHROME = {
  light: {
    accent: "#4a3aa7",
    accentSoft: "rgba(74, 58, 167, 0.09)",
    grid: "#eceae5",
    axis: "#8b8a85",
    surface: "#ffffff",
    tooltipBg: "#1c1c1e",
    tooltipFg: "#f4f4f5",
  },
  dark: {
    accent: "#9085e9",
    accentSoft: "rgba(144, 133, 233, 0.13)",
    grid: "rgba(255,255,255,0.07)",
    axis: "#8f8e94",
    surface: "#1a1a1d",
    tooltipBg: "#f4f4f5",
    tooltipFg: "#1c1c1e",
  },
};

export function getCategoryColor(category, theme = "light") {
  const palette = CATEGORY_PALETTE[theme] || CATEGORY_PALETTE.light;
  return palette[category?.toLowerCase()] || palette.other;
}
