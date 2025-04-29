import { APIURL } from "@/lib/utils"
import { getToken } from "@/services/authService"

// Add these new types at the top of the file
export enum EmailTemplateType {
  SALES_FOLLOW_UP = "SALES_FOLLOW_UP",
  DEAL_CLOSING = "DEAL_CLOSING",
  MEETING_FOLLOW_UP = "MEETING_FOLLOW_UP",
  CLIENT_CHECKIN = "CLIENT_CHECKIN",
  PROMOTION_ANNOUNCEMENT = "PROMOTION_ANNOUNCEMENT",
  PARTNERSHIP_INTRO = "PARTNERSHIP_INTRO",
  ONBOARDING_WELCOME = "ONBOARDING_WELCOME",
  CUSTOMER_FEEDBACK = "CUSTOMER_FEEDBACK",
  INACTIVE_CUSTOMER_REACTIVATION = "INACTIVE_CUSTOMER_REACTIVATION",
  PRODUCT_UPDATE_ANNOUNCEMENT = "PRODUCT_UPDATE_ANNOUNCEMENT",
}

export enum EmailLength {
  SHORT = "SHORT",
  MEDIUM = "MEDIUM",
  LONG = "LONG",
  DONT_SPECIFY = "DONT_SPECIFY",
}

export enum EmailTone {
  FORMAL = "FORMAL",
  INFORMAL = "INFORMAL",
  NEUTRAL = "NEUTRAL",
  DONT_SPECIFY = "DONT_SPECIFY",
}

export interface EmailTemplateOptions {
  templateType?: EmailTemplateType
  length?: EmailLength
  tone?: EmailTone
}

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


const formatEmailBody = (body: string): string => {
  if (!body) return "";

  let formatted = body;

  // Convert markdown-style bold (**text**) to <strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Remove dash before bold headers like "- **Key Decisions:**"
  formatted = formatted.replace(/^- <strong>(.*?):<\/strong>/gm, "<strong>$1:</strong>");

  // Convert bullet points (excluding section headers) to <li>
  formatted = formatted.replace(/\n\s*-\s(?!<strong>)(.*?)(?=\n|$)/g, "<li>$1</li>");

  // Wrap consecutive <li> elements with a <ul>
  formatted = formatted.replace(/(?:<li>.*?<\/li>\s*)+/g, match => {
    const cleaned = match.replace(/\s*\n\s*/g, ""); // remove internal newlines between <li>
    return `<ul>${cleaned}</ul>`;
  });

  // Replace double newlines with paragraph breaks
  formatted = formatted.replace(/\n\n+/g, "<br><br>");

  // Replace single newlines (only if not already handled by lists)
  formatted = formatted.replace(/(?<!<\/li>)\n(?!\n)/g, "<br>");

  return formatted;
};


// Update the fetchEmailTemplate function to accept the new options
export async function fetchEmailTemplate(meetingId: string, options?: EmailTemplateOptions): Promise<EmailTemplate> {
  try {
    const token = getToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    // Build request body based on provided options
    const requestBody: any = {
      meetingId: meetingId,
    }

    // Add optional parameters if they exist
    if (options?.templateType) {
      requestBody.templateType = options.templateType
    }

    if (options?.length) {
      requestBody.length = options.length
    }

    if (options?.tone) {
      requestBody.tone = options.tone
    }
console.log("rquestBody",requestBody);
    const response = await fetch(`${APIURL}/api/v1/meeting-bot/follow-up-emails?meetingId=${meetingId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login"
        throw new Error("Authentication required")
      }
      throw new Error(`Failed to fetch email template: ${response.status}`)
    }

    const data: ApiEmailResponse = await response.json()
console.log("email data at eservice",data);
    // Check if we have a scope error
    const hasGmailScope = data?.scope ? true : false

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
