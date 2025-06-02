"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SettingsDropdownProps {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}

export function SettingsDropdown({ label, options, value, onChange }: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="flex items-center gap-2 relative" ref={dropdownRef}>
      <span>{label}:</span>
      <button
        className="flex items-center gap-1 bg-white rounded-md px-2 py-1 border border-gray-200 hover:border-gray-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value}
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 mt-1 z-50 bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[120px]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            style={{ zIndex: 50 }}
          >
            {options.map((option) => (
              <button
                key={option}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 transition-colors ${
                  option === value ? "bg-gray-50 text-purple-600 font-medium" : "text-gray-700"
                }`}
                onClick={() => {
                  onChange(option)
                  setIsOpen(false)
                }}
              >
                {option}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
