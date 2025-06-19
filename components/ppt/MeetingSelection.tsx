"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Clock,
  Users,
  Check,
  Filter,
  ChevronDown,
  ChevronUp,
  Settings,
  Upload,
  X,
  FileText,
  CheckCircle,
} from "lucide-react"
import { fetchMeetings } from "@/services/api"
import DateRangePicker from "@/components/dashboard/DateRangePicker"
import type { Meeting } from "@/types/meetings"

interface MeetingSelectionProps {
  onMeetingSelection: (meetingIds: string[]) => void
  meetingPrompt: string
  onMeetingPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onGenerateOutline: (settings: {
    pages: string
    tone: string
    audience: string
    scenario: string
  }) => void
  onFilesChange: (files: File[]) => void
  isLoading: boolean
  selectedMeetingsCount: number
  uploadedFiles: File[]
}

interface GroupedMeetings {
  [date: string]: Meeting[]
}

export const MeetingSelection: React.FC<MeetingSelectionProps> = ({
  onMeetingSelection,
  meetingPrompt,
  onMeetingPromptChange,
  onGenerateOutline,
  onFilesChange,
  isLoading,
  selectedMeetingsCount,
  uploadedFiles,
}) => {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [groupedMeetings, setGroupedMeetings] = useState<GroupedMeetings>({})
  const [selectedMeetings, setSelectedMeetings] = useState<string[]>([])
  const [isFetchingMeetings, setIsFetchingMeetings] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())

  // Presentation settings state
  const [pages, setPages] = useState("3-5")
  const [tone, setTone] = useState("General")
  const [audience, setAudience] = useState("General")
  const [scenario, setScenario] = useState("General")

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get last 7 days date range
  const getDefaultDateRange = () => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)
    startDate.setHours(0, 0, 0, 0)
    return { startDate, endDate }
  }

  const [dateRange, setDateRange] = useState(getDefaultDateRange())

  // Helper function to create a date at midnight in Indian timezone
  const createIndianMidnightDate = (date: Date): Date => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const indianDateString = `${year}-${month}-${day}T00:00:00+05:30`
    return new Date(indianDateString)
  }

  const fetchMeetingsData = async (startDate: Date, endDate: Date) => {
    setIsFetchingMeetings(true)
    setError(null)

    try {
      const indianStartDate = createIndianMidnightDate(startDate)
      const indianEndDate = new Date(endDate)
      indianEndDate.setHours(23, 59, 59, 999)

      const startDateISO = indianStartDate.toISOString()
      const endDateISO = indianEndDate.toISOString()

      console.log("Fetching meetings from:", startDateISO, "to", endDateISO)

      const response = await fetchMeetings(startDateISO, endDateISO)
      const readyMeetings = response.items.filter((meeting) => meeting.meetingStatus === "SummaryReady")

      setMeetings(readyMeetings)

      const grouped = groupMeetingsByDate(readyMeetings)
      setGroupedMeetings(grouped)
      setExpandedDates(new Set(Object.keys(grouped)))
    } catch (err) {
      setError("Failed to fetch meetings")
      console.error("Error fetching meetingsss:", err)
    } finally {
      setIsFetchingMeetings(false)
    }
  }

  const groupMeetingsByDate = (meetings: Meeting[]): GroupedMeetings => {
    const grouped: GroupedMeetings = {}

    meetings.forEach((meeting) => {
      const meetingDate = new Date(meeting.start.dateTime)
      const dateKey = meetingDate.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      })

      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(meeting)
    })

    const sortedGrouped: GroupedMeetings = {}
    Object.keys(grouped)
      .sort((a, b) => {
        const dateA = new Date(a.split(",")[1].trim())
        const dateB = new Date(b.split(",")[1].trim())
        return dateB.getTime() - dateA.getTime()
      })
      .forEach((date) => {
        sortedGrouped[date] = grouped[date]
      })

    return sortedGrouped
  }

  const handleDateRangeSelect = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate })
    setShowDatePicker(false)
    fetchMeetingsData(startDate, endDate)
  }

  const handleMeetingToggle = (meetingId: string) => {
    let newSelection: string[]

    if (selectedMeetings.includes(meetingId)) {
      newSelection = selectedMeetings.filter((id) => id !== meetingId)
    } else {
      if (selectedMeetings.length >= 3) {
        newSelection = [...selectedMeetings.slice(1), meetingId]
      } else {
        newSelection = [...selectedMeetings, meetingId]
      }
    }

    setSelectedMeetings(newSelection)
    onMeetingSelection(newSelection)
  }

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates)
    if (newExpanded.has(date)) {
      newExpanded.delete(date)
    } else {
      newExpanded.add(date)
    }
    setExpandedDates(newExpanded)
  }

  const handleGenerateClick = () => {
    onGenerateOutline({
      pages,
      tone,
      audience,
      scenario,
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const validFiles: File[] = []
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 50MB.`)
        continue
      }

      const allowedTypes = [
        "application/pdf",
        "text/plain",
        "text/csv",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]

      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" is not supported. Please upload PDF, TXT, CSV, DOC, or DOCX files.`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length > 0) {
      const newFiles = [...uploadedFiles, ...validFiles]
      onFilesChange(newFiles)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDateHeader = (dateString: string) => {
    const parts = dateString.split(",")
    if (parts.length >= 2) {
      const weekday = parts[0].trim()
      const datePart = parts[1].trim()
      return `${weekday} ${datePart}`
    }
    return dateString
  }

  const getParticipantNames = (meeting: Meeting) => {
    return meeting.attendees
      .filter((attendee) => !attendee.organizer)
      .slice(0, 3)
      .map((attendee) => attendee.email.split("@")[0])
      .join(", ")
  }

  useEffect(() => {
    console.log("Fetching meetings for date range:", dateRange.startDate, "to", dateRange.endDate)
    fetchMeetingsData(dateRange.startDate, dateRange.endDate)
  }, [])

  // Step completion status
  const isStep1Complete = true // File upload is optional, so always complete
  const isStep2Complete = selectedMeetingsCount > 0
  const isStep3Complete = meetingPrompt.trim().length > 0 // Check if instructions are provided

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Create Presentation from Meetings</h3>
        <p className="text-gray-600">Follow the steps below to generate your presentation</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          {/* Step 1 */}
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isStep1Complete
                  ? "bg-green-100 text-green-600 border-2 border-green-200"
                  : "bg-purple-100 text-purple-600 border-2 border-purple-200"
              }`}
            >
              {isStep1Complete ? <CheckCircle className="h-5 w-5" /> : "1"}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Upload Files</span>
          </div>

          <div className="w-8 h-0.5 bg-gray-300"></div>

          {/* Step 2 */}
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isStep2Complete
                  ? "bg-green-100 text-green-600 border-2 border-green-200"
                  : "bg-purple-100 text-purple-600 border-2 border-purple-200"
              }`}
            >
              {isStep2Complete ? <CheckCircle className="h-5 w-5" /> : "2"}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Select Meetings</span>
          </div>

          <div className="w-8 h-0.5 bg-gray-300"></div>

          {/* Step 3 */}
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isStep3Complete
                  ? "bg-green-100 text-green-600 border-2 border-green-200"
                  : "bg-purple-100 text-purple-600 border-2 border-purple-200"
              }`}
            >
              {isStep3Complete ? <CheckCircle className="h-5 w-5" /> : "3"}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Instructions</span>
          </div>
        </div>
      </div>

      {/* Step 1: File Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium">
            1
          </div>
          <h4 className="text-lg font-semibold text-gray-800">Upload Supporting Documents</h4>
          <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">Optional</span>
        </div>

        <p className="text-gray-600 mb-4">
          Upload any relevant documents (PDFs, Word docs, etc.) to enhance your presentation content.
        </p>

        {/* File Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer bg-white"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500">PDF, TXT, CSV, DOC, DOCX (max 50MB each)</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.csv,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Step 2: Select Meetings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium">
              2
            </div>
            <h4 className="text-lg font-semibold text-gray-800">Select Meetings</h4>
            <span className="text-sm text-red-500 bg-red-100 px-2 py-1 rounded-full">Required</span>
          </div>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm">Filter Dates</span>
          </button>
        </div>

        <p className="text-gray-600 mb-4">Choose 1-3 meetings to generate your presentation from.</p>

        {/* Date Range Display */}
        <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {dateRange.startDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}{" "}
              -{" "}
              {dateRange.endDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </p>
        </div>

        {/* Selection Counter */}
        {selectedMeetingsCount > 0 && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-700">
              {selectedMeetingsCount} of 3 meetings selected
              {selectedMeetingsCount >= 3 && " (maximum reached)"}
            </p>
          </div>
        )}

        {/* Date Range Picker */}
        <AnimatePresence>
          {showDatePicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 border border-gray-200 rounded-lg bg-white"
            >
              <DateRangePicker onSelect={handleDateRangeSelect} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isFetchingMeetings && (
          <div className="flex items-center justify-center py-12 bg-white rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Loading meetings...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Meetings List */}
        {!isFetchingMeetings && !error && (
          <div className="space-y-4 bg-white rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
            <div className="p-4">
              {Object.keys(groupedMeetings).length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No meetings found</p>
                  <p className="text-sm text-gray-500 mt-1">Try selecting a different date range</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedMeetings).map(([date, dateMeetings]) => (
                    <div key={date} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleDateExpansion(date)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-gray-500" />
                          <span className="font-medium text-gray-800">{formatDateHeader(date)}</span>
                          <span className="text-sm text-gray-500">
                            ({dateMeetings.length} meeting{dateMeetings.length !== 1 ? "s" : ""})
                          </span>
                        </div>
                        {expandedDates.has(date) ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedDates.has(date) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-gray-200"
                          >
                            {dateMeetings.map((meeting) => (
                              <motion.div
                                key={meeting.id}
                                className={`p-4 border-b border-gray-100 last:border-b-0 cursor-pointer transition-all ${
                                  selectedMeetings.includes(meeting.id)
                                    ? "bg-purple-50 border-l-4 border-l-purple-500"
                                    : "hover:bg-gray-50"
                                }`}
                                onClick={() => handleMeetingToggle(meeting.id)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h4 className="font-medium text-gray-800 line-clamp-1">{meeting.summary}</h4>
                                      {selectedMeetings.includes(meeting.id) && (
                                        <div className="flex items-center justify-center w-5 h-5 bg-purple-600 rounded-full">
                                          <Check className="h-3 w-3 text-white" />
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                          {formatTime(meeting.start.dateTime)} - {formatTime(meeting.end.dateTime)}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span className="line-clamp-1">
                                          {getParticipantNames(meeting) || "No participants"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {!isFetchingMeetings && !error && Object.keys(groupedMeetings).length > 0 && (
          <div className="text-center py-2 text-xs text-gray-500 bg-gray-50 rounded-b-lg border-t border-gray-200">
            <span>Scroll to see more meetings</span>
          </div>
        )}
      </motion.div>

      {/* Step 3: Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium">
            3
          </div>
          <h4 className="text-lg font-semibold text-gray-800">Add Specific Instructions</h4>
          <span className="text-sm text-red-500 bg-red-100 px-2 py-1 rounded-full">Required</span>
        </div>

        <p className="text-gray-600 mb-4">
          Provide specific guidance on what aspects you'd like to focus on in your presentation.
        </p>

        <textarea
          value={meetingPrompt}
          onChange={onMeetingPromptChange}
          placeholder="What specific aspects would you like to focus on? (e.g., key decisions, action items, technical discussions, etc.) *Required"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white"
          rows={4}
          required
        />
        <p className="text-xs text-gray-500 mt-2">
          This helps us create a more targeted presentation from your selected meetings.
        </p>
      </motion.div>

      {/* Presentation Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50"
      >
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-5 w-5 text-gray-600" />
          <h4 className="text-lg font-semibold text-gray-800">Presentation Settings</h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">No. of pages:</label>
            <select
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="3-5">3-5</option>
              <option value="5-10">5-10</option>
              <option value="10-15">10-15</option>
              <option value="15-20">15-20</option>
              <option value="20+">20+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tone:</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="General">General</option>
              <option value="Professional">Professional</option>
              <option value="Casual">Casual</option>
              <option value="Formal">Formal</option>
              <option value="Creative">Creative</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Audience:</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="General">General</option>
              <option value="Executives">Executives</option>
              <option value="Technical">Technical</option>
              <option value="Students">Students</option>
              <option value="Clients">Clients</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scenario:</label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="General">General</option>
              <option value="Business">Business</option>
              <option value="Educational">Educational</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Technical">Technical</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <button
          onClick={handleGenerateClick}
          disabled={isLoading || selectedMeetingsCount === 0 || meetingPrompt.trim().length === 0}
          className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all transform ${
            isLoading || selectedMeetingsCount === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:scale-105 shadow-lg"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating Outline...</span>
            </div>
          ) : selectedMeetingsCount === 0 ? (
            "Select at least one meeting to continue"
          ) : meetingPrompt.trim().length === 0 ? (
            "Add instructions to continue"
          ) : (
            `Generate Outline from ${selectedMeetingsCount} Meeting${selectedMeetingsCount !== 1 ? "s" : ""}`
          )}
        </button>

        {(selectedMeetingsCount === 0 || meetingPrompt.trim().length === 0) && (
          <p className="text-sm text-gray-500 mt-2">
            Please complete {selectedMeetingsCount === 0 ? "Step 2" : "Step 3"} to enable the generate button
          </p>
        )}
      </motion.div>
    </div>
  )
}
