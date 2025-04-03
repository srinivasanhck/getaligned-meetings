// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define routes that don't need authentication
const publicRoutes = ["/login", "/auth/callback"]

export function middleware(request: NextRequest) {
  const token = request.cookies.get("getaligned_token")

    // Add explicit exclusion for API routes
    // ✅ Bypass middleware for /auth/callback completely
    if (request.nextUrl.pathname.startsWith("/api/auth/callback") ||request.nextUrl.pathname.startsWith("/core/api")) {
      return NextResponse.next()
    }

  // If user is authenticated, allow access
  if (token || publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // If not authenticated, redirect to login
  return NextResponse.redirect(new URL("/login", request.url))
}


// Apply middleware to all routes except public assets
export const config = {
    matcher: [
      /*
        Exclude the following from middleware:
        - _next (static assets and images)
        - favicon.ico
        - public images and files
      */
      "/((?!_next/static|_next/image|favicon.ico|images/|logo.png).*)",
      // "/((?!_next/static|_next/image|favicon.ico|images/|public/).*)",
      // "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|ico)$).*)",
    ],
  }
