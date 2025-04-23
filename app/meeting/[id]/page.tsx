"use client"

import { useEffect } from "react"
import { use } from "react" // Import the use function from React
import Sidebar from "@/components/layout/sidebar"
import MeetingsList from "@/components/dashboard/MeetingsList"
import MeetingDetails from "@/components/dashboard/MeetingDetails"
import { useAppDispatch } from "@/lib/redux/hooks"
import { setSelectedMeetingId, fetchMeetingDetailsThunk } from "@/lib/redux/features/meetingDetailsSlice"


export default function MeetingPage({ params }: { params: any }) {
  // Unwrap the params object using React.use()
  const unwrappedParams = use(params) as { id: string }
  const meetingId = unwrappedParams.id
  const dispatch = useAppDispatch()

  // Update Redux state when this page is loaded directly
  useEffect(() => {
    if (meetingId) {
      // Set the selected meeting ID in Redux
      dispatch(setSelectedMeetingId(meetingId))

      // Directly fetch the meeting details for this ID
      // This ensures we load the correct meeting when the page is accessed directly
      dispatch(fetchMeetingDetailsThunk(meetingId))
    }
  }, [meetingId, dispatch])

  return (
    <div className="flex h-screen">
      <Sidebar />
      <MeetingsList selectedMeetingId={meetingId} />
      <main className="flex-1 overflow-hidden">
        <MeetingDetails meetingId={meetingId} />
      </main>
    </div>
  )
}
