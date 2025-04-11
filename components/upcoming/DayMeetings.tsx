import type React from "react"
import MeetingCard from "./MeetingCard"
import type { Meeting } from "@/types/meetings"

interface DayMeetingsProps {
  date: string
  meetings: Meeting[]
  onBotStatusChange: (meetingId: string, hasBotEnabled: boolean) => void
}

const DayMeetings: React.FC<DayMeetingsProps> = ({ date, meetings, onBotStatusChange }) => {
  // Format the date to display day of week and date (e.g., "Wednesday • 9 Apr")
  const formattedDate = new Date(date)
  const dayOfWeek = formattedDate.toLocaleDateString("en-US", { weekday: "long" })
  const dayAndMonth = formattedDate.toLocaleDateString("en-US", { day: "numeric", month: "short" })

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-lg font-medium text-gray-700">
        {dayOfWeek} • {dayAndMonth}
      </h2>
      <div className="flex flex-wrap gap-4">
        {meetings.map((meeting) => (
          <MeetingCard key={meeting.id} meeting={meeting} dateStr={date} onBotStatusChange={onBotStatusChange} />
        ))}
      </div>
    </div>
  )
}

export default DayMeetings
