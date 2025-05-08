"use client"

import type React from "react"
import { useEffect } from "react"
import { useState, useRef } from "react"
import {
  Edit,
  Save,
  X,
  Download,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Link,
  MessageSquarePlus,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react"
import type { MeetingDetails } from "@/types/meetingDetails"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

// Add the import for useToast
import { useToast } from "@/components/ui/toast"
import { isHubspotConnected, getAllHubspotContacts } from "@/services/hubspotService"
import HubspotContactPopup from "@/components/hubspot/HubspotContactPopup"
import { getToken } from "@/services/authService"
import { APIURL } from "@/lib/utils"
import axios from "axios"
import { HubspotIcon } from "@/components/icons/HubspotIcon"
// Add this import at the top with the other imports
import HubspotDealPopup from "@/components/hubspot/HubspotDealPopup"

// Contact Selection Modal Component
interface ContactSelectionModalProps {
  content: string
  onClose: () => void
  contacts: any[]
  isLoading: boolean
  onSubmit: (contactId: string, note: string) => Promise<void>
}

const ContactSelectionModal: React.FC<ContactSelectionModalProps> = ({
  content,
  onClose,
  contacts,
  isLoading,
  onSubmit,
}) => {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [note, setNote] = useState(content)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredContacts = contacts.filter((contact) => {
    const firstName = (contact.properties.firstname || "").toLowerCase()
    const lastName = (contact.properties.lastname || "").toLowerCase()
    const email = (contact.properties.email || "").toLowerCase()
    const company = (contact.properties.company || "").toLowerCase()
    const search = searchTerm.toLowerCase()

    return firstName.includes(search) || lastName.includes(search) || email.includes(search) || company.includes(search)
  })

  const handleSubmit = async () => {
    if (!selectedContactId) return

    try {
      setIsSubmitting(true)
      await onSubmit(selectedContactId, note)
      onClose()
    } catch (error) {
      console.error("Error submitting note:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Add as Hubspot Note</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="mb-4">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Note Content
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm min-h-[100px]"
              placeholder="Enter note content"
            />
          </div>
        </div>

        <div className="p-4 border-b">
          <div className="mb-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Select Contact
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search contacts..."
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No contacts found</div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedContactId === contact.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedContactId(contact.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">
                        {contact.properties.firstname || ""} {contact.properties.lastname || ""}
                        {!contact.properties.firstname && !contact.properties.lastname && "No Name"}
                      </div>
                      <div className="text-sm text-gray-500">{contact.properties.email || "No Email"}</div>
                      {contact.properties.company && (
                        <div className="text-xs text-gray-400 mt-1">{contact.properties.company}</div>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border ${
                        selectedContactId === contact.id ? "border-primary bg-primary" : "border-gray-300"
                      } flex items-center justify-center`}
                    >
                      {selectedContactId === contact.id && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedContactId || isSubmitting}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
              !selectedContactId || isSubmitting ? "bg-primary/50 cursor-not-allowed" : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span> Adding...
              </>
            ) : (
              "Add Note"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

interface DealSummaryTabProps {
  details: MeetingDetails
  onSave?: (updatedDealSummary: any) => void
  showToast?: (message: string, type: "success" | "error" | "info") => void
}

// Helper function to check if a string is already HTML
const isHTML = (str: string): boolean => {
  if (typeof str !== "string") return false
  return /<\/?[a-z][\s\S]*>/i.test(str)
}

// Convert JSON to HTML for initial display
const jsonToHTML = (data: any): string => {
  if (!data) return ""

  let html = ""

  // Process each section in the data
  Object.entries(data).forEach(([key, value]) => {
    // Skip if the key is "content" or the value is empty or meaningless
    if (
      key === "content" ||
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0)
    ) {
      return // Skip this key-value pair
    }

    // Skip generating top-level headers if the key is a tab name or "context"
    const isTopLevelTab =
      key === "dealData" ||
      key === "dealGap" ||
      key === "signal" ||
      key === "Deal Data" ||
      key === "Deal Gap" ||
      key === "Signal" ||
      key === "Content" ||
      key === "Discovery Gap" ||
      key === "Pain" ||
      key === "context" ||
      key.toLowerCase() === "context"

    if (!isTopLevelTab) {
      const formattedKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim()

      html += `<h2>${formattedKey}</h2>`
    }

    if (typeof value === "string") {
      html += isHTML(value as string) ? value : `<p>${value}</p>`
    } else if (Array.isArray(value)) {
      // Only render array if it has items
      if (value.length > 0) {
        html += "<ul class='text-sm'>" // Add text-sm class to ensure consistent text size

        value.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            // Check if object has meaningful properties
            const hasProperties = Object.entries(item).some(
              ([k, v]) =>
                k !== "length" &&
                v !== null &&
                v !== undefined &&
                v !== "" &&
                !(Array.isArray(v) && v.length === 0) &&
                !(typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0),
            )

            if (hasProperties) {
              // Handle array of objects
              html += `<li class="text-sm mb-3 pb-2 border-b border-gray-100">`

              // Process each property in the object
              Object.entries(item).forEach(([objKey, objValue]) => {
                if (objKey !== "length") {
                  // Skip empty values
                  if (
                    objValue === null ||
                    objValue === undefined ||
                    objValue === "" ||
                    (Array.isArray(objValue) && objValue.length === 0) ||
                    (typeof objValue === "object" && !Array.isArray(objValue) && Object.keys(objValue).length === 0)
                  ) {
                    return
                  }

                  // Skip length property
                  const formattedObjKey = objKey
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim()

                  html += `<div class="mb-2"><strong class="text-gray-700">${formattedObjKey}:</strong> `

                  if (typeof objValue === "string") {
                    // If it's HTML content, render it directly, otherwise escape it
                    html += isHTML(objValue as string) ? objValue : `<span class="text-gray-600">${objValue}</span>`
                  } else if (Array.isArray(objValue) && objValue.length > 0) {
                    html += `<ul class="pl-4 mt-1">`
                    objValue.forEach((subItem) => {
                      if (subItem !== null && subItem !== undefined && subItem !== "") {
                        html += `<li class="text-sm text-gray-600">${subItem}</li>`
                      }
                    })
                    html += `</ul>`
                  } else if (objValue !== null && typeof objValue === "object" && Object.keys(objValue).length > 0) {
                    // For nested objects, format them as a list of properties
                    html += `<div class="pl-4 mt-1">`
                    Object.entries(objValue).forEach(([nestedKey, nestedValue]) => {
                      if (nestedValue !== null && nestedValue !== undefined && nestedValue !== "") {
                        const formattedNestedKey = nestedKey
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())
                          .trim()
                        html += `<div class="text-sm"><em class="text-gray-500">${formattedNestedKey}:</em> <span class="text-gray-600">${nestedValue}</span></div>`
                      }
                    })
                    html += `</div>`
                  } else {
                    html += `<span class="text-gray-600">${objValue}</span>`
                  }

                  html += `</div>`
                }
              })

              html += `</li>`
            }
          } else if (item !== null && item !== undefined && item !== "") {
            // Handle primitive values in arrays
            html += `<li class="text-sm">${item}</li>`
          }
        })

        html += "</ul>"
      }
    } else if (typeof value === "object" && value !== null) {
      // Check if this is a nested object with meaningful properties
      const hasNestedProperties = Object.entries(value).some(
        ([k, v]) =>
          v !== null &&
          v !== undefined &&
          v !== "" &&
          !(Array.isArray(v) && v.length === 0) &&
          !(typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0),
      )

      if (hasNestedProperties) {
        // Process object properties
        Object.entries(value).forEach(([subKey, subValue]) => {
          // Skip empty values
          if (
            subValue === null ||
            subValue === undefined ||
            subValue === "" ||
            (Array.isArray(subValue) && subValue.length === 0) ||
            (typeof subValue === "object" && !Array.isArray(subValue) && Object.keys(subValue).length === 0)
          ) {
            return
          }

          const formattedSubKey = subKey
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim()

          // Skip generating headers for tab names
          const isTabName =
            formattedSubKey === "Deal Data" ||
            formattedSubKey === "Deal Gap" ||
            formattedSubKey === "Signal" ||
            subKey === "dealData" ||
            subKey === "dealGap" ||
            subKey === "signal"

          if (!isTabName) {
            html += `<h3>${formattedSubKey}</h3>`
          }

          if (typeof subValue === "string") {
            html += isHTML(subValue as string) ? subValue : `<p class="text-sm">${subValue}</p>`
          } else if (Array.isArray(subValue) && subValue.length > 0) {
            html += "<ul class='text-sm'>" // Add text-sm class to ensure consistent text size

            subValue.forEach((item) => {
              if (typeof item === "object" && item !== null) {
                // Check if object has meaningful properties
                const hasProperties = Object.entries(item).some(
                  ([k, v]) =>
                    k !== "length" &&
                    v !== null &&
                    v !== undefined &&
                    v !== "" &&
                    !(Array.isArray(v) && v.length === 0) &&
                    !(typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0),
                )

                if (hasProperties) {
                  // Handle array of objects
                  html += `<li class="text-sm mb-3 pb-2 border-b border-gray-100">`

                  // Process each property in the object
                  Object.entries(item).forEach(([objKey, objValue]) => {
                    if (objKey !== "length") {
                      // Skip empty values
                      if (
                        objValue === null ||
                        objValue === undefined ||
                        objValue === "" ||
                        (Array.isArray(objValue) && objValue.length === 0) ||
                        (typeof objValue === "object" && !Array.isArray(objValue) && Object.keys(objValue).length === 0)
                      ) {
                        return
                      }

                      // Skip length property
                      const formattedObjKey = objKey
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())
                        .trim()

                      html += `<div class="mb-2"><strong class="text-gray-700">${formattedObjKey}:</strong> `

                      if (typeof objValue === "string") {
                        // If it's HTML content, render it directly, otherwise escape it
                        html += isHTML(objValue as string) ? objValue : `<span class="text-gray-600">${objValue}</span>`
                      } else if (Array.isArray(objValue) && objValue.length > 0) {
                        html += `<ul class="pl-4 mt-1">`
                        objValue.forEach((subItem) => {
                          if (subItem !== null && subItem !== undefined && subItem !== "") {
                            html += `<li class="text-sm text-gray-600">${subItem}</li>`
                          }
                        })
                        html += `</ul>`
                      } else if (
                        objValue !== null &&
                        typeof objValue === "object" &&
                        Object.keys(objValue).length > 0
                      ) {
                        // For nested objects, format them as a list of properties
                        html += `<div class="pl-4 mt-1">`
                        Object.entries(objValue).forEach(([nestedKey, nestedValue]) => {
                          if (nestedValue !== null && nestedValue !== undefined && nestedValue !== "") {
                            const formattedNestedKey = nestedKey
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())
                              .trim()
                            html += `<div class="text-sm"><em class="text-gray-500">${formattedNestedKey}:</em> <span class="text-gray-600">${nestedValue}</span></div>`
                          }
                        })
                        html += `</div>`
                      } else {
                        html += `<span class="text-gray-600">${objValue}</span>`
                      }

                      html += `</div>`
                    }
                  })

                  html += `</li>`
                }
              } else if (item !== null && item !== undefined && item !== "") {
                // Handle primitive values in arrays
                html += `<li class="text-sm">${item}</li>`
              }
            })

            html += "</ul>"
          } else if (typeof subValue === "object" && subValue !== null) {
            // Handle nested objects (this is the key part for your discoveryGap object)
            html += "<ul class='text-sm'>"

            Object.entries(subValue).forEach(([nestedKey, nestedValue]) => {
              if (
                nestedValue !== null &&
                nestedValue !== undefined &&
                nestedValue !== "" &&
                !(Array.isArray(nestedValue) && nestedValue.length === 0) &&
                !(
                  typeof nestedValue === "object" &&
                  !Array.isArray(nestedValue) &&
                  Object.keys(nestedValue).length === 0
                )
              ) {
                const formattedNestedKey = nestedKey
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())
                  .trim()

                html += `<li class="text-sm mb-3 pb-2 border-b border-gray-100">
                <div class="mb-2"><strong class="text-gray-700">${formattedNestedKey}:</strong> `

                if (typeof nestedValue === "string") {
                  html += `<span class="text-gray-600">${nestedValue}</span>`
                } else if (Array.isArray(nestedValue) && nestedValue.length > 0) {
                  html += `<ul class="pl-4 mt-1">`
                  nestedValue.forEach((item) => {
                    if (item !== null && item !== undefined && item !== "") {
                      html += `<li class="text-sm text-gray-600">${item}</li>`
                    }
                  })
                  html += `</ul>`
                } else if (typeof nestedValue === "object" && nestedValue !== null) {
                  // Handle deeply nested objects
                  html += `<div class="pl-4 mt-1">`
                  Object.entries(nestedValue).forEach(([deepKey, deepValue]) => {
                    if (deepValue !== null && deepValue !== undefined && deepValue !== "") {
                      const formattedDeepKey = deepKey
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())
                        .trim()
                      html += `<div class="text-sm"><em class="text-gray-500">${formattedDeepKey}:</em> <span class="text-gray-600">${deepValue}</span></div>`
                    }
                  })
                  html += `</div>`
                }

                html += `</div></li>`
              }
            })

            html += "</ul>"
          }
        })
      }
    }
  })

  return html
}

const cleanupHTMLContent = (html: string): string => {
  // Create a temporary DOM element
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = html

  // Fix orphaned list items (li elements outside of ul/ol)
  const fixOrphanedListItems = () => {
    // Find all empty ul elements
    const emptyUls = Array.from(tempDiv.querySelectorAll("ul:empty"))

    // For each empty ul, find the li elements that follow it and move them inside
    emptyUls.forEach((emptyUl) => {
      let nextElement = emptyUl.nextElementSibling
      const lisToMove = []

      // Collect all consecutive li elements that follow this empty ul
      while (nextElement && nextElement.tagName.toLowerCase() === "li") {
        lisToMove.push(nextElement)
        nextElement = nextElement.nextElementSibling
      }

      // Move all collected li elements inside the empty ul
      lisToMove.forEach((li) => {
        emptyUl.appendChild(li.cloneNode(true))
        li.parentNode?.removeChild(li)
      })
    })

    // Also handle any remaining orphaned li elements
    const orphanedListItems = Array.from(tempDiv.querySelectorAll("li")).filter((li) => {
      const parent = li.parentElement
      return parent && parent.tagName.toLowerCase() !== "ul" && parent.tagName.toLowerCase() !== "ol"
    })

    if (orphanedListItems.length > 0) {
      // Create a new ul for these orphaned items
      const newUl = document.createElement("ul")
      newUl.className = "text-sm"

      // Insert the new ul before the first orphaned li
      if (orphanedListItems[0].parentNode) {
        orphanedListItems[0].parentNode.insertBefore(newUl, orphanedListItems[0])
      }

      // Move all orphaned li elements into the new ul
      orphanedListItems.forEach((li) => {
        newUl.appendChild(li.cloneNode(true))
        li.parentNode?.removeChild(li)
      })
    }
  }

  // Process the DOM to clean up any issues
  const processNode = (node: Node) => {
    // Process child nodes first (depth-first)
    Array.from(node.childNodes).forEach((child) => {
      processNode(child)
    })

    // If this is an element node
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement

      // Remove empty paragraphs
      if (element.tagName.toLowerCase() === "p" && element.innerHTML.trim() === "") {
        element.remove()
      }

      // Fix nested block elements
      if (/^(h[1-6]|p|div|ul|ol|li)$/i.test(element.tagName)) {
        const nestedBlocks = element.querySelectorAll("h1, h2, h3, h4, h5, h6, p, div, ul, ol, li")

        if (nestedBlocks.length > 0) {
          // Handle nested blocks by moving them after the current element
          Array.from(nestedBlocks).forEach((nestedBlock) => {
            if (nestedBlock.parentNode === element) {
              element.parentNode?.insertBefore(nestedBlock, element.nextSibling)
            }
          })
        }
      }
    }
  }

  // First fix orphaned list items
  fixOrphanedListItems()

  // Then process other issues
  processNode(tempDiv)

  // Run the orphaned list item fix again to catch any that might have been created during processing
  fixOrphanedListItems()

  return tempDiv.innerHTML
}

// Function to extract objections from HTML content
const extractObjections = (html: string): string[] => {
  if (!html) return []

  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = html

  const extractedObjections: string[] = []

  // Find all h3 elements
  const h3Elements = tempDiv.querySelectorAll("h3")

  // Check each h3 element and its content
  h3Elements.forEach((h3) => {
    const text = h3.textContent?.toLowerCase() || ""
    // Check if the heading contains "objection" or related keywords
    if (text.includes("objection") || text.includes("concern") || text.includes("pushback")) {
      // Get the content following this h3 until the next h3
      let content = ""
      let currentNode = h3.nextSibling

      while (currentNode && currentNode.nodeName !== "H3") {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
          content += (currentNode as HTMLElement).outerHTML
        } else if (currentNode.nodeType === Node.TEXT_NODE) {
          const textContent = currentNode.textContent?.trim()
          if (textContent) content += `<p>${textContent}</p>`
        }
        currentNode = currentNode.nextSibling
      }

      // If there's content, add it to the objections with the heading
      if (content) {
        extractedObjections.push(
          `<div class="objection-item"><h4 class="text-red-600 font-medium">${h3.textContent}</h4>${content}</div>`,
        )
      }
    }
  })

  return extractedObjections
}

const DealSummaryTab = ({ details, onSave, showToast: parentShowToast }: DealSummaryTabProps) => {
  const { dealSummary } = details
  console.log("details", details)

  // Add these state variables inside the DealSummaryTab component
  const [hubspotConnected, setHubspotConnected] = useState<boolean>(false)
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(true)
  const router = useRouter()

  // Add this line inside the component to get the showToast function
  const { showToast } = useToast()

  // State for HTML content of left and right sides
  const [leftSideHTML, setLeftSideHTML] = useState<string>("")
  const [rightSideHTMLMap, setRightSideHTMLMap] = useState<Record<string, string>>({})

  // Add loading state to prevent flicker
  const [isContentLoading, setIsContentLoading] = useState<boolean>(true)

  // State to track if we're in edit mode\
  const [isEditMode, setIsEditMode] = useState(false)

  // State to track the active right-side tab
  const [activeRightTab, setActiveRightTab] = useState<string | null>(null)

  // References for content display and editing
  const leftContentRef = useRef<HTMLDivElement>(null)
  const rightContentRef = useRef<HTMLDivElement>(null)
  const leftEditableRef = useRef<HTMLDivElement>(null)
  const rightEditableRef = useRef<HTMLDivElement>(null)
  const pdfContentRef = useRef<HTMLDivElement>(null)

  const [rightSideKeys, setRightSideKeys] = useState<string[]>([])

  // State for hubspot note functionality
  const [isHubspotSelectMode, setIsHubspotSelectMode] = useState(false)
  const [selectedContent, setSelectedContent] = useState<string | null>(null)
  const [showNotePopup, setShowNotePopup] = useState(false)
  const [showHubspotPopup, setShowHubspotPopup] = useState(false)

  // Add these new state variables
  const [hubspotContacts, setHubspotContacts] = useState<any[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)

  // Add state for menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // Add this state variable with the other state variables (around line 100)
  const [showDealPopup, setShowDealPopup] = useState(false)

  const [objections, setObjections] = useState<string[]>([])
  const [showObjectionsPanel, setShowObjectionsPanel] = useState(true)

  // State for PDF generation
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [pdfPreparationProgress, setPdfPreparationProgress] = useState(0)

  // Initialize content when dealSummary changes
  useEffect(() => {
    if (dealSummary) {
      setIsContentLoading(true)

      // Process left side content
      if (dealSummary["left-side"]) {
        // Check if the left side has a content property (post-editing format)
        if (dealSummary["left-side"].content) {
          setLeftSideHTML(dealSummary["left-side"].content)
        } else {
          // Original format
          const leftHTML = jsonToHTML(dealSummary["left-side"])
          setLeftSideHTML(leftHTML)
        }
      }

      // Process right side content
      if (dealSummary["right-side"] && typeof dealSummary["right-side"] === "object") {
        const rightHTMLMap: Record<string, string> = {}

        // Convert each tab's content to HTML
        Object.entries(dealSummary["right-side"]).forEach(([key, value]) => {
          // Skip the "context" key
          if (key.toLowerCase() === "context") return

          // Check if the value has a content property (post-editing format)
          if (value && typeof value === "object" && "content" in value) {
            rightHTMLMap[key] = value.content as string
          } else {
            // Original format
            rightHTMLMap[key] = jsonToHTML({ [key]: value })
          }
        })

        setRightSideHTMLMap(rightHTMLMap)

        // Set the first key as the active tab by default
        const keys = Object.keys(dealSummary["right-side"]).filter((k) => k.toLowerCase() !== "context")
        setRightSideKeys(keys)
        if (keys.length > 0 && !activeRightTab) {
          setActiveRightTab(keys[0])
        }
      }

      // Set loading to false after a short delay to ensure content is rendered
      setTimeout(() => {
        setIsContentLoading(false)
      }, 100)
    } else {
      setIsContentLoading(false)
    }
  }, [dealSummary, activeRightTab])

  useEffect(() => {
    if (isEditMode && rightEditableRef.current && activeRightTab && rightSideHTMLMap[activeRightTab]) {
      rightEditableRef.current.innerHTML = rightSideHTMLMap[activeRightTab]
    }
  }, [isEditMode, activeRightTab, rightSideHTMLMap])

  // Add this function to fetch contacts
  const fetchHubspotContacts = async () => {
    try {
      setIsLoadingContacts(true)
      const contacts = await getAllHubspotContacts()
      setHubspotContacts(contacts)
    } catch (error) {
      console.error("Error fetching Hubspot contacts:", error)
      showToast("Failed to load Hubspot contacts", "error")
    } finally {
      setIsLoadingContacts(false)
    }
  }

  // Add this useEffect to check HubSpot connection status
  useEffect(() => {
    const checkHubspotConnection = async () => {
      try {
        setIsCheckingConnection(true)
        const connected = await isHubspotConnected()
        setHubspotConnected(connected)

        if (connected) {
          fetchHubspotContacts()
        }
      } catch (error) {
        console.error("Error checking HubSpot connection:", error)
      } finally {
        setIsCheckingConnection(false)
      }
    }

    checkHubspotConnection()
  }, [])

  // Add this function to handle HubSpot button click at the top (for contacts)
  const handleHubspotClick = () => {
    if (!hubspotConnected) {
      // Redirect to integrations page if not connected
      router.push("/integrations")
    } else {
      // Show the HubSpot contact popup
      setShowHubspotPopup(true)
    }
  }

  // Add this function to handle HubSpot note button click (bottom right corner)
  const toggleHubspotSelectMode = () => {
    if (!hubspotConnected) {
      router.push("/integrations")
      return
    }

    setIsHubspotSelectMode((prev) => !prev)
    setIsMenuOpen(false)

    if (isHubspotSelectMode) {
      showToast("Exited Hubspot select mode", "info")
    } else {
      showToast("Click on any content to add as a Hubspot note", "info")
    }
  }

  // Add this function to handle content selection
  const handleContentSelect = (event: React.MouseEvent<HTMLElement>) => {
    if (!isHubspotSelectMode) return

    // Get the clicked element
    const target = event.target as HTMLElement

    // Get the text content of the clicked element
    let content = ""

    // If it's a list item or paragraph, get its text content
    if (target.tagName === "LI" || target.tagName === "P") {
      content = target.textContent || ""
    }
    // If it's a heading, get its text content
    else if (/^H[1-6]$/.test(target.tagName)) {
      content = target.textContent || ""
    }
    // Otherwise, try to find the closest paragraph, list item, or heading
    else {
      const closestElement = target.closest("p, li, h1, h2, h3, h4, h5, h6")
      content = closestElement ? closestElement.textContent || "" : ""
    }

    // Trim the content and ensure it's not empty
    content = content.trim()
    if (content) {
      setSelectedContent(content)
      setShowNotePopup(true)
    }
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditMode) {
      // When exiting edit mode without saving, reset to original content
      if (dealSummary["left-side"]) {
        // Check if the left side has a content property (post-editing format)
        if (typeof dealSummary["left-side"] === "object" && "content" in dealSummary["left-side"]) {
          setLeftSideHTML(dealSummary["left-side"].content as string)
        } else {
          // Original format
          setLeftSideHTML(jsonToHTML(dealSummary["left-side"]))
        }
      }

      if (dealSummary["right-side"]) {
        const rightHTMLMap: Record<string, string> = {}
        Object.entries(dealSummary["right-side"]).forEach(([key, value]) => {
          // Skip the "context" key
          if (key.toLowerCase() === "context") return

          // Check if the value has a content property (post-editing format)
          if (value && typeof value === "object" && "content" in value) {
            rightHTMLMap[key] = value.content as string
          } else {
            // Original format
            rightHTMLMap[key] = jsonToHTML({ [key]: value })
          }
        })
        setRightSideHTMLMap(rightHTMLMap)
      }
    } else {
      // When entering edit mode, make sure the content is in the editable divs
      setTimeout(() => {
        if (leftEditableRef.current && leftSideHTML) {
          leftEditableRef.current.innerHTML = leftSideHTML
        }

        if (rightEditableRef.current && activeRightTab && rightSideHTMLMap[activeRightTab]) {
          rightEditableRef.current.innerHTML = rightSideHTMLMap[activeRightTab]
        }
      }, 0)
    }

    setIsEditMode(!isEditMode)
  }

  // Save changes
  const saveChanges = () => {
    if (!onSave) return

    // Get the edited content from the editable divs
    const newLeftSideHTML = leftEditableRef.current?.innerHTML || leftSideHTML
    const newRightSideHTMLMap = { ...rightSideHTMLMap }

    if (rightEditableRef.current && activeRightTab) {
      newRightSideHTMLMap[activeRightTab] = rightEditableRef.current.innerHTML
    }

    // Clean up the HTML content
    const cleanedLeftSideHTML = cleanupHTMLContent(newLeftSideHTML)
    const cleanedRightSideHTMLMap: Record<string, string> = {}

    Object.keys(newRightSideHTMLMap).forEach((key) => {
      cleanedRightSideHTMLMap[key] = cleanupHTMLContent(newRightSideHTMLMap[key])
    })

    // Update the state with the new content
    setLeftSideHTML(cleanedLeftSideHTML)
    setRightSideHTMLMap(cleanedRightSideHTMLMap)

    // Create a structure that matches the expected format
    // Build the right-side object based on the original structure
    const rightSideObj: Record<string, any> = {}

    // Populate each tab with its content
    Object.keys(cleanedRightSideHTMLMap).forEach((key) => {
      rightSideObj[key] = {
        content: cleanedRightSideHTMLMap[key],
      }
    })

    // Create the final structure to save
    const updatedDealSummary = {
      "left-side": {
        content: cleanedLeftSideHTML,
      },
      "right-side": rightSideObj,
    }

    // Call the onSave callback with the updated data
    onSave(updatedDealSummary)
    setIsEditMode(false)
  }

  // Handle tab change during edit mode
  const handleTabChange = (tabKey: string) => {
    if (isEditMode && rightEditableRef.current && activeRightTab) {
      // Save the current tab's content before switching
      const currentTabHTML = rightEditableRef.current.innerHTML
      setRightSideHTMLMap((prev) => ({
        ...prev,
        [activeRightTab]: currentTabHTML,
      }))
    }

    setActiveRightTab(tabKey)

    // If in edit mode, update the editable div with the new tab's content
    if (isEditMode && rightEditableRef.current) {
      setTimeout(() => {
        if (rightEditableRef.current && rightSideHTMLMap[tabKey]) {
          rightEditableRef.current.innerHTML = rightSideHTMLMap[tabKey]
        }
      }, 0)
    }
  }

  // Apply formatting to the editor
  const applyFormatting = (command: string, value = "") => {
    if (command === "formatBlock") {
      // For block formatting commands like headings and paragraphs,
      // first remove existing block formatting to prevent nesting
      document.execCommand("removeFormat", false, "")

      // Get the current selection
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)

        // Check if we're inside a block element that needs to be replaced
        let currentBlock = range.commonAncestorContainer
        while (currentBlock && currentBlock.nodeType !== Node.ELEMENT_NODE) {
          currentBlock = currentBlock.parentNode as Node
        }

        // If we're already in a block element like h1-h6 or p, we need to unwrap it first
        if (currentBlock && /^(h[1-6]|p)$/i.test((currentBlock as Element).tagName)) {
          // Execute the formatBlock command with normal paragraph first to reset
          document.execCommand("formatBlock", false, "p")
        }
      }

      // Now apply the new block format
      document.execCommand(command, false, value)
    } else {
      // For inline formatting like bold, italic, etc.
      document.execCommand(command, false, value)
    }

    if (rightEditableRef.current) {
      rightEditableRef.current.focus()

      // Clean up nested tags after applying formatting
      cleanupNestedTags()
    }
  }

  // Improve the cleanupNestedTags function to be more thorough
  const cleanupNestedTags = () => {
    if (!rightEditableRef.current) return

    // Get the current HTML content
    const content = rightEditableRef.current.innerHTML

    // Use DOMParser to parse the HTML and clean it up
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, "text/html")

    // Find and fix nested heading and paragraph tags
    const fixNestedTags = (element: Element) => {
      // Check all child nodes
      Array.from(element.children).forEach((child) => {
        // Check if this is a heading or paragraph with nested headings/paragraphs
        if (/^(h[1-6]|p)$/i.test(child.tagName)) {
          // Find any nested headings or paragraphs
          const nestedBlocks = child.querySelectorAll("h1, h2, h3, h4, h5, h6, p")

          if (nestedBlocks.length > 0) {
            // Replace the nested structure with a flattened structure
            nestedBlocks.forEach((nestedBlock) => {
              // Create a new element with the same tag
              const newElement = document.createElement(nestedBlock.tagName)
              newElement.innerHTML = nestedBlock.innerHTML

              // Insert the new element after the current child
              element.insertBefore(newElement, child.nextSibling)

              // Remove the nested block from its original location
              nestedBlock.remove()
            })

            // If the original element now has only empty content, clean it up
            if (child.innerHTML.trim() === "" || child.textContent?.trim() === "") {
              child.remove()
            }
          }
        }

        // Recursively process child elements
        if (child.children.length > 0) {
          fixNestedTags(child)
        }
      })
    }

    fixNestedTags(doc.body)

    // Update the editor content with the cleaned HTML
    rightEditableRef.current.innerHTML = doc.body.innerHTML
  }

  // Generate and download PDF - completely new approach using jspdf and html2canvas
  const handleDownloadPDF = async () => {
    if (!leftContentRef.current) return

    try {
      setIsGeneratingPDF(true)
      setPdfPreparationProgress(10)
      showToast("Preparing PDF...", "info")

      // Import libraries dynamically
      const jsPDF = (await import("jspdf")).default
      const html2canvas = (await import("html2canvas")).default

      setPdfPreparationProgress(30)

      // Create a container for the PDF content
      const pdfContainer = document.createElement("div")
      pdfContainer.style.position = "absolute"
      pdfContainer.style.left = "-9999px"
      pdfContainer.style.width = "800px" // Fixed width for PDF
      pdfContainer.style.backgroundColor = "white"
      pdfContainer.style.padding = "40px"
      pdfContainer.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      document.body.appendChild(pdfContainer)

      // Clone the content
      const contentClone = leftContentRef.current.cloneNode(true) as HTMLElement

      // Add PDF-specific styling
      const styleElement = document.createElement("style")
      styleElement.textContent = `
      h1, h2, h3, h4, h5, h6 { 
        margin-top: 16px;
        margin-bottom: 8px;
        font-weight: 600;
        page-break-after: avoid;
      }
      p { 
        margin-bottom: 8px;
        line-height: 1.5;
      }
      ul, ol { 
        margin-bottom: 16px;
        padding-left: 20px;
      }
      li { 
        margin-bottom: 8px;
        padding-left: 8px;
        position: relative;
      }
      ul li {
        list-style-type: disc;
        margin-left: 12px;
      }
      ul li::before {
        content: "";
        display: none;
      }
    `
      pdfContainer.appendChild(styleElement)
      pdfContainer.appendChild(contentClone)

      setPdfPreparationProgress(50)

      // Wait for content to render
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Capture the content as canvas
      const canvas = await html2canvas(pdfContainer, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      setPdfPreparationProgress(70)

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Calculate dimensions
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Calculate how many pages we need
      const pageCount = Math.ceil(imgHeight / pageHeight)

      setPdfPreparationProgress(80)

      // For each page, add the appropriate slice of the image
      for (let i = 0; i < pageCount; i++) {
        if (i > 0) {
          pdf.addPage()
        }

        // Calculate the position to start from for this page
        const sourceY = i * pageHeight

        // Calculate the height to use for this page (might be less for the last page)
        const sliceHeight = Math.min(pageHeight, imgHeight - sourceY)

        // Add the image slice for this page

        pdf.addImage(  canvas.toDataURL("image/jpeg", 0.95),"JPEG",0,
          i === 0 ? 0 : -10, // Add margin at top of pages after the first
          imgWidth,
          imgHeight
        )
      }

      setPdfPreparationProgress(90)

      // Clean up
      document.body.removeChild(pdfContainer)

      // Download the PDF
      pdf.save(`deal_summary_${new Date().toISOString().slice(0, 10)}.pdf`)

      // Show success message
      showToast("PDF downloaded successfully", "success")
      setPdfPreparationProgress(100)
    } catch (error) {
      console.error("Error generating PDF:", error)
      showToast("Failed to generate PDF. Please try again.", "error")
    } finally {
      // Ensure minimum loading time for better UX
      setTimeout(() => {
        setIsGeneratingPDF(false)
        setPdfPreparationProgress(0)
      }, 500)
    }
  }

  // Get the right side tabs (top-level keys)
  const rightSideTabs = rightSideKeys

  // Ensure activeRightTab is initialized to null if rightSideKeys is empty
  useEffect(() => {
    if (rightSideKeys.length === 0) {
      setActiveRightTab(null)
    } else if (!activeRightTab && rightSideKeys.length > 0) {
      setActiveRightTab(rightSideKeys[0])
    }
  }, [rightSideKeys, activeRightTab])

  // Add this useEffect to close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (MouseEvent: MouseEvent) => {
      // Don't close the menu if we're clicking inside the menu container
      const menuContainer = document.getElementById("hubspot-menu-container")
      if (menuContainer && menuContainer.contains(MouseEvent.target as Node)) {
        return
      }

      // Don't close the menu if we're clicking the main button (that's handled separately)
      const mainButton = document.getElementById("hubspot-main-button")
      if (mainButton && mainButton.contains(MouseEvent.target as Node)) {
        return
      }

      // Otherwise, close the menu
      if (isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    // Add event listener to document
    document.addEventListener("mousedown", handleClickOutside)

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen])

  // Extract objections from the signal tab content
  useEffect(() => {
    if (rightSideHTMLMap && rightSideHTMLMap["signal"]) {
      const extractedObjections = extractObjections(rightSideHTMLMap["signal"])
      setObjections(extractedObjections)
    }
  }, [rightSideHTMLMap])
  console.log("objections", objections)

  const validObjections = objections.filter((objection) => {
    const match = objection.match(/<p[^>]*>(.*?)<\/p>/)
    const textContent = match?.[1]?.trim().toLowerCase()
    return textContent && textContent !== "none"
  })

  // Define handleSubmitNote function
  const handleSubmitNote = async (contactId: string, note: string) => {
    const token = await getToken()
    if (!token) {
      console.error("No token found")
      showToast("Not authenticated", "error")
      return
    }

    try {
      const response = await axios.post(
        `${APIURL}/api/hubspot/add-note`,
        {
          contactId: contactId,
          note: note,
          dealId: details.hubspotDealId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.status === 200) {
        showToast("Note added to Hubspot successfully", "success")
      } else {
        showToast("Failed to add note to Hubspot", "error")
      }
    } catch (error: any) {
      console.error("Error adding note to Hubspot:", error)
      showToast("Failed to add note to Hubspot", "error")
    }
  }

  // Add NoDataState component
  const NoDataState = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16">
        <div className="bg-gray-100 rounded-full p-4 mb-4">
          <AlertCircle className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Deal Summary Available</h3>
        <p className="text-gray-500 text-center max-w-md mb-6">
          There is no deal summary information available for this meeting yet.
        </p>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
    )
  }

  // Check if there's actual content in the dealSummary
  const hasDealSummaryData =
    dealSummary &&
    dealSummary["left-side"] &&
    ((typeof dealSummary["left-side"] === "object" &&
      "content" in dealSummary["left-side"] &&
      dealSummary["left-side"].content &&
      dealSummary["left-side"].content.trim() !== "") ||
      (typeof dealSummary["left-side"] === "object" && Object.keys(dealSummary["left-side"]).length > 0))

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Objections Panel */}
      {objections.length > 0 && validObjections.length > 0 && showObjectionsPanel && (
        <div className="bg-red-50 border border-red-200 rounded-lg mb-4 overflow-hidden">
          <div className="bg-red-100 px-4 py-2 flex justify-between items-center">
            <h3 className="font-semibold text-red-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Key Objections to Address
            </h3>
            <button
              onClick={() => setShowObjectionsPanel(false)}
              className="text-red-600 hover:text-red-800"
              aria-label="Close objections panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
            {objections.map((objection, index) => (
              <div key={index} className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: objection }} />
            ))}
            <div className="pt-2 border-t border-red-100 mt-3">
              <button
                className="text-sm text-red-700 hover:text-red-900 font-medium flex items-center"
                onClick={() => {
                  if (rightSideTabs.includes("signal")) {
                    handleTabChange("signal")
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1 h-3 w-3"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                View all signals
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hubspot Select Mode Indicator */}
      {isHubspotSelectMode && (
        <div className="bg-primary/10 text-primary font-medium p-3 rounded-lg mb-4 flex items-center justify-between sticky top-0 z-30">
          <span>Hubspot Select Mode: Click on any content to add as a note</span>
          <button
            onClick={toggleHubspotSelectMode}
            className="text-sm bg-white text-primary px-3 py-1 rounded-md hover:bg-gray-100"
          >
            Exit
          </button>
        </div>
      )}

      {/* Rich Text Editing Toolbar - Only visible in edit mode */}
      {isEditMode && (
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 p-2 flex items-center space-x-1 shadow-sm">
          <button onClick={() => applyFormatting("bold")} className="p-1.5 rounded hover:bg-gray-100" title="Bold">
            <Bold size={16} />
          </button>
          <button onClick={() => applyFormatting("italic")} className="p-1.5 rounded hover:bg-gray-100" title="Italic">
            <Italic size={16} />
          </button>
          <button
            onClick={() => applyFormatting("underline")}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Underline"
          >
            <Underline size={16} />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button
            onClick={() => applyFormatting("formatBlock", "<h1>")}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Heading 1"
          >
            <Heading1 size={16} />
          </button>
          <button
            onClick={() => applyFormatting("formatBlock", "<h2>")}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Heading 2"
          >
            <Heading2 size={16} />
          </button>
          <button
            onClick={() => applyFormatting("formatBlock", "<h3>")}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Heading 3"
          >
            <span className="text-xs font-semibold">H3</span>
          </button>
          <button
            onClick={() => applyFormatting("formatBlock", "<h4>")}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Heading 4"
          >
            <span className="text-xs font-semibold">H4</span>
          </button>
          <button
            onClick={() => applyFormatting("formatBlock", "<p>")}
            className="p-1.5 rounded hover:bg-gray-100 text-sm font-medium"
            title="Paragraph"
          >
            P
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button
            onClick={() => applyFormatting("insertUnorderedList")}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => applyFormatting("insertOrderedList")}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button
            onClick={() => {
              const url = prompt("Enter link URL:")
              if (url) applyFormatting("createLink", url)
            }}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Insert Link"
          >
            <Link size={16} />
          </button>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex justify-between overflow-hidden">
        {/* Left side - 60% width with independent scrolling */}
        <div className="w-[68%] h-full overflow-y-auto custom-scrollbar p-6 pr-3 pt-1 relative">
          {isContentLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !hasDealSummaryData ? (
            <NoDataState />
          ) : (
            <>
              {!isEditMode ? (
                <div className="absolute top-6 right-6 z-10 flex space-x-2">
                  <div className="group relative">
                    <button
                      onClick={handleDownloadPDF}
                      disabled={isGeneratingPDF}
                      className={`flex items-center justify-center p-2 ${
                        isGeneratingPDF ? "bg-[#a67dd9]" : "bg-[#8034CB] hover:bg-[#6a2ba9]"
                      } text-white rounded-md transition-colors shadow-sm`}
                      aria-label={isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
                    >
                      {isGeneratingPDF ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </button>
                    <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
                    </div>
                  </div>
                  <div className="group relative">
                    <button
                      onClick={toggleEditMode}
                      className="flex items-center justify-center p-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                      aria-label="Edit Deal Summary"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      Edit Deal Summary
                    </div>
                  </div>

                  {/* Hubspot Button */}
                  <div className="group relative">
                  <button
  id="hubspot-main-button"
  onClick={(e) => {
    e.stopPropagation()
    if (!hubspotConnected) {
      router.push("/integrations")
    } else {
      setIsMenuOpen(!isMenuOpen)
    }
  }}
  className={`flex items-center justify-center transition-all 
    ${isHubspotSelectMode ? "" : ""} 
    ${isMenuOpen ? "ring-2 ring-primary/20" : ""} 
    rounded-full`} // ✅ Add this line
  title={hubspotConnected ? "HubSpot Options" : "Connect HubSpot"}
>
  <HubspotIcon className="h-8 w-8" />
</button>


                    {/* Menu items - Absolutely positioned below the button */}
                    {isMenuOpen && (
                      <div
                        id="hubspot-menu-container"
                        className="absolute top-full right-0 mt-3 flex flex-col gap-2 z-50"
                        onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the menu
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowHubspotPopup(true)
                            setIsMenuOpen(false)
                          }}
                          className="flex items-center bg-primary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors whitespace-nowrap active:scale-95"
                        >
                          <User className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Create Contact</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowDealPopup(true)
                            setIsMenuOpen(false)
                          }}
                          className="flex items-center bg-primary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors whitespace-nowrap active:scale-95"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 mr-2"
                          >
                            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                          </svg>
                          <span className="text-sm font-medium">Create Deal</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleHubspotSelectMode()
                            setIsMenuOpen(false)
                          }}
                          className="flex items-center bg-primary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors whitespace-nowrap active:scale-95"
                        >
                          <MessageSquarePlus className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Add Notes to Contact</span>
                        </button>
                      </div>
                    )}

                    {/* Tooltip for non-connected state - only shows on hover */}
                    {!hubspotConnected && !isCheckingConnection && (
                      <div className="absolute top-full right-0 mt-2 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Connect HubSpot
                      </div>
                    )}

                    {/* Loading indicator */}
                    {isCheckingConnection && (
                      <div className="absolute top-0 right-0 -mt-1 -mr-1 h-3 w-3">
                        <div className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-75"></div>
                        <div className="relative rounded-full h-3 w-3 bg-primary"></div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="absolute top-6 right-6 z-10 flex space-x-2">
                  <button
                    onClick={toggleEditMode}
                    className="flex items-center justify-center p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors shadow-sm"
                    title="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    onClick={saveChanges}
                    className="flex items-center justify-center p-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                    title="Save Changes"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* View mode content */}
              {!isEditMode && (
                <div
                  ref={leftContentRef}
                  className={`prose prose-sm max-w-none ${isHubspotSelectMode ? "cursor-pointer" : ""}`}
                  dangerouslySetInnerHTML={{ __html: leftSideHTML }}
                  onClick={isHubspotSelectMode ? handleContentSelect : undefined}
                />
              )}

              {/* Edit mode content */}
              {isEditMode && (
                <div
                  ref={leftEditableRef}
                  contentEditable
                  className="prose prose-sm max-w-none min-h-[500px] focus:outline-none"
                  dangerouslySetInnerHTML={{ __html: leftSideHTML }}
                />
              )}
            </>
          )}
        </div>

        {/* Right side - 32% width with independent scrolling */}
        <div className="w-[32%] h-full overflow-hidden pr-6 pt-4 pl-2 flex items-start">
          {/* Card container for the entire right side */}
          <div
            className="h-[100%] w-full flex flex-col rounded-xl shadow-xl border border-gray-200 overflow-hidden bg-white relative z-20 transform translate-x-2"
            style={{
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Right side tabs */}
            {rightSideTabs.length > 0 && (
              <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
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
                      onClick={() => handleTabChange(tabKey)}
                    >
                      {tabKey
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())
                        .trim()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Right side content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pt-3">
              {/* View mode content */}
              {!isEditMode && activeRightTab && rightSideHTMLMap[activeRightTab] && (
                <div
                  ref={rightContentRef}
                  className={`prose prose-sm max-w-none deal-summary-content ${isHubspotSelectMode ? "cursor-pointer" : ""}`}
                  dangerouslySetInnerHTML={{ __html: rightSideHTMLMap[activeRightTab] }}
                  onClick={isHubspotSelectMode ? handleContentSelect : undefined}
                />
              )}

              {/* Edit mode content */}
              {isEditMode && activeRightTab && (
                <div
                  ref={rightEditableRef}
                  contentEditable
                  className="prose prose-sm max-w-none min-h-[500px] focus:outline-none mt-2 deal-summary-content"
                  dangerouslySetInnerHTML={{ __html: rightSideHTMLMap[activeRightTab] || "" }}
                />
              )}

              {/* Empty state */}
              {(!activeRightTab || !rightSideHTMLMap[activeRightTab]) && (
                <div className="flex flex-col items-center justify-center h-full py-8 px-4">
                  <div className="bg-gray-100 rounded-full p-3 mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-gray-400"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="M12 18v-6" />
                      <path d="M8 18v-1" />
                      <path d="M16 18v-3" />
                    </svg>
                  </div>
                  <h4 className="text-base font-medium text-gray-700 mb-1">No Content Available</h4>
                  <p className="text-sm text-gray-500 text-center">
                    There is no information available for this section yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden div for PDF content preparation */}
      <div ref={pdfContentRef} className="hidden"></div>

      {/* Hubspot Contact Popup */}
      {showHubspotPopup && hubspotConnected && (
        <HubspotContactPopup
          onClose={() => {
            setShowHubspotPopup(false)
          }}
          onSuccess={() => {
            setShowHubspotPopup(false)
            parentShowToast
              ? parentShowToast("Contact added to HubSpot successfully", "success")
              : showToast("Contact added to HubSpot successfully", "success")
          }}
          dealData={dealSummary?.["right-side"]?.dealData || null}
        />
      )}

      {/* Note Popup */}
      {showNotePopup && selectedContent && (
        <ContactSelectionModal
          content={selectedContent}
          onClose={() => {
            setShowNotePopup(false)
            setSelectedContent(null)
          }}
          contacts={hubspotContacts}
          isLoading={isLoadingContacts}
          onSubmit={handleSubmitNote}
        />
      )}
      {/* Deal Popup */}
      {showDealPopup && hubspotConnected && (
        <HubspotDealPopup
          onClose={() => {
            setShowDealPopup(false)
          }}
          onSuccess={() => {
            setShowDealPopup(false)
            parentShowToast
              ? parentShowToast("Deal created in HubSpot successfully", "success")
              : showToast("Deal created in HubSpot successfully", "success")
          }}
          contacts={hubspotContacts}
          isLoadingContacts={isLoadingContacts}
          dealData={dealSummary?.["right-side"]?.dealData || null}
        />
      )}

      {/* PDF Generation Progress Indicator */}
      {isGeneratingPDF && pdfPreparationProgress > 0 && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Generating PDF</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${pdfPreparationProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {pdfPreparationProgress < 40 && "Preparing content..."}
              {pdfPreparationProgress >= 40 && pdfPreparationProgress < 70 && "Rendering document..."}
              {pdfPreparationProgress >= 70 && pdfPreparationProgress < 90 && "Creating PDF..."}
              {pdfPreparationProgress >= 90 && "Finalizing..."}
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        ${
          isHubspotSelectMode
            ? `
          /* Apply hover styles to both left and right side content */
          .prose p:hover, 
          .prose li:hover,
          .prose h1:hover,
          .prose h2:hover,
          .prose h3:hover,
          .prose h4:hover,
          .deal-summary-content p:hover, 
          .prose li:hover,
          .deal-summary-content h1:hover,
          .deal-summary-content h2:hover,
          .deal-summary-content h3:hover,
          .deal-summary-content h4:hover {
            background-color: rgba(79, 70, 229, 0.1);
            border-radius: 4px;
            transition: background-color 0.2s;
          }
        `
            : ""
        }
      `}</style>
    </div>
  )
}

export default DealSummaryTab
