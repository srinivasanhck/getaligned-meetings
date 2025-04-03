import { getToken } from "./auth"
import { APIURL } from "./utils"
/**
 * Base API client for making authenticated requests
 */
export async function apiClient<T>(url: string, options: RequestInit = {}): Promise<T> {
  // const token =
  //   "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjbGVhbktvZGluZyIsInN1YiI6IkpXVCBUb2tlbiIsInVzZXJuYW1lIjoiNzQiLCJhdXRob3JpdGllcyI6IlJPTEVfVVNFUiIsImlhdCI6MTc0MzE0NTgxOSwiZXhwIjoxNzc0NjgxODE5fQ.Slx00D525vU5DIbrBFonnc20Be-ae4QT0L59LqfsEOk"
  const token = getToken();
  console.log("token here got it",token);
  if (!token) {
    throw new Error("Authentication token not found")
  }

  const headers = new Headers({
    Authorization: `Bearer ${token}`,
  })

  // Only add Content-Type for non-GET requests with a body
  if (options.method && options.method !== "GET" && options.body) {
    headers.append("Content-Type", "application/json")
  }

  // Merge headers with any provided in options
  const mergedOptions = {
    ...options,
    headers,
  }

  console.log(`Making API request to: ${url}`)

  try {
    const response = await fetch(url, mergedOptions)

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.message || `API request failed with status ${response.status}`
      } catch {
        errorMessage = `API request failed with status ${response.status}: ${errorText}`
      }
      throw new Error(errorMessage)
    }

    // Check if the response is JSON
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      return response.json()
    }

    // Return empty object for non-JSON responses
    return {} as T
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

/**
 * Fetch meetings within a date range
 */
export async function fetchMeetings(startDate: string, endDate: string, page = 1, limit = 10) {
  return apiClient(
    `${APIURL}/api/v1/googleCalendar/events?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`,
  )
}

/**
 * Fetch meeting details by ID
 */
export async function fetchMeetingDetails(meetingId: string) {
  return apiClient(`${APIURL}/api/v1/meeting-bot/summary/transcript?id=${meetingId}`)
}

/**
 * Fetch email template for a meeting
 */
export async function fetchEmailTemplate(meetingId: string) {
  return apiClient(`${APIURL}/api/v1/meeting-bot/follow-up-emails?meetingId=${meetingId}`)
}

/**
 * Send email with attachments
 */
export async function sendEmail(emailData: {
  to: string[]
  cc: string[]
  bcc: string[]
  subject: string
  body: string
  attachments?: File[]
}) {
  // const token =
  //   "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjbGVhbktvZGluZyIsInN1YiI6IkpXVCBUb2tlbiIsInVzZXJuYW1lIjoiNzQiLCJhdXRob3JpdGllcyI6IlJPTEVfVVNFUiIsImlhdCI6MTc0MzE0NTgxOSwiZXhwIjoxNzc0NjgxODE5fQ.Slx00D525vU5DIbrBFonnc20Be-ae4QT0L59LqfsEOk"

  const token = getToken(); 

  // Create FormData object
  const formData = new FormData()

  // Add recipients
  formData.append("to", JSON.stringify(emailData.to))

  // Add CC if present
  if (emailData.cc && emailData.cc.length > 0) {
    formData.append("cc", JSON.stringify(emailData.cc))
  }

  // Add BCC if present
  if (emailData.bcc && emailData.bcc.length > 0) {
    formData.append("bcc", JSON.stringify(emailData.bcc))
  }

  // Add subject and body
  formData.append("subject", emailData.subject)
  formData.append("body", emailData.body)

  // Add attachments if present
  if (emailData.attachments && emailData.attachments.length > 0) {
    emailData.attachments.forEach((file, index) => {
      formData.append(`attachment`, file, file.name)
    })
  }

  // Create headers - don't set Content-Type for FormData
  const headers = new Headers()
  headers.append("Authorization", `Bearer ${token}`)

  const response = await fetch(
    `${APIURL}api/v1/meeting-bot/send-email?accessToken=${token}`,
    {
      method: "POST",
      headers: headers,
      body: formData,
    },
  )

  if (!response.ok) {
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json()
      throw new Error(errorData.message || `API request failed with status ${response.status}`)
    } else {
      throw new Error(`API request failed with status ${response.status}`)
    }
  }

  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    return response.json()
  }
  return response.text()
}

// Add these new functions to handle bot management

/**
 * Add bot to a meeting
 */
export async function addBotToMeeting(meetingUniqueId: string) {
  return apiClient(`${APIURL}/api/v1/meeting-bot/meeting`, {
    method: "POST",
    body: JSON.stringify({ meetingUniqueId }),
  })
}

/**
 * Remove bot from a meeting
 */
export async function removeBotFromMeeting(meetingId: string) {
  return apiClient(`${APIURL}/api/v1/meeting-bot/remove-user-bot-job?meetingId=${meetingId}`, {
    method: "POST",
  })
}

// Add this new function to fetch meeting video recording
export async function fetchMeetingVideo(meetingUniqueId: string) {
  // const token =
  //   "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjbGVhbktvZGluZyIsInN1YiI6IkpXVCBUb2tlbiIsInVzZXJuYW1lIjoiNzQiLCJhdXRob3JpdGllcyI6IlJPTEVfVVNFUiIsImlhdCI6MTc0MzE0NTgxOSwiZXhwIjoxNzc0NjgxODE5fQ.Slx00D525vU5DIbrBFonnc20Be-ae4QT0L59LqfsEOk"

  const token = getToken();

  const response = await fetch(
    `${APIURL}/api/v1/meeting-bot/meeting-files-v2?meetingUniqueId=${meetingUniqueId}&fileType=mp4`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch video: ${response.status}`)
  }

  return response.blob()
}

