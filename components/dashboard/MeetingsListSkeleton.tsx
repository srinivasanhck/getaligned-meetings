// Individual meeting card skeleton
export const MeetingCardSkeleton = () => (
  <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 w-3/5 rounded bg-gray-200"></div>
      <div className="h-3 w-1/6 rounded bg-gray-200"></div>
    </div>
    <div className="mt-2 flex items-center">
      <div className="h-3 w-4/5 rounded bg-gray-200"></div>
    </div>
    <div className="mt-3 flex space-x-1">
      <div className="h-6 w-6 rounded-full bg-gray-200"></div>
      <div className="h-6 w-6 rounded-full bg-gray-200"></div>
      <div className="h-6 w-6 rounded-full bg-gray-200"></div>
    </div>
    <div className="mt-3">
      <div className="h-4 w-1/3 rounded-full bg-gray-200"></div>
    </div>
  </div>
)

// Group of skeleton cards with date header
const MeetingsGroupSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="mb-6">
    <div className="mb-3 h-4 w-1/3 rounded bg-gray-200 animate-pulse"></div>
    {Array.from({ length: count }).map((_, index) => (
      <MeetingCardSkeleton key={index} />
    ))}
  </div>
)

// Full skeleton loader for the meetings list
const MeetingsListSkeleton = () => {
  return (
    <>
      <MeetingsGroupSkeleton count={3} />
      <MeetingsGroupSkeleton count={2} />
    </>
  )
}

export default MeetingsListSkeleton
