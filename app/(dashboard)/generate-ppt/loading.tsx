import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container max-w-5xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-6 w-64 mx-auto mt-3" />
        </div>

        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-32" />
          ))}
        </div>

        <Skeleton className="h-40 w-full rounded-xl" />

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <Skeleton className="h-6 w-32 bg-background" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
