"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Upload, ImageIcon, Palette } from "lucide-react"
import ColorPickerPortal from "./color-picker-portal"
import { imageTracker, type ImageLocation } from "@/lib/image-tracker"

interface BackgroundDialogProps {
  isOpen: boolean
  onClose: () => void
  onApplyColor: (color: string) => void
  onApplyImage: (imageUrl: string) => void
  currentBackground: string
  slideId?: string // Add slideId prop to track background images
}

export default function BackgroundDialog({
  isOpen,
  onClose,
  onApplyColor,
  onApplyImage,
  currentBackground,
  slideId,
}: BackgroundDialogProps) {
  const [activeTab, setActiveTab] = useState<"color" | "image">("color")
  const [selectedColor, setSelectedColor] = useState(
    currentBackground.startsWith("url") ? "#ffffff" : currentBackground,
  )
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(
    currentBackground.startsWith("url") ? extractUrlFromBackground(currentBackground) : null,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const colorButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Extract URL from background CSS
  function extractUrlFromBackground(background: string): string | null {
    const urlMatch = background.match(/url$$['"]?([^'"]+)['"]?$$/)
    return urlMatch ? urlMatch[1] : null
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
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

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setPreviewImage(imageUrl)

        // Track this background image if slideId is provided
        if (slideId) {
          const location: ImageLocation = {
            slideId: slideId,
            type: "background",
          }
          imageTracker.addImage(imageUrl, file, location)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleApply = () => {
    if (activeTab === "color") {
      onApplyColor(selectedColor)
    } else if (activeTab === "image" && previewImage) {
      onApplyImage(previewImage)
    }
    onClose()
  }

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    setColorPickerOpen(false)
  }

  const removePreviewImage = () => {
    // Remove from tracker if it was a local image
    if (previewImage && slideId && previewImage.startsWith("data:image/")) {
      const location: ImageLocation = {
        slideId: slideId,
        type: "background",
      }
      imageTracker.removeImageLocation(previewImage, location)
    }
    setPreviewImage(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Change Background</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "color"
                  ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("color")}
            >
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span>Color</span>
              </div>
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "image"
                  ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("image")}
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span>Image</span>
              </div>
            </button>
          </div>

          {/* Color Tab Content */}
          {activeTab === "color" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded border border-gray-300"
                  style={{ backgroundColor: selectedColor }}
                ></div>
                <button
                  ref={colorButtonRef}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                  onClick={() => setColorPickerOpen(true)}
                >
                  Choose Color
                </button>
              </div>

              {/* Quick Colors */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Colors</h3>
                <div className="grid grid-cols-8 gap-2">
                  {[
                    "#ffffff",
                    "#f8f9fa",
                    "#f1f3f4",
                    "#e8eaed",
                    "#dadce0",
                    "#000000",
                    "#ea4335",
                    "#fbbc04",
                    "#34a853",
                    "#4285f4",
                    "#1a73e8",
                    "#9c27b0",
                    "#673ab7",
                    "#3f51b5",
                  ].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color ? "border-blue-500" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Image Tab Content */}
          {activeTab === "image" && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                style={{ height: "200px" }}
                onClick={handleFileSelect}
              >
                {previewImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={previewImage || "/placeholder.svg"}
                      alt="Background preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                      onClick={(e) => {
                        e.stopPropagation()
                        removePreviewImage()
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload an image</p>
                    <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </div>
      </div>

      {/* Color Picker Portal */}
      <ColorPickerPortal
        isOpen={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        onColorSelect={handleColorSelect}
        currentColor={selectedColor}
        triggerRef={colorButtonRef}
      />
    </div>
  )
}
