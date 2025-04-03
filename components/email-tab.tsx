"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertCircle, Mail, X } from "lucide-react"
import type { Meeting, MeetingDetail } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { fetchEmailTemplate } from "@/lib/redux/dashboardSlice"
import Cookies from "js-cookie"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import dynamic from "next/dynamic"
import { APIURL, CLIENT_ID } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

// Add this at the top of the file, after imports
// Preload the rich text editor component
if (typeof window !== "undefined") {
  // Only run in browser environment
  const preloadRichTextEditor = () => {
    import("@/components/rich-text-editor")
  }
  // Preload after a short delay to prioritize initial render
  setTimeout(preloadRichTextEditor, 1000)
}

// Dynamically import the Editor component with SSR disabled and better loading state
const RichTextEditor = dynamic(() => import("@/components/rich-text-editor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[300px] border rounded-md p-4 bg-gray-50">
      <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3"></div>
      <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
    </div>
  ),
})

interface EmailTabProps {
  meeting: Meeting
  meetingDetails: MeetingDetail
}

// Cookie names
const TOKEN_COOKIE = "getaligned_token"


// Function to convert HTML to formatted plain text
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

    return ""
  }

  // Process the entire document
  let plainText = processNode(tempDiv)

  // Clean up extra whitespace and newlines
  plainText = plainText
    .replace(/\n\n\n+/g, "\n\n") // Replace 3+ newlines with 2
    .replace(/^\s+|\s+$/g, "") // Trim whitespace

  return plainText
}

export const EmailTab = ({ meeting, meetingDetails }: EmailTabProps) => {
  const dispatch = useAppDispatch()
    const { toast } = useToast()
  const { emailData, loadingEmail, emailError: reduxEmailError } = useAppSelector((state) => state.dashboard)
  const [toRecipients, setToRecipients] = useState<string[]>([])
  const [ccRecipients, setCcRecipients] = useState<string[]>([])
  const [bccRecipients, setBccRecipients] = useState<string[]>([])
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<{ file: File; name: string; size: string }[]>([])
  const [editedEmailData, setEditedEmailData] = useState<{ subject: string; body: string } | null>(null)
  const [draggedEmail, setDraggedEmail] = useState<string | null>(null)
  const [emailContent, setEmailContent] = useState("")

  // New states for Gmail permission handling
  const [needsGmailPermission, setNeedsGmailPermission] = useState(false)
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [htmlContent, setHtmlContent] = useState("") // Store the HTML version separately

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Fetch email template when component mounts or when meeting changes
  useEffect(() => {
    if (!meetingDetails?.meeting?.meetingUniqueId) return
console.log("emaildata",emailData);
    // Only fetch if we don't already have email data
    if (!emailData) {
      // Show loading state for the editor specifically
      setEmailContent("Loading content...")

      dispatch(fetchEmailTemplate(meetingDetails.meeting.meetingUniqueId))
        .unwrap()
        .then((response) => {
          // Check if the response indicates missing Gmail scope
          if (response && response?.email) {
            // Initialize edited data when emailData is available
            setEditedEmailData({
              subject: response.email.subject,
              body: response.email.body,
            })
           
             // Set email content only if it's different from current content
             if (response?.email.body !== emailContent) {
            setEmailContent(response?.email.body)
            setHtmlContent(response.email.body) // Store HTML version
             }
          }
        })
        .catch((error) => {
          console.error("Error fetching email template:", error)
          setEmailContent("Failed to load content. Please try again.")
        })
    } else if (!editedEmailData && emailData.email) {
      // Initialize edited data when emailData is available
      setEditedEmailData({
        subject: emailData.email.subject,
        body: emailData.email.body,
      })
        // Set email content only if it's different from current content
      if (emailData.email.body !== emailContent) {
      setEmailContent(emailData.email.body)
      setHtmlContent(emailData.email.body) // Store HTML version
      }
    }
  }, [dispatch, meetingDetails?.meeting?.meetingUniqueId, emailData, editedEmailData, emailContent])

  // Set default recipients from meeting attendees when data is loaded
  useEffect(() => {
    if (meeting?.attendees?.length && toRecipients.length === 0) {
      const emails = meeting.attendees.map((attendee) => attendee.email)
      setToRecipients(emails)
    }
  }, [meeting, toRecipients.length])

  // Handle requesting Gmail permissions
  const requestGmailPermission = () => {
    setIsRequestingPermission(true)

    try {
      // Get the current origin for the redirect URI
      // const redirectUri = "http://localhost:3000/auth/callback"
      const redirectUri = process.env.NEXT_PUBLIC_isLocalhost == "true" ? "http://localhost:3000/auth/callback" : "https://app.getaligned.work/auth/callback";
      const client_id = CLIENT_ID
      // const scope = encodeURIComponent("https://www.googleapis.com/auth/gmail.modify")
      const scope = encodeURIComponent("https://www.googleapis.com/auth/gmail.modify")

      // Construct the OAuth URL for Gmail
    // const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`

    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.modify&access_type=offline&prompt=consent`

    // Redirect the user to Gmail's OAuth consent screen
    window.location.href = oauthUrl

    } catch (err) {
      console.error("Permission request error:", err)
      setIsRequestingPermission(false)
      setEmailError("Failed to request Gmail permissions. Please try again.")
    }
  }

  // Handle canceling the permission request
  const cancelPermissionRequest = () => {
    setNeedsGmailPermission(false)
  }

  // Handle editor content change
  const handleEditorChange = (content: string) => {
     // Only update if content actually changed
     if (content !== htmlContent) {
      setHtmlContent(content) // Store the HTML version
      setEmailContent(content) // Keep this for backward compatibility
    if (editedEmailData) {
      setEditedEmailData({
        ...editedEmailData,
        body: content,
      })
    }
  }
  }

  // Handle sending email
  const handleSendEmail = async () => {
    if (!editedEmailData || toRecipients.length === 0) return

    setIsSending(true)
    setSendSuccess(false)
    setEmailError(null)

    try {
      const token = Cookies.get(TOKEN_COOKIE);
      const gmailscopePresent = emailData?.scope === "Email scope not found in user session" ? false : true
     console.log("gmailscopePresent",gmailscopePresent)
      if (gmailscopePresent === false) {
        // Instead of throwing an error, show the Gmail permission UI
        setNeedsGmailPermission(true)
        setEmailError("Gmail permission required to send emails")
        setIsSending(false)
        return
      }

      // Create FormData object
      const formData = new FormData()

      // Add recipients as comma-separated strings instead of JSON arrays
      formData.append("to", toRecipients.join(","))

      // Add CC if present
      if (ccRecipients.length > 0) {
        formData.append("cc", ccRecipients.join(","))
      }

      // Add BCC if present
      if (bccRecipients.length > 0) {
        formData.append("bcc", bccRecipients.join(","))
      }

          // Convert HTML to plain text before sending
          const plainTextContent = convertHtmlToPlainText(htmlContent)
          // Add subject and body (using plain text version)
      formData.append("subject", editedEmailData.subject)
      formData.append("body", plainTextContent)

      // Add attachments if present
      attachments.forEach((attachment, index) => {
        formData.append(`attachment`, attachment.file, attachment.name)
      })

      // Create headers
      const headers = new Headers()
      // Don't set Content-Type for FormData, browser will set it with boundary
      headers.append("Authorization", `Bearer ${token}`)
console.log("formData", formData);
      // Make the API call
      const response = await fetch(
        `${APIURL}/api/v1/meeting-bot/send-email?accessToken=${token}`,
        {
          method: "POST",
          headers: headers,
          body: formData,
        },
      )

      let data
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        // Check if the error is due to missing Gmail scope
        if (data.scope === "Email scope not found in user session") {
          setNeedsGmailPermission(true)
          throw new Error("Gmail permission required to send emails")
        }
        throw new Error(typeof data === "object" ? data.message || "Failed to send email" : "Failed to send email")
      }

      console.log("Email sent successfully:", data)

      // Show success message
      setSendSuccess(true)
      toast({
        title: "Email sent successfully!",
        // description: "Task moved back to active tasks",
        variant: "success",
      })

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSendSuccess(false)
      }, 3000)
    } catch (err) {
      console.error("Failed to send email:", err)

      // Don't show error if we're showing the permission request
      if (!needsGmailPermission) {
        setEmailError((err as Error).message || "Failed to send email. Please try again.")
        toast({
          title: "Failed to send email. Please try again.",
          variant: "success",
        })
        // Show error message for 3 seconds
        setTimeout(() => {
          setEmailError(null)
        }, 3000)
      }
    } finally {
      setIsSending(false)
    }
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newAttachments = Array.from(files).map((file) => ({
      file: file,
      name: file.name,
      size: formatFileSize(file.size),
    }))

    setAttachments([...attachments, ...newAttachments])
    e.target.value = "" // Reset input
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  // Remove email from recipients
  const removeFromTo = (email: string) => {
    setToRecipients(toRecipients.filter((e) => e !== email))
  }

  // Remove email from CC
  const removeFromCc = (email: string) => {
    setCcRecipients(ccRecipients.filter((e) => e !== email))
  }

  // Add a function to remove email from BCC
  const removeFromBcc = (email: string) => {
    setBccRecipients(bccRecipients.filter((e) => e !== email))
  }

  // Handle drag start
  const handleDragStart = (email: string) => {
    setDraggedEmail(email)
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Update the handleDropOnCc function to handle BCC as well
  const handleDropOnBcc = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedEmail) {
      // Remove from original location
      if (toRecipients.includes(draggedEmail)) {
        setToRecipients(toRecipients.filter((email) => email !== draggedEmail))
      } else if (ccRecipients.includes(draggedEmail)) {
        setCcRecipients(ccRecipients.filter((email) => email !== draggedEmail))
      }

      // Add to BCC if not already there
      if (!bccRecipients.includes(draggedEmail)) {
        setBccRecipients([...bccRecipients, draggedEmail])
      }
      setDraggedEmail(null)
    }
  }

  // Update the handleDropOnTo and handleDropOnCc functions to handle removal from BCC
  const handleDropOnTo = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedEmail) {
      // Remove from original location
      if (ccRecipients.includes(draggedEmail)) {
        setCcRecipients(ccRecipients.filter((email) => email !== draggedEmail))
      } else if (bccRecipients.includes(draggedEmail)) {
        setBccRecipients(bccRecipients.filter((email) => email !== draggedEmail))
      }

      // Add to To if not already there
      if (!toRecipients.includes(draggedEmail)) {
        setToRecipients([...toRecipients, draggedEmail])
      }
      setDraggedEmail(null)
    }
  }

  const handleDropOnCc = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedEmail) {
      // Remove from original location
      if (toRecipients.includes(draggedEmail)) {
        setToRecipients(toRecipients.filter((email) => email !== draggedEmail))
      } else if (bccRecipients.includes(draggedEmail)) {
        setBccRecipients(bccRecipients.filter((email) => email !== draggedEmail))
      }

      // Add to CC if not already there
      if (!ccRecipients.includes(draggedEmail)) {
        setCcRecipients([...ccRecipients, draggedEmail])
      }
      setDraggedEmail(null)
    }
  }

  // Render Gmail permission request
  if (needsGmailPermission) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
        <Alert className="mb-6 border-yellow-300 bg-yellow-50">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <AlertTitle className="text-yellow-800 font-medium">Gmail Permission Required</AlertTitle>
          <AlertDescription className="text-yellow-700 mt-2">
            <p className="mb-4">
              To send emails directly from this application, you need to grant permission to access your Gmail account.
              This will allow the app to send emails on your behalf.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                onClick={requestGmailPermission}
                disabled={isRequestingPermission}
                className="bg-purple hover:bg-purple/90 flex items-center gap-2"
              >
                {isRequestingPermission ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    Requesting Permission...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Grant Gmail Access
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={cancelPermissionRequest}
                disabled={isRequestingPermission}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <div className="bg-white rounded-lg border p-4 sm:p-6">
          <h3 className="text-lg font-medium mb-4">Why do we need Gmail access?</h3>
          <div className="space-y-4 text-gray-600">
            <p>GetAligned needs the following Gmail permission to send emails on your behalf:</p>
            <div className="bg-gray-50 p-3 rounded-md border text-sm font-mono overflow-x-auto">
              https://www.googleapis.com/auth/gmail.modify
            </div>
            <p>This permission allows the application to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Compose and send emails from your account</li>
              <li>Create drafts and manage your email</li>
              <li>Send meeting summaries and follow-ups directly from the app</li>
            </ul>
            <p className="text-sm text-gray-500 mt-6">
              Your credentials are securely stored and we never read your personal emails. You can revoke this
              permission at any time from your Google Account settings.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Update the loading state to maintain full width
  if (loadingEmail) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center py-12">
        <div className="h-8 w-8 border-4 border-t-purple border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-500">Generating email template...</p>
      </div>
    )
  }

  if (reduxEmailError && !emailData && !editedEmailData) {
    return (
      <div className="rounded-md bg-red-50 p-4 my-4 w-full">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading email template</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{reduxEmailError}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!emailData && !editedEmailData) {
    return (
      <div className="flex items-center justify-center h-40 w-full border border-dashed rounded-md">
        <p className="text-gray-500">No email template available for this meeting.</p>
      </div>
    )
  }

  // Use edited data if available, otherwise use the original data
  const currentEmailData =
    editedEmailData ||
    (emailData && emailData.email
      ? {
          subject: emailData.email.subject,
          body: emailData.email.body,
        }
      : null)

  if (!currentEmailData) {
    return null // Safeguard against null data
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm border">
      {/* Success message */}
      {sendSuccess && (
        <div className="rounded-t-lg bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Email sent successfully!</p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {emailError && (
        <div className="rounded-t-lg bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{emailError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Email compose form */}
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-800">New Message</h2>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // navigator.clipboard.writeText(emailContent)
                   // Copy the plain text version to clipboard
                   const plainText = convertHtmlToPlainText(htmlContent)
                   navigator.clipboard.writeText(plainText)
                }}
                className="text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                Copy
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                Save Draft
              </Button>
            </div>
          </div>

          {/* Recipients */}
          <div
            className="flex flex-col sm:flex-row sm:items-start border-b border-gray-200 py-2"
            onDragOver={handleDragOver}
            onDrop={handleDropOnTo}
          >
            <div className="w-16 flex-shrink-0 font-medium text-gray-700 mb-2 sm:mb-0 sm:mt-2">To:</div>
            <div className="flex-grow">
              <div className="flex flex-wrap gap-1 mb-1">
                {toRecipients.map((email, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(email)}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-800 cursor-move"
                  >
                    {email}
                    <button onClick={() => removeFromTo(email)} className="ml-1 text-purple-600 hover:text-purple-800">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="text"
                className="w-full border-none focus:outline-none focus:ring-0 text-sm"
                placeholder="Add more recipients..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value) {
                    const newEmail = e.currentTarget.value.trim()
                    if (newEmail && !toRecipients.includes(newEmail)) {
                      setToRecipients([...toRecipients, newEmail])
                      e.currentTarget.value = ""
                    }
                  }
                }}
              />
            </div>
            <div className="flex-shrink-0 mt-2 sm:mt-0">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCc(!showCc)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {showCc ? "Hide CC" : "Add CC"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBcc(!showBcc)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {showBcc ? "Hide BCC" : "Add BCC"}
                </Button>
              </div>
            </div>
          </div>

          {/* CC Recipients - Conditional */}
          {showCc && (
            <div
              className="flex flex-col sm:flex-row sm:items-start border-b border-gray-200 py-2"
              onDragOver={handleDragOver}
              onDrop={handleDropOnCc}
            >
              <div className="w-16 flex-shrink-0 font-medium text-gray-700 mb-2 sm:mb-0 sm:mt-2">Cc:</div>
              <div className="flex-grow">
                <div className="flex flex-wrap gap-1 mb-1">
                  {ccRecipients.map((email, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(email)}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 cursor-move"
                    >
                      {email}
                      <button onClick={() => removeFromCc(email)} className="ml-1 text-blue-600 hover:text-blue-800">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  className="w-full border-none focus:outline-none focus:ring-0 text-sm"
                  placeholder="Add CC recipients..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      const newEmail = e.currentTarget.value.trim()
                      if (newEmail && !ccRecipients.includes(newEmail)) {
                        setCcRecipients([...ccRecipients, newEmail])
                        e.currentTarget.value = ""
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* BCC Recipients - Conditional */}
          {showBcc && (
            <div
              className="flex flex-col sm:flex-row sm:items-start border-b border-gray-200 py-2"
              onDragOver={handleDragOver}
              onDrop={handleDropOnBcc}
            >
              <div className="w-16 flex-shrink-0 font-medium text-gray-700 mb-2 sm:mb-0 sm:mt-2">Bcc:</div>
              <div className="flex-grow">
                <div className="flex flex-wrap gap-1 mb-1">
                  {bccRecipients.map((email, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(email)}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-800 cursor-move"
                    >
                      {email}
                      <button onClick={() => removeFromBcc(email)} className="ml-1 text-green-600 hover:text-green-800">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  className="w-full border-none focus:outline-none focus:ring-0 text-sm"
                  placeholder="Add BCC recipients..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      const newEmail = e.currentTarget.value.trim()
                      if (newEmail && !bccRecipients.includes(newEmail)) {
                        setBccRecipients([...bccRecipients, newEmail])
                        e.currentTarget.value = ""
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Subject */}
          <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 py-2">
            <div className="w-16 flex-shrink-0 font-medium text-gray-700 mb-2 sm:mb-0">Subject:</div>
            <div className="flex-grow">
              <input
                type="text"
                className="w-full border-none focus:outline-none focus:ring-0 text-sm"
                value={currentEmailData.subject}
                onChange={(e) => setEditedEmailData({ ...currentEmailData, subject: e.target.value })}
              />
            </div>
          </div>

          {/* Email body - Rich Text Editor */}
          <div className="pt-4">
            {loadingEmail ? (
              <div className="min-h-[300px] border rounded-md p-4 bg-gray-50">
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <RichTextEditor initialValue={emailContent} onChange={handleEditorChange} />
            )}
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Attachments</h3>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-md p-2">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <button onClick={() => removeAttachment(index)} className="text-gray-400 hover:text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 gap-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleSendEmail}
                disabled={isSending || toRecipients.length === 0}
                className="bg-purple hover:bg-purple/90 w-full sm:w-auto"
              >
                {isSending ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </>
                ) : (
                  "Send"
                )}
              </Button>

              <div className="relative w-full sm:w-auto">
                <input type="file" id="file-upload" multiple className="sr-only" onChange={handleFileUpload} />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  Attach
                </label>
              </div>
            </div>

            <div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 w-full sm:w-auto"
                onClick={() => {
                  // Reset form
                  setToRecipients([])
                  setCcRecipients([])
                  setBccRecipients([])
                  setAttachments([])
                  setShowCc(false)
                  setShowBcc(false)
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Discard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Drag and drop instructions - hide on mobile */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg hidden sm:block">
        <div className="text-sm text-gray-600 mb-2 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Tip: Drag emails between To, CC, and BCC fields to move them. Click the X to remove.</span>
        </div>
      </div>
    </div>
  )
}

