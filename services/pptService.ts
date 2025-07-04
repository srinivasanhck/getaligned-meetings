import { getToken } from "@/services/authService"
const API_PPT_URL = "https://api.getaligned.work/ppt"
export interface Slide {
  slide_id: string
  content: any[]
  background?: {
    type: string
    value: string
  }
}

export const pptService = {
  fetchSlidesByRequestId: async (requestId: string): Promise<Slide[]> => {
    try {
      const token = getToken()
      const response = await fetch(`${API_PPT_URL}/api/v1/slides/generate?id=${requestId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.message || `Error: ${response.status}`)
      }

      const res = await response.json()

      // Process the slides data
      if (res && res.data && Array.isArray(res.data.slides)) {
        return res.data.slides
      } else if (Array.isArray(res)) {
        // Fallback for backward compatibility
        return res
      } else if (res && Array.isArray(res.slides)) {
        // Alternative structure
        return res.slides
      }

      console.error("Unexpected response format:", res)
      return []
    } catch (error) {
      console.error("Error fetching slides:", error)
      throw error
    }
  },

  initiateSlideGeneration: async (request: any): Promise<{ request_id: string }> => {
    try {
      const token = getToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      console.log("Sending request to initiate slide generation:", request)

      // const response = await fetch(`https://api.getaligned.work/ppt/api/v1/slides/initiate`, {
      const response = await fetch(`https://api.getaligned.work/integration/api/v1/slides/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request), // Send the request object directly
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.message || `HTTP Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Received initiate response:", data)

      if (!data.request_id) {
        throw new Error("Invalid response: request_id not found")
      }

      return data
    } catch (error) {
      console.error("Error initiating slide generation:", error)
      throw error
    }
  },
}
