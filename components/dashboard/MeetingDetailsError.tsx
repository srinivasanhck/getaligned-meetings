"use client"
import { AlertCircle } from "lucide-react"
import { useAppDispatch } from "@/lib/redux/hooks"
import { fetchMeetingDetailsThunk } from "@/lib/redux/features/meetingDetailsSlice"

interface MeetingDetailsErrorProps {
  error: string
  meetingId: string | null
}

const MeetingDetailsError = ({ error, meetingId }: MeetingDetailsErrorProps) => {
  const dispatch = useAppDispatch()

  const handleRetry = () => {
    if (meetingId) {
      dispatch(fetchMeetingDetailsThunk(meetingId))
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-md w-full rounded-lg border border-red-100 bg-red-50 p-6 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Meeting Details</h3>
        <p className="text-red-600 mb-4">{error}</p>
        {meetingId && (
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}

export default MeetingDetailsError
