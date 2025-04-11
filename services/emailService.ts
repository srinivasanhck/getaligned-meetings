import { APIURL } from "@/lib/utils"
import { getToken } from "@/services/authService"

export interface EmailTemplate {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  scope?: boolean
  attachments?: {
    name: string
    url: string
    size?: number
  }[]
}

interface ApiEmailResponse {
  email: {
    subject: string
    recipient: string
    body: string
  }
  meeting: any
  scope?: string
}

// Helper function to format email body
const formatEmailBody = (body: string): string => {
  // Start with the original content
  let formattedContent = body

  // Handle bold text
  formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Replace double newlines with paragraph breaks (with proper spacing)
  formattedContent = formattedContent.replace(/\n\n/g, "<br><br>")

  // Replace single newlines (not preceded or followed by another newline)
  // This regex looks for a newline that is not preceded by a newline and not followed by a newline
  formattedContent = formattedContent.replace(/(?<!\n)\n(?!\n)/g, "<br>")

  // Format section headers with proper spacing
  formattedContent = formattedContent.replace(
    /- (Key Decisions|Challenges & Resolutions|Action Items & Next Steps|Stakeholders Involved):/g,
    "<br><br>- <strong>$1:</strong>",
  )

  // Format bullet points with proper indentation
  formattedContent = formattedContent.replace(/\n {2}- /g, "<br>&nbsp;&nbsp;- ")

  return formattedContent
}

// Update the fetchEmailTemplate function to include all meeting attendees in the "to" field

export async function fetchEmailTemplate(meetingId: string): Promise<EmailTemplate> {
  try {
    const token = getToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${APIURL}/api/v1/meeting-bot/follow-up-emails?meetingId=${meetingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login"
        throw new Error("Authentication required")
      }
      throw new Error(`Failed to fetch email template: ${response.status}`)
    }

    const data: ApiEmailResponse = await response.json()

    // Check if we have a scope error
    const hasGmailScope = data.scope !== false

    // Parse recipients from comma-separated string to array
    // Note: We'll still parse this, but we'll use meeting attendees in the EmailTab component
    const recipients = data.email?.recipient ? data.email.recipient.split(",").map((email) => email.trim()) : []

    // Format the body to convert markdown-style formatting to HTML
    const formattedBody = data.email?.body ? formatEmailBody(data.email.body) : ""

    return {
      to: recipients, // This will be overridden in the EmailTab component with meeting attendees
      cc: [],
      bcc: [],
      subject: data.email?.subject || "",
      body: formattedBody,
      scope: hasGmailScope,
      attachments: [],
    }
  } catch (error) {
    console.error("Error fetching email template:", error)
    throw error
  }
}

export async function sendEmail(emailData: EmailTemplate): Promise<{ success: boolean; message: string }> {
  console.warn("This function is deprecated. Email sending is now handled directly in the EmailTab component.")
  return {
    success: false,
    message: "This function is deprecated. Email sending is now handled directly in the EmailTab component.",
  }
}
