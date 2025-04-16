import { APIURL } from "@/lib/utils"
import { getToken } from "@/services/authService"
import type { MeetingsResponse } from "@/types/meetings"

// Helper to format date to the specific format required by the API: YYYY-MM-DDTHH:MM:SS
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

// Create a reusable API client
const apiClient = async (url: string, options: RequestInit = {}) => {
  const token = getToken()
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }

  const response = await fetch(url, { ...defaultOptions, ...options })

  if (!response.ok) {
    // Handle 401 Unauthorized errors
    if (response.status === 401) {
      window.location.href = "/login"
      throw new Error("Authentication required")
    }

    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `API request failed with status ${response.status}`)
  }

  return response.json()
}

// Get today's upcoming meetings (from current time until end of day)
export const fetchTodayMeetings = async (): Promise<MeetingsResponse> => {
  // Use current time for start date
  const now = new Date()

  // Set end of day as 23:59:59
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59)

  const startDate = formatDateForAPI(now)
  const endDate = formatDateForAPI(endOfDay)

  console.log("Fetching today's meetings with date range:", { startDate, endDate })
  return fetchUpcomingMeetings(startDate, endDate)
}

// Get next 7 days meetings (from tomorrow until 7 days later)
export const fetchNext7DaysMeetings = async (): Promise<MeetingsResponse> => {
  const now = new Date()

  // Start from tomorrow at 00:00:00
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0)

  // End 7 days later at 23:59:59
  const sevenDaysLater = new Date(tomorrow)
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 6)
  sevenDaysLater.setHours(23, 59, 59)

  const startDate = formatDateForAPI(tomorrow)
  const endDate = formatDateForAPI(sevenDaysLater)

  console.log("Fetching next 7 days meetings with date range:", { startDate, endDate })
  return fetchUpcomingMeetings(startDate, endDate)
}

// Base function to fetch meetings for a date range
export const fetchUpcomingMeetings = async (startDate: string, endDate: string): Promise<MeetingsResponse> => {
  try {
    return apiClient(`${APIURL}/api/v1/googleCalendar/events?startDate=${startDate}&endDate=${endDate}`)
  } catch (error) {
    console.error("Error fetching upcoming meetings:", error)
    throw error
  }
}

// Add bot to a meeting
export const addBotToMeeting = async (meetingUniqueId: string) => {
  return apiClient(`${APIURL}/api/v1/meeting-bot/meeting`, {
    method: "POST",
    body: JSON.stringify({ meetingUniqueId }),
  })
}

// Remove bot from a meeting
export const removeBotFromMeeting = async (meetingId: string) => {
  return apiClient(`${APIURL}/api/v1/meeting-bot/remove-user-bot-job?meetingId=${meetingId}`, {
    method: "POST",
  })
}