import type { Meeting } from "@/types/meetings"

// Format date to display in a user-friendly way (Monday, April 7)
export const formatDateHeader = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

// Format date for meeting card (07 Apr 2025)
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, "0")
  const month = date.toLocaleDateString("en-US", { month: "short" })
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

export const formatDateForMT = (dateString: string): string => {
  const date = new Date(dateString)
  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = date.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC", // Force UTC
  })
  const year = date.getUTCFullYear()
  return `${day} ${month} ${year}`
}


// Format time for meeting cards (09:30 AM)
export const formatTime = (dateString: string): string => {
  if (!dateString) return ""

  try {
    // Create a date object from the ISO string (which includes timezone info)
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString)
      return ""
    }

    // Format the time in 12-hour format with AM/PM
    // We don't specify a timeZone here, so it will respect the timezone in the dateString
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  } catch (error) {
    console.error("Error formatting time:", error)
    return ""
  }
}

// Format time specifically for meeting details with UTC format (09:30 AM)
export const formatMeetingDetailsTime = (dateString: string): string => {
  if (!dateString) return ""

  try {
    // Create a date object from the ISO string
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString)
      return ""
    }

    // Format the time in 12-hour format with AM/PM, explicitly using UTC
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    })
  } catch (error) {
    console.error("Error formatting meeting details time:", error)
    return ""
  }
}

// Get meeting duration in minutes
export const getMeetingDuration = (startTime: string, endTime: string): number => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
}

// Get initials from email (e.g., john.doe@example.com -> JD)
export const getInitialsFromEmail = (email: string): string => {
  const parts = email.split("@")[0].split(".")

  if (parts.length >= 2) {
    // If email has format like "john.doe@example.com"
    return (parts[0][0] + parts[1][0]).toUpperCase()
  } else if (parts[0].length >= 2) {
    // If email has format like "johndoe@example.com"
    return parts[0].substring(0, 2).toUpperCase()
  } else {
    // Fallback
    return parts[0][0].toUpperCase()
  }
}

// Get initials from name (e.g., John Doe -> JD)
export const getInitialsFromName = (name: string): string => {
  if (!name) return ""

  const parts = name.split(" ")
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  } else if (parts[0].length >= 2) {
    return parts[0].substring(0, 2).toUpperCase()
  } else {
    return parts[0][0].toUpperCase()
  }
}

// Group meetings by date
export const groupMeetingsByDate = (meetings: Meeting[]): Record<string, Meeting[]> => {
  const grouped: Record<string, Meeting[]> = {}

  meetings.forEach((meeting) => {
    const date = new Date(meeting.start.dateTime)
    const dateKey = date.toISOString().split("T")[0] // YYYY-MM-DD format

    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }

    grouped[dateKey].push(meeting)
  })

  // Sort meetings within each date group by time (descending)
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => new Date(b.start.dateTime).getTime() - new Date(a.start.dateTime).getTime())
  })

  return grouped
}

// Check if a date is today
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString)
  const today = new Date()

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

// Check if a date is yesterday
export const isYesterday = (dateString: string): boolean => {
  const date = new Date(dateString)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  )
}

// Get a color for an attendee (consistent colors based on email)
export const getAttendeeColor = (email: string): string => {
  const colors = [
    "bg-red-100 text-red-600",
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-yellow-100 text-yellow-600",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
    "bg-indigo-100 text-indigo-600",
  ]

  // Simple hash function to get consistent colors
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}
