"use client"

import { useState, useRef, useEffect } from "react"
import { HubspotIcon } from "@/components/icons/HubspotIcon"
import { getHubspotAuthUrl } from "@/services/hubspotService"
import { User, MessageSquarePlus } from "lucide-react"

interface HubspotButtonProps {
  isConnected: boolean
  onCreateContact: () => void
  onToggleSelectMode: () => void
  isSelectModeActive?: boolean
}

export default function HubspotButton({
  isConnected,
  onCreateContact,
  onToggleSelectMode,
  isSelectModeActive = false,
}: HubspotButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleButtonClick = () => {
    if (isConnected) {
      setShowMenu(!showMenu)
    } else {
      // Redirect to Hubspot OAuth URL if not connected
      window.location.href = getHubspotAuthUrl()
    }
  }

  const handleCreateContact = () => {
    setShowMenu(false)
    onCreateContact()
  }

  const handleToggleSelectMode = () => {
    setShowMenu(false)
    onToggleSelectMode()
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="absolute top-1 right-4 z-30">
      <div className="relative group">
        {/* Menu items - Absolutely positioned above the button */}
        {isConnected && showMenu && (
          <div ref={menuRef} className="absolute top-full right-0 mt-3 flex flex-col gap-2 min-w-[180px]">
            <button
              onClick={handleCreateContact}
              className="flex items-center bg-[#8034CB] text-white px-4 py-3 rounded-lg shadow-lg hover:bg-[#6a2ba9] transition-colors whitespace-nowrap active:scale-95 w-full"
            >
              <User className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Create Contact</span>
            </button>
            <button
              onClick={handleToggleSelectMode}
              className="flex items-center bg-[#8034CB] text-white px-4 py-3 rounded-lg shadow-lg hover:bg-[#6a2ba9] transition-colors whitespace-nowrap active:scale-95 w-full"
            >
              <MessageSquarePlus className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Add Notes to Contact</span>
            </button>
          </div>
        )}

        {/* Main button */}
        <button
          ref={buttonRef}
          onClick={handleButtonClick}
          className={`group flex items-center justify-center rounded-full shadow-lg transition-all ${
            showMenu ? "ring-2 ring-[#8034CB]/20" : ""
          }`}
          title={isConnected ? "HubSpot Options" : "Connect HubSpot"}
        >
          <HubspotIcon size={42} className="h-8 w-8" />
        </button>

        {/* Tooltip for non-connected state - only shows on hover */}
        {!isConnected && (
          <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Connect HubSpot
          </div>
        )}
      </div>
    </div>
  )
}
