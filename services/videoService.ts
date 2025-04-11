import { APIURL } from "@/lib/utils"
import { getToken } from "@/services/authService"

export const fetchMeetingVideo = async (meetingUniqueId: string): Promise<string> => {
  try {
    const token = getToken()
    const response = await fetch(
      `${APIURL}/api/v1/meeting-bot/meeting-files-v2?meetingUniqueId=${meetingUniqueId}&fileType=mp4`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      // Handle 401 Unauthorized errors
      if (response.status === 401) {
        window.location.href = "/login"
        throw new Error("Authentication required")
      }

      throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`)
    }

    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error("Error fetching meeting video:", error)
    throw error
  }
}
