"use client"

import type React from "react"
import { useState } from "react"
import type {
  TextElementProps,
  ImageElementProps,
  ChartElementProps,
  ShapeElementProps,
  TableElementProps,
  VideoElementProps,
  DividerElementProps,
  ButtonElementProps,
  CodeElementProps,
  TextSemanticType,
  CalloutType,
  BarChartData,
  LineChartData,
  PieChartData,
  TableData,
  Slide,
  SlideBackground,
} from "@/types"
import { PREDEFINED_GRADIENTS } from "@/constants"
import type { SlideElement } from "@/types"
import {
  Trash2,
  Lock,
  Unlock,
  Palette,
  Type,
  ImageIcon,
  BarChart3,
  Square,
  Table,
  Video,
  Minus,
  MousePointer,
  Code2,
  Loader2,
} from "lucide-react"
import DeleteConfirmationModal from "@/components/ui/delete-confirmation-modal"
import { presentationService } from "@/services/presentationService"

interface PropertyInspectorPanelProps {
  currentSlide: Slide | undefined | null
  selectedElement: SlideElement | undefined | null
  onElementChange: (updatedElement: SlideElement) => void
  onSlideUpdate: (updatedSlide: Slide) => void
  onDeleteElement: (slideId: string, elementId: string) => void
}

const PropertyInspectorPanel: React.FC<PropertyInspectorPanelProps> = ({
  currentSlide,
  selectedElement,
  onElementChange,
  onSlideUpdate,
  onDeleteElement,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handlePropertyChange = <T extends SlideElement>(currentElement: T, propsToUpdate: Partial<T>) => {
    onElementChange({ ...currentElement, ...propsToUpdate })
  }

  const handleSlideBackgroundChange = (propsToUpdate: Partial<SlideBackground>) => {
    if (currentSlide) {
      onSlideUpdate({
        ...currentSlide,
        background: {
          ...currentSlide.background,
          ...propsToUpdate,
        },
      })
    }
  }

  const handleDeleteElement = () => {
    if (currentSlide && selectedElement) {
      onDeleteElement(currentSlide.id, selectedElement.id)
    }
  }

  const handleImageUpload = async (file: File, element: ImageElementProps) => {
    setIsUploadingImage(true)
    setUploadError(null)

    try {
      const uploadedUrl = await presentationService.uploadImage(file)
      handlePropertyChange(element, { src: uploadedUrl })
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Helper function to get default styles for text semantic types
  const getSemanticTypeStyles = (semanticType: TextSemanticType) => {
    switch (semanticType) {
      case "title":
        return {
          fontSize: 48,
          fontWeight: "bold",
          lineHeight: 1.2,
          letterSpacing: -0.5,
        }
      case "heading1":
        return {
          fontSize: 36,
          fontWeight: "bold",
          lineHeight: 1.3,
          letterSpacing: -0.3,
        }
      case "heading2":
        return {
          fontSize: 28,
          fontWeight: "bold",
          lineHeight: 1.4,
          letterSpacing: -0.2,
        }
      case "heading3":
        return {
          fontSize: 24,
          fontWeight: "semibold",
          lineHeight: 1.4,
          letterSpacing: -0.1,
        }
      case "heading4":
        return {
          fontSize: 20,
          fontWeight: "semibold",
          lineHeight: 1.5,
          letterSpacing: 0,
        }
      case "quote":
        return {
          fontSize: 18,
          fontWeight: "normal",
          lineHeight: 1.6,
          letterSpacing: 0,
          fontStyle: "italic",
        }
      case "paragraph":
      default:
        return {
          fontSize: 16,
          fontWeight: "normal",
          lineHeight: 1.5,
          letterSpacing: 0,
        }
    }
  }

  // Helper function to get default styles for callout types
  const getCalloutTypeStyles = (calloutType: CalloutType) => {
    switch (calloutType) {
      case "note":
        return {
          backgroundColor: "#f1f5f9", // slate-100
          color: "#334155", // slate-700
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 16,
          paddingRight: 16,
        }
      case "info":
        return {
          backgroundColor: "#dbeafe", // blue-100
          color: "#1e40af", // blue-800
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 16,
          paddingRight: 16,
        }
      case "tip":
        return {
          backgroundColor: "#dcfce7", // green-100
          color: "#166534", // green-800
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 16,
          paddingRight: 16,
        }
      case "warning":
        return {
          backgroundColor: "#fef3c7", // yellow-100
          color: "#92400e", // yellow-800
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 16,
          paddingRight: 16,
        }
      case "success":
        return {
          backgroundColor: "#d1fae5", // emerald-100
          color: "#065f46", // emerald-800
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 16,
          paddingRight: 16,
        }
      default:
        return {}
    }
  }

  const renderCommonProperties = (element: SlideElement) => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Opacity</label>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={element.opacity !== undefined ? element.opacity : 1}
            onChange={(e) => handlePropertyChange(element, { opacity: Number.parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            disabled={element.locked}
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0%</span>
            <span className="font-medium text-slate-700">
              {((element.opacity !== undefined ? element.opacity : 1) * 100).toFixed(0)}%
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  )

  const TEXT_SEMANTIC_TYPES: TextSemanticType[] = [
    "paragraph",
    "title",
    "heading1",
    "heading2",
    "heading3",
    "heading4",
    "quote",
  ]
  const CALLOUT_TYPES: CalloutType[] = ["note", "info", "tip", "warning", "success"]

  const renderTextProperties = (element: TextElementProps) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Text Type</label>
          <select
            value={element.semanticType || "paragraph"}
            onChange={(e) => {
              const newSemanticType = e.target.value as TextSemanticType
              const semanticStyles = getSemanticTypeStyles(newSemanticType)

              // Apply semantic type with corresponding styles
              handlePropertyChange(element, {
                semanticType: newSemanticType,
                ...semanticStyles,
              })
            }}
            className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 capitalize"
            disabled={element.locked}
          >
            {TEXT_SEMANTIC_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Callout Style</label>
          <select
            value={element.calloutType || ""}
            onChange={(e) => {
              const newCalloutType = (e.target.value as CalloutType) || undefined
              const calloutStyles = newCalloutType
                ? getCalloutTypeStyles(newCalloutType)
                : {
                    backgroundColor: undefined,
                    paddingTop: 4,
                    paddingBottom: 4,
                    paddingLeft: 4,
                    paddingRight: 4,
                  }

              // Apply callout type with corresponding styles
              handlePropertyChange(element, {
                calloutType: newCalloutType,
                ...calloutStyles,
              })
            }}
            className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 capitalize"
            disabled={element.locked}
          >
            <option value="">None</option>
            {CALLOUT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Content</label>
        <textarea
          value={element.content.replace(/<br\s*\/?>/gi, "\n")}
          onChange={(e) => {
            handlePropertyChange(element, { content: e.target.value.replace(/\n/g, "<br>") })
          }}
          rows={3}
          className="w-full p-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 resize-none"
          disabled={element.locked}
          placeholder="Enter your text content..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Font Size (px)</label>
          <input
            type="number"
            value={element.fontSize || 16}
            onChange={(e) => handlePropertyChange(element, { fontSize: Number.parseInt(e.target.value) || 16 })}
            className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
            disabled={element.locked}
            min="8"
            max="72"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Line Height</label>
          <input
            type="number"
            step="0.1"
            value={element.lineHeight || 1.5}
            onChange={(e) => handlePropertyChange(element, { lineHeight: Number.parseFloat(e.target.value) || 1.5 })}
            className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
            disabled={element.locked}
            min="1"
            max="3"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Font Family</label>
        <input
          type="text"
          placeholder="e.g., Arial, Inter, sans-serif"
          value={element.fontFamily || ""}
          onChange={(e) => handlePropertyChange(element, { fontFamily: e.target.value })}
          className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
          disabled={element.locked}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Text Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={element.color || "#FFFFFF"}
              onChange={(e) => handlePropertyChange(element, { color: e.target.value })}
              className="w-8 h-8 border border-slate-300 rounded cursor-pointer flex-shrink-0"
              disabled={element.locked}
            />
            <input
              type="text"
              value={element.color || "#FFFFFF"}
              onChange={(e) => handlePropertyChange(element, { color: e.target.value })}
              className="flex-1 p-2 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-700 min-w-0"
              disabled={element.locked}
              placeholder="#FFFFFF"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Background</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={element.backgroundColor || "#00000000"}
              onChange={(e) => handlePropertyChange(element, { backgroundColor: e.target.value })}
              className="w-8 h-8 border border-slate-300 rounded cursor-pointer flex-shrink-0"
              disabled={element.locked}
            />
            <input
              type="text"
              value={element.backgroundColor || "#00000000"}
              onChange={(e) => handlePropertyChange(element, { backgroundColor: e.target.value })}
              className="flex-1 p-2 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-700 min-w-0"
              disabled={element.locked}
              placeholder="Transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Letter Spacing (px)</label>
        <input
          type="number"
          step="0.1"
          value={element.letterSpacing || 0}
          onChange={(e) => handlePropertyChange(element, { letterSpacing: Number.parseFloat(e.target.value) })}
          className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
          disabled={element.locked}
          min="-2"
          max="5"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Text Shadow</label>
        <input
          type="text"
          placeholder="e.g., 1px 1px 2px #000000"
          value={element.textShadow || ""}
          onChange={(e) => handlePropertyChange(element, { textShadow: e.target.value })}
          className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
          disabled={element.locked}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Hyperlink URL</label>
        <input
          type="url"
          placeholder="https://example.com"
          value={element.hyperlink || ""}
          onChange={(e) => handlePropertyChange(element, { hyperlink: e.target.value })}
          className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
          disabled={element.locked}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Padding (px)</label>
        <div className="grid grid-cols-2 gap-2">
          {(["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"] as const).map((side) => (
            <div key={side}>
              <label className="block text-xs text-slate-500 mb-1 capitalize">{side.replace("padding", "")}</label>
              <input
                type="number"
                value={element[side] !== undefined ? element[side] : 4}
                onChange={(e) => handlePropertyChange(element, { [side]: Number.parseInt(e.target.value) || 0 })}
                className="w-full p-1.5 text-sm bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-700"
                disabled={element.locked}
                min="0"
                max="50"
              />
            </div>
          ))}
        </div>
      </div>

      {renderCommonProperties(element)}
    </div>
  )

  const renderImageProperties = (element: ImageElementProps) => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Image URL</label>
        <input
          type="text"
          value={element.src}
          onChange={(e) => handlePropertyChange(element, { src: e.target.value })}
          className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
          disabled={element.locked}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Upload Image</label>
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleImageUpload(file, element)
              }
            }}
            disabled={element.locked || isUploadingImage}
            className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {isUploadingImage && (
            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-sm text-blue-700">Uploading image...</span>
            </div>
          )}

          {uploadError && (
            <div className="p-2 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">{uploadError}</p>
              <button onClick={() => setUploadError(null)} className="text-xs text-red-600 hover:text-red-800 mt-1">
                Dismiss
              </button>
            </div>
          )}

          <p className="text-xs text-slate-500">Upload an image file (JPG, PNG, GIF, etc.) to use in your slide</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Alt Text</label>
        <input
          type="text"
          value={element.alt || ""}
          onChange={(e) => handlePropertyChange(element, { alt: e.target.value })}
          className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
          disabled={element.locked}
          placeholder="Describe the image..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Object Fit</label>
        <select
          value={element.objectFit || "contain"}
          onChange={(e) =>
            handlePropertyChange(element, {
              objectFit: e.target.value as "contain" | "cover" | "fill" | "none" | "scale-down",
            })
          }
          disabled={element.locked}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="contain">Contain (fit entire image)</option>
          <option value="cover">Cover (fill container, may crop)</option>
          <option value="fill">Fill (stretch to fit)</option>
          <option value="none">None (original size)</option>
          <option value="scale-down">Scale Down</option>
        </select>
        <p className="text-xs text-gray-500">How the image should fit within its container</p>
      </div>

      <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
        <input
          type="checkbox"
          id={`aspectLock-${element.id}`}
          checked={!!element.aspectRatioLocked}
          onChange={(e) => handlePropertyChange(element, { aspectRatioLocked: e.target.checked })}
          className="h-4 w-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500"
          disabled={element.locked || !element.aspectRatio}
        />
        <label htmlFor={`aspectLock-${element.id}`} className="text-sm text-slate-700">
          Lock Aspect Ratio {element.aspectRatio ? `(${(element.aspectRatio).toFixed(2)})` : "(N/A)"}
        </label>
      </div>
      {renderCommonProperties(element)}
    </div>
  )

  const renderChartProperties = (chartElement: ChartElementProps) => {
    const chartProps = chartElement.chartProperties

    const handleChartPropertyChange = (propName: keyof typeof chartProps, value: any) => {
      const newChartProps = { ...chartProps, [propName]: value }
      handlePropertyChange(chartElement, { chartProperties: newChartProps })
    }

    const handleNestedDataChange = (path: (string | number)[], value: any) => {
      const newChartProps = JSON.parse(JSON.stringify(chartProps))
      let currentLevel: any = newChartProps

      for (let i = 0; i < path.length - 1; i++) {
        if (currentLevel[path[i]] === undefined && typeof path[i + 1] === "number") {
          currentLevel[path[i]] = []
        } else if (currentLevel[path[i]] === undefined) {
          currentLevel[path[i]] = {}
        }
        currentLevel = currentLevel[path[i]]
      }
      currentLevel[path[path.length - 1]] = value
      handlePropertyChange(chartElement, { chartProperties: newChartProps })
    }

    return (
      <div className="space-y-4">
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium text-slate-700">
            Chart Type: <span className="text-blue-600">{chartProps.type}</span>
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Chart Title</label>
          <input
            type="text"
            value={chartProps.title || ""}
            onChange={(e) => handleChartPropertyChange("title", e.target.value)}
            className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
            disabled={chartElement.locked}
            placeholder="Enter chart title..."
          />
        </div>

        <div className="p-3 bg-slate-50 rounded-lg max-h-60 overflow-y-auto custom-scrollbar">
          <h5 className="text-xs font-semibold text-slate-600 mb-3 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Data Points
          </h5>
          {chartProps.type === "barChart" &&
            Array.isArray((chartProps as BarChartData).data) &&
            (chartProps as BarChartData).data.map((item, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-2 mb-3 p-2 border border-slate-200 rounded-lg bg-white">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Label {idx + 1}</label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleNestedDataChange(["data", idx, "label"], e.target.value)}
                    className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded text-slate-700"
                    disabled={chartElement.locked}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Value {idx + 1}</label>
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) =>
                      handleNestedDataChange(["data", idx, "value"], Number.parseFloat(e.target.value) || 0)
                    }
                    className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded text-slate-700"
                    disabled={chartElement.locked}
                  />
                </div>
              </div>
            ))}
          {chartProps.type === "lineChart" &&
            Array.isArray((chartProps as LineChartData).series) &&
            (chartProps as LineChartData).series.map((seriesItem, sIdx) => (
              <div key={sIdx} className="mb-3 p-2 border border-slate-200 rounded-lg bg-white">
                <label className="block text-xs text-slate-500 mb-1">Series {sIdx + 1} Name</label>
                <input
                  type="text"
                  value={seriesItem.name || ""}
                  onChange={(e) => handleNestedDataChange(["series", sIdx, "name"], e.target.value)}
                  className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded text-slate-700 mb-2"
                  disabled={chartElement.locked}
                />
                {Array.isArray(seriesItem.data) &&
                  seriesItem.data.map((point, pIdx) => (
                    <div key={pIdx} className="grid grid-cols-2 gap-2 mb-1">
                      <div>
                        <label className="block text-xs text-slate-400 mb-0.5">Pt. {pIdx + 1} Label</label>
                        <input
                          type="text"
                          value={point.label}
                          onChange={(e) =>
                            handleNestedDataChange(["series", sIdx, "data", pIdx, "label"], e.target.value)
                          }
                          className="w-full p-1 text-xs bg-white border border-slate-300 rounded text-slate-700"
                          disabled={chartElement.locked}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-0.5">Pt. {pIdx + 1} Value</label>
                        <input
                          type="number"
                          value={point.value}
                          onChange={(e) =>
                            handleNestedDataChange(
                              ["series", sIdx, "data", pIdx, "value"],
                              Number.parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-full p-1 text-xs bg-white border border-slate-300 rounded text-slate-700"
                          disabled={chartElement.locked}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          {chartProps.type === "pieChart" &&
            Array.isArray((chartProps as PieChartData).data) &&
            (chartProps as PieChartData).data.map((item, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-2 mb-3 p-2 border border-slate-200 rounded-lg bg-white">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Label {idx + 1}</label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleNestedDataChange(["data", idx, "label"], e.target.value)}
                    className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded text-slate-700"
                    disabled={chartElement.locked}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Value {idx + 1}</label>
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) =>
                      handleNestedDataChange(["data", idx, "value"], Number.parseFloat(e.target.value) || 0)
                    }
                    className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded text-slate-700"
                    disabled={chartElement.locked}
                  />
                </div>
              </div>
            ))}
          {chartProps.type === "table" && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 mb-1">
                Headers:{" "}
                {Array.isArray((chartProps as TableData).headers) && (chartProps as TableData).headers.length > 0 ? (
                  (chartProps as TableData).headers.join(", ")
                ) : (
                  <span className="text-red-500 italic">None</span>
                )}
              </p>
              <p className="text-xs text-blue-700">
                Rows:{" "}
                {Array.isArray((chartProps as TableData).rows) ? (
                  (chartProps as TableData).rows.length
                ) : (
                  <span className="text-red-500 italic">0</span>
                )}
              </p>
              <p className="text-xs text-blue-600 mt-2 italic">Table editing coming soon</p>
            </div>
          )}
        </div>
        {chartProps.type !== "table" && (
          <p className="text-xs text-slate-500 italic">Data point management coming soon</p>
        )}
        {renderCommonProperties(chartElement)}
      </div>
    )
  }

  const renderShapeProperties = (element: ShapeElementProps) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Fill Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={element.fillColor || "#3B82F6"}
              onChange={(e) => handlePropertyChange(element, { fillColor: e.target.value })}
              className="w-8 h-8 border border-slate-300 rounded cursor-pointer flex-shrink-0"
              disabled={element.locked}
            />
            <input
              type="text"
              value={element.fillColor || "#3B82F6"}
              onChange={(e) => handlePropertyChange(element, { fillColor: e.target.value })}
              className="flex-1 p-2 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-700 min-w-0"
              disabled={element.locked}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Stroke Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={element.strokeColor || "#FFFFFF"}
              onChange={(e) => handlePropertyChange(element, { strokeColor: e.target.value })}
              className="w-8 h-8 border border-slate-300 rounded cursor-pointer flex-shrink-0"
              disabled={element.locked}
            />
            <input
              type="text"
              value={element.strokeColor || "#FFFFFF"}
              onChange={(e) => handlePropertyChange(element, { strokeColor: e.target.value })}
              className="flex-1 p-2 text-xs bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-700 min-w-0"
              disabled={element.locked}
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Stroke Width (px)</label>
        <input
          type="number"
          min="0"
          max="10"
          value={element.strokeWidth || 0}
          onChange={(e) => handlePropertyChange(element, { strokeWidth: Number.parseInt(e.target.value) || 0 })}
          className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
          disabled={element.locked}
        />
      </div>
      {renderCommonProperties(element)}
    </div>
  )

  const renderTableProperties = (element: TableElementProps) => (
    <div className="space-y-4">
      <div className="p-3 bg-slate-50 rounded-lg">
        <p className="text-sm font-medium text-slate-700">
          Table Size: {element.rowCount} rows × {element.colCount} columns
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Cell Padding (px)</label>
        <input
          type="number"
          min="0"
          max="20"
          value={element.cellPadding || 4}
          onChange={(e) => handlePropertyChange(element, { cellPadding: Number.parseInt(e.target.value) || 0 })}
          className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
          disabled={element.locked}
        />
      </div>
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700 italic">Table cell content editing coming soon</p>
      </div>
      {renderCommonProperties(element)}
    </div>
  )

  const renderVideoProperties = (element: VideoElementProps) => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Video URL</label>
        <input
          type="url"
          value={element.src}
          onChange={(e) => handlePropertyChange(element, { src: e.target.value })}
          className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
          disabled={element.locked}
          placeholder="YouTube, Vimeo, or direct video URL"
        />
      </div>
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700">Supports YouTube, Vimeo, and direct video links</p>
      </div>
      {renderCommonProperties(element)}
    </div>
  )

  const renderDividerProperties = (element: DividerElementProps) => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Divider Color</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={element.color || "#6B7280"}
            onChange={(e) => handlePropertyChange(element, { color: e.target.value })}
            className="w-8 h-8 border border-slate-300 rounded cursor-pointer flex-shrink-0"
            disabled={element.locked}
          />
          <input
            type="text"
            value={element.color || "#6B7280"}
            onChange={(e) => handlePropertyChange(element, { color: e.target.value })}
            className="flex-1 p-2 text-sm bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-700 min-w-0"
            disabled={element.locked}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Thickness (px)</label>
        <input
          type="number"
          min="1"
          max="10"
          value={element.thickness || 2}
          onChange={(e) => handlePropertyChange(element, { thickness: Number.parseInt(e.target.value) || 1 })}
          className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
          disabled={element.locked}
        />
      </div>
      {renderCommonProperties(element)}
    </div>
  )

  const renderButtonProperties = (element: ButtonElementProps) => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Button Text</label>
        <input
          type="text"
          value={element.text}
          onChange={(e) => handlePropertyChange(element, { text: e.target.value })}
          className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
          disabled={element.locked}
          placeholder="Enter button text..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Link URL (optional)</label>
        <input
          type="url"
          placeholder="https://example.com"
          value={element.link || ""}
          onChange={(e) => handlePropertyChange(element, { link: e.target.value })}
          className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
          disabled={element.locked}
        />
      </div>
      {renderCommonProperties(element)}
    </div>
  )

  const renderCodeProperties = (element: CodeElementProps) => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Programming Language</label>
        <input
          type="text"
          placeholder="e.g., javascript, python, html"
          value={element.language || ""}
          onChange={(e) => handlePropertyChange(element, { language: e.target.value })}
          className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
          disabled={element.locked}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Code Content</label>
        <textarea
          value={element.codeContent}
          onChange={(e) => handlePropertyChange(element, { codeContent: e.target.value })}
          rows={5}
          className="w-full p-3 text-sm bg-slate-900 border border-slate-300 rounded-lg text-slate-100 font-mono resize-none"
          disabled={element.locked}
          placeholder="Enter your code here..."
        />
      </div>
      {renderCommonProperties(element)}
    </div>
  )

  const renderSlideBackgroundProperties = () => {
    if (!currentSlide) return null
    const { background } = currentSlide

    return (
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Slide Background</h3>
            <p className="text-xs text-slate-500">Customize the slide appearance</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Background Type</label>
            <select
              value={background.type}
              onChange={(e) => handleSlideBackgroundChange({ type: e.target.value as SlideBackground["type"] })}
              className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 capitalize"
            >
              <option value="color">Color / Gradient</option>
              <option value="image">Image</option>
            </select>
          </div>

          {background.type === "color" && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Color Value / Gradient Class</label>
                <input
                  type="text"
                  value={background.value}
                  onChange={(e) => handleSlideBackgroundChange({ value: e.target.value })}
                  placeholder="e.g., #FF0000 or bg-gradient-to-r from-blue-500"
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                />
                <p className="text-xs text-slate-500 mt-1">Enter hex color or Tailwind gradient class</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Predefined Gradients</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleSlideBackgroundChange({ value: e.target.value })
                    }
                  }}
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                >
                  <option value="">Select a gradient...</option>
                  {PREDEFINED_GRADIENTS.map((gradient) => (
                    <option key={gradient.name} value={gradient.value}>
                      {gradient.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {background.type === "image" && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Image URL</label>
                <input
                  type="url"
                  value={background.value}
                  onChange={(e) => handleSlideBackgroundChange({ value: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Image Fit</label>
                <select
                  value={background.imageFit || "cover"}
                  onChange={(e) => handleSlideBackgroundChange({ imageFit: e.target.value as "cover" | "contain" })}
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 capitalize"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Overlay Opacity</label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={background.overlayOpacity !== undefined ? background.overlayOpacity : 0.5}
                    onChange={(e) => handleSlideBackgroundChange({ overlayOpacity: Number.parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>0%</span>
                    <span className="font-medium text-slate-700">
                      {((background.overlayOpacity !== undefined ? background.overlayOpacity : 0.5) * 100).toFixed(0)}%
                    </span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  const getElementIcon = (type: string) => {
    switch (type) {
      case "text":
        return Type
      case "image":
        return ImageIcon
      case "chart":
        return BarChart3
      case "shape":
        return Square
      case "table":
        return Table
      case "video":
        return Video
      case "divider":
        return Minus
      case "button":
        return MousePointer
      case "code":
        return Code2
      default:
        return Type
    }
  }

  if (!selectedElement && currentSlide) {
    return renderSlideBackgroundProperties()
  }

  if (!selectedElement) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
          <MousePointer className="w-8 h-8 text-slate-400" />
        </div>
        <h4 className="text-lg font-semibold text-slate-700 mb-2">No Element Selected</h4>
        <p className="text-sm text-slate-500 leading-relaxed mb-4">
          Select an element on the slide to edit its properties, or customize the slide background above.
        </p>
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">💡 Use "Add New Block" to insert new content elements</p>
        </div>
      </div>
    )
  }

  const ElementIcon = getElementIcon(selectedElement.type)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Element Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <ElementIcon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-slate-800 capitalize truncate">
              {selectedElement.type} Properties
            </h3>
            <p className="text-xs text-slate-500 truncate">ID: {selectedElement.id}</p>
          </div>
        </div>

        {/* Element Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handlePropertyChange(selectedElement, { locked: !selectedElement.locked })}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedElement.locked
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              {selectedElement.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              <span>{selectedElement.locked ? "Locked" : "Unlocked"}</span>
            </button>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={selectedElement.locked}
            className="flex items-center space-x-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 disabled:bg-slate-100 text-red-700 disabled:text-slate-400 rounded-lg transition-colors text-xs font-medium disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Element Properties */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {selectedElement.type === "text" && renderTextProperties(selectedElement as TextElementProps)}
        {selectedElement.type === "image" && renderImageProperties(selectedElement as ImageElementProps)}
        {selectedElement.type === "chart" && renderChartProperties(selectedElement as ChartElementProps)}
        {selectedElement.type === "shape" && renderShapeProperties(selectedElement as ShapeElementProps)}
        {selectedElement.type === "table" && renderTableProperties(selectedElement as TableElementProps)}
        {selectedElement.type === "video" && renderVideoProperties(selectedElement as VideoElementProps)}
        {selectedElement.type === "divider" && renderDividerProperties(selectedElement as DividerElementProps)}
        {selectedElement.type === "button" && renderButtonProperties(selectedElement as ButtonElementProps)}
        {selectedElement.type === "code" && renderCodeProperties(selectedElement as CodeElementProps)}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteElement}
        elementType={selectedElement.type}
        message={`Are you sure you want to delete this ${selectedElement.type} element? This action cannot be undone and will permanently remove the element from your slide.`}
      />
    </div>
  )
}

export default PropertyInspectorPanel
