const MeetingDetailsLoading = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header skeleton */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="mt-2 flex gap-3">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
        </div>
        <div className="mt-3 flex gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex p-1">
          <div className="h-8 bg-gray-200 rounded w-24 mx-2 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-24 mx-2 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-24 mx-2 animate-pulse"></div>
        </div>
      </div>

      {/* Content skeleton - Two column layout with independent scrolling */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-12 gap-6">
          {/* Left column - 7/12 width */}
          <div className="col-span-7 h-full overflow-y-auto p-6 pr-3">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="flex flex-wrap gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Right column - 5/12 width */}
          <div className="col-span-5 h-full overflow-y-auto p-6 pl-3">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
              </div>

              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeetingDetailsLoading
