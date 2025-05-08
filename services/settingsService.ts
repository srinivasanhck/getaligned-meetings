import api from "@/services/api"

export interface BotInfo {
  id: number | null
  botName: string
  botType: string
  botDescription: string | null
  botStatus: string
  botVersion: string | null
  createdAt: string
  updatedAt: string
  userId: number
  userName: string
}

export interface BotNameResponse {
  success: boolean
  message: string
}

export interface ErrorResponse {
  message: string
  errorType: string
  statusCode: number
  path: string | null
  timeStamp: string
}

export async function getBotInfo(): Promise<BotInfo> {
  try {
    const response = await api.get("/api/v1/meeting-bot/bot")
    return response.data
  } catch (error: any) {
    // Check if this is the specific "Bot not found" error
    if (error.response?.status === 404 && error.response?.data?.errorType === "Bot not found") {
      throw {
        isBotNotFoundError: true,
        message: error.response.data.message,
        ...error.response.data,
      }
    }
    console.error("Error fetching bot info:", error)
    throw error
  }
}

export async function updateBotName(botName: string): Promise<BotNameResponse> {
  try {
    const response = await api.post("/api/v1/meeting-bot/add-bot-name", {
      botName,
    })

    return {
      success: true,
      message: "Bot name updated successfully",
    }
  } catch (error) {
    console.error("Error updating bot name:", error)
    return {
      success: false,
      message: "Failed to update bot name. Please try again.",
    }
  }
}
