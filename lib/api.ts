import { getToken } from "@/services/authService"
import { APIURL, APIURLINTEGRATION } from "./utils";


  const AUTH_TOKEN = getToken();
// const AUTH_TOKEN =
//   "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjbGVhbktvZGluZyIsInN1YiI6IkpXVCBUb2tlbiIsInVzZXJuYW1lIjoiNzQiLCJhdXRob3JpdGllcyI6IlJPTEVfVVNFUiIsImlhdCI6MTc0NTkyNjQ2NiwiZXhwIjoxNzc3NDYyNDY2fQ.eAsOIyxKmY0kn7kNskFWk15-zDV7rP_VeOvCWJ5wm1E"

export interface InitiatePPTResponse {
  request_id: string
}

export interface GeneratePPTResponse {
  data: {
    slides: Array<{
      slide_id: string
      background: string
      content: Array<{
        id: string
        x: number
        y: number
        width: number
        height: number
        type?: string
        html?: string
        src?: string
        alt?: string
        caption?: string
        style?: Record<string, any>
      }>
    }>
  }
}

export interface EditContentRequest {
  request_id: string
  slide_id: string
  content_id?: string // Optional - only for element editing
  prompt: string
}

export interface EditContentResponse {
  data: {
    slide_id: string
    content?: Array<{
      id: string
      x: number
      y: number
      width: number
      height: number
      type?: string
      html?: string
      src?: string
      alt?: string
      caption?: string
      style?: Record<string, any>
    }>
    background?: string
    // For element editing, might return just the updated element
    updated_element?: {
      id: string
      x: number
      y: number
      width: number
      height: number
      type?: string
      html?: string
      src?: string
      alt?: string
      caption?: string
      style?: Record<string, any>
    }
  }
}

export interface SaveSlidesRequest {
  slides: Array<{
    slide_id: string
    background: string
    content: Array<{
      id: string
      x: number
      y: number
      width: number
      height: number
      type?: string
      html?: string
      src?: string
      alt?: string
      caption?: string
      style?: Record<string, any>
    }>
  }>
}

export interface SaveSlidesResponse {
  message: string
  status: string
}

export interface FileUploadResponse {
  filename: string
  size_bytes: number
  success: boolean
  url: string
}

export async function initiatePPTGeneration(): Promise<InitiatePPTResponse> {
  try {
    const response = await fetch(`${APIURLINTEGRATION}/api/v1/slides/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to initiate PPT generation: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error initiating PPT generation:", error)
    throw error
  }
}

export async function generatePPTSlides(requestId: string): Promise<GeneratePPTResponse> {
  try {
    const response = await fetch(`${APIURLINTEGRATION}/api/v1/slides/generate?id=${requestId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to generate PPT slides: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error generating PPT slides:", error)
    throw error
  }
}

export async function editSlideContent(editRequest: EditContentRequest): Promise<EditContentResponse> {
  try {
    console.log("Sending edit request:", editRequest)

    const response = await fetch(`${APIURLINTEGRATION}/api/v1/slides/content/edit-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify(editRequest),
    })

    if (!response.ok) {
      throw new Error(`Failed to edit slide content: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Edit response received:", data)
    return data
  } catch (error) {
    console.error("Error editing slide content:", error)
    throw error
  }
}

export async function saveSlides(requestId: string, slidesData: SaveSlidesRequest): Promise<SaveSlidesResponse> {
  try {
    console.log("Saving slides to backend:", { requestId, slidesData })

    const response = await fetch(`${APIURL}/api/v1/ppt/mindmap/slides?id=${requestId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify(slidesData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to save slides: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Save response received:", data)
    return data
  } catch (error) {
    console.error("Error saving slides:", error)
    throw error
  }
}

export async function uploadFile(file: File, filename?: string): Promise<FileUploadResponse> {
  try {
    console.log("Uploading file:", file.name, "Size:", file.size)

    const formData = new FormData()
    // Use provided filename or generate a unique one
    const uploadFilename = filename || `${Date.now()}_${file.name}`
    formData.append("file", file, uploadFilename)

    const response = await fetch(`${APIURLINTEGRATION}/api/v1/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to upload file: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log("File upload response:", data)

    if (!data.success) {
      throw new Error("File upload failed: " + (data.message || "Unknown error"))
    }

    return data
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

// Batch upload multiple files
export async function uploadMultipleFiles(files: File[]): Promise<FileUploadResponse[]> {
  const uploadPromises = files.map((file, index) => {
    const filename = `${Date.now()}_${index}_${file.name}`
    return uploadFile(file, filename)
  })

  try {
    const results = await Promise.allSettled(uploadPromises)

    const successful: FileUploadResponse[] = []
    const failed: string[] = []

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successful.push(result.value)
      } else {
        failed.push(`File ${files[index].name}: ${result.reason.message}`)
        console.error(`Failed to upload ${files[index].name}:`, result.reason)
      }
    })

    if (failed.length > 0) {
      console.warn("Some files failed to upload:", failed)
    }

    return successful
  } catch (error) {
    console.error("Error in batch file upload:", error)
    throw error
  }
}



