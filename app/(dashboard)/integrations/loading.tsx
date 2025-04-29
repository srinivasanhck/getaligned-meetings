import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="mt-2 h-5 w-[350px]" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[350px] w-full rounded-lg" />
        <Skeleton className="h-[350px] w-full rounded-lg" />
      </div>
    </div>
  )
}
