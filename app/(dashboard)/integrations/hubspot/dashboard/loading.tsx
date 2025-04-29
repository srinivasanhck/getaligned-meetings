import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      <Skeleton className="mb-4 h-10 w-full" />

      <div className="space-y-6">
        <div className="rounded-lg border">
          <div className="p-6">
            <Skeleton className="mb-2 h-6 w-40" />
            <Skeleton className="mb-6 h-4 w-64" />

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              <div>
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="mb-2 h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>

            <div className="mt-6 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
