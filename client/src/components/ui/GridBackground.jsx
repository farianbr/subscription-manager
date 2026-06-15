// Neutral app background. Minimal and theme-aware — the premium look comes from
// typography and whitespace, not decorative gradients.
const GridBackground = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="relative z-10 min-h-screen flex flex-col">{children}</div>
    </div>
  );
};

export default GridBackground;
