"use client"

import { useState, useEffect, useRef } from "react"
import { useAppSelector } from "@/lib/redux/hooks"
import { formatDate, formatMeetingDetailsTime, getInitialsFromName, getAttendeeColor, formatDateForMT } from "@/lib/utils/formatters"
import MeetingDetailsLoading from "./MeetingDetailsLoading"
import MeetingDetailsError from "./MeetingDetailsError"
import { Clock, Calendar, Users, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import CalendarAccessPopup from "../auth/CalendarAccessPopup"
import axios from "axios"
import { APIURL } from "@/lib/utils"
import { getToken } from "@/services/authService"

// Import tab components
import SummaryTab from "./tabs/SummaryTab"
import DealSummaryTab from "./tabs/DealSummaryTab"
import EmailTab from "./tabs/EmailTab"
import { useToast } from "@/components/ui/toast"

// Tab type
type TabType = "summary" | "dealSummary" | "email"

const MeetingDetails = () => {
  const { details, loading, error, selectedMeetingId } = useAppSelector((state) => state.meetingDetails)
  const { initialLoading: meetingsInitialLoading } = useAppSelector((state) => state.meetings)
  const { hasCalendarAccess } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>("summary")
  const [showAttendees, setShowAttendees] = useState(false)
  const [showCalendarPopup, setShowCalendarPopup] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const attendeesRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  // Log meeting details to console when they're loaded
  useEffect(() => {
    if (details) {
      console.log("Meeting Details in component:", details)
    }
  }, [details])

  // Close attendees popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attendeesRef.current && !attendeesRef.current.contains(event.target as Node)) {
        setShowAttendees(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Function to save deal summary to backend
  const saveDealSummaryToBackend = async (updatedDealSummary: any) => {
    if (!details || !details.meeting || !details.meeting.meetingUniqueId) {
      toast.showToast("Meeting ID not found. Cannot save changes.", "error")
      return
    }

    const meetingUniqueId = details.meeting.meetingUniqueId

    try {
      setIsSaving(true)
      console.log("Saving updated deal summary:", updatedDealSummary)

      // Format the request body according to the API requirements
      const requestBody = {
        "left-side": updatedDealSummary["left-side"],
        "right-side": updatedDealSummary["right-side"],
      }

      // Get the auth token
      const token = getToken()

      // Make the API call - using PUT request as specified
      const response = await axios.put(
        `${APIURL}/api/v1/meeting-bot/update-ai-generated-response?meetingUniqueId=${meetingUniqueId}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      )

      console.log("API response:", response.data)

      toast.showToast("Deal summary updated successfully", "success")
    } catch (error) {
      console.error("Error saving deal summary:", error)
      toast.showToast("Failed to save deal summary. Please try again.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  // If no calendar access, show a message
  if (!hasCalendarAccess) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Calendar Access Required</h3>
          <p className="text-gray-500 mb-6">Connect your Google Calendar to view meeting details and summaries.</p>
          <button
            onClick={() => setShowCalendarPopup(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Connect Calendar
          </button>

          {/* Calendar Access Popup */}
          {showCalendarPopup && <CalendarAccessPopup onClose={() => setShowCalendarPopup(false)} />}
        </div>
      </div>
    )
  }

  // Show loading state if meetings are still initially loading or if meeting details are loading
  if (meetingsInitialLoading || loading) {
    return <MeetingDetailsLoading />
  }

  if (error) {
    return <MeetingDetailsError error={error} meetingId={selectedMeetingId} />
  }

  if (!details) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No meeting selected</h3>
          <p className="text-sm text-gray-500">Select a meeting from the list to view its details.</p>
        </div>
      </div>
    )
  }

  // Extract meeting data
  const { meeting, attendees = [] } = details

  // Show all attendees without filtering
  const allAttendees = [...attendees]

  // Format meeting time correctly using the new formatter
  const formattedTime = meeting?.startTime ? formatMeetingDetailsTime(meeting.startTime) : ""

  // Calculate meeting duration
  const meetingDuration =
    meeting?.startTime && meeting?.endTime
      ? Math.round((new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / (1000 * 60))
      : 0

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="border-b border-gray-200 bg-white p-4 sticky top-0 z-10">
        <h1 className="text-base font-bold text-gray-900">{meeting?.meetingTitle || "Untitled Meeting"}</h1>
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
            <span>
              {formatDateForMT(meeting?.startTime || "")} • {formattedTime}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
            <span>{meetingDuration} min</span>
          </div>
          <div className="relative" ref={attendeesRef}>
            <button
              className="flex items-center hover:text-gray-700 transition-colors"
              onClick={() => allAttendees.length > 0 && setShowAttendees(!showAttendees)}
            >
              <Users className="mr-1.5 h-4 w-4 text-gray-400" />
              <span>{allAttendees.length} participants</span>
            </button>

            {/* Attendees Popup */}
            {showAttendees && allAttendees.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">Attendees</h3>
                  <div className="max-h-60 overflow-y-auto">
                    {allAttendees.map((attendee, index) => (
                      <div key={index} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${getAttendeeColor(attendee)}`}
                        >
                          {getInitialsFromName(attendee)}
                        </div>
                        <span className="ml-2 text-sm text-gray-700 truncate">{attendee}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Tabs */}
      <div className="border-b border-gray-200 bg-white sticky">
        <div className="flex">
          <button
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === "summary"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            )}
            onClick={() => setActiveTab("summary")}
          >
            Summary
          </button>
          <button
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === "dealSummary"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            )}
            onClick={() => setActiveTab("dealSummary")}
          >
            Deal Summary
          </button>
          <button
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === "email"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            )}
            onClick={() => setActiveTab("email")}
          >
            Email
          </button>
        </div>
      </div>

      {/* Tab Content - Container */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "summary" && <SummaryTab details={details} />}
        {activeTab === "dealSummary" && <DealSummaryTab details={details} onSave={saveDealSummaryToBackend} />}
        {activeTab === "email" && <EmailTab details={details} />}
      </div>

      {/* Loading overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 border-2 border-t-primary border-r-primary border-b-gray-200 border-l-gray-200 rounded-full animate-spin"></div>
              <span>Saving changes...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MeetingDetails
