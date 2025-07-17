// "use client"

// import type React from "react"

// import { useState, useRef, useEffect } from "react"
// import {  Sparkles, Loader2 } from "lucide-react"
// import { PresentationSettings } from "./PresentationSettings"

// interface PromptInputProps {
//   value: string
//   onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
//   onSubmit: (settings: {
//     pages: string
//     tone: string
//     audience: string
//     scenario: string
//   }) => void
//   isLoading?: boolean
// }

// export function PromptInput({ value, onChange, onSubmit, isLoading = false }: PromptInputProps) {
//   const textareaRef = useRef<HTMLTextAreaElement>(null)
//   const [charCount, setCharCount] = useState(0)
//   const [pages, setPages] = useState("3-5")
//   const [tone, setTone] = useState("General")
//   const [audience, setAudience] = useState("General")
//   const [scenario, setScenario] = useState("General")

//   // Auto-resize textarea as content grows
//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto"
//       textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
//     }
//     setCharCount(value.length)
//   }, [value])

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && e.ctrlKey && !isLoading) {
//       handleSubmit()
//     }
//   }

//   const handleSubmit = () => {
//     if (!isLoading) {
//       onSubmit({
//         pages,
//         tone,
//         audience,
//         scenario,
//       })
//     }
//   }

//   return (
//     <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
//       <div className="relative">
//         <textarea
//           ref={textareaRef}
//           className="w-full px-4 pt-4 pb-12 text-gray-800 resize-none focus:outline-none min-h-[100px]"
//           placeholder="What would you like to create? (e.g., 'Create a sales pitch for our new CRM solution')"
//           value={value}
//           onChange={onChange}
//           onKeyDown={handleKeyDown}
//           rows={1}
//           disabled={isLoading}
//         />

//         <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end p-2 border-t bg-gray-50">
//           <div className="flex items-center gap-2 mr-[16px]">
//             <button
//               className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
//               onClick={() => console.log("Upload file")}
//               disabled={isLoading}
//             >
//             </button>
//             <span className="text-xs text-gray-500">{charCount}/1000</span>
//           </div>

//           <button
//             className={`flex items-center gap-2 px-4 py-2 rounded-md ${
//               isLoading
//                 ? "bg-purple-400 text-white cursor-not-allowed"
//                 : value.trim().length > 0
//                   ? "bg-purple-600 text-white hover:bg-purple-700"
//                   : "bg-gray-200 text-gray-400 cursor-not-allowed"
//             } transition-colors`}
//             disabled={value.trim().length === 0 || isLoading}
//             onClick={handleSubmit}
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="h-4 w-4 animate-spin" />
//                 <span>Generating...</span>
//               </>
//             ) : (
//               <>
//                 <Sparkles className="h-4 w-4" />
//                 <span>Generate Outline</span>
//               </>
//             )}
//           </button>
//         </div>
//       </div>

//       <PresentationSettings
//         pages={pages}
//         tone={tone}
//         audience={audience}
//         scenario={scenario}
//         onPagesChange={setPages}
//         onToneChange={setTone}
//         onAudienceChange={setAudience}
//         onScenarioChange={setScenario}
//       />
//     </div>
//   )
// }





"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Sparkles, Loader2, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [showSettings, setShowSettings] = useState(false)

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
    setCharCount(value.length)
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && !isLoading) {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (!isLoading && value.trim()) {
      onSubmit({
        pages,
        tone,
        audience,
        scenario,
      })
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Settings Panel */}
      {showSettings && (
        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Presentation Settings</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Number of pages</label>
              <Select value={pages} onValueChange={setPages}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3-5">3-5 pages</SelectItem>
                  <SelectItem value="5-10">5-10 pages</SelectItem>
                  <SelectItem value="10-15">10-15 pages</SelectItem>
                  <SelectItem value="15-20">15-20 pages</SelectItem>
                  <SelectItem value="20+">20+ pages</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Tone</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Persuasive">Persuasive</SelectItem>
                  <SelectItem value="Informative">Informative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Audience</label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Executives">Executives</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Customers">Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Scenario</label>
              <Select value={scenario} onValueChange={setScenario}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Sales Pitch">Sales Pitch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4">
          {/* Settings Toggle */}
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-2 h-8 px-3 text-sm ${
                showSettings
                  ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
              disabled={isLoading}
            >
              <Settings className="h-4 w-4" />
              <span>{showSettings ? "Hide Settings" : "Settings"}</span>
            </Button>
            <div className="text-xs text-gray-500">{charCount}/1000</div>
          </div>

          {/* Text Area */}
          <div className="relative mb-3">
            <textarea
              ref={textareaRef}
              className="w-full px-4 py-3 text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 placeholder-gray-500 rounded-lg border border-gray-200"
              placeholder="What would you like to create? (e.g., 'Create a sales pitch for our new CRM solution')"
              value={value}
              onChange={onChange}
              onKeyDown={handleKeyDown}
              rows={3}
              disabled={isLoading}
              style={{ minHeight: "80px", maxHeight: "150px" }}
            />
          </div>

          {/* Bottom Row - Generate Button and Helper Text */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">Press Ctrl + Enter to generate quickly</div>
            <Button
              onClick={handleSubmit}
              disabled={!value.trim() || isLoading}
              className={`px-6 py-2 h-10 ${
                isLoading
                  ? "bg-purple-400 text-white cursor-not-allowed"
                  : value.trim().length > 0
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
              } transition-colors`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Generate Outline</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
