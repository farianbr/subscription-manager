const SkeletonCard = () => {
  
  return (
    <div className="rounded-md p-4 bg-gradient-to-br from-gray-300 to-gray-200 animate-pulse">
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex flex-row items-center justify-between">
          <div className="h-5 w-24 bg-gray-400 rounded"></div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-gray-400 rounded"></div>
            <div className="h-5 w-5 bg-gray-400 rounded"></div>
          </div>
        </div>

        {/* Description */}
        <div className="h-4 w-40 bg-gray-400 rounded"></div>
        {/* Payment type */}
        <div className="h-4 w-32 bg-gray-400 rounded"></div>
        {/* Amount */}
        <div className="h-4 w-28 bg-gray-400 rounded"></div>
        {/* Provider */}
        <div className="h-4 w-24 bg-gray-400 rounded"></div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-2">
          <div className="h-3 w-16 bg-gray-400 rounded"></div>
          <div className="h-8 w-8 bg-gray-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
