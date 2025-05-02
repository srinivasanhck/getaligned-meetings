import { getToken } from "@/services/authService"
import { APIURL } from "@/lib/utils"

// Hubspot OAuth configuration
const HUBSPOT_CLIENT_ID = process.env.NEXT_PUBLIC_HUBSPOT_CLIENT_ID
const REDIRECT_URI = typeof window !== "undefined" ? `${window.location.origin}/integrations/hubspot/callback` : ""

// Define the scopes needed for the integration
const HUBSPOT_SCOPES = [
  "oauth",
  "crm.objects.contacts.read",
  "crm.objects.contacts.write",
  "crm.objects.deals.read",
  "crm.objects.deals.write",
  "crm.objects.companies.read",
  "crm.objects.companies.write",
  "crm.objects.owners.read",
  "crm.schemas.deals.read",
  "crm.schemas.deals.write",
  "crm.schemas.companies.read",
  "crm.schemas.companies.write",
  "crm.schemas.contacts.read",
  "crm.schemas.contacts.write",
]

// Track if we've already processed a code to prevent duplicate calls
const processedCodes = new Set<string>()

/**
 * Get the Hubspot OAuth URL for authentication
 */
export function getHubspotAuthUrl(): string {
  const scope = HUBSPOT_SCOPES.join("%20")
  const encodedRedirectUri = encodeURIComponent(REDIRECT_URI)

  return `https://app.hubspot.com/oauth/authorize?client_id=${HUBSPOT_CLIENT_ID}&scope=${scope}&redirect_uri=${encodedRedirectUri}`
}

/**
 * Handle the Hubspot OAuth callback by exchanging the code for a token
 */
export async function handleHubspotCallback(code: string): Promise<any> {
  try {
    // Check if we've already processed this code
    if (processedCodes.has(code)) {
      console.log("Code already processed, returning cached success")
      return { status: "success", message: "Authentication successful (cached)" }
    }

    // Add the code to our processed set
    processedCodes.add(code)

    const token = getToken()

    if (!token) {
      throw new Error("User not authenticated")
    }

    const response = await fetch(`${APIURL}/api/v1/hubspot/callback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ authorizationCode: code, redirectUri: REDIRECT_URI }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData?.message || "Failed to authenticate with Hubspot")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Hubspot authentication error:", error)
    // Remove the code from processed set if there was an error
    processedCodes.delete(code)
    throw error
  }
}

/**
 * Check if Hubspot is connected by calling the ownerUser API
 */
export async function isHubspotConnected(): Promise<boolean> {
  try {
    const token = getToken()

    if (!token) {
      return false
    }

    const response = await fetch(`${APIURL}/api/v1/hubspot/checkConnection`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    console.log("HubSpot connection check response:", data)

    // Check the status from the response
    if (data.status === "success") {
      console.log("HubSpot connection is valid")
      return true
    } else {
      console.log("HubSpot connection is invalid:", data.message)
      return false
    }
  } catch (error) {
    console.error("Error checking Hubspot connection:", error)
    return false
  }
}

/**
 * Get all contacts from HubSpot
 */
export async function getAllHubspotContacts(): Promise<any[]> {
  try {
    const token = getToken()

    if (!token) {
      throw new Error("User not authenticated")
    }

    const response = await fetch(`${APIURL}/api/v1/hubspot/allContacts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData?.message || "Failed to fetch contacts from HubSpot")
    }

    const data = await response.json()
    console.log("All contacts response:", data)

    // return data.results || []
    return  []
  } catch (error) {
    console.error("Error fetching HubSpot contacts:", error)
    throw error
  }
}

/**
 * Create a contact in HubSpot
 */
export async function createHubspotContact(contactData: {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  company?: string
}): Promise<any> {
  try {
    const token = getToken()

    if (!token) {
      throw new Error("User not authenticated")
    }

    console.log("Creating contact with data:", contactData)

    const response = await fetch(`${APIURL}/api/v1/hubspot/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(contactData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData?.message || "Failed to create contact in HubSpot")
    }

    const data = await response.json()
    console.log("Create contact response:", data)
    return data
  } catch (error) {
    console.error("Error creating HubSpot contact:", error)
    throw error
  }
}

/**
 * Create a note for a contact in HubSpot
 */
export async function createHubspotNote(noteData: {
  contactObjectId: string
  noteBody: string
}): Promise<any> {
  try {
    const token = getToken()

    if (!token) {
      throw new Error("User not authenticated")
    }

    console.log("Creating note with data:", noteData)

    const response = await fetch(`${APIURL}/api/v1/hubspot/createNote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(noteData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData?.message || "Failed to create note in HubSpot")
    }

    const data = await response.json()
    console.log("Create note response:", data)
    return data
  } catch (error) {
    console.error("Error creating HubSpot note:", error)
    throw error
  }
}

/**
 * Get the HubSpot portal URL
 */
export function getHubspotPortalUrl(): string {
  return "https://app.hubspot.com/contacts/"
}

// Clear the processed codes set when the window is closed or refreshed
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    processedCodes.clear()
  })
}
