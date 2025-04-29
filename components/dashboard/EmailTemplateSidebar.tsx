"use client"

import type React from "react"
import { X } from "lucide-react"
import { EmailTemplateType, EmailLength, EmailTone } from "@/services/emailService"

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
    { value: EmailLength.SHORT, label: "Short" },
    { value: EmailLength.MEDIUM, label: "Medium" },
    { value: EmailLength.LONG, label: "Long" },
    { value: EmailLength.DONT_SPECIFY, label: "Don't Specify" },
  ]

  // Tone options
  const toneOptions = [
    { value: EmailTone.FORMAL, label: "Formal" },
    { value: EmailTone.INFORMAL, label: "Informal" },
    { value: EmailTone.NEUTRAL, label: "Neutral" },
    { value: EmailTone.DONT_SPECIFY, label: "Don't Specify" },
  ]

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">Email Template Options</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Template Type Selection */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">
              Template Type <span className="text-red-500">*</span>
            </h4>
            <div className="space-y-2">
              {templateOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="templateType"
                    value={option.value}
                    checked={selectedTemplate === option.value}
                    onChange={() => onTemplateChange(option.value)}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Email Length Selection */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Email Length</h4>
            <div className="space-y-2">
              {lengthOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="emailLength"
                    value={option.value}
                    checked={selectedLength === option.value}
                    onChange={() => onLengthChange(option.value)}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Email Tone Selection */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Email Tone</h4>
            <div className="space-y-2">
              {toneOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="emailTone"
                    value={option.value}
                    checked={selectedTone === option.value}
                    onChange={() => onToneChange(option.value)}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={onApply}
            disabled={!selectedTemplate}
            className={`w-full py-2 px-4 rounded-md text-white text-sm font-medium ${
              selectedTemplate ? "bg-primary hover:bg-primary/90" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Apply Changes
          </button>
          {!selectedTemplate && <p className="text-xs text-red-500 mt-2">Please select a template type to continue</p>}
        </div>
      </div>
    </div>
  )
}

export default EmailTemplateSidebar
