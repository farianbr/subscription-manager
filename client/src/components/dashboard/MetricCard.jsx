/** Small supporting stat card: label, value, and a contextual line underneath. */
const MetricCard = ({ label, value, context, icon: Icon }) => {
  return (
    <div className="bg-surface rounded-2xl border border-border p-5 shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-lifted)] min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-muted/70 shrink-0" aria-hidden="true" />}
      </div>
      <p className="text-2xl font-semibold tracking-tight text-foreground mt-2 truncate">{value}</p>
      {context && <p className="text-xs text-muted mt-1.5 truncate">{context}</p>}
    </div>
  );
};

export default MetricCard;
