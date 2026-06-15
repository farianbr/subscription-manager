const SkeletonCard = () => {
  
  return (
    <div className="group relative">
      <div className="relative bg-surface rounded-2xl p-6 border border-border animate-pulse">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-row items-start justify-between">
            <div>
              <div className="h-6 w-32 bg-border rounded-lg mb-2"></div>
              <div className="h-4 w-20 bg-border rounded-full"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-border rounded-full"></div>
              <div className="h-8 w-8 bg-border rounded-full"></div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="p-2 bg-surface-2 rounded-lg">
                  <div className="h-4 w-4 bg-border rounded"></div>
                </div>
                <div className="flex-1">
                  <div className="h-3 w-16 bg-border rounded mb-1"></div>
                  <div className="h-4 w-24 bg-border rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Alert Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-2 rounded-lg">
                <div className="h-4 w-4 bg-border rounded"></div>
              </div>
              <div>
                <div className="h-3 w-20 bg-border rounded mb-1"></div>
                <div className="h-4 w-16 bg-border rounded"></div>
              </div>
            </div>
            <div className="h-6 w-11 bg-border rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
