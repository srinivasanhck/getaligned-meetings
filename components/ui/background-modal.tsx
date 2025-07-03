"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, ImageIcon } from "lucide-react"

interface BackgroundModalProps {
  isOpen: boolean
  onClose: () => void
  currentBackground: {
    type: "color" | "gradient" | "image"
    value: string
    imageFit?: "cover" | "contain"
    overlayOpacity?: number
  }
  onBackgroundChange: (background: {
    type: "color" | "gradient" | "image"
    value: string
    imageFit?: "cover" | "contain"
    overlayOpacity?: number
  }) => void
}

const PRESET_COLORS = [
  // Row 1 - Grays and basics
  ["#000000", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#F3F4F6", "#FFFFFF"],
  // Row 2 - Reds
  ["#DC2626", "#EF4444", "#F87171", "#FCA5A5", "#FECACA", "#FEE2E2"],
  // Row 3 - Oranges and Yellows
  ["#EA580C", "#F97316", "#FB923C", "#FDE047", "#FEF08A", "#FEFCE8"],
  // Row 4 - Greens
  ["#16A34A", "#22C55E", "#4ADE80", "#86EFAC", "#BBF7D0", "#DCFCE7"],
  // Row 5 - Blues
  ["#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE", "#EFF6FF"],
  // Row 6 - Purples
  ["#7C3AED", "#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#F3F4F6"],
  // Row 7 - Pinks
  ["#DB2777", "#EC4899", "#F472B6", "#F9A8D4", "#FBCFE8", "#FDF2F8"],
  // Row 8 - Light Vibrant Colors
  ["#FFE4E1", "#FFB6C1", "#FFA07A", "#98FB98", "#87CEEB", "#DDA0DD", "#F0E68C"],
]

const GRADIENT_PRESETS = [
  { name: "Ocean Blue", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Sunset", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Forest", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { name: "Purple Rain", value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
  { name: "Fire", value: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
  { name: "Sky", value: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)" },
]

const BackgroundModal: React.FC<BackgroundModalProps> = ({
  isOpen,
  onClose,
  currentBackground,
  onBackgroundChange,
}) => {
  const [activeTab, setActiveTab] = useState<"solid" | "gradient" | "image">("solid")
  const [customColor, setCustomColor] = useState("#3B82F6")
  const [imageUrl, setImageUrl] = useState("")
  const [imageFit, setImageFit] = useState<"cover" | "contain">("cover")
  const [overlayOpacity, setOverlayOpacity] = useState(0.3)

  const [uploadStatus, setUploadStatus] = useState<{ type: "loading" | "success" | "error"; message: string } | null>(
    null,
  )

  // Initialize state from current background when modal opens
  useEffect(() => {
    if (isOpen && currentBackground) {
      console.log("BackgroundModal - Initializing with current background:", currentBackground)

      if (currentBackground.type === "image") {
        setImageUrl(currentBackground.value || "")
        setImageFit(currentBackground.imageFit || "cover")
        // Handle both undefined and 0 values properly
        setOverlayOpacity(currentBackground.overlayOpacity !== undefined ? currentBackground.overlayOpacity : 0)
        setActiveTab("image")
      } else if (currentBackground.type === "gradient") {
        setActiveTab("gradient")
      } else {
        setActiveTab("solid")
      }
    }
  }, [isOpen, currentBackground])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadStatus({ type: "error", message: "Please select an image file" })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus({ type: "error", message: "File size must be less than 10MB" })
      return
    }

    setUploadStatus({ type: "loading", message: "Uploading image..." })

    try {
      // Import the presentationService
      const { presentationService } = await import("@/services/presentationService")
      const uploadedUrl = await presentationService.uploadImage(file)

      setImageUrl(uploadedUrl)
      setUploadStatus({ type: "success", message: "Image uploaded successfully!" })
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus({ type: "error", message: "Failed to upload image. Please try again." })
    }
  }

  if (!isOpen) return null

  const handleColorSelect = (color: string) => {
    const newBackground = {
      type: "color" as const,
      value: color,
    }
    console.log("BackgroundModal - Applying color:", newBackground)
    onBackgroundChange(newBackground)
  }

  const handleGradientSelect = (gradient: string) => {
    const newBackground = {
      type: "gradient" as const,
      value: gradient,
    }
    console.log("BackgroundModal - Applying gradient:", newBackground)
    onBackgroundChange(newBackground)
  }

  const handleImageApply = () => {
    if (imageUrl.trim()) {
      const newBackground = {
        type: "image" as const,
        value: imageUrl.trim(),
        imageFit,
        overlayOpacity,
      }
      console.log("BackgroundModal - Applying image:", newBackground)
      onBackgroundChange(newBackground)
    }
  }

  // Auto-apply image changes when settings change
  const handleImageFitChange = (newFit: "cover" | "contain") => {
    setImageFit(newFit)
    if (imageUrl.trim()) {
      const newBackground = {
        type: "image" as const,
        value: imageUrl.trim(),
        imageFit: newFit,
        overlayOpacity,
      }
      console.log("BackgroundModal - Auto-applying image fit change:", newBackground)
      onBackgroundChange(newBackground)
    }
  }

  const handleOverlayOpacityChange = (newOpacity: number) => {
    setOverlayOpacity(newOpacity)
    if (imageUrl.trim()) {
      const newBackground = {
        type: "image" as const,
        value: imageUrl.trim(),
        imageFit,
        overlayOpacity: newOpacity,
      }
      console.log("BackgroundModal - Auto-applying opacity change:", newBackground)
      onBackgroundChange(newBackground)
    }
  }

  const handleTransparent = () => {
    const newBackground = {
      type: "color" as const,
      value: "transparent",
    }
    console.log("BackgroundModal - Applying transparent:", newBackground)
    onBackgroundChange(newBackground)
  }

  const handleReset = () => {
    const newBackground = {
      type: "color" as const,
      value: "#FFFFFF",
    }
    console.log("BackgroundModal - Resetting to white:", newBackground)
    onBackgroundChange(newBackground)
  }

  // Create preview style for image with overlay
  const getImagePreviewStyle = () => {
    if (!imageUrl) return {}

    const baseStyle: React.CSSProperties = {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: imageFit,
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }

    return baseStyle
  }

  const getOverlayStyle = (): React.CSSProperties => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
    pointerEvents: "none",
  })

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Background</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Tab Navigation */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("solid")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "solid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Solid
            </button>
            <button
              onClick={() => setActiveTab("gradient")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "gradient" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Gradient
            </button>
            <button
              onClick={() => setActiveTab("image")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "image" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Image
            </button>
          </div>

          {/* Solid Colors Tab */}
          {activeTab === "solid" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Preset Colors</h3>
                <div className="space-y-2">
                  {PRESET_COLORS.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-2">
                      {row.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          className="w-8 h-8 rounded-md border-2 border-slate-200 hover:border-slate-400 transition-colors relative group"
                          style={{ backgroundColor: color }}
                          title={color}
                        >
                          {currentBackground.value === color && currentBackground.type === "color" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Custom Color</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-12 h-10 border border-slate-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#3B82F6"
                  />
                  <button
                    onClick={() => handleColorSelect(customColor)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleTransparent}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Transparent
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Gradient Tab */}
          {activeTab === "gradient" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Preset Gradients</h3>
                <div className="grid grid-cols-2 gap-3">
                  {GRADIENT_PRESETS.map((gradient) => (
                    <button
                      key={gradient.name}
                      onClick={() => handleGradientSelect(gradient.value)}
                      className="h-16 rounded-lg border-2 border-slate-200 hover:border-slate-400 transition-colors relative group overflow-hidden"
                      style={{ background: gradient.value }}
                      title={gradient.name}
                    >
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="text-xs font-medium text-white bg-black/50 rounded px-2 py-1 truncate">
                          {gradient.name}
                        </div>
                      </div>
                      {currentBackground.value === gradient.value && currentBackground.type === "gradient" && (
                        <div className="absolute top-1 right-1">
                          <div className="w-3 h-3 bg-white rounded-full shadow-sm border border-slate-300"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Image Tab */}
          {activeTab === "image" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Upload Image</label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploadStatus && (
                    <div
                      className={`text-sm ${uploadStatus.type === "error" ? "text-red-600" : uploadStatus.type === "success" ? "text-green-600" : "text-blue-600"}`}
                    >
                      {uploadStatus.message}
                    </div>
                  )}
                  {imageUrl && (
                    <div className="space-y-2">
                      <div className="text-sm text-slate-600">Preview:</div>
                      <div
                        className="w-full h-24 bg-slate-100 rounded-md overflow-hidden relative"
                        style={getImagePreviewStyle()}
                      >
                        {overlayOpacity > 0 && <div style={getOverlayStyle()} />}
                        {!imageUrl && (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">No image</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Image Fit</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleImageFitChange("cover")}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      imageFit === "cover"
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    Cover
                  </button>
                  <button
                    onClick={() => handleImageFitChange("contain")}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      imageFit === "contain"
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    Contain
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Overlay Opacity: {Math.round(overlayOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={overlayOpacity}
                  onChange={(e) => handleOverlayOpacityChange(Number.parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <style jsx>{`
                  .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #3B82F6;
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  }
                  .slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #3B82F6;
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  }
                `}</style>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium mb-1">Image Tips:</p>
                    <ul className="space-y-1">
                      <li>• Use high-resolution images (1920x1080 or higher)</li>
                      <li>• Cover fills the entire slide, Contain shows the full image</li>
                      <li>• Overlay adds a dark layer for better text readability</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BackgroundModal
