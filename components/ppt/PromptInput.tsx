"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload, Sparkles, Loader2 } from "lucide-react"
import { PresentationSettings } from "./PresentationSettings"

interface PromptInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (settings: {
    pages: string
    tone: string
    audience: string
    scenario: string
  }) => void
  isLoading?: boolean
}

export function PromptInput({ value, onChange, onSubmit, isLoading = false }: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [charCount, setCharCount] = useState(0)
  const [pages, setPages] = useState("3-5")
  const [tone, setTone] = useState("General")
  const [audience, setAudience] = useState("General")
  const [scenario, setScenario] = useState("General")

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
    setCharCount(value.length)
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && !isLoading) {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (!isLoading) {
      onSubmit({
        pages,
        tone,
        audience,
        scenario,
      })
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
      <div className="relative">
        <textarea
          ref={textareaRef}
          className="w-full px-4 pt-4 pb-12 text-gray-800 resize-none focus:outline-none min-h-[100px]"
          placeholder="What would you like to create? (e.g., 'Create a sales pitch for our new CRM solution')"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
        />

        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end p-2 border-t bg-gray-50">
          <div className="flex items-center gap-2 mr-[16px]">
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => console.log("Upload file")}
              disabled={isLoading}
            >
              <Upload className="h-5 w-5" />
            </button>
            <span className="text-xs text-gray-500">{charCount}/1000</span>
          </div>

          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              isLoading
                ? "bg-purple-400 text-white cursor-not-allowed"
                : value.trim().length > 0
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
            } transition-colors`}
            disabled={value.trim().length === 0 || isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Outline</span>
              </>
            )}
          </button>
        </div>
      </div>

      <PresentationSettings
        pages={pages}
        tone={tone}
        audience={audience}
        scenario={scenario}
        onPagesChange={setPages}
        onToneChange={setTone}
        onAudienceChange={setAudience}
        onScenarioChange={setScenario}
      />
    </div>
  )
}
