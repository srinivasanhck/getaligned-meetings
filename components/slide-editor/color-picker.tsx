"use client"

import { useRef, useEffect } from "react"
import { Pipette, Plus } from "lucide-react"

interface ColorPickerProps {
  isOpen: boolean
  onClose: () => void
  onColorSelect: (color: string) => void
  currentColor?: string
}

export default function ColorPicker({ isOpen, onClose, onColorSelect, currentColor }: ColorPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)

  // Streamline colors (commonly used)
  const streamlineColors = ["#16a085", "#000000", "#95a5a6", "#e67e22", "#e74c3c", "#2ecc71", "#3498db", "#f39c12"]

  // Custom color palette
  const customColors = [
    ["#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff"],
    ["#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff"],
    ["#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc"],
    ["#dd7e6b", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
    ["#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6d9eeb", "#6fa8dc", "#8e7cc3", "#c27ba0"],
    ["#a61c00", "#cc0000", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3c78d8", "#3d85c6", "#674ea7", "#a64d79"],
    ["#85200c", "#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#1155cc", "#0b5394", "#351c75", "#741b47"],
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

  const handleColorClick = (color: string) => {
    onColorSelect(color)
    onClose()
  }

  return (
    <div
      ref={pickerRef}
      className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-[10000] w-64"
    >
      {/* Streamline Section */}
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Streamline</div>
        <div className="flex gap-1">
          {streamlineColors.map((color, index) => (
            <button
              key={index}
              className={`w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform ${
                currentColor === color ? "border-blue-500" : "border-gray-300"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorClick(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Custom Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Custom</div>
          <div className="flex gap-1">
            <button
              className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50"
              title="Add custom color"
            >
              <Plus className="w-3 h-3 text-gray-600" />
            </button>
            <button
              className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50"
              title="Eyedropper tool"
            >
              <Pipette className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Color Grid */}
        <div className="space-y-1">
          {customColors.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {row.map((color, colIndex) => (
                <button
                  key={colIndex}
                  className={`w-5 h-5 rounded border hover:scale-110 transition-transform ${
                    currentColor === color ? "border-blue-500 border-2" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorClick(color)}
                  title={color}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Reset option */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button className="text-xs text-gray-600 hover:text-gray-800 underline" onClick={() => handleColorClick("")}>
          Reset to default
        </button>
      </div>
    </div>
  )
}
