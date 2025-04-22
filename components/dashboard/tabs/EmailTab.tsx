"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Paperclip, X, AlertCircle, Loader, Send, Bold, Italic, Underline, List, Link, Check } from "lucide-react"
import { fetchEmailTemplate, type EmailTemplate } from "@/services/emailService"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import type { MeetingDetails } from "@/types/meetingDetails"
import GmailAccessPopup from "@/components/auth/GmailAccessPopup"
import { getToken } from "@/services/authService"
import { APIURL } from "@/config"

interface EmailTabProps {
  details: MeetingDetails
}

interface Recipient {
  id: string
  email: string
  type: "to" | "cc" | "bcc"
}

interface EmailSuggestion {
  email: string
  name?: string
}

const EmailTab = ({ details }: EmailTabProps) => {
  const { meeting } = details
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emailData, setEmailData] = useState<EmailTemplate>({
    to: [],
    cc: [],
    bcc: [],
    subject: "",
    body: "",
    attachments: [],
  })
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [sending, setSending] = useState(false)
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [hasGmailAccess, setHasGmailAccess] = useState(true) // Default to true until we know otherwise
  const [showGmailPopup, setShowGmailPopup] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bodyEditorRef = useRef<HTMLDivElement>(null)
  const toInputRef = useRef<HTMLInputElement>(null)
  const ccInputRef = useRef<HTMLInputElement>(null)
  const bccInputRef = useRef<HTMLInputElement>(null)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  // Email suggestions state
  const [emailSuggestions, setEmailSuggestions] = useState<EmailSuggestion[]>([])
  const [filteredSuggestions, setFilteredSuggestions] = useState<EmailSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const [currentInputType, setCurrentInputType] = useState<"to" | "cc" | "bcc" | null>(null)
  const [inputValue, setInputValue] = useState("")

  console.log("meetings in emailTab", meeting)
  // Convert HTML content to plain text for email sending
  const convertHtmlToPlainText = (html: string): string => {
    // Create a temporary DOM element
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html

    // Process the DOM to create formatted plain text
    const processNode = (node: Node, level = 0, inList = false): string => {
      const result = ""

      // Text node - just return the text
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || ""
      }

      // Element node - process based on tag
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement
        const tagName = element.tagName.toLowerCase()

        // Handle different HTML elements
        switch (tagName) {
          case "p":
            // Add double newline for paragraphs
            const innerText = Array.from(element.childNodes)
              .map((child) => processNode(child, level, inList))
              .join("")
            return innerText + "\n\n"

          case "br":
            // Single newline for line breaks
            return "\n"

          case "strong":
          case "b":
            // Bold text
            return Array.from(element.childNodes)
              .map((child) => processNode(child, level, inList))
              .join("")

          case "em":
          case "i":
            // Italic text
            return Array.from(element.childNodes)
              .map((child) => processNode(child, level, inList))
              .join("")

          case "ul":
          case "ol":
            // Lists - process each list item
            return Array.from(element.childNodes)
              .map((child) => processNode(child, level, true))
              .join("")

          case "li":
            // List items - add indentation and bullet/number
            const indent = "  ".repeat(level)
            const prefix = inList ? "- " : ""
            const itemText = Array.from(element.childNodes)
              .map((child) => processNode(child, level + 1, false))
              .join("")
            return `${indent}${prefix}${itemText}`

          case "div":
            // Divs - process children
            return Array.from(element.childNodes)
              .map((child) => processNode(child, level, inList))
              .join("")

          case "span":
            // Spans - just process children
            return Array.from(element.childNodes)
              .map((child) => processNode(child, level, inList))
              .join("")

          case "a":
            // Links - include the text and URL
            const linkText = Array.from(element.childNodes)
              .map((child) => processNode(child, level, inList))
              .join("")
            return linkText

          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "h5":
          case "h6":
            // Headings - make them stand out
            const headingText = Array.from(element.childNodes)
              .map((child) => processNode(child, level, inList))
              .join("")
            return headingText + "\n\n"

          default:
            // Default - just process children
            return Array.from(element.childNodes)
              .map((child) => processNode(child, level, inList))
              .join("")
        }
      }

      return result
    }

    // Process the entire document
    let plainText = processNode(tempDiv)

    // Clean up extra whitespace and newlines
    plainText = plainText
      .replace(/\n\n\n+/g, "\n\n") // Replace 3+ newlines with 2
      .replace(/^\s+|\s+$/g, "") // Trim whitespace

    return plainText
  }

  // Update the useEffect that initializes recipients to ensure it uses meeting attendees' emails

  // Fetch email template when component mounts
  useEffect(() => {
    const getEmailTemplate = async () => {
      if (!meeting?.meetingUniqueId) {
        setError("Meeting ID not found")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const template = await fetchEmailTemplate(meeting.meetingUniqueId)
        setEmailData(template)

        // Check if we have Gmail access from the API response
        if (template.hasOwnProperty("scope") && template.scope === false) {
          setHasGmailAccess(false)

          // Show Gmail popup after 3 seconds
          setTimeout(() => {
            setShowGmailPopup(true)
          }, 3000)
        }

        // If there are recipients, show CC/BCC options
        if (template.to.length > 0) {
          setShowCc(!!(template.cc && template.cc.length > 0))
          setShowBcc(!!(template.bcc && template.bcc.length > 0))
        }

        // Initialize recipients from template and meeting attendees
        const initialRecipients: Recipient[] = []

        // If we have meeting attendees, use them as the primary source for recipients
        if (details.meeting?.attendees && details.meeting.attendees.length > 0) {
          // Get unique emails from attendees
          const attendeeEmails = new Set(details.meeting.attendees.map((a) => a.email))

          // Add each attendee as a recipient
          attendeeEmails.forEach((email) => {
            initialRecipients.push({
              id: `to-${email}-${Math.random().toString(36).substring(2, 9)}`,
              email,
              type: "to",
            })
          })

          // Update the emailData.to field as well
          setEmailData((prev) => ({
            ...prev,
            to: Array.from(attendeeEmails),
          }))
        } else {
          // If no attendees, fall back to template recipients
          template.to.forEach((email) => {
            initialRecipients.push({
              id: `to-${email}-${Math.random().toString(36).substring(2, 9)}`,
              email,
              type: "to",
            })
          })
        }

        // Add CC and BCC recipients if they exist
        template.cc?.forEach((email) => {
          initialRecipients.push({
            id: `cc-${email}-${Math.random().toString(36).substring(2, 9)}`,
            email,
            type: "cc",
          })
        })

        template.bcc?.forEach((email) => {
          initialRecipients.push({
            id: `bcc-${email}-${Math.random().toString(36).substring(2, 9)}`,
            email,
            type: "bcc",
          })
        })

        setRecipients(initialRecipients)

        // Initialize email suggestions from attendees and existing recipients
        const allEmails = new Set<string>()

        // Add attendees to suggestions
        if (details.meeting?.attendees) {
          details.meeting.attendees.forEach((attendee) => {
            if (attendee.email && attendee.email.includes("@")) allEmails.add(attendee.email)
          })
        }

        // Add existing recipients to suggestions
        template.to.forEach((email) => {
          if (email && email.includes("@")) allEmails.add(email)
        })
        template.cc?.forEach((email) => {
          if (email && email.includes("@")) allEmails.add(email)
        })
        template.bcc?.forEach((email) => {
          if (email && email.includes("@")) allEmails.add(email)
        })

        // Convert to suggestions array
        const suggestions: EmailSuggestion[] = Array.from(allEmails).map((email) => ({
          email,
          name: email.split("@")[0].replace(".", " "),
        }))

        setEmailSuggestions(suggestions)
      } catch (err) {
        console.error("Failed to fetch email template:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch email template")
      } finally {
        setLoading(false)
      }
    }

    getEmailTemplate()
  }, [meeting?.meetingUniqueId, details.meeting?.attendees])

  // Update emailData when recipients change
  useEffect(() => {
    const to = recipients.filter((r) => r.type === "to").map((r) => r.email)
    const cc = recipients.filter((r) => r.type === "cc").map((r) => r.email)
    const bcc = recipients.filter((r) => r.type === "bcc").map((r) => r.email)

    setEmailData((prev) => ({
      ...prev,
      to,
      cc,
      bcc,
    }))

    // Show/hide CC and BCC fields based on whether they have recipients
    if (cc.length > 0 && !showCc) setShowCc(true)
    if (bcc.length > 0 && !showBcc) setShowBcc(true)
  }, [recipients, showCc, showBcc])

  // Format the email body for display
  useEffect(() => {
    // Only set the initial content when it first loads
    // or when it's empty and gets new content
    if (
      bodyEditorRef.current &&
      emailData.body &&
      (bodyEditorRef.current.innerHTML === "" || !bodyEditorRef.current.isContentEditable)
    ) {
      // Apply the formatted content directly
      bodyEditorRef.current.innerHTML = emailData.body

      // Focus at the end of the content
      if (bodyEditorRef.current.lastChild) {
        const range = document.createRange()
        const selection = window.getSelection()
        range.setStartAfter(bodyEditorRef.current.lastChild)
        range.collapse(true)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }
  }, [emailData.body])

  // Filter suggestions based on input value
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredSuggestions([])
      setShowSuggestions(false)
      return
    }

    const lowerCaseInput = inputValue.toLowerCase()
    const filtered = emailSuggestions.filter((suggestion) => {
      // Only include suggestions that have a valid email
      if (!suggestion.email || !suggestion.email.includes("@")) {
        return false
      }

      return (
        suggestion.email.toLowerCase().includes(lowerCaseInput) ||
        (suggestion.name && suggestion.name.toLowerCase().includes(lowerCaseInput))
      )
    })

    // Don't show suggestions for emails that are already added
    const existingEmails = recipients.map((r) => r.email.toLowerCase())
    const uniqueFiltered = filtered.filter((s) => !existingEmails.includes(s.email.toLowerCase()))

    setFilteredSuggestions(uniqueFiltered)
    setShowSuggestions(uniqueFiltered.length > 0)
    setActiveSuggestionIndex(0)
  }, [inputValue, emailSuggestions, recipients])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        toInputRef.current &&
        !toInputRef.current.contains(e.target as Node) &&
        ccInputRef.current &&
        !ccInputRef.current.contains(e.target as Node) &&
        bccInputRef.current &&
        !bccInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle input changes
  const handleInputChange = (field: keyof EmailTemplate, value: string | string[]) => {
    setEmailData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle body editor input
  const handleBodyInput = () => {
    if (bodyEditorRef.current) {
      // Save current selection/cursor position
      const selection = window.getSelection()
      let range = null
      if (selection && selection.rangeCount > 0) {
        range = selection.getRangeAt(0).cloneRange()
      }

      // Get the HTML content
      const htmlContent = bodyEditorRef.current.innerHTML

      // Store the HTML content directly
      setEmailData((prev) => ({
        ...prev,
        body: htmlContent,
      }))

      // Restore cursor position after state update and re-render
      // We use setTimeout to ensure this happens after React's re-render
      if (range) {
        setTimeout(() => {
          if (bodyEditorRef.current) {
            const newSelection = window.getSelection()
            if (newSelection) {
              newSelection.removeAllRanges()
              newSelection.addRange(range)
            }
          }
        }, 0)
      }
    }
  }

  // Add a new recipient
  const addRecipient = (email: string, type: "to" | "cc" | "bcc") => {
    if (!email.trim()) return

    // Validate email format
    if (!email.includes("@") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Please enter a valid email address", "error")
      return
    }

    // Check if recipient already exists
    const exists = recipients.some((r) => r.email.toLowerCase() === email.toLowerCase())
    if (exists) return

    const newRecipient: Recipient = {
      id: `${type}-${email}-${Math.random().toString(36).substring(2, 9)}`,
      email,
      type,
    }

    setRecipients((prev) => [...prev, newRecipient])

    // Clear input field
    setInputValue("")
    setShowSuggestions(false)
  }

  // Remove a recipient
  const removeRecipient = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id))
  }

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id)
    e.dataTransfer.setData("text/plain", id)
    // Add some opacity to the dragged element
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.4"
    }
  }

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null)
    // Reset opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1"
    }
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, type: "to" | "cc" | "bcc") => {
    e.preventDefault()
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add("bg-gray-100")
    }
  }

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("bg-gray-100")
    }
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent, type: "to" | "cc" | "bcc") => {
    e.preventDefault()
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("bg-gray-100")
    }

    const id = e.dataTransfer.getData("text/plain")
    if (!id) return

    // Update the recipient type
    setRecipients((prev) => prev.map((r) => (r.id === id ? { ...r, type } : r)))

    // If dropping into CC or BCC, make sure those sections are visible
    if (type === "cc" && !showCc) setShowCc(true)
    if (type === "bcc" && !showBcc) setShowBcc(true)

    setDraggedItem(null)
  }

  // Handle input focus
  const handleInputFocus = (type: "to" | "cc" | "bcc") => {
    setCurrentInputType(type)
    if (inputValue.trim()) {
      setShowSuggestions(filteredSuggestions.length > 0)
    }
  }

  // Handle input change
  const handleInputValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  // Handle key down for navigation and selection
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: "to" | "cc" | "bcc") => {
    // If suggestions are shown, handle navigation
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveSuggestionIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === "Enter" && filteredSuggestions[activeSuggestionIndex]) {
        e.preventDefault()
        addRecipient(filteredSuggestions[activeSuggestionIndex].email, type)
      } else if (e.key === "Escape") {
        setShowSuggestions(false)
      }
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const email = inputValue.trim().replace(/,$/, "")
      if (email) {
        if (!email.includes("@") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showToast("Please enter a valid email address", "error")
          return
        }
        addRecipient(email, type)
      }
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: EmailSuggestion) => {
    if (currentInputType && suggestion.email && suggestion.email.includes("@")) {
      addRecipient(suggestion.email, currentInputType)
    } else if (currentInputType) {
      showToast("Invalid email address", "error")
    }
  }

  // Handle manual recipient input
  const handleManualRecipientInput = (e: React.KeyboardEvent<HTMLInputElement>, type: "to" | "cc" | "bcc") => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()

      const email = inputValue.trim().replace(/,$/, "")

      if (email) {
        if (!email.includes("@") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showToast("Please enter a valid email address", "error")
          return
        }
        addRecipient(email, type)
      }
    }
  }

  // Handle file attachment
  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Convert FileList to array and add to attachments
    const newAttachments = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
    }))

    setEmailData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newAttachments],
    }))

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Remove attachment
  const removeAttachment = (index: number) => {
    setEmailData((prev) => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index),
    }))
  }

  // Format file size
  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return "Unknown size"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Apply formatting to the editor
  const applyFormatting = (command: string, value = "") => {
    document.execCommand(command, false, value)
    if (bodyEditorRef.current) {
      bodyEditorRef.current.focus()
      handleBodyInput()
    }
  }

  // Handle send email
  const handleSendEmail = async () => {
    // Check if we have Gmail access before sending
    if (!hasGmailAccess) {
      setShowGmailPopup(true)
      return
    }

    // Validate required fields
    if (toRecipients.length === 0 || !emailData.subject) {
      showToast("Please add recipients and a subject", "error")
      return
    }

    try {
      setSending(true)

      // Get token
      const token = getToken()
      if (!token) {
        throw new Error("Authentication required")
      }

      // Create FormData object
      const formData = new FormData()

      // Add recipients as comma-separated strings
      const toEmails = recipients.filter((r) => r.type === "to").map((r) => r.email)
      const ccEmails = recipients.filter((r) => r.type === "cc").map((r) => r.email)
      const bccEmails = recipients.filter((r) => r.type === "bcc").map((r) => r.email)

      formData.append("to", toEmails.join(","))

      // Add CC if present
      if (ccEmails.length > 0) {
        formData.append("cc", ccEmails.join(","))
      }

      // Add BCC if present
      if (bccEmails.length > 0) {
        formData.append("bcc", bccEmails.join(","))
      }

      // Convert HTML to plain text before sending
      // const plainTextContent = convertHtmlToPlainText(emailData.body)

      // Add subject and body
      // formData.append("body", plainTextContent)
      formData.append("subject", emailData.subject)
      formData.append("body", emailData.body)
      formData.append("isHtml", "true") // Add this flag to indicate HTML content

      // Add attachments if present
      if (emailData.attachments && emailData.attachments.length > 0) {
        // For this example, we'll need to fetch the files from their URLs
        // In a real implementation, you would have the actual File objects
        for (let i = 0; i < emailData.attachments.length; i++) {
          const attachment = emailData.attachments[i]
          try {
            const response = await fetch(attachment.url)
            const blob = await response.blob()
            const file = new File([blob], attachment.name, { type: blob.type })
            formData.append(`attachment`, file, attachment.name)
          } catch (error) {
            console.error(`Failed to process attachment ${attachment.name}:`, error)
          }
        }
      }

      // Create headers - don't set Content-Type for FormData
      const headers = new Headers()
      headers.append("Authorization", `Bearer ${token}`)

      // Make the API call
      const response = await fetch(`${APIURL}/api/v1/meeting-bot/send-email`, {
        method: "POST",
        headers: headers,
        body: formData,
      })

      // Parse response
      let data
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        // Check if the error is due to missing Gmail scope
        if (
          data.scope === "Email scope not found in user session" ||
          (typeof data === "object" &&
            data.message &&
            (data.message.includes("scope") || data.message.includes("permission") || data.message.includes("access")))
        ) {
          setHasGmailAccess(false)
          setShowGmailPopup(true)
          throw new Error("Gmail permission required to send emails")
        }
        throw new Error(typeof data === "object" ? data.message || "Failed to send email" : "Failed to send email")
      }

      console.log("Email sent successfully:", data)
      showToast("Email sent successfully!", "success")
    } catch (err) {
      console.error("Failed to send email:", err)

      // Don't show error if we're showing the permission request
      if (!showGmailPopup) {
        showToast(err instanceof Error ? err.message : "Failed to send email", "error")
      }
    } finally {
      setSending(false)
    }
  }

  // Render loading state
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Loading email template...</p>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md w-full rounded-lg border border-red-100 bg-red-50 p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Failed to Load Email Template</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Filter recipients by type
  const toRecipients = recipients.filter((r) => r.type === "to")
  const ccRecipients = recipients.filter((r) => r.type === "cc")
  const bccRecipients = recipients.filter((r) => r.type === "bcc")

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="mx-auto bg-white rounded-lg shadow-sm">
        {/* Email Compose Header */}
        {/* <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-800">Compose Email</h2>
          <div className="text-sm text-gray-500">Follow-up for: {meeting?.meetingTitle || "Meeting"}</div>
        </div> */}

        {/* Email Form */}
        <div className="p-4">
          <div className="space-y-4">
            {/* To Field */}
            <div
              className="border-b border-gray-200 pb-2 relative"
              onDragOver={(e) => handleDragOver(e, "to")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "to")}
            >
              <div className="flex items-center">
                <div className="w-8 text-sm font-medium text-gray-700">To:</div>
                <div className="flex-1 flex flex-wrap gap-1 min-h-[28px]">
                  {toRecipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, recipient.id)}
                      onDragEnd={handleDragEnd}
                      className="bg-purple-100 rounded-md px-2 py-1 text-xs flex items-center gap-1 cursor-move"
                    >
                      <span className="text-purple-800">{recipient.email}</span>
                      <button
                        onClick={() => removeRecipient(recipient.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <input
                    ref={toInputRef}
                    type="text"
                    className="flex-1 outline-none text-sm min-w-[100px]"
                    placeholder={toRecipients.length === 0 ? "Add recipients" : "Add more recipients..."}
                    value={currentInputType === "to" ? inputValue : ""}
                    onChange={handleInputValueChange}
                    onFocus={() => handleInputFocus("to")}
                    onKeyDown={(e) => handleInputKeyDown(e, "to")}
                  />
                </div>
                <div className="flex space-x-2">
                  {!showCc && (
                    <button onClick={() => setShowCc(true)} className="text-xs text-gray-500 hover:text-gray-700">
                      Add CC
                    </button>
                  )}
                  {!showBcc && (
                    <button onClick={() => setShowBcc(true)} className="text-xs text-gray-500 hover:text-gray-700">
                      Add BCC
                    </button>
                  )}
                </div>
              </div>

              {/* Email suggestions dropdown for TO field */}
              {showSuggestions && currentInputType === "to" && filteredSuggestions.length > 0 && (
                <div className="absolute left-16 top-full mt-1 w-64 max-h-48 overflow-y-auto bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.email}
                      className={cn(
                        "flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50",
                        index === activeSuggestionIndex ? "bg-gray-100" : "",
                      )}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700">
                          {suggestion.name || suggestion.email.split("@")[0]}
                        </div>
                        <div className="text-xs text-gray-500">{suggestion.email}</div>
                      </div>
                      {index === activeSuggestionIndex && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cc Field - Conditional */}
            {showCc && (
              <div
                className="border-b border-gray-200 pb-2 relative"
                onDragOver={(e) => handleDragOver(e, "cc")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "cc")}
              >
                <div className="flex items-center">
                  <div className="w-8 text-sm font-medium text-gray-700">Cc:</div>
                  <div className="flex-1 flex flex-wrap gap-1 min-h-[28px]">
                    {ccRecipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, recipient.id)}
                        onDragEnd={handleDragEnd}
                        className="bg-purple-100 rounded-md px-2 py-1 text-xs flex items-center gap-1 cursor-move"
                      >
                        <span className="text-purple-800">{recipient.email}</span>
                        <button
                          onClick={() => removeRecipient(recipient.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <input
                      ref={ccInputRef}
                      type="text"
                      className="flex-1 outline-none text-sm min-w-[100px]"
                      placeholder={ccRecipients.length === 0 ? "Add CC recipients" : "Add CC recipients..."}
                      value={currentInputType === "cc" ? inputValue : ""}
                      onChange={handleInputValueChange}
                      onFocus={() => handleInputFocus("cc")}
                      onKeyDown={(e) => handleInputKeyDown(e, "cc")}
                    />
                  </div>
                  <button onClick={() => setShowCc(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Email suggestions dropdown for CC field */}
                {showSuggestions && currentInputType === "cc" && filteredSuggestions.length > 0 && (
                  <div className="absolute left-16 top-full mt-1 w-64 max-h-48 overflow-y-auto bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    {filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.email}
                        className={cn(
                          "flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50",
                          index === activeSuggestionIndex ? "bg-gray-100" : "",
                        )}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-700">
                            {suggestion.name || suggestion.email.split("@")[0]}
                          </div>
                          <div className="text-xs text-gray-500">{suggestion.email}</div>
                        </div>
                        {index === activeSuggestionIndex && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bcc Field - Conditional */}
            {showBcc && (
              <div
                className="border-b border-gray-200 pb-2 relative"
                onDragOver={(e) => handleDragOver(e, "bcc")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "bcc")}
              >
                <div className="flex items-center">
                  <div className="w-8 text-sm font-medium text-gray-700">Bcc:</div>
                  <div className="flex-1 flex flex-wrap gap-1 min-h-[28px]">
                    {bccRecipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, recipient.id)}
                        onDragEnd={handleDragEnd}
                        className="bg-purple-100 rounded-md px-2 py-1 text-xs flex items-center gap-1 cursor-move"
                      >
                        <span className="text-purple-800">{recipient.email}</span>
                        <button
                          onClick={() => removeRecipient(recipient.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <input
                      ref={bccInputRef}
                      type="text"
                      className="flex-1 outline-none text-sm min-w-[100px]"
                      placeholder={bccRecipients.length === 0 ? "Add BCC recipients" : "Add BCC recipients..."}
                      value={currentInputType === "bcc" ? inputValue : ""}
                      onChange={handleInputValueChange}
                      onFocus={() => handleInputFocus("bcc")}
                      onKeyDown={(e) => handleInputKeyDown(e, "bcc")}
                    />
                  </div>
                  <button onClick={() => setShowBcc(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Email suggestions dropdown for BCC field */}
                {showSuggestions && currentInputType === "bcc" && filteredSuggestions.length > 0 && (
                  <div className="absolute left-16 top-full mt-1 w-64 max-h-48 overflow-y-auto bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    {filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.email}
                        className={cn(
                          "flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50",
                          index === activeSuggestionIndex ? "bg-gray-100" : "",
                        )}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-700">
                            {suggestion.name || suggestion.email.split("@")[0]}
                          </div>
                          <div className="text-xs text-gray-500">{suggestion.email}</div>
                        </div>
                        {index === activeSuggestionIndex && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subject Field */}
            <div className="flex items-center border-b border-gray-200 pb-2">
              <div className="w-16 text-sm font-medium text-gray-700">Subject:</div>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                className="flex-1 outline-none text-sm"
                placeholder="Email subject"
              />
            </div>

            {/* Formatting Toolbar */}
            <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
              <button onClick={() => applyFormatting("bold")} className="p-1 rounded hover:bg-gray-100" title="Bold">
                <Bold className="h-4 w-4" />
              </button>
              <button
                onClick={() => applyFormatting("italic")}
                className="p-1 rounded hover:bg-gray-100"
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                onClick={() => applyFormatting("underline")}
                className="p-1 rounded hover:bg-gray-100"
                title="Underline"
              >
                <Underline className="h-4 w-4" />
              </button>
              <div className="h-4 border-l border-gray-300 mx-1"></div>
              <button
                onClick={() => applyFormatting("insertUnorderedList")}
                className="p-1 rounded hover:bg-gray-100"
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  const url = prompt("Enter link URL:")
                  if (url) applyFormatting("createLink", url)
                }}
                className="p-1 rounded hover:bg-gray-100"
                title="Insert Link"
              >
                <Link className="h-4 w-4" />
              </button>
            </div>

            {/* Email Body - Rich Text Editor */}
            <div className="min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar rounded-md p-1">
              <div
                ref={bodyEditorRef}
                contentEditable
                className="w-full min-h-[300px] outline-none text-sm font-sans"
                onInput={handleBodyInput}
              />
            </div>

            {/* Attachments */}
            {emailData.attachments && emailData.attachments.length > 0 && (
              <div className="border-t border-gray-200 pt-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Attachments:</div>
                <div className="flex flex-wrap gap-2">
                  {emailData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center bg-gray-100 rounded-md px-3 py-1.5 text-sm">
                      <Paperclip className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
                      <span className="text-gray-700 mr-1.5">{file.name}</span>
                      <span className="text-gray-500 text-xs">({formatFileSize(file.size)})</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleAttachmentClick}
                className="flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors mr-2"
              >
                <Paperclip className="h-4 w-4 mr-1.5" />
                Attach
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
            </div>

            <button
              onClick={handleSendEmail}
              disabled={sending || toRecipients.length === 0 || !emailData.subject}
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors",
                sending || toRecipients.length === 0 || !emailData.subject
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90",
              )}
            >
              {sending ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-1.5" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1.5" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Gmail Access Popup */}
      {showGmailPopup && <GmailAccessPopup onClose={() => setShowGmailPopup(false)} />}
    </div>
  )
}

export default EmailTab
