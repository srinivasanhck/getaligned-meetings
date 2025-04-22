"use client"

import { useEffect } from "react"
import Sidebar from "@/components/layout/sidebar"
import MeetingsList from "@/components/dashboard/MeetingsList"
import MeetingDetails from "@/components/dashboard/MeetingDetails"
import { useAppDispatch } from "@/lib/redux/hooks"
import { setSelectedMeetingId } from "@/lib/redux/features/meetingDetailsSlice"

// This is a dynamic route that will receive the meeting ID as a parameter
export default function MeetingPage({ params }: { params: { id: string } }) {
  const meetingId = params.id
  const dispatch = useAppDispatch()

  // Update Redux state when this page is loaded directly
  useEffect(() => {
    if (meetingId) {
      dispatch(setSelectedMeetingId(meetingId))
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
