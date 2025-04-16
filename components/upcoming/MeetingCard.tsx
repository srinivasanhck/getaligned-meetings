"use client"

import type React from "react"

import { useState } from "react"
import { ExternalLink, Loader } from "lucide-react"
import { formatTime, getMeetingDuration, getInitialsFromEmail } from "@/lib/utils/formatters"
import { addBotToMeeting, removeBotFromMeeting } from "@/services/upcomingMeetingsService"
import { useToast } from "@/components/ui/toast"
import { useAppDispatch } from "@/lib/redux/hooks"
import type { Meeting } from "@/types/meetings"

interface MeetingCardProps {
  meeting: Meeting
  dateStr: string
  onBotStatusChange: (meetingId: string, hasBotEnabled: boolean) => void
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, dateStr, onBotStatusChange }) => {
  const dispatch = useAppDispatch()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [botEnabled, setBotEnabled] = useState(!!meeting.meetingBot)
  const duration = getMeetingDuration(meeting.start.dateTime, meeting.end.dateTime)

  // Get up to 3 attendees to display
  const displayAttendees = meeting.attendees?.slice(0, 3) || []
  const additionalAttendeesCount = Math.max(0, (meeting.attendees?.length || 0) - 3)

  // Generate random colors for attendees (in a real app, these would be consistent)
  const colors = [
    "bg-red-100 text-red-600",
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
  ]

  const handleBotToggle = async (checked: boolean) => {
    setIsLoading(true)

    try {
      if (checked) {
        // Add bot to meeting
        const result = await addBotToMeeting(meeting.id)

        if (
          result.errorType === "Meeting in the past" ||
          result.errorType === "Meeting is already started or less than 10 minutes remaining for meeting" ||
          result.errorType === "Meeting start time cannot be in the past"
        ) {
          showToast("Meeting is already started or less than 5 minutes remaining for meeting", "error")
        } else if (result.errorType === "Bot already exists") {
          showToast("Bot is already in the meet", "error")
        } else if (result.errorType === "GenericError") {
          showToast("Meeting url doesn't exist or something went wrong. Please try again later", "warning")
        } else if (result) {
          showToast("Meeting bot added successfully. Bot will take a few minutes to join the meeting", "success")
          setBotEnabled(true)
          onBotStatusChange(meeting.id, true)
        }
      } else {
        // Remove bot from meeting
        const result = await removeBotFromMeeting(meeting.id)

        if (
          result.errorType === "Meeting in the past" ||
          result.errorType === "Meeting is already started or less than 10 minutes remaining for meeting" ||
          result.errorType === "Meeting start time cannot be in the past"
        ) {
          showToast("Meeting is already started", "error")
        } else if (result.message === "User not authorized to remove bot from meeting") {
          showToast("You don't have authorization to remove bot from this meeting", "error")
        } else if (result.meetingBot === false) {
          showToast("Meeting bot removed successfully", "success")
          setBotEnabled(false)
          onBotStatusChange(meeting.id, false)
        } else {
          showToast("Something went wrong. Please try again later", "error")
        }
      }
    } catch (err) {
      console.error("Error toggling bot:", err)
      showToast(`${err}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4" style={{ width: "320px" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-900 truncate max-w-[220px]">{meeting.summary}</h3>
        <div className="relative h-6 w-12">
          {isLoading ? (
            <div className="flex items-center justify-center h-6">
              <Loader className="h-5 w-5 text-purple-600 animate-spin" />
            </div>
          ) : (
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={botEnabled}
                onChange={(e) => handleBotToggle(e.target.checked)}
                disabled={isLoading}
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-purple-300 peer-disabled:opacity-50"></div>
            </label>
          )}
        </div>
      </div>

      <div className="mt-2 text-sm text-gray-500">
        {formatTime(meeting.start.dateTime)} • {duration} mins
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex -space-x-1">
          {displayAttendees.map((attendee, index) => (
            <div
              key={attendee.email}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${colors[index % colors.length]}`}
              title={attendee.email}
            >
              {getInitialsFromEmail(attendee.email)}
            </div>
          ))}
          {additionalAttendeesCount > 0 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
              +{additionalAttendeesCount}
            </div>
          )}
        </div>

        {meeting.hangoutLink && (
          <a
            href={meeting.hangoutLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 transition-colors"
          >
            Join Meeting <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  )
}

export default MeetingCard
