"use client"

import { memo } from "react"
import { Home, Calendar, ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const AppSidebar = memo(function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname()
  const { userEmail, logout } = useAuth()

  // Extract initials from email for avatar
  const getInitials = () => {
    if (!userEmail) return "GA"

    const parts = userEmail.split("@")[0].split(".")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return userEmail.substring(0, 2).toUpperCase()
  }

  return (
    <div
      className={cn(
        "h-full bg-white border-r flex flex-col relative transition-all duration-300 font-figtree",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="h-16 border-b flex items-center px-4 justify-between">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple text-white">GA</div>
            <span className="text-lg font-semibold">GetAligned</span>
            </Link>
        )}
        {collapsed && (
           <Link href="/" className="mx-auto">
           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple text-white cursor-pointer hover:opacity-80 transition-opacity">
             GA
           </div>
         </Link>
        )}
      </div>

      {/* Toggle button - hidden on mobile as we use Sheet instead */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-purple-border bg-white shadow-sm z-10"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 rounded-md text-sm font-medium",
              pathname === "/" ? "text-gray-900 bg-gray-100" : "text-gray-700 hover:bg-gray-100",
              collapsed ? "justify-center py-2" : "px-3 py-2",
            )}
          >
            <Home className="h-5 w-5" />
            {!collapsed && <span>Home</span>}
          </Link>
          {/* <Link
            href="/previous-meeting"
            className={cn(
              "flex items-center gap-2 rounded-md text-sm font-medium",
              pathname === "/previous-meeting" ? "text-gray-900 bg-gray-100" : "text-gray-700 hover:bg-gray-100",
              collapsed ? "justify-center py-2" : "px-3 py-2",
            )}
          >
            <Calendar className="h-5 w-5" />
            {!collapsed && <span>Previous Meeting</span>}
          </Link> */}
          <Link
            href="/upcoming-meeting"
            className={cn(
              "flex items-center gap-2 rounded-md text-sm font-medium",
              pathname === "/upcoming-meeting" ? "text-gray-900 bg-gray-100" : "text-gray-700 hover:bg-gray-100",
              collapsed ? "justify-center py-2" : "px-3 py-2",
            )}
          >
            <Calendar className="h-5 w-5" />
            {!collapsed && <span>Upcoming Meeting</span>}
          </Link>
        </nav>

        {/* {!collapsed && (
  <div className="p-2 mt-4">
    <div className="flex items-center justify-between px-3 py-2">
      <h3 className="text-sm font-medium text-gray-500">Teams</h3>
      <button className="rounded-md p-1 hover:bg-gray-100">
        <Plus className="h-4 w-4 text-gray-500" />
      </button>
    </div>

    <div className="mt-1 space-y-1">
      <div className="px-2">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-xs font-medium text-blue-800">
              DT
            </div>
            <span>Default</span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>

        <div className="ml-5 pl-3 border-l border-gray-200 mt-1">
          <a
            href="#"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100"
          >
            <span>Daily Standup</span>
          </a>
        </div>
      </div>

      <div className="px-2">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-yellow-100 text-xs font-medium text-yellow-800">
              YT
            </div>
            <span>Yellow Team</span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="px-2">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-green-100 text-xs font-medium text-green-800">
              W2
            </div>
            <span>ws2</span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>
  </div>
)}

{collapsed && (
  <div className="p-2 mt-4 flex flex-col items-center space-y-4">
    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-xs font-medium text-blue-800">
      DT
    </div>
    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-yellow-100 text-xs font-medium text-yellow-800">
      YT
    </div>
    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-100 text-xs font-medium text-green-800">
      W2
    </div>
  </div>
)} */}
      </div>

      {/* User profile and logout section */}
      <div className={cn("border-t p-2", collapsed ? "text-center" : "")}>
        <div className={cn("flex items-center", collapsed ? "flex-col gap-2" : "gap-3 px-3 py-2")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-800 text-sm font-medium">
            {getInitials()}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{userEmail}</p>
            </div>
          )}

          <button
            onClick={logout}
            className={cn("text-gray-500 hover:text-gray-700", collapsed ? "p-1" : "p-1 ml-auto")}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
})

export default AppSidebar

