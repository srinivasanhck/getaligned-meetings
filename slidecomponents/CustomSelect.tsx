"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, MessageCircle, Bot } from "lucide-react"

interface CustomSelectProps {
  value: "ask" | "agent"
  onChange: (value: "ask" | "agent") => void
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  const options = [
    { value: "ask" as const, label: "Ask", icon: MessageCircle, description: "Ask questions about slides" },
    { value: "agent" as const, label: "Agent", icon: Bot, description: "AI agent for modifications" },
  ]

  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={selectRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm font-medium min-w-[80px]"
      >
        {selectedOption && (
          <>
            <selectedOption.icon className="w-3.5 h-3.5" />
            <span>{selectedOption.label}</span>
          </>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full flex items-start space-x-3 px-3 py-2.5 text-left hover:bg-blue-50 transition-colors ${
                value === option.value ? "bg-blue-50 text-blue-700" : "text-slate-700"
              }`}
            >
              <option.icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{option.label}</div>
              
              </div>
              {value === option.value && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomSelect
