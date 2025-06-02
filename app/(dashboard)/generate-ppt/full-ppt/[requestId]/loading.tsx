import { Loader2 } from "lucide-react"

export default function FullPptLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-800">Loading Presentation</h2>
        <p className="text-gray-600">Please wait while we prepare your slides...</p>
      </div>
    </div>
  )
}
