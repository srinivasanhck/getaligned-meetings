import Cookies from "js-cookie"
import { APIURL, CLIENTID } from "@/lib/utils"
import axios from "axios"
import { getToken as getAuthToken } from "@/services/authService"
import type { MeetingsResponse } from "@/types/meetings"
import type { MeetingDetails } from "@/types/meetingDetails"

// Constants
const CLIENT_ID = CLIENTID;
const REDIRECT_URI = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : ""

// Cookie names
export const TOKEN_COOKIE = "getaligned_meeting_token"
export const EMAIL_COOKIE = "getaligned_meeting_email"

// Get the current domain for cookies
const getCookieDomain = () => {
  if (typeof window === "undefined") return "localhost"

  const hostname = window.location.hostname
  // If it's localhost, return it as is
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return hostname
  }

  // For production domains, return the domain without subdomains
  // This handles domains like app.example.com or example.com
  const parts = hostname.split(".")
  if (parts.length > 2) {
    // Return the top two levels (example.com from app.example.com)
    return parts.slice(-2).join(".")
  }
  return hostname
}

// Cookie options - 365 days expiry
export const COOKIE_OPTIONS = {
  expires: 365,
  path: "/",
  domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || "localhost",
  secure: process.env.NEXT_PUBLIC_NODE_ENV === "production" ? true : false,
  sameSite: "lax" as const, // More flexible than "strict" for cross-origin
}

// Create axios instance with default config
const api = axios.create({
  baseURL: APIURL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Redirect to login if unauthorized
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

/**
 * Get the Google OAuth URL for authentication
 */
export function getGoogleAuthUrl(): string {
  console.log("REDIRECT_URI", REDIRECT_URI)
  const scope = "https://www.googleapis.com/auth/userinfo.email"
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}`
}

/**
 * Handle the OAuth callback by exchanging the code for a token
 */
export async function handleAuthCallback(code: string): Promise<any> {
  console.log("Processing auth code:", code)

  const requestBody: any = {
    authorizationCode: code,
    zoneInfo: "Asia/Kolkata",
  }


  const isLocalHostForAuth = process.env.NEXT_PUBLIC_isLocalhost == "true" ? true : false;
  if(isLocalHostForAuth){
    requestBody.isLocalhost = true;
  } else {
    requestBody.isIntegration = true;
  }

  try {
    const response = await fetch(`${APIURL}/api/auth/oauth/callback/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData?.message || "Failed to authenticate")
    }

    const data = await response.json()
    console.log("Authentication successful:", data)

    // Store token and email in cookies
    if (data.token) {
      Cookies.set(TOKEN_COOKIE, data.token, COOKIE_OPTIONS)
    }
    if (data.email) {
      Cookies.set(EMAIL_COOKIE, data.email, COOKIE_OPTIONS)
    }

    return data
  } catch (error) {
    console.error("Authentication error:", error)
    throw error
  }
}

/**
 * Check if the user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!Cookies.get(TOKEN_COOKIE)
}

/**
 * Get the authentication token
 */
export function getToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE)
}

/**
 * Get the user's email
 */
export function getUserEmail(): string | undefined {
  return Cookies.get(EMAIL_COOKIE)
}

/**
 * Logout the user by removing cookies
 */
export function logout(): void {
  const cookieDomain = getCookieDomain()
  Cookies.remove(TOKEN_COOKIE, { path: "/", domain: cookieDomain })
  Cookies.remove(EMAIL_COOKIE, { path: "/", domain: cookieDomain })
  window.location.href = "/login"
}

export const fetchMeetings = async (startDate: string, endDate: string): Promise<MeetingsResponse> => {
  try {
    const response = await api.get<MeetingsResponse>(
      `/api/v1/googleCalendar/events?startDate=${startDate}&endDate=${endDate}`,
    )

    // Validate response structure
    if (!response.data || typeof response.data !== "object") {
      throw new Error("Invalid response format")
    }

    return response.data
  } catch (error) {
    console.error("Error fetching meetings:", error)
    throw error
  }
}

export const fetchMeetingDetails = async (meetingId: string): Promise<MeetingDetails> => {
  console.log("Fetching meeting details for ID:", meetingId)
  try {
    const response = await api.get<MeetingDetails>(`/api/v1/meeting-bot/summary/transcript?id=${meetingId}`)

    // Validate response structure
    if (!response.data || typeof response.data !== "object") {
      throw new Error("Invalid response format")
    }

    console.log("API response data:", response.data)

    // Return the data directly
    return response.data
  } catch (error) {
    console.error("Error fetching meeting details:", error)
    throw error
  }
}
