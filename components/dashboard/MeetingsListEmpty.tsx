"use client"
import { Calendar } from "lucide-react"
import { getInitialDateRange } from "@/lib/redux/features/meetingsSlice"
import { useAppDispatch } from "@/lib/redux/hooks"
import { fetchMeetingsThunk } from "@/lib/redux/features/meetingsSlice"

const MeetingsListEmpty = () => {
  const dispatch = useAppDispatch()

  const handleLoadMoreDates = () => {
    const dateRange = getInitialDateRange()
    dispatch(fetchMeetingsThunk(dateRange))
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Calendar className="h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-1">No meetings found</h3>
      <p className="text-sm text-gray-500 max-w-xs">
        You don't have any scheduled meetings for the selected time period.
      </p>
      <button
        onClick={handleLoadMoreDates}
        className="mt-4 rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
      >
        Refresh
      </button>
    </div>
  )
}

export default MeetingsListEmpty
