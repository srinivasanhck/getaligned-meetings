// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define routes that don't need authentication
const publicRoutes = ["/login", "/auth/callback"]

export default function middleware(request: NextRequest) {
  const token = request.cookies.get("getaligned_meeting_token")
  console.log("at middleware token", token)
  // Add explicit exclusion for API routes
  if (request.nextUrl.pathname.startsWith("/api/auth/callback") || 
      request.nextUrl.pathname.startsWith("/core/api")) {
    return NextResponse.next()
  }

  // If on login page and already authenticated, redirect to home
  if (token && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If not authenticated and not on a public route, redirect to login
  if (!token && !publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// Apply middleware to all routes except public assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|logo.png).*)",
  ],
}


// <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
// <Card>
//   <CardContent className="p-4">
//     <h3 className="text-sm font-medium text-gray-500">Total Completed Tasks</h3>
//     <p className="text-2xl font-bold">{stats.totalCompletedTasks}</p>
//   </CardContent>
// </Card>
// <Card>
//   <CardContent className="p-4">
//     <h3 className="text-sm font-medium text-gray-500">In Progress Action Items</h3>
//     <p className="text-2xl font-bold">{stats.inProgressActionItems}</p>
//   </CardContent>
// </Card>
// <Card>
//   <CardContent className="p-4">
//     <h3 className="text-sm font-medium text-gray-500">Completed Action Items</h3>
//     <p className="text-2xl font-bold">{stats.completedActionItems}</p>
//   </CardContent>
// </Card>
// <Card>
//   <CardContent className="p-4">
//     <h3 className="text-sm font-medium text-gray-500">Ideas Shared Tasks</h3>
//     <p className="text-2xl font-bold">{stats.inProgressIdeasSharedTasks}</p>
//   </CardContent>
// </Card>
// </div>