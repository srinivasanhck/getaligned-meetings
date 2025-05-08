import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="container mx-auto p-6">
      <Skeleton className="h-10 w-1/4 mb-6" />
      <div className="grid gap-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-1/4" />
        </div>
      </div>
    </div>
  )
}
