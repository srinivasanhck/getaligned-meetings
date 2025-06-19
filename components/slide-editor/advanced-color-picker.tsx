"use client"

import { useState, useRef, useEffect } from "react"
import { HexColorPicker, HexColorInput } from "react-colorful"
import { Palette, Pipette } from "lucide-react"

interface AdvancedColorPickerProps {
  isOpen: boolean
  onClose: () => void
  onColorSelect: (color: string) => void
  currentColor?: string
}

export default function AdvancedColorPicker({
  isOpen,
  onClose,
  onColorSelect,
  currentColor = "#000000",
}: AdvancedColorPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)
  const [selectedColor, setSelectedColor] = useState(currentColor)
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets")

  // Preset colors organized by categories
  const presetColors = {
    basic: ["#000000", "#434343", "#666666", "#999999", "#cccccc", "#efefef", "#f3f3f3", "#ffffff"],
    theme: ["#1f4e79", "#2e75b6", "#5b9bd5", "#9dc3e6", "#a61c00", "#c55a5a", "#e06666", "#ea9999"],
    vibrant: ["#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#9900ff", "#ff00ff"],
    pastels: ["#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc"],
  }

  // Recent colors (you could store this in localStorage)
  const [recentColors, setRecentColors] = useState<string[]>(["#e74c3c", "#3498db", "#2ecc71", "#f39c12"])

  useEffect(() => {
    setSelectedColor(currentColor)
  }, [currentColor])

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

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
  }

  const handleColorSelect = (color: string) => {
    // Add to recent colors if not already there
    if (!recentColors.includes(color)) {
      setRecentColors((prev) => [color, ...prev.slice(0, 7)]) // Keep only 8 recent colors
    }

    onColorSelect(color)
    onClose()
  }

  const handleApplyColor = () => {
    handleColorSelect(selectedColor)
  }

  if (!isOpen) return null

  return (
    <div
      ref={pickerRef}
      className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-[10000] w-80"
    >
      {/* Header with tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === "presets"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("presets")}
        >
          <Palette className="w-4 h-4 inline mr-2" />
          Presets
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === "custom"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("custom")}
        >
          <Pipette className="w-4 h-4 inline mr-2" />
          Custom
        </button>
      </div>

      <div className="p-4">
        {activeTab === "presets" ? (
          <div className="space-y-4">
            {/* Recent Colors */}
            {recentColors.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Recent</h4>
                <div className="flex gap-1 flex-wrap">
                  {recentColors.map((color, index) => (
                    <button
                      key={index}
                      className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                        selectedColor === color ? "border-blue-500" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Preset Color Categories */}
            {Object.entries(presetColors).map(([category, colors]) => (
              <div key={category}>
                <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">{category}</h4>
                <div className="flex gap-1 flex-wrap">
                  {colors.map((color, index) => (
                    <button
                      key={index}
                      className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                        selectedColor === color ? "border-blue-500" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Color Picker */}
            <div className="flex justify-center">
              <HexColorPicker
                color={selectedColor}
                onChange={handleColorChange}
                style={{ width: "200px", height: "150px" }}
              />
            </div>

            {/* Color Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Hex Color</label>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded border border-gray-300" style={{ backgroundColor: selectedColor }} />
                <HexColorInput
                  color={selectedColor}
                  onChange={handleColorChange}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApplyColor}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Apply Color
            </button>
          </div>
        )}

        {/* Reset Option */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button className="text-xs text-gray-600 hover:text-gray-800 underline" onClick={() => handleColorSelect("")}>
            Reset to default
          </button>
        </div>
      </div>
    </div>
  )
}
