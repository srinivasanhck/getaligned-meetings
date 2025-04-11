"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Edit, Save, X, Plus, Trash2, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MeetingDetails } from "@/types/meetingDetails"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface DealSummaryTabProps {
  details: MeetingDetails
  onSave?: (updatedDealSummary: any) => void
}

// Helper function to format key names for display
const formatKeyName = (key: string): string => {
  // Handle hyphenated keys like "left-side"
  if (key.includes("-")) {
    return key
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Convert camelCase to Title Case with spaces
  return key
    .replace(/([A-Z])/g, " $1") // Insert a space before all capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
    .trim() // Remove any leading/trailing spaces
}

// Helper function to check if a value is empty
const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === "string") return value.trim() === ""
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === "object") return Object.keys(value).length === 0
  return false
}

// Deep clone function to avoid reference issues
const deepClone = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj))
}

// Helper function to parse complex paths with array indices
const parsePath = (path: string, obj: any): any => {
  const parts = path.split(".")
  let current = obj

  for (const part of parts) {
    // Check if this part contains an array index
    if (part.includes("[") && part.includes("]")) {
      const [arrayName, indexPart] = part.split("[")
      const index = Number.parseInt(indexPart.replace("]", ""), 10)

      if (!current[arrayName]) return undefined
      if (!current[arrayName][index]) return undefined

      current = current[arrayName][index]
    } else {
      if (current[part] === undefined) return undefined
      current = current[part]
    }
  }

  return current
}

// Inside the DealSummaryTab component, add a new state for the active right-side tab
const DealSummaryTab = ({ details, onSave }: DealSummaryTabProps) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const { dealSummary } = details

  // State for edited data
  const [editedLeftSide, setEditedLeftSide] = useState<any>(null)
  const [editedRightSide, setEditedRightSide] = useState<any>(null)

  // State to track which fields are being edited
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({})

  // State to track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // New state to track the active right-side tab
  const [activeRightTab, setActiveRightTab] = useState<string | null>(null)

  const leftPanelRef = useRef<HTMLDivElement>(null)

  // Initialize edited data when dealSummary changes
  useEffect(() => {
    if (dealSummary) {
      if (dealSummary["left-side"]) {
        setEditedLeftSide(deepClone(dealSummary["left-side"]))
      }
      if (dealSummary["right-side"]) {
        setEditedRightSide(deepClone(dealSummary["right-side"]))

        // Set the first key as the active tab by default
        if (dealSummary["right-side"] && typeof dealSummary["right-side"] === "object") {
          const rightSideKeys = Object.keys(dealSummary["right-side"])
          if (rightSideKeys.length > 0) {
            setActiveRightTab(rightSideKeys[0])
          }
        }
      }
    }
  }, [dealSummary])

  // Keep all the existing functions (togglePanel, toggleEditMode, updateValue, etc.)

  // Toggle panel
  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen)
  }

  // Toggle edit mode for a field
  const toggleEditMode = (path: string) => {
    setEditingFields((prev) => ({
      ...prev,
      [path]: !prev[path],
    }))
  }

  // Update a value in the edited data
  const updateValue = (path: string, value: any, isRightSide = false) => {
    const pathParts = path.split(".")
    const targetState = isRightSide ? editedRightSide : editedLeftSide
    const setTargetState = isRightSide ? setEditedRightSide : setEditedLeftSide

    // Create a deep copy to avoid reference issues
    const newState = deepClone(targetState)

    // Navigate to the correct location in the object
    let current = newState
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i]

      // Check if this part is an array index (matches pattern [n])
      const arrayIndexMatch = part.match(/\[(\d+)\]/)

      if (arrayIndexMatch) {
        // Extract the array name and index
        const arrayName = part.split("[")[0]
        const index = Number.parseInt(arrayIndexMatch[1], 10)

        // Make sure the array exists
        if (!current[arrayName]) {
          current[arrayName] = []
        }

        // Make sure the index exists in the array
        if (!current[arrayName][index]) {
          current[arrayName][index] = {}
        }

        current = current[arrayName][index]
      } else {
        // Handle regular object properties
        if (current[part] === undefined) {
          // Initialize missing objects in the path
          current[part] = {}
        }
        current = current[part]
      }
    }

    // Update the value at the final path location
    const lastPart = pathParts[pathParts.length - 1]
    current[lastPart] = value

    // Update state
    setTargetState(newState)
    setHasUnsavedChanges(true)
  }

  // Add an item to an array
  const addArrayItem = (path: string, isRightSide = false) => {
    const targetState = isRightSide ? editedRightSide : editedLeftSide
    const setTargetState = isRightSide ? setEditedRightSide : setEditedLeftSide

    // Create a deep copy to avoid reference issues
    const newState = deepClone(targetState)

    // Parse the path to handle array indices
    let current = newState
    const parts = path.split(".")

    // Navigate to the correct location in the object
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]

      // Check if this part contains an array index
      const arrayIndexMatch = part.match(/\[(\d+)\]/)

      if (arrayIndexMatch) {
        // Extract the array name and index
        const arrayName = part.split("[")[0]
        const index = Number.parseInt(arrayIndexMatch[1], 10)

        // Make sure the array exists
        if (!current[arrayName]) {
          current[arrayName] = []
        }

        // Make sure the index exists in the array
        if (!current[arrayName][index]) {
          current[arrayName][index] = {}
        }

        current = current[arrayName][index]
      } else {
        // Handle regular object properties
        if (current[part] === undefined) {
          // If we're at the last part and it doesn't exist, initialize it as an array
          if (i === parts.length - 1) {
            current[part] = []
          } else {
            current[part] = {}
          }
        }
        current = current[part]
      }
    }

    // At this point, current should be the array we want to modify
    if (Array.isArray(current)) {
      if (current.length > 0) {
        if (typeof current[0] === "string") {
          current.push("")
        } else if (typeof current[0] === "object") {
          // Create a new object with the same structure as the first item
          const newItem = {}
          Object.keys(current[0]).forEach((key) => {
            newItem[key] = typeof current[0][key] === "object" ? deepClone(current[0][key]) : ""
          })
          current.push(newItem)
        }
      } else {
        // If array is empty, add a string by default
        current.push("")
      }
    }

    // Update state
    setTargetState(newState)
    setHasUnsavedChanges(true)
  }

  // Remove an item from an array
  const removeArrayItem = (path: string, index: number, isRightSide = false) => {
    const targetState = isRightSide ? editedRightSide : editedLeftSide
    const setTargetState = isRightSide ? setEditedRightSide : setEditedLeftSide

    // Create a deep copy to avoid reference issues
    const newState = deepClone(targetState)

    // Parse the path to handle array indices
    let current = newState
    const parts = path.split(".")

    // Navigate to the correct location in the object
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]

      // Check if this part contains an array index
      const arrayIndexMatch = part.match(/\[(\d+)\]/)

      if (arrayIndexMatch) {
        // Extract the array name and index
        const arrayName = part.split("[")[0]
        const index = Number.parseInt(arrayIndexMatch[1], 10)

        // If the array or index doesn't exist, we can't proceed
        if (!current[arrayName] || !current[arrayName][index]) {
          console.error(`Path ${path} not found in object`)
          return
        }

        current = current[arrayName][index]
      } else {
        // If the property doesn't exist, we can't proceed
        if (current[part] === undefined) {
          console.error(`Path ${path} not found in object`)
          return
        }
        current = current[part]
      }
    }

    // At this point, current should be the array we want to modify
    if (Array.isArray(current) && index >= 0 && index < current.length) {
      current.splice(index, 1)
    }

    // Update state
    setTargetState(newState)
    setHasUnsavedChanges(true)
  }

  // Save all changes
  const saveAllChanges = () => {
    if (!onSave) return

    // Reconstruct the full dealSummary object with the edited data
    const updatedDealSummary = {
      ...dealSummary,
      "left-side": editedLeftSide,
      "right-side": editedRightSide,
    }

    // Call the onSave callback with the updated data
    onSave(updatedDealSummary)
    setHasUnsavedChanges(false)

    // Exit edit mode for all fields
    setEditingFields({})
  }

  // Generate and download PDF
  const handleDownloadPDF = async () => {
    if (!leftPanelRef.current) return

    try {
      // Create a temporary div to clone the content for better PDF rendering
      const contentDiv = document.createElement("div")
      contentDiv.innerHTML = leftPanelRef.current.innerHTML
      contentDiv.style.padding = "20px"
      contentDiv.style.position = "absolute"
      contentDiv.style.top = "-9999px"
      contentDiv.style.left = "-9999px"
      contentDiv.style.width = "800px" // Fixed width for better PDF layout
      document.body.appendChild(contentDiv)

      // Use html2canvas to capture the content
      const canvas = await html2canvas(contentDiv, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      // Remove the temporary div
      document.body.removeChild(contentDiv)

      // Create PDF
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Calculate dimensions
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Add image to PDF
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

      // If content is longer than one page, add more pages
      let heightLeft = imgHeight
      let position = 0

      while (heightLeft > 297) {
        // A4 height in mm
        position = heightLeft - 297
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, -position, imgWidth, imgHeight)
        heightLeft -= 297
      }

      // Download the PDF
      pdf.save(`deal_summary_${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  // Render an editable string value
  const renderEditableString = (path: string, value: string, isRightSide = false) => {
    const isEditing = editingFields[path]

    if (isEditing) {
      return (
        <div className="flex flex-col space-y-2">
          <textarea
            value={value}
            onChange={(e) => updateValue(path, e.target.value, isRightSide)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm min-h-[60px]"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => toggleEditMode(path)}
              className="p-1 text-gray-500 hover:text-gray-700"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={() => toggleEditMode(path)}
              className="p-1 text-green-500 hover:text-green-700"
              aria-label="Save"
            >
              <Save className="h-4 w-4" />
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="group relative">
        <div className="text-black text-sm">{value}</div>
        <button
          onClick={() => toggleEditMode(path)}
          className="absolute top-0 right-0 p-1 text-gray-600 opacity-0 group-hover:opacity-100 hover:text-primary bg-white rounded-full shadow-sm z-10 transition-opacity"
          aria-label="Edit"
        >
          <Edit className="h-4 w-4" />
        </button>
      </div>
    )
  }

  // Render an editable array of strings
  const renderEditableStringArray = (path: string, values: string[], isRightSide = false) => {
    const isEditing = editingFields[path]

    if (isEditing) {
      return (
        <div className="flex flex-col space-y-2">
          {values.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newValues = [...values]
                  newValues[index] = e.target.value
                  updateValue(path, newValues, isRightSide)
                }}
                className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={() => removeArrayItem(path, index, isRightSide)}
                className="p-1 text-red-500 hover:text-red-700"
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex justify-between">
            <button
              onClick={() => addArrayItem(path, isRightSide)}
              className="flex items-center text-sm text-blue-500 hover:text-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" /> Add item
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleEditMode(path)}
                className="p-1 text-gray-500 hover:text-gray-700"
                aria-label="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={() => toggleEditMode(path)}
                className="p-1 text-green-500 hover:text-green-700"
                aria-label="Save"
              >
                <Save className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="group relative">
        <ul className="space-y-3 pl-0">
          {values.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2 mt-1.5 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-black"></span>
              <span className="text-black text-sm">{item}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => toggleEditMode(path)}
          className="absolute top-0 right-0 p-1 text-gray-600 opacity-0 group-hover:opacity-100 hover:text-primary bg-white rounded-full shadow-sm z-10 transition-opacity"
          aria-label="Edit"
        >
          <Edit className="h-4 w-4" />
        </button>
      </div>
    )
  }

  // Function to render a value based on its type
  const renderValue = (
    key: string,
    value: any,
    level = 0,
    isRightSide = false,
    parentPath = "",
    skipHeading = false,
  ): React.ReactNode => {
    // Skip empty values
    if (isEmpty(value)) return null

    // Create the current path
    const currentPath = parentPath ? `${parentPath}.${key}` : key

    // Format the key name for display
    const formattedKey = formatKeyName(key)

    // Determine heading level based on nesting
    const HeadingTag = level === 0 ? "h2" : level === 1 ? "h3" : "h4"
    const headingClasses =
      level === 0
        ? "text-[16px] font-semibold text-black mb-4" // Increased from mb-2 to mb-4
        : level === 1
          ? "text-base font-medium text-black mb-3" // Increased from mb-2 to mb-3
          : "text-sm font-medium text-black mb-2" // Increased from mb-1 to mb-2

    // Handle different value types
    if (typeof value === "string") {
      return (
        <div key={key} className="mb-6">
          {!skipHeading && <HeadingTag className={headingClasses}>{formattedKey}</HeadingTag>}
          <div className="pl-0">{renderEditableString(currentPath, value, isRightSide)}</div>
        </div>
      )
    } else if (Array.isArray(value)) {
      // Handle arrays
      if (value.length === 0) return null

      // Check if it's an array of strings or objects
      if (typeof value[0] === "string") {
        return (
          <div key={key} className="mb-6">
            {!skipHeading && <HeadingTag className={headingClasses}>{formattedKey}</HeadingTag>}
            <div className="pl-0">{renderEditableStringArray(currentPath, value, isRightSide)}</div>
          </div>
        )
      } else if (typeof value[0] === "object") {
        // Array of objects
        return (
          <div key={key} className="mb-6">
            {!skipHeading && <HeadingTag className={headingClasses}>{formattedKey}</HeadingTag>}
            <div className="pl-0">
              <div className="space-y-4">
                {value.map((item, index) => (
                  <div key={index} className="pb-2 last:pb-0">
                    {Object.entries(item).map(([subKey, subValue]) => {
                      if (isEmpty(subValue)) return null

                      // Create a path for this nested item
                      const subPath = Array.isArray(value)
                        ? `${currentPath}[${index}].${subKey}`
                        : `${currentPath}.${index}.${subKey}`

                      if (typeof subValue === "string") {
                        return (
                          <div key={subKey} className="mb-2">
                            <div className="text-sm font-semibold text-black">{formatKeyName(subKey)}</div>
                            <div className="pl-0">{renderEditableString(subPath, subValue as string, isRightSide)}</div>
                          </div>
                        )
                      } else if (Array.isArray(subValue)) {
                        return (
                          <div key={subKey} className="mb-3">
                            <div className="text-sm font-semibold text-black mb-1">{formatKeyName(subKey)}</div>
                            {typeof subValue[0] === "string" ? (
                              <div className="pl-0">
                                {renderEditableStringArray(subPath, subValue as string[], isRightSide)}
                              </div>
                            ) : (
                              <ul className="pl-0 space-y-1">
                                {subValue.map((subItem, subIndex) => (
                                  <li key={subIndex} className="flex items-start">
                                    <span className="mr-2 mt-1.5 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-black"></span>
                                    <span className="text-sm text-black">
                                      {typeof subItem === "object" ? JSON.stringify(subItem) : String(subItem)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )
                      } else if (typeof subValue === "object" && subValue !== null) {
                        // For nested objects
                        return (
                          <div key={subKey} className="mb-3">
                            <div className="text-sm font-semibold text-black mb-1">{formatKeyName(subKey)}</div>
                            <div className="pl-0">
                              {Object.entries(subValue).map(([nestedKey, nestedValue]) => (
                                <div key={nestedKey} className="mb-2">
                                  <div className="text-sm font-semibold text-black">{formatKeyName(nestedKey)}</div>
                                  <div className="text-sm text-black">
                                    {typeof nestedValue === "object"
                                      ? JSON.stringify(nestedValue)
                                      : String(nestedValue)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      } else {
                        return (
                          <div key={subKey} className="mb-2">
                            <div className="text-sm font-semibold text-black">{formatKeyName(subKey)}</div>
                            <div className="text-sm text-black">{String(subValue)}</div>
                          </div>
                        )
                      }
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }
    } else if (typeof value === "object" && value !== null) {
      // Handle objects
      return (
        <div key={key} className="mb-6">
          {!skipHeading && <HeadingTag className={headingClasses}>{formattedKey}</HeadingTag>}
          <div className="pl-0">
            {Object.entries(value).map(([subKey, subValue]) => {
              if (isEmpty(subValue)) return null

              const subPath = `${currentPath}.${subKey}`

              // If subValue is a string or a primitive
              if (typeof subValue === "string" || typeof subValue === "number" || typeof subValue === "boolean") {
                return (
                  <div key={subKey} className="mb-4">
                    <div className="text-sm font-semibold text-black mb-2">{formatKeyName(subKey)}</div>
                    <div className="pl-0">{renderEditableString(subPath, String(subValue), isRightSide)}</div>
                  </div>
                )
              }

              // If it's an array
              if (Array.isArray(subValue)) {
                return (
                  <div key={subKey} className="mb-4">
                    <div className="text-sm font-semibold text-black mb-2">{formatKeyName(subKey)}</div>
                    <div className="pl-0">
                      {typeof subValue[0] === "string" ? (
                        renderEditableStringArray(subPath, subValue as string[], isRightSide)
                      ) : (
                        <div className="space-y-2">
                          {subValue.map((item, idx) => (
                            <div key={idx} className="pl-0">
                              {typeof item === "object" ? (
                                Object.entries(item).map(([itemKey, itemValue]) => (
                                  <div key={itemKey} className="mb-1">
                                    <div className="text-sm font-semibold text-black">{formatKeyName(itemKey)}</div>
                                    <div className="text-sm text-black">{String(itemValue)}</div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm text-black">{String(item)}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              // If it's an object
              if (typeof subValue === "object" && subValue !== null) {
                return (
                  <div key={subKey} className="mb-4">
                    <div className="text-sm font-semibold text-black mb-2">{formatKeyName(subKey)}</div>
                    <div className="pl-0">
                      {Object.entries(subValue).map(([nestedKey, nestedValue]) => (
                        <div key={nestedKey} className="mb-3">
                          <div className="text-sm font-semibold text-black">{formatKeyName(nestedKey)}</div>
                          <div className="pl-0">
                            {typeof nestedValue === "object" && nestedValue !== null
                              ? Array.isArray(nestedValue)
                                ? renderEditableStringArray(
                                    `${subPath}.${nestedKey}`,
                                    nestedValue as string[],
                                    isRightSide,
                                  )
                                : Object.entries(nestedValue).map(([deepKey, deepValue]) => (
                                    <div key={deepKey} className="mb-1">
                                      <div className="text-sm font-semibold text-black">{formatKeyName(deepKey)}</div>
                                      <div className="text-sm text-black">{String(deepValue)}</div>
                                    </div>
                                  ))
                              : renderEditableString(`${subPath}.${nestedKey}`, String(nestedValue), isRightSide)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }

              return null
            })}
          </div>
        </div>
      )
    }

    // Fallback for other types
    return (
      <div key={key} className="mb-6">
        {!skipHeading && <HeadingTag className={headingClasses}>{formattedKey}</HeadingTag>}
        <div className="pl-0 text-black text-sm">{String(value)}</div>
      </div>
    )
  }

  // Get the left and right side data
  const leftSideData = editedLeftSide || dealSummary["left-side"]
  const rightSideData = editedRightSide || dealSummary["right-side"]

  // Get the right side tabs (top-level keys)
  const rightSideTabs = rightSideData && typeof rightSideData === "object" ? Object.keys(rightSideData) : []

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Save button bar */}
      {hasUnsavedChanges && (
        <div className="bg-blue-50 p-2 border-b border-blue-100 flex justify-end">
          <button
            onClick={saveAllChanges}
            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            <Save className="h-4 w-4 mr-1" /> Save Changes
          </button>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main content - left side */}
        <div
          className={cn(
            "h-full overflow-y-auto custom-scrollbar p-6 transition-all duration-300 ease-in-out",
            isPanelOpen ? "w-[58%]" : "w-full",
          )}
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[14px]  text-gray-500">Deal Summary</h2>
            {leftSideData && typeof leftSideData === "object" && Object.keys(leftSideData).length > 0 && (
              <div className="relative group">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center p-2 bg-[#8034CB] text-white rounded-md hover:bg-[#6a2ba9] transition-colors"
                  aria-label="Download PDF"
                >
                  <Download className="h-4 w-4" />
                </button>
                <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Download PDF
                </div>
              </div>
            )}
          </div>
          <div className="space-y-6" ref={leftPanelRef}>
            {leftSideData && typeof leftSideData === "object" ? (
              Object.entries(leftSideData).map(([key, value]) => renderValue(key, value))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No left panel data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel toggle button */}
        <button
          onClick={togglePanel}
          className={cn(
            "absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-100 hover:bg-gray-200 p-2 rounded-l-md shadow-md z-10 transition-all duration-300",
            isPanelOpen ? "translate-x-0" : "translate-x-0",
          )}
          aria-label={isPanelOpen ? "Close right panel" : "Open right panel"}
        >
          {isPanelOpen ? (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          )}
        </button>

        {/* Right panel */}
        <div
          className={cn(
            "h-full border-l border-gray-200 overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out",
            isPanelOpen ? "w-[38%] opacity-100" : "w-0 opacity-0",
          )}
        >
          {/* Right side tabs */}
          {isPanelOpen && rightSideTabs.length > 0 && (
            <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex overflow-x-auto">
                {rightSideTabs.map((tabKey) => (
                  <button
                    key={tabKey}
                    className={cn(
                      "px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                      activeRightTab === tabKey
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                    )}
                    onClick={() => setActiveRightTab(tabKey)}
                  >
                    {formatKeyName(tabKey)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Right side content */}
          <div className="p-6">
            {rightSideData && typeof rightSideData === "object" ? (
              activeRightTab && rightSideData[activeRightTab] ? (
                // Only render the content for the active tab, and skip the heading
                renderValue(activeRightTab, rightSideData[activeRightTab], 0, true, "", true)
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Select a tab to view details</p>
                </div>
              )
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No right panel data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DealSummaryTab
