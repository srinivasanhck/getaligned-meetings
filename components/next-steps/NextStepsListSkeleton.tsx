import { Skeleton } from "@/components/ui/skeleton"

export default function NextStepsListSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Stats Cards Skeleton */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card text-card-foreground p-4">
            <Skeleton className="mb-2 h-4 w-32" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Meeting Skeleton */}
      {[...Array(2)].map((_, meetingIndex) => (
        <div key={meetingIndex} className="mb-6 bg-card text-card-foreground">
          {/* Meeting Header */}
          <div className="bg-muted/30 px-4 py-3">
            <Skeleton className="h-5 w-3/4 max-w-md" />
            <Skeleton className="mt-1 h-4 w-1/2 max-w-xs" />
          </div>

          {/* Tasks List Skeleton */}
          <div className="px-4 py-2 space-y-2">
            {[...Array(3)].map((_, taskIndex) => (
              <div key={taskIndex} className="py-1.5">
                <div className="flex items-start">
                  <Skeleton className="mr-3 mt-0.5 h-5 w-5 rounded-full" />
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <Skeleton className="h-5 w-3/4 max-w-md" />
                      <Skeleton className="mt-0.5 sm:mt-0 h-4 w-1/3 max-w-[150px]" />
                    </div>
                    <Skeleton className="mt-0.5 h-4 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
