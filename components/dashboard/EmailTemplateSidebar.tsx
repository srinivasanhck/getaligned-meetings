"use client"

import type React from "react"
import { X, Check, Sparkles, FileText, MessageSquare, Zap } from "lucide-react"
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
  // Template options with friendly names
  const templateOptions = [
    { value: EmailTemplateType.SALES_FOLLOW_UP, label: "Sales Follow-up" },
    { value: EmailTemplateType.DEAL_CLOSING, label: "Deal Closing" },
    { value: EmailTemplateType.MEETING_FOLLOW_UP, label: "Meeting Follow-up" },
    { value: EmailTemplateType.CLIENT_CHECKIN, label: "Client Check-in" },
    { value: EmailTemplateType.PROMOTION_ANNOUNCEMENT, label: "Promotion Announcement" },
    { value: EmailTemplateType.PARTNERSHIP_INTRO, label: "Partnership Introduction" },
    { value: EmailTemplateType.ONBOARDING_WELCOME, label: "Onboarding Welcome" },
    { value: EmailTemplateType.CUSTOMER_FEEDBACK, label: "Customer Feedback" },
    { value: EmailTemplateType.INACTIVE_CUSTOMER_REACTIVATION, label: "Inactive Customer Reactivation" },
    { value: EmailTemplateType.PRODUCT_UPDATE_ANNOUNCEMENT, label: "Product Update Announcement" },
  ]

  // Length options
  const lengthOptions = [
    { value: EmailLength.SHORT, label: "Short", description: "Brief and to the point" },
    { value: EmailLength.MEDIUM, label: "Medium", description: "Standard email length" },
    { value: EmailLength.LONG, label: "Long", description: "Detailed with more context" },
    { value: EmailLength.DONT_SPECIFY, label: "Don't Specify", description: "Let AI decide the best length" },
  ]

  // Tone options
  const toneOptions = [
    { value: EmailTone.FORMAL, label: "Formal", description: "Professional and business-like" },
    { value: EmailTone.INFORMAL, label: "Informal", description: "Casual and conversational" },
    { value: EmailTone.NEUTRAL, label: "Neutral", description: "Balanced and moderate" },
    { value: EmailTone.DONT_SPECIFY, label: "Don't Specify", description: "Let AI decide the best tone" },
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" onClick={onClose} />}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">AI Email Template</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-8">
            {/* Template Type Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h4 className="font-medium text-gray-800">
                  Template Type <span className="text-red-500">*</span>
                </h4>
              </div>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {templateOptions.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-colors",
                      selectedTemplate === option.value
                        ? "border-primary/30 bg-primary/5 text-primary"
                        : "border-gray-200 hover:bg-gray-50",
                    )}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center border",
                        selectedTemplate === option.value ? "border-primary bg-primary text-white" : "border-gray-300",
                      )}
                    >
                      {selectedTemplate === option.value && <Check className="h-3 w-3" />}
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
                ))}
              </div>
            </div>

            {/* Email Length Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h4 className="font-medium text-gray-800">Email Length</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {lengthOptions.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex flex-col p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedLength === option.value
                        ? "border-primary/30 bg-primary/5 text-primary"
                        : "border-gray-200 hover:bg-gray-50",
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{option.label}</span>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center border",
                          selectedLength === option.value ? "border-primary bg-primary text-white" : "border-gray-300",
                        )}
                      >
                        {selectedLength === option.value && <Check className="h-2.5 w-2.5" />}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{option.description}</p>
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
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h4 className="font-medium text-gray-800">Email Tone</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {toneOptions.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex flex-col p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedTone === option.value
                        ? "border-primary/30 bg-primary/5 text-primary"
                        : "border-gray-200 hover:bg-gray-50",
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{option.label}</span>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center border",
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
                "w-full py-2.5 px-4 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                selectedTemplate ? "bg-primary hover:bg-primary/90" : "bg-gray-300 cursor-not-allowed",
              )}
            >
              <Sparkles className="h-4 w-4" />
              Generate AI Template
            </button>
            {!selectedTemplate && (
              <p className="text-xs text-red-500 mt-2 text-center">Please select a template type to continue</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default EmailTemplateSidebar
