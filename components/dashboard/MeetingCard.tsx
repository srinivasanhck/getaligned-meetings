"use client"

import type React from "react"
import type { Meeting } from "@/types/meetings"
import {
  formatDate,
  formatTime,
  getMeetingDuration,
  getInitialsFromEmail,
  isToday,
  isYesterday,
  getAttendeeColor,
} from "@/lib/utils/formatters"
import { Video, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface MeetingCardProps {
  meeting: Meeting
  onClick?: () => void
  isActive?: boolean
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onClick, isActive = false }) => {
  const meetingStatus = meeting.meetingStatus || ""
  const duration = getMeetingDuration(meeting.start.dateTime, meeting.end.dateTime)

  // Get up to 3 attendees to display
  const displayAttendees = meeting.attendees?.slice(0, 3) || []
  const additionalAttendeesCount = Math.max(0, (meeting.attendees?.length || 0) - 3)

  // Status styling based on meeting status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "SummaryReady":
        return "text-green-600 bg-green-50 border-green-100"
      case "InProgress":
        return "text-yellow-600 bg-yellow-50 border-yellow-100"
      case "BotRestricted":
        return "text-red-600 bg-red-50 border-red-100"
      default:
        return "text-gray-600 bg-gray-50 border-gray-100"
    }
  }

  // Status text based on meeting status
  const getStatusText = (status: string) => {
    switch (status) {
      case "SummaryReady":
        return "Summary Ready"
      case "InProgress":
        return "In Progress"
      case "BotRestricted":
        return "Bot Restricted"
      default:
        return ""
    }
  }

  // Status indicator color
  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "SummaryReady":
        return "bg-green-500"
      case "InProgress":
        return "bg-yellow-500"
      case "BotRestricted":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Only show status for specific statuses
  const showStatus = ["SummaryReady", "InProgress", "BotRestricted"].includes(meetingStatus)

  // Get date label (Today, Yesterday, or nothing)
  const getDateLabel = () => {
    if (isToday(meeting.start.dateTime)) {
      return "Today"
    } else if (isYesterday(meeting.start.dateTime)) {
      return "Yesterday"
    }
    return ""
  }

  const dateLabel = getDateLabel()

  return (
    <div
      className={cn(
        "mb-4 rounded-lg border transition-all cursor-pointer",
        isActive
          ? "border-primary/30 bg-primary/5 shadow-sm"
          : "border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm",
      )}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-center">
          <h3 className="text-[14px] font-medium text-gray-900 truncate max-w-[180px]">{meeting.summary}</h3>
          {dateLabel && <span className="text-xs text-gray-500 font-medium ml-2">{dateLabel}</span>}
        </div>

        <div className="mt-1 text-[12px] text-gray-500 flex items-center">
          <span>
            {formatDate(meeting.start.dateTime)} • {formatTime(meeting.start.dateTime)} • {duration} min
          </span>
          {meeting.hangoutLink && (
            <span className="ml-1 inline-flex items-center">
              <Video size={14} className="text-gray-400 ml-1" />
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {displayAttendees.map((attendee) => (
            <div
              key={attendee.email}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${getAttendeeColor(attendee.email)}`}
              title={attendee.email}
            >
              {getInitialsFromEmail(attendee.email)}
            </div>
          ))}

          {additionalAttendeesCount > 0 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
              +{additionalAttendeesCount}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          {showStatus && (
            <div
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusStyle(meetingStatus)}`}
            >
              <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${getStatusDotColor(meetingStatus)}`}></span>
              {getStatusText(meetingStatus)}
            </div>
          )}

          {meetingStatus === "InProgress" && meeting.hangoutLink && (
            <a
              href={meeting.hangoutLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 transition-colors"
              onClick={(e) => e.stopPropagation()} // Prevent triggering the card's onClick
            >
              Join Meeting <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default MeetingCard
