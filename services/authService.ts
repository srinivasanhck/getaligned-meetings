import Cookies from "js-cookie"
import { APIURL, CLIENTID } from "@/lib/utils"

// Constants
const CLIENT_ID = CLIENTID;
const REDIRECT_URI = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : ""
console.log("redirecttt", REDIRECT_URI)
// Cookie names
export const TOKEN_COOKIE = "getaligned_meeting_token"
export const EMAIL_COOKIE = "getaligned_meeting_email"
export const HAS_CALENDAR_ACCESS = "getaligned_calendar_access"

// Get the current domain for cookies
const getCookieDomain = () => {
  // In v0 preview environment or localhost, don't set a domain at all
  return undefined
}

// Cookie options - 365 days expiry
export const getCookieOptions = () => ({
  expires: 365,
  path: "/",
  domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || "localhost",
  secure: process.env.NEXT_PUBLIC_NODE_ENV === "production" ? true : false,
  sameSite: "lax" as const,
})

console.log("NEXT_PUBLIC_COOKIE_DOMAIN s",process.env.NEXT_PUBLIC_COOKIE_DOMAIN);
console.log("NEXT_PUBLIC_NODE_ENV s",process.env.NEXT_PUBLIC_NODE_ENV);
console.log("process.env.NEXT_PUBLIC_isLocalhost s", process.env.NEXT_PUBLIC_isLocalhost);

// User scope interface
export interface UserScope {
  id: number
  jwtToken: string | null
  accessToken: string
  refreshToken: string | null
  expiresIn: number
  scope: string
  tokenType: string
  userId: number
  userName: string
  email: string
  sessionType: string | null
}

/**
 * Get the Google OAuth URL for authentication
 */
export function getGoogleAuthUrl(includeCalendar = false, includeGmail = false): string {
  const scope = ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]

  if (includeCalendar) {
    scope.push("https://www.googleapis.com/auth/calendar")
  }

  if (includeGmail) {
    scope.push("https://www.googleapis.com/auth/gmail.modify")
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${encodeURIComponent(
    scope.join(" "),
  )}&access_type=offline&prompt=consent`
}

/**
 * Handle the OAuth callback by exchanging the code for a token
 */
export async function handleAuthCallback(code: string): Promise<any> {
  console.log("Processing auth code:", code)

  const requestBody: any = {
    authorizationCode: code,
    zoneInfo: "Asia/Kolkata",
    redirectUri: REDIRECT_URI,
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

    // Store token and email in cookies with the correct domain
    if (data.token) {
      // Clear any existing tokens first
      try {
        Cookies.remove(TOKEN_COOKIE, { path: "/" })
        localStorage.removeItem(TOKEN_COOKIE)
      } catch (e) {
        console.error("Error clearing existing token:", e)
      }

      // Set the new token
      try {
        const cookieOptions = getCookieOptions()
        console.log("Setting token cookie with options:", cookieOptions)
        Cookies.set(TOKEN_COOKIE, data.token, cookieOptions)

        // Also store in localStorage as a fallback
        localStorage.setItem(TOKEN_COOKIE, data.token)

        console.log("Token cookie set:", Cookies.get(TOKEN_COOKIE) ? "Success" : "Failed")
        console.log("Token localStorage set:", localStorage.getItem(TOKEN_COOKIE) ? "Success" : "Failed")
      } catch (e) {
        console.error("Error setting token cookie:", e)
        // Fallback to localStorage
        localStorage.setItem(TOKEN_COOKIE, data.token)
      }
    }

    if (data.email) {
      try {
        Cookies.set(EMAIL_COOKIE, data.email, getCookieOptions())
        // Also store in localStorage as a fallback
        localStorage.setItem(EMAIL_COOKIE, data.email)

        console.log("Email cookie set:", Cookies.get(EMAIL_COOKIE) ? "Success" : "Failed")
        console.log("Email localStorage set:", localStorage.getItem(EMAIL_COOKIE) ? "Success" : "Failed")
      } catch (e) {
        console.error("Error setting email cookie:", e)
        // Fallback to localStorage
        localStorage.setItem(EMAIL_COOKIE, data.email)
      }
    }

    // Clear any existing calendar access status to force a fresh check
    try {
      Cookies.remove(HAS_CALENDAR_ACCESS, { path: "/" })
      localStorage.removeItem(HAS_CALENDAR_ACCESS)
    } catch (e) {
      console.error("Error clearing calendar access status:", e)
    }

    return data
  } catch (error) {
    console.error("Authentication error:", error)
    throw error
  }
}

// Add this function to check if we need to refresh the calendar access status
export function shouldRefreshCalendarAccess(): boolean {
  // Get the last check timestamp from localStorage
  const lastCheckStr = localStorage.getItem("calendar_access_last_check")
  // const hasAccess = hasCalendarAccess()

  if (!lastCheckStr) {
    return true // No previous check, should refresh
  }

  const lastCheck = Number.parseInt(lastCheckStr, 10)
  const now = Date.now()

  // Only refresh if it's been more than 5 minutes since the last check
  // AND we don't have calendar access
  return (now - lastCheck > 5 * 60 * 1000) 
}

// Update the checkUserScope function to cache the timestamp
export async function checkUserScope(): Promise<boolean> {
  try {
    // First check if we have a cached result that's recent
    const cachedAccess = hasCalendarAccess()

    // If we have a cached result and it's recent, return it without making an API call
    if (cachedAccess) {
      console.log("Using cached calendar access status:", cachedAccess)
      return cachedAccess
    }


    const token = getToken()
    if (!token) {
      console.error("No token available for checking user scope")
      return false
    }

    console.log("Fetching user scope with token:", token.substring(0, 10) + "...")

    const response = await fetch(`${APIURL}/api/v1/user-session/user-scope`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      console.error(`Failed to check user scope: ${response.status} ${response.statusText}`)
      throw new Error(`Failed to check user scope: ${response.status}`)
    }

    const scopes: UserScope[] = await response.json()
    console.log("User scopes received:", scopes)

    // Check if any scope has sessionType == "calendar"
    const hasCalendarAccessResult = scopes.some((scope) => scope.sessionType === "calendar")
    console.log("Has calendar access:", hasCalendarAccessResult)

    // Store the result in a cookie and localStorage for quick access
    try {
      Cookies.set(HAS_CALENDAR_ACCESS, String(hasCalendarAccessResult), getCookieOptions())
      localStorage.setItem(HAS_CALENDAR_ACCESS, String(hasCalendarAccessResult))

      // Store the timestamp of this check
      localStorage.setItem("calendar_access_last_check", Date.now().toString())

      console.log("Calendar access cookie set:", Cookies.get(HAS_CALENDAR_ACCESS))
      console.log("Calendar access localStorage set:", localStorage.getItem(HAS_CALENDAR_ACCESS))
    } catch (e) {
      console.error("Error setting calendar access cookie:", e)
      localStorage.setItem(HAS_CALENDAR_ACCESS, String(hasCalendarAccessResult))
      localStorage.setItem("calendar_access_last_check", Date.now().toString())
    }

    return hasCalendarAccessResult
  } catch (error) {
    console.error("Error checking user scope:", error)
    return false
  }
}

/**
 * Check if the user is authenticated
 */
export function isAuthenticated(): boolean {
  // Try to get token from cookie first, then fallback to localStorage
  const tokenFromCookie = Cookies.get(TOKEN_COOKIE)
  const tokenFromStorage = localStorage.getItem(TOKEN_COOKIE)
  const token = tokenFromCookie || tokenFromStorage

  console.log("Checking authentication, token exists:", !!token)
  console.log("Token from cookie:", !!tokenFromCookie)
  console.log("Token from localStorage:", !!tokenFromStorage)

  return !!token
  // return true
}

/**
 * Check if the user has calendar access (from cookie or localStorage)
 */
export function hasCalendarAccess(): boolean {
  const accessFromCookie = Cookies.get(HAS_CALENDAR_ACCESS)
  const accessFromStorage = localStorage.getItem(HAS_CALENDAR_ACCESS)

  console.log("Calendar access check - Cookie:", accessFromCookie, "LocalStorage:", accessFromStorage)

  return accessFromCookie === "true" || accessFromStorage === "true"
  // return true
}

/**
 * Get the authentication token
 */
export function getToken(): string | undefined {
  // Try to get token from cookie first, then fallback to localStorage
  const tokenFromCookie = Cookies.get(TOKEN_COOKIE)
  const tokenFromStorage = localStorage.getItem(TOKEN_COOKIE)

  return tokenFromCookie || tokenFromStorage || undefined
  // return "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjbGVhbktvZGluZyIsInN1YiI6IkpXVCBUb2tlbiIsInVzZXJuYW1lIjoiNzQiLCJhdXRob3JpdGllcyI6IlJPTEVfVVNFUiIsImlhdCI6MTc0NDI2NjQ5MCwiZXhwIjoxNzc1ODAyNDkwfQ.MvZagbjIja83p28oNEGburKGxCn14CpyGfM18kXDoyM"
}

/**
 * Get the user's email
 */
export function getUserEmail(): string | undefined {
  // Try to get email from cookie first, then fallback to localStorage
  const emailFromCookie = Cookies.get(EMAIL_COOKIE)
  const emailFromStorage = localStorage.getItem(EMAIL_COOKIE)

  return emailFromCookie || emailFromStorage || undefined
  // return "srinivasan@cleankoding.com"
}

/**
 * Logout the user by removing cookies and localStorage
 */
export function logout(): void {
  try {
    const cookieOptions = { path: "/" }
    console.log("Removing cookies with options:", cookieOptions)

    Cookies.remove(TOKEN_COOKIE, cookieOptions)
    Cookies.remove(EMAIL_COOKIE, cookieOptions)
    Cookies.remove(HAS_CALENDAR_ACCESS, cookieOptions)
  } catch (e) {
    console.error("Error removing cookies:", e)
  }

  // Also clear localStorage
  localStorage.removeItem(TOKEN_COOKIE)
  localStorage.removeItem(EMAIL_COOKIE)
  localStorage.removeItem(HAS_CALENDAR_ACCESS)

  window.location.href = "/login"
}
