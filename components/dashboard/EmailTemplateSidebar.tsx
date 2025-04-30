"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Check, Sparkles, FileText, MessageSquare, Zap, Info, ChevronRight, Search } from "lucide-react"
import { EmailTemplateType, EmailLength, EmailTone } from "@/services/emailService"
import { cn } from "@/lib/utils"

interface EmailTemplateSidebarProps {
  isOpen: boolean
  onClose: () => void
  selectedTemplate: EmailTemplateType | null
  selectedLength: EmailLength | null
  selectedTone: EmailTone | null
  onTemplateChange: (template: EmailTemplateType) => void
  onLengthChange: (length: EmailLength) => void
  onToneChange: (tone: EmailTone) => void
  onApply: () => void
}

interface TemplateOption {
  value: EmailTemplateType
  label: string
  description: string
  category: "sales" | "customer" | "marketing" | "partnership"
}

interface LengthOption {
  value: EmailLength
  label: string
  description: string
  wordCount: string
}

interface ToneOption {
  value: EmailTone
  label: string
  description: string
  emoji: string
}

const EmailTemplateSidebar: React.FC<EmailTemplateSidebarProps> = ({
  isOpen,
  onClose,
  selectedTemplate,
  selectedLength,
  selectedTone,
  onTemplateChange,
  onLengthChange,
  onToneChange,
  onApply,
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  //const [activeTab, setActiveTab] = useState<"all" | "sales" | "customer" | "marketing" | "partnership">("all")
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [animateButton, setAnimateButton] = useState(false)

  // Template options with friendly names and descriptions
  const templateOptions: TemplateOption[] = [
    {
      value: EmailTemplateType.SALES_FOLLOW_UP,
      label: "Sales Follow-up",
      description: "Follow up after a sales call or meeting",
      category: "sales",
    },
    {
      value: EmailTemplateType.DEAL_CLOSING,
      label: "Deal Closing",
      description: "Close a deal with final terms and next steps",
      category: "sales",
    },
    {
      value: EmailTemplateType.MEETING_FOLLOW_UP,
      label: "Meeting Follow-up",
      description: "Summarize meeting outcomes and action items",
      category: "sales",
    },
    {
      value: EmailTemplateType.PARTNERSHIP_INTRO,
      label: "Partnership Introduction",
      description: "Introduce potential partnership opportunities",
      category: "partnership",
    },
    {
      value: EmailTemplateType.CLIENT_CHECKIN,
      label: "Client Check-in",
      description: "Regular check-in with existing clients",
      category: "customer",
    },
    {
      value: EmailTemplateType.ONBOARDING_WELCOME,
      label: "Onboarding Welcome",
      description: "Welcome new customers and explain next steps",
      category: "customer",
    },
    {
      value: EmailTemplateType.CUSTOMER_FEEDBACK,
      label: "Customer Feedback",
      description: "Request feedback from customers",
      category: "customer",
    },
    {
      value: EmailTemplateType.PROMOTION_ANNOUNCEMENT,
      label: "Promotion Announcement",
      description: "Announce a new promotion or special offer",
      category: "marketing",
    },
    {
      value: EmailTemplateType.INACTIVE_CUSTOMER_REACTIVATION,
      label: "Inactive Customer Reactivation",
      description: "Re-engage with inactive customers",
      category: "marketing",
    },
    {
      value: EmailTemplateType.PRODUCT_UPDATE_ANNOUNCEMENT,
      label: "Product Update Announcement",
      description: "Announce new features or product updates",
      category: "marketing",
    },
  ]

  // Length options with descriptions and word counts
  const lengthOptions: LengthOption[] = [
    {
      value: EmailLength.SHORT,
      label: "Short",
      description: "Brief and to the point",
      wordCount: "50-100 words",
    },
    {
      value: EmailLength.MEDIUM,
      label: "Medium",
      description: "Standard email length",
      wordCount: "100-200 words",
    },
    {
      value: EmailLength.LONG,
      label: "Long",
      description: "Detailed with more context",
      wordCount: "200-300 words",
    },
    {
      value: EmailLength.DONT_SPECIFY,
      label: "AI Optimized",
      description: "Let AI decide the best length",
      wordCount: "Varies",
    },
  ]

  // Tone options with descriptions and emojis
  const toneOptions: ToneOption[] = [
    {
      value: EmailTone.FORMAL,
      label: "Formal",
      description: "Professional and business-like",
      emoji: "👔",
    },
    {
      value: EmailTone.INFORMAL,
      label: "Informal",
      description: "Casual and conversational",
      emoji: "😊",
    },
    {
      value: EmailTone.NEUTRAL,
      label: "Neutral",
      description: "Balanced and moderate",
      emoji: "🤝",
    },
    {
      value: EmailTone.DONT_SPECIFY,
      label: "AI Optimized",
      description: "Let AI decide the best tone",
      emoji: "✨",
    },
  ]

  // Filter templates based on search query and active tab
  const filteredTemplates = templateOptions.filter((template) => {
    const matchesSearch =
      template.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    //const matchesTab = activeTab === "all" || template.category === activeTab
    return matchesSearch //&& matchesTab
  })

  // Animate the generate button when all required fields are selected
  useEffect(() => {
    if (selectedTemplate) {
      setAnimateButton(true)
      const timeout = setTimeout(() => setAnimateButton(false), 1000)
      return () => clearTimeout(timeout)
    }
  }, [selectedTemplate, selectedLength, selectedTone])

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowTooltip(null)
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <>
      {/* Overlay with blur effect */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-[420px] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-primary/90 to-primary p-5 pt-3 pb-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">AI Email Template</h3>
                <p className="text-xs text-white/80">Customize your AI-generated email</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Template Type Selection */}
          <div className="p-5 pr-1 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h4 className="font-medium text-gray-800">
                  Template Type <span className="text-red-500">*</span>
                </h4>
              </div>
              <div
                className="relative inline-block"
                onMouseEnter={() => setShowTooltip("template")}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                {showTooltip === "template" && (
                  <div className="absolute right-0 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                    Select a template type that best matches your email purpose
                  </div>
                )}
              </div>
            </div>

            {/* Search and filter */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Template options */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex flex-col p-3 rounded-lg border cursor-pointer transition-all",
                      selectedTemplate === option.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{option.label}</span>
                          <span
                            className={`ml-2 px-2 py-0.5 text-[10px] rounded-full ${getCategoryBadgeColor(option.category)}`}
                          >
                            {option.category.charAt(0).toUpperCase() + option.category.slice(1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                      </div>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center border transition-colors",
                          selectedTemplate === option.value
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300",
                        )}
                      >
                        {selectedTemplate === option.value && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="templateType"
                      value={option.value}
                      checked={selectedTemplate === option.value}
                      onChange={() => onTemplateChange(option.value)}
                      className="sr-only"
                    />
                  </label>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No templates match your search</p>
                  <button onClick={() => setSearchQuery("")} className="text-primary text-sm mt-2 hover:underline">
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Email Length Selection */}
          <div className="p-5 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h4 className="font-medium text-gray-800">Email Length</h4>
              </div>
              <div
                className="relative inline-block"
                onMouseEnter={() => setShowTooltip("length")}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                {showTooltip === "length" && (
                  <div className="absolute right-0 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                    Choose how long you want your email to be
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {lengthOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex flex-col p-3 rounded-lg border cursor-pointer transition-all",
                    selectedLength === option.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{option.label}</span>
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center border transition-colors",
                        selectedLength === option.value ? "border-primary bg-primary text-white" : "border-gray-300",
                      )}
                    >
                      {selectedLength === option.value && <Check className="h-2.5 w-2.5" />}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{option.description}</p>
                  <div className="mt-1.5 text-[10px] text-gray-400 font-medium">{option.wordCount}</div>
                  <input
                    type="radio"
                    name="emailLength"
                    value={option.value}
                    checked={selectedLength === option.value}
                    onChange={() => onLengthChange(option.value)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Email Tone Selection */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h4 className="font-medium text-gray-800">Email Tone</h4>
              </div>
              <div
                className="relative inline-block"
                onMouseEnter={() => setShowTooltip("tone")}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                {showTooltip === "tone" && (
                  <div className="absolute right-0 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                    Select the tone of voice for your email
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {toneOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex flex-col p-3 rounded-lg border cursor-pointer transition-all",
                    selectedTone === option.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{option.emoji}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center border transition-colors",
                        selectedTone === option.value ? "border-primary bg-primary text-white" : "border-gray-300",
                      )}
                    >
                      {selectedTone === option.value && <Check className="h-2.5 w-2.5" />}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{option.description}</p>
                  <input
                    type="radio"
                    name="emailTone"
                    value={option.value}
                    checked={selectedTone === option.value}
                    onChange={() => onToneChange(option.value)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-gray-50">
          <button
            onClick={onApply}
            disabled={!selectedTemplate}
            className={cn(
              "w-full py-3 px-4 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 transition-all",
              selectedTemplate
                ? "bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg"
                : "bg-gray-300 cursor-not-allowed",
              animateButton && "animate-pulse",
            )}
          >
            <Sparkles className="h-4 w-4" />
            Generate AI Template
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
          {!selectedTemplate && (
            <p className="text-xs text-gray-500 mt-2 text-center">Select a template to get started</p>
          )}
        </div>
      </div>
    </>
  )
}

// Helper function to get category badge color
function getCategoryBadgeColor(category: string): string {
  switch (category) {
    case "sales":
      return "bg-blue-100 text-blue-700"
    case "customer":
      return "bg-green-100 text-green-700"
    case "marketing":
      return "bg-purple-100 text-purple-700"
    case "partnership":
      return "bg-amber-100 text-amber-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default EmailTemplateSidebar
