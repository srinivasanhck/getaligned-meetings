"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bot, FileText, FileUp, Link } from "lucide-react"
import { ExamplePrompts } from "@/components/ppt/ExamplePrompts"
import { PromptInput } from "@/components/ppt/PromptInput"
import { FileUpload } from "@/components/ppt/FileUpload"
import { useAppDispatch } from "@/lib/redux/hooks"
import { setTitle, setOutline, setIsGeneratingOutline } from "@/lib/redux/features/pptSlice"
import { useRouter } from "next/navigation"
import { getToken } from "@/services/authService"
import { APIURL } from "@/lib/utils"

export default function GeneratePPTPage() {
  const dispatch = useAppDispatch()
  const [prompt, setPrompt] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedOption, setSelectedOption] = useState("chat")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
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

  const handleSelectPrompt = (selectedPrompt: string) => {
    setPrompt(selectedPrompt)
    setIsTyping(true)
  }

  const handleGenerateOutline = async (settings: {
    pages: string
    tone: string
    audience: string
    scenario: string
  }) => {
    if (!prompt.trim() || isLoading) return

    setIsLoading(true)
    setError(null)
    dispatch(setIsGeneratingOutline(true))

    try {
      // API call
      const token = getToken()

      const requestBody = {
        content: prompt,
        pages: settings.pages,
        tone: settings.tone,
        audience: settings.audience,
        scenario: settings.scenario,
      }

      console.log("Sending request with body:", requestBody)

      const response = await fetch(`${APIURL}/api/v1/ppt/mindmap/generate`, {
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

      // Use the hardcoded data
      setOutlineData(data)
      dispatch(setTitle(data.title))
      dispatch(setOutline(data.outline))

      // Redirect to the outline page
      router.push(`/generate-ppt/outline/${data.id}`)
    } catch (err) {
      console.error("Error generating outline:", err)
      setError(err instanceof Error ? err.message : "Failed to generate outline")
    } finally {
      setIsLoading(false)
      dispatch(setIsGeneratingOutline(false))
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    console.log("File selected:", file.name, file.type, file.size)
  }

  const creationOptions = [
    { id: "chat", name: "Chat to Generate", icon: <Bot className="h-5 w-5" /> },
    { id: "documents", name: "Import Documents", icon: <FileText className="h-5 w-5" /> },
    { id: "drive", name: "Import from Google Drive", icon: <FileUp className="h-5 w-5" /> },
    { id: "url", name: "Import from URL", icon: <Link className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-gray-500 mb-1">Hi there,</h2>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">How would you like to create your PPT?</h1>
          <p className="text-gray-600 mt-2">
            Simply type in your topic, or select one of the options below.
            <br />
            Your presentation will be available in a few seconds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {creationOptions.map((option) => (
            <motion.button
              key={option.id}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border transition-all ${
                selectedOption === option.id
                  ? "bg-white border-purple-200 shadow-sm text-purple-600"
                  : "bg-white/80 border-gray-200 text-gray-600 hover:bg-white hover:shadow-sm"
              }`}
              onClick={() => setSelectedOption(option.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  selectedOption === option.id ? "bg-purple-100" : "bg-gray-100"
                }`}
              >
                {option.icon}
              </div>
              <span className="text-sm font-medium">{option.name}</span>
            </motion.button>
          ))}
        </div>

        {selectedOption === "chat" && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6"
            >
              <PromptInput
                value={prompt}
                onChange={handlePromptChange}
                onSubmit={handleGenerateOutline}
                isLoading={isLoading}
              />
            </motion.div>

            {error && (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}

            {outlineData && !isLoading && !error && (
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-800">Outline generated successfully!</p>
                <p className="text-green-700 mt-1">Title: {outlineData.title}</p>
                <p className="text-green-700 mt-1">Number of slides: {outlineData.outline.length}</p>
              </div>
            )}

            {!isTyping && !isLoading && !outlineData && <ExamplePrompts onSelectPrompt={handleSelectPrompt} />}
          </>
        )}

        {selectedOption === "documents" && (
          <motion.div
            className="mt-6 bg-white rounded-xl border border-gray-200 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex justify-center space-x-4 mb-8">
              <button className="px-4 py-2 border-b-2 border-purple-500 text-purple-600 font-medium">
                Upload file
              </button>
              <button className="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                Paste in text
              </button>
            </div>

            <FileUpload onFileSelect={handleFileSelect} />
          </motion.div>
        )}

        {selectedOption === "drive" && (
          <motion.div
            className="mt-6 bg-white rounded-xl border border-gray-200 p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-12">
              <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3 1.4.8 2.9 1.2 4.5 1.2h47.4c1.6 0 3.1-.4 4.5-1.2 1.35-.8 2.5-1.9 3.3-3.3l3.85-6.65-70.7-.05z"
                  fill="#0066da"
                />
                <path
                  d="m45.95 12.8-18.2 31.5-19.5 33.7c.8 1.4 1.95 2.5 3.3 3.3 1.4.8 2.9 1.2 4.5 1.2h47.4c1.6 0 3.1-.4 4.5-1.2 1.35-.8 2.5-1.9 3.3-3.3l-25.3-43.8-18.2-31.5c-1.6 2.75-3.2 5.55-4.8 8.3z"
                  fill="#00ac47"
                />
                <path d="m45.95 12.8-18.2 31.5-19.5 33.7 37.7-65.2z" fill="#00832d" />
                <path d="m45.95 12.8 18.2 31.5 25.3 43.8-43.5-75.3z" fill="#2684fc" />
                <path
                  d="m45.95 12.8 18.2 31.5 25.3 43.8c.8-1.4 1.2-2.9 1.2-4.5v-66.6c0-1.6-.4-3.1-1.2-4.5-.8-1.35-1.9-2.5-3.3-3.3-1.4-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.1.4-4.5 1.2-1.35.8-2.5 1.95-3.3 3.3l-9.4 16.3z"
                  fill="#ffba00"
                />
              </svg>
              <p className="text-gray-700 mb-2">Connect to Google Drive</p>
              <p className="text-sm text-gray-500 mb-4">Import documents directly from your Google Drive</p>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                onClick={() => console.log("Connect to Google Drive")}
              >
                Connect Google Drive
              </button>
            </div>
          </motion.div>
        )}

        {selectedOption === "url" && (
          <motion.div
            className="mt-6 bg-white rounded-xl border border-gray-200 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-medium mb-4">Import from URL</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter a URL to import content from"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                onClick={() => console.log("Import from URL")}
              >
                Import
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              We'll extract the content from the URL and use it to generate your presentation.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
