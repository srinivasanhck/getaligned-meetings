"use client"

import { useRef, useEffect } from "react"

interface SimpleColorPickerProps {
  isOpen: boolean
  onClose: () => void
  onColorSelect: (color: string) => void
}

export default function SimpleColorPicker({ isOpen, onClose, onColorSelect }: SimpleColorPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)

  // Basic colors
  const colors = [
    "#000000",
    "#434343",
    "#666666",
    "#999999",
    "#cccccc",
    "#ffffff",
    "#ff0000",
    "#ff9900",
    "#ffff00",
    "#00ff00",
    "#00ffff",
    "#0000ff",
    "#9900ff",
    "#ff00ff",
    "#e74c3c",
    "#e67e22",
    "#f1c40f",
    "#2ecc71",
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={pickerRef}
      className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-2 z-50 w-48"
    >
      <div className="grid grid-cols-6 gap-1">
        {colors.map((color, index) => (
          <button
            key={index}
            className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            onClick={() => {
              onColorSelect(color)
              onClose()
            }}
            aria-label={`Color ${color}`}
          />
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200">
        <button
          className="text-xs text-gray-600 hover:text-gray-800"
          onClick={() => {
            onColorSelect("")
            onClose()
          }}
        >
          Reset color
        </button>
      </div>
    </div>
  )
}
