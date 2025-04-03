import Cookies from "js-cookie";
import { APIURL } from "./utils";

// Cookie names
const TOKEN_COOKIE = "getaligned_token"
const EMAIL_COOKIE = "getaligned_email"

// Cookie options - 7 days expiry, secure in production
const COOKIE_OPTIONS = {
  expires: 365,
  path: "/",
  domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || "localhost",
  secure: process.env.NEXT_PUBLIC_NODE_ENV === "production" ? true : false,
  sameSite: "lax" as "lax", // More flexible than "strict" for cross-origin
}
console.log("NEXT_PUBLIC_COOKIE_DOMAIN s",process.env.NEXT_PUBLIC_COOKIE_DOMAIN);
console.log("NEXT_PUBLIC_NODE_ENV s",process.env.NEXT_PUBLIC_NODE_ENV);
console.log("process.env.NEXT_PUBLIC_isLocalhost s", process.env.NEXT_PUBLIC_isLocalhost);
/**
 * Handle the OAuth callback by exchanging the code for a token
 */
export async function handleAuthCallback(code: string): Promise<void> {
  console.log("code in auth.ts", code);

  const requestBody: any = {
    authorizationCode: code,
    zoneInfo: "Asia/Kolkata",
  };

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
console.log("response", response);
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData?.message || "Failed to authenticate")
    }

    const data = await response.json()
    console.log("token data in auth.ts", data);
    // Store token and email in cookies
    if(data.token){
      Cookies.set(TOKEN_COOKIE, data.token, COOKIE_OPTIONS)
    }
    if(data.email){
      Cookies.set(EMAIL_COOKIE, data.email, COOKIE_OPTIONS)
    }

    return data
  } catch (error) {
    console.error("Authentication error:", error)
    throw error
  }
}

export async function handleGmailCallback(code: string): Promise<void> {
  console.log("Gmail code in auth.ts", code);
  const requestBody: any = {
    authorizationCode: code,
    zoneInfo: "Asia/Kolkata",
  };
  const isLocalHostForAuth = process.env.NEXT_PUBLIC_isLocalhost == "true" ? true : false;
  console.log("isLocalHostForAuth", isLocalHostForAuth);
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
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to authenticate for Gmail");
    }
    const data = await response.json();
    console.log("Gmail token data in auth.ts", data);
    // Update the token with Gmail scopes
    Cookies.set(TOKEN_COOKIE, data.token, COOKIE_OPTIONS);
    return data;
  } catch (error) {
    console.error("Gmail Authentication error:", error);
    throw error;
  }
}


/**
 * Check if the user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!Cookies.get(TOKEN_COOKIE)
  // return true
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
 * Log out the user by removing cookies
 */
// export function logout(): void {
//   let domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
//   // Cookies.remove(TOKEN_COOKIE, { path: "/", domain: "localhost" });  //for localhost only
//   // Cookies.remove(EMAIL_COOKIE, { path: "/", domain: "localhost" });  //for localhost only
//   Cookies.remove(TOKEN_COOKIE, { path: "/", domain: ".getaligned" });  //for production only
//   Cookies.remove(EMAIL_COOKIE, { path: "/", domain: "localhost" });  //for production only
//   window.location.href = "/login"
// }


export function logout(): void {
  let domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || "localhost"; // Default to localhost if not set

  Cookies.remove(TOKEN_COOKIE, { path: "/", domain });
  Cookies.remove(EMAIL_COOKIE, { path: "/", domain });

  window.location.href = "/login";
}

