"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bot, Users } from "lucide-react"
import { ExamplePrompts } from "@/components/ppt/ExamplePrompts"
import { PromptInput } from "@/components/ppt/PromptInput"
import { MeetingSelection } from "@/components/ppt/MeetingSelection"
import { useAppDispatch } from "@/lib/redux/hooks"
import { setTitle, setOutline, setIsGeneratingOutline } from "@/lib/redux/features/pptSlice"
import { useRouter } from "next/navigation"
import { getToken } from "@/services/authService"
import AllPresentationsList from "@/components/ppt/AllPresentationsList"
import { APIURLINTEGRATION } from "@/lib/utils"

export default function GeneratePPTPage() {
  const dispatch = useAppDispatch()
  const [prompt, setPrompt] = useState("")
  const [meetingPrompt, setMeetingPrompt] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedOption, setSelectedOption] = useState("")
  const [selectedMeetings, setSelectedMeetings] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [outlineData, setOutlineData] = useState<any>(null)
  const router = useRouter()

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true)
    } else if (isTyping && e.target.value.length === 0) {
      setIsTyping(false)
    }
  }

  const handleMeetingPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMeetingPrompt(e.target.value)
  }

  const handleSelectPrompt = (selectedPrompt: string) => {
    setPrompt(selectedPrompt)
    setIsTyping(true)
  }

  // Upload files to get URLs
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = []
    const token = getToken()

    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append("file", file, file.name)

        const response = await fetch(`${APIURLINTEGRATION}/v1/files/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const data = await response.json()
        if (data.success && data.url) {
          uploadedUrls.push(data.url)
        } else {
          throw new Error(`Upload failed for ${file.name}`)
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        throw error
      }
    }

    return uploadedUrls
  }

  const handleGenerateOutline = async (
    settings: {
      pages: string
      tone: string
      audience: string
      scenario: string
    },
    sourceType: "chat" | "meetings" = "chat",
  ) => {
    // Validation based on source type
    if (sourceType === "chat" && (!prompt.trim() || isLoading)) return
    if (sourceType === "meetings" && (selectedMeetings.length === 0 || isLoading)) return

    setIsLoading(true)
    setError(null)
    dispatch(setIsGeneratingOutline(true))

    try {
      const token = getToken()
      let fileUrls: string[] = []

      // Upload files first if any are selected (only for meetings)
      if (sourceType === "meetings" && uploadedFiles.length > 0) {
        console.log(
          "Uploading files:",
          uploadedFiles.map((f) => f.name),
        )
        fileUrls = await uploadFiles(uploadedFiles)
        console.log("Uploaded file URLs:", fileUrls)
      }

      const requestBody: any = {
        inputType: sourceType === "chat" ? "PROMPT" : "MEETINGS",
        useSearch: false,
        pages: settings.pages,
        tone: settings.tone,
        scenario: settings.scenario,
      }

      // Add content based on source type
      if (sourceType === "chat") {
        requestBody.userInput = prompt
      } else if (sourceType === "meetings") {
        // For meetings, we'll need to format the userInput differently
        requestBody.userInput = meetingPrompt.trim() || "Generate presentation from selected meetings"
        requestBody.meeting_ids = selectedMeetings
        // Add file URLs if any files were uploaded
        if (fileUrls.length > 0) {
          requestBody.file_url = fileUrls
        }
      }

      console.log("Sending request with body:", requestBody)

      const response = await fetch(`${APIURLINTEGRATION}/generate_presentation_outline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.message || `Error: ${response.status}`)
      }

      const data = await response.json()

      console.log("Using outline data:", data)

      // Generate a unique ID for navigation since the response doesn't have one
      const outlineId = `outline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Extract title from first slide or use a default
      const title = data.outline?.[0]?.slideTitle || "Generated Presentation"

      setOutlineData({ ...data, id: outlineId, title })
      dispatch(setTitle(title))
      dispatch(setOutline(data.outline))

      // Redirect to the outline page
      console.log("Redirecting to outline page with ID:", outlineId)
      router.push(`/generate-ppt/outline/${outlineId}`)
    } catch (err) {
      console.error("Error generating outline:", err)
      setError(err instanceof Error ? err.message : "Failed to generate outline")
    } finally {
      setIsLoading(false)
      dispatch(setIsGeneratingOutline(false))
    }
  }

  const handleMeetingSelection = (meetingIds: string[]) => {
    setSelectedMeetings(meetingIds)
    console.log("Selected meetings:", meetingIds)
  }

  const handleMeetingFilesChange = (files: File[]) => {
    setUploadedFiles(files)
    console.log(
      "Meeting files selected:",
      files.map((f) => f.name),
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-gray-500 mb-2 text-lg">Hi there,</h2>
          <h1 className="text-4xl font-bold tracking-tight text-gray-800 mb-4">
            How would you like to create your PPT?
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose your preferred method to generate a professional presentation in seconds
          </p>
        </motion.div>

        {/* Main Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.button
            className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
              selectedOption === "chat"
                ? "border-purple-300 bg-white shadow-lg scale-105"
                : "border-gray-200 bg-white/80 hover:bg-white hover:shadow-md hover:scale-102"
            }`}
            onClick={() => setSelectedOption("chat")}
            whileHover={{ scale: selectedOption === "chat" ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="p-8 text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
                  selectedOption === "chat"
                    ? "bg-purple-100 text-purple-600"
                    : "bg-gray-100 text-gray-600 group-hover:bg-purple-50 group-hover:text-purple-500"
                }`}
              >
                <Bot className="h-8 w-8" />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 transition-colors ${
                  selectedOption === "chat" ? "text-purple-600" : "text-gray-800"
                }`}
              >
                Chat to Generate
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Describe your topic and let AI create a comprehensive presentation for you
              </p>
            </div>
            {selectedOption === "chat" && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none" />
            )}
          </motion.button>

          <motion.button
            className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
              selectedOption === "meetings"
                ? "border-purple-300 bg-white shadow-lg scale-105"
                : "border-gray-200 bg-white/80 hover:bg-white hover:shadow-md hover:scale-102"
            }`}
            onClick={() => setSelectedOption("meetings")}
            whileHover={{ scale: selectedOption === "meetings" ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-8 text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
                  selectedOption === "meetings"
                    ? "bg-purple-100 text-purple-600"
                    : "bg-gray-100 text-gray-600 group-hover:bg-purple-50 group-hover:text-purple-500"
                }`}
              >
                <Users className="h-8 w-8" />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 transition-colors ${
                  selectedOption === "meetings" ? "text-purple-600" : "text-gray-800"
                }`}
              >
                Import from Meetings
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Transform your meeting summaries and documents into professional presentations
              </p>
            </div>
            {selectedOption === "meetings" && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none" />
            )}
          </motion.button>
        </div>

        {/* Content Based on Selection */}
        {selectedOption && selectedOption === "chat" && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8"
            >
              <PromptInput
                value={prompt}
                onChange={handlePromptChange}
                onSubmit={(settings) => handleGenerateOutline(settings, "chat")}
                isLoading={isLoading}
              />
            </motion.div>

            {error && (
              <motion.div
                className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </motion.div>
            )}

            {outlineData && !isLoading && !error && (
              <motion.div
                className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-medium text-green-800">Outline generated successfully!</p>
                <p className="text-green-700 mt-1">Title: {outlineData.title}</p>
                <p className="text-green-700 mt-1">Number of slides: {outlineData.outline.length}</p>
              </motion.div>
            )}

            {!isTyping && !isLoading && !outlineData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <ExamplePrompts onSelectPrompt={handleSelectPrompt} />
              </motion.div>
            )}
          </>
        )}

        {selectedOption && selectedOption === "meetings" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <MeetingSelection
              onMeetingSelection={handleMeetingSelection}
              meetingPrompt={meetingPrompt}
              onMeetingPromptChange={handleMeetingPromptChange}
              onGenerateOutline={(settings) => handleGenerateOutline(settings, "meetings")}
              onFilesChange={handleMeetingFilesChange}
              isLoading={isLoading}
              selectedMeetingsCount={selectedMeetings.length}
              uploadedFiles={uploadedFiles}
            />

            {error && (
              <motion.div
                className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </motion.div>
            )}

            {outlineData && !isLoading && !error && (
              <motion.div
                className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-medium text-green-800">Outline generated successfully!</p>
                <p className="text-green-700 mt-1">Title: {outlineData.title}</p>
                <p className="text-green-700 mt-1">Number of slides: {outlineData.outline.length}</p>
              </motion.div>
            )}
          </motion.div>
        )}
           {/* All Presentations List */}
        <AllPresentationsList />
      </div>
    </div>
  )
}
