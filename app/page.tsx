"use client"

import { useEffect, useRef } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import { fetchMeetingsThunk, getInitialDateRange } from "@/lib/redux/features/meetingsSlice"
import Sidebar from "@/components/layout/sidebar"
import MeetingsList from "@/components/dashboard/MeetingsList"
import MeetingDetails from "@/components/dashboard/MeetingDetails"
import { useAuth } from "@/contexts/AuthContext"
import { setSelectedMeetingId, clearMeetingDetails } from "@/lib/redux/features/meetingDetailsSlice"

export default function Home() {
  const dispatch = useAppDispatch()
  const { meetings, loading } = useAppSelector((state) => state.meetings)
  const { selectedMeetingId } = useAppSelector((state) => state.meetingDetails)
  const { hasCalendarAccess } = useAuth()
  const initialRedirectDone = useRef(false)

  // Fetch meetings on initial load
  useEffect(() => {
    if (hasCalendarAccess) {
      const initialDateRange = getInitialDateRange()
      dispatch(fetchMeetingsThunk(initialDateRange))
    }
  }, [dispatch, hasCalendarAccess])

  // Clear meeting details when on the home page
  useEffect(() => {
    // If we're on the home page and there's a selected meeting ID,
    // we should clear it to ensure proper state management
    if (window.location.pathname === "/" && selectedMeetingId) {
      dispatch(clearMeetingDetails())
    }
  }, [dispatch, selectedMeetingId])

  // Handle initial redirect to meeting page
  useEffect(() => {
    // Only do the automatic redirect if we're on the root path
    // This prevents overriding a direct meeting URL visit
    if (window.location.pathname === "/" && !loading && meetings.length > 0 && !initialRedirectDone.current) {
      // Sort meetings by date (newest first)
      const sortedMeetings = [...meetings].sort(
        (a, b) => new Date(b.start.dateTime).getTime() - new Date(a.start.dateTime).getTime(),
      )

      // Find the first meeting with "SummaryReady" status
      const readyMeeting = sortedMeetings.find((meeting) => meeting.meetingStatus === "SummaryReady")

      if (readyMeeting) {
        // Update Redux state
        dispatch(setSelectedMeetingId(readyMeeting.id))

        // Update URL without causing a page reload
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", `/meeting/${readyMeeting.id}`)
          initialRedirectDone.current = true
        }
      }
    }
  }, [meetings, loading, dispatch])

  return (
    <div className="flex h-screen">
      <Sidebar />
      <MeetingsList />
      <main className="flex-1 overflow-hidden">
        <MeetingDetails />
      </main>
    </div>
  )
}

