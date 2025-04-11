"use client"
import { AlertCircle } from "lucide-react"
import { getInitialDateRange } from "@/lib/redux/features/meetingsSlice"
import { useAppDispatch } from "@/lib/redux/hooks"
import { fetchMeetingsThunk } from "@/lib/redux/features/meetingsSlice"

interface MeetingsListErrorProps {
  error: string
}

const MeetingsListError = ({ error }: MeetingsListErrorProps) => {
  const dispatch = useAppDispatch()

  const handleRetry = () => {
    const dateRange = getInitialDateRange()
    dispatch(fetchMeetingsThunk(dateRange))
  }

  return (
    <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">
      <div className="flex items-center mb-2">
        <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
        <span className="font-medium">Error loading meetings</span>
      </div>
      <p>{error}</p>
      <button
        onClick={handleRetry}
        className="mt-3 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}

export default MeetingsListError
