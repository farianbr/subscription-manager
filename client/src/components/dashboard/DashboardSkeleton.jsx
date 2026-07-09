const shimmer = "bg-surface-2 rounded-lg animate-pulse";

/** Loading placeholder that mirrors the final dashboard layout. */
const DashboardSkeleton = () => {
  return (
    <div aria-busy="true" aria-label="Loading dashboard">
      {/* Hero */}
      <div className="pt-8 sm:pt-12 pb-7">
        <div className={`${shimmer} h-3.5 w-28 mb-3`} />
        <div className={`${shimmer} h-9 w-48 mb-3`} />
        <div className={`${shimmer} h-4 w-72 max-w-full`} />
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="col-span-2 lg:row-span-2 bg-surface rounded-3xl border border-border p-6 sm:p-7">
          <div className={`${shimmer} h-3.5 w-40 mb-4`} />
          <div className={`${shimmer} h-12 w-44 mb-3`} />
          <div className={`${shimmer} h-4 w-56 max-w-full mb-8`} />
          <div className={`${shimmer} h-14 w-full`} />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-2xl border border-border p-5">
            <div className={`${shimmer} h-3.5 w-24 mb-3`} />
            <div className={`${shimmer} h-7 w-20 mb-2`} />
            <div className={`${shimmer} h-3 w-28`} />
          </div>
        ))}
      </div>

      {/* Upcoming payments */}
      <div className="bg-surface rounded-3xl border border-border p-5 sm:p-6 mb-6">
        <div className={`${shimmer} h-5 w-44 mb-5`} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <div className={`${shimmer} w-10 h-10 rounded-xl shrink-0`} />
            <div className="flex-1">
              <div className={`${shimmer} h-4 w-32 mb-2`} />
              <div className={`${shimmer} h-3 w-24`} />
            </div>
            <div className={`${shimmer} h-4 w-16`} />
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="bg-surface rounded-3xl border border-border p-5 sm:p-6 mb-6">
        <div className={`${shimmer} h-5 w-40 mb-6`} />
        <div className={`${shimmer} h-56 w-full`} />
      </div>

      {/* Library */}
      <div className="bg-surface rounded-3xl border border-border p-5 sm:p-6">
        <div className={`${shimmer} h-5 w-36 mb-6`} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3.5">
            <div className={`${shimmer} w-10 h-10 rounded-xl shrink-0`} />
            <div className={`${shimmer} h-4 flex-1`} />
            <div className={`${shimmer} h-4 w-20 hidden sm:block`} />
            <div className={`${shimmer} h-4 w-24 hidden md:block`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
