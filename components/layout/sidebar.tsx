"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, LogOut, PuzzleIcon as PuzzlePiece, BarChartIcon as ChartBar, ListChecks } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

const sidebarItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: Calendar,
    label: "Upcoming",
    href: "/upcoming",
  },
  {
    icon: ListChecks,
    label: "Next Steps",
    href: "/next-steps",
  },
  {
    icon: PuzzlePiece,
    label: "Integrations",
    href: "/integrations",
  },
  {
    icon: ChartBar,
    label: "Analytics",
    href: "/analytics",
  },
]

const Sidebar = () => {
  const pathname = usePathname()
  const [activeItem, setActiveItem] = useState<string>("home")
  const { logout, email } = useAuth()

  // Get user initials from email
  const getUserInitials = () => {
    if (!email) return "GA"

    const parts = email.split("@")[0].split(".")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    } else {
      return parts[0].substring(0, 2).toUpperCase()
    }
  }

  // Update active item based on pathname
  useEffect(() => {
    if (pathname === "/" || pathname.includes("/dashboard") || pathname.includes("/meeting/")) {
      setActiveItem("home")
    } else if (pathname.includes("/upcoming")) {
      setActiveItem("calendar")
    } else if (pathname.includes("/next-steps")) {
      setActiveItem("next-steps")
    } else if (pathname.includes("/integrations")) {
      setActiveItem("integrations")
    }
  }, [pathname])

  return (
    <div className="flex h-screen w-16 flex-col items-center border-r border-gray-200 bg-white py-4">
      {/* Top Section with Logo and Navigation */}
      <div className="flex flex-col items-center space-y-6">
        {/* Logo - Clickable and smaller */}
        <Link href="/" className="relative h-8 w-8 overflow-hidden rounded-full bg-primary">
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">GA</div>
        </Link>

        {/* Navigation Section - Moved below logo */}
        <div className="flex flex-col items-center space-y-4">
          {/* Home Icon */}
          <div className="group relative">
            <Link
              href="/"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                activeItem === "home"
                  ? "bg-gray-100 text-primary"
                  : "text-gray-500 hover:bg-gray-50 hover:text-primary",
              )}
              onClick={() => setActiveItem("home")}
            >
              <Home size={20} />
            </Link>
            <div className="absolute left-full ml-2 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block z-[99]">
              Homepage
            </div>
          </div>

          {/* Calendar Icon */}
          <div className="group relative">
            <Link
              href="/upcoming"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                activeItem === "calendar"
                  ? "bg-gray-100 text-primary"
                  : "text-gray-500 hover:bg-gray-50 hover:text-primary",
              )}
              onClick={() => setActiveItem("calendar")}
            >
              <Calendar size={20} />
            </Link>
            <div className="absolute left-full ml-2 hidden rounded z-[99] bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
              Upcoming Meetings
            </div>
          </div>

          {/* Next Steps Icon */}
          <div className="group relative">
            <Link
              href="/next-steps"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                activeItem === "next-steps"
                  ? "bg-gray-100 text-primary"
                  : "text-gray-500 hover:bg-gray-50 hover:text-primary",
              )}
              onClick={() => setActiveItem("next-steps")}
            >
              <ListChecks size={20} />
            </Link>
            <div className="absolute left-full ml-2 hidden rounded z-[99] bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
              Next Steps
            </div>
          </div>

          {/* Integrations Icon */}
          <div className="group relative">
            <Link
              href="/integrations"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                activeItem === "integrations"
                  ? "bg-gray-100 text-primary"
                  : "text-gray-500 hover:bg-gray-50 hover:text-primary",
              )}
              onClick={() => setActiveItem("integrations")}
            >
              <PuzzlePiece size={20} />
            </Link>
            <div className="absolute left-full ml-2 hidden rounded z-[99] bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
              Integrations
            </div>
          </div>
        </div>
      </div>

      {/* User Section - Explicitly at the bottom with mt-auto */}
      <div className="mt-auto flex flex-col items-center space-y-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-primary">
          {getUserInitials()}
        </div>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50 hover:text-primary"
          onClick={logout}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  )
}

export default Sidebar
