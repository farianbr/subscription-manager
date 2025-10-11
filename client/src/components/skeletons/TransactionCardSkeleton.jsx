const SkeletonCard = () => {
  
  return (
    <div className="group relative">
      <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 animate-pulse">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-row items-start justify-between">
            <div>
              <div className="h-6 w-32 bg-slate-200 rounded-lg mb-2"></div>
              <div className="h-4 w-20 bg-slate-200 rounded-full"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
              <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <div className="h-4 w-4 bg-slate-200 rounded"></div>
                </div>
                <div className="flex-1">
                  <div className="h-3 w-16 bg-slate-200 rounded mb-1"></div>
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Alert Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <div className="h-4 w-4 bg-slate-200 rounded"></div>
              </div>
              <div>
                <div className="h-3 w-20 bg-slate-200 rounded mb-1"></div>
                <div className="h-4 w-16 bg-slate-200 rounded"></div>
              </div>
            </div>
            <div className="h-6 w-11 bg-slate-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
