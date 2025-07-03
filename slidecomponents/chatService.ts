import { getToken } from "@/services/authService"

const API_BASE_URL = "https://api.getaligned.work/integration/api"

export interface ChatRequest {
  slide_requests_id: string
  agent_type: "ask" | "agent"
  prompt: string
  slide_id?: string // Optional for agent mode
}

export interface ChatMessage {
  id: string
  user_message: string
  agent_response: string
  agent_type: "ask" | "agent"
  created_at: string
  slide_requests_id: string
  slide_id?: string | null
}

export interface UpdatedSlide {
  id: string
  slide_number: number
  title: string
  titleForThumbnail: string
  iconNameForThumbnail: string
  elements_count: number
  background: {
    type: "color" | "gradient" | "image"
    value: string
  }
  defaultElementTextColor?: string
  elements: any[]
  text_content: Array<{
    content: string
    semantic_type: string
  }>
  charts: any[]
  images: any[]
}

export interface ChatResponse {
  agent_type: "ask" | "agent"
  conversation_history: ChatMessage[]
  edited: boolean
  response: string
  slide_requests_id: string
  success: boolean
  updated_slides?: UpdatedSlide[]
}

export interface ConversationHistoryResponse {
  conversation_history: ChatMessage[]
  slide_requests_id: string
  success: boolean
  total_messages: number
}

export const chatService = {
  // Send a chat message to the PPT assistant
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    try {
      const token = getToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      console.log("Sending chat request:", request)

      const response = await fetch(`${API_BASE_URL}/chat_with_ppt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.message || `HTTP Error: ${response.status} ${response.statusText}`)
      }

      const data: ChatResponse = await response.json()
      console.log("Chat response:", data)
      return data
    } catch (error) {
      console.error("Error sending chat message:", error)
      throw error
    }
  },

  getConversationHistory: async (requestId: string): Promise<ConversationHistoryResponse> => {
    try {
      const token = getToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      console.log("Fetching conversation history for requestId:", requestId)

      const response = await fetch(`${API_BASE_URL}/conversation_history/${requestId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.message || `HTTP Error: ${response.status} ${response.statusText}`)
      }

      const data: ConversationHistoryResponse = await response.json()
      console.log("Conversation history response:", data)
      return data
    } catch (error) {
      console.error("Error fetching conversation history:", error)
      throw error
    }
  },
}
