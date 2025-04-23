"use client"

import { useEffect } from "react"

import { useState, useRef } from "react"
import { Edit, Save,  X, Download, Bold,Italic, Underline, List, ListOrdered, Heading1, Heading2, Link } from "lucide-react"
import type { MeetingDetails } from "@/types/meetingDetails"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { cn } from "@/lib/utils"

interface DealSummaryTabProps {
  details: MeetingDetails
  onSave?: (updatedDealSummary: any) => void
}

// Helper function to check if a string is already HTML
const isHTML = (str: string): boolean => {
  if (typeof str !== "string") return false
  return /<\/?[a-z][\s\S]*>/i.test(str)
}

// Modify the jsonToHTML function to check for meaningful values before displaying

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

const DealSummaryTab = ({ details, onSave }: DealSummaryTabProps) => {
  const { dealSummary } = details
  console.log("details",details)

  // State for HTML content of left and right sides
  const [leftSideHTML, setLeftSideHTML] = useState<string>("")
  const [rightSideHTMLMap, setRightSideHTMLMap] = useState<Record<string, string>>({})

  // State to track if we're in edit mode\
  const [isEditMode, setIsEditMode] = useState(false)

  // State to track the active right-side tab
  const [activeRightTab, setActiveRightTab] = useState<string | null>(null)

  // References for content display and editing
  const leftContentRef = useRef<HTMLDivElement>(null)
  const rightContentRef = useRef<HTMLDivElement>(null)
  const leftEditableRef = useRef<HTMLDivElement>(null)
  const rightEditableRef = useRef<HTMLDivElement>(null)

  const [rightSideKeys, setRightSideKeys] = useState<string[]>([])

  // Initialize content when dealSummary changes
  useEffect(() => {
    if (dealSummary) {
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
    }
  }, [dealSummary, activeRightTab])

  useEffect(() => {
    if (isEditMode && rightEditableRef.current && activeRightTab && rightSideHTMLMap[activeRightTab]) {
      rightEditableRef.current.innerHTML = rightSideHTMLMap[activeRightTab]
    }
  }, [isEditMode, activeRightTab, rightSideHTMLMap])

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

  // Generate and download PDF
  const handleDownloadPDF = async () => {
    if (!leftContentRef.current) return

    try {
      // Create a temporary div to clone the content for better PDF rendering
      const contentDiv = document.createElement("div")
      contentDiv.innerHTML = leftContentRef.current.innerHTML
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

  return (
    <div className="h-full flex flex-col overflow-hidden">
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
          {!isEditMode ? (
            <div className="absolute top-6 right-6 z-10 flex space-x-2">
              <div className="group relative">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center p-2 bg-[#8034CB] text-white rounded-md hover:bg-[#6a2ba9] transition-colors shadow-sm"
                  aria-label="Download PDF"
                >
                  <Download className="h-4 w-4" />
                </button>
                <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Download PDF
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
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: leftSideHTML }}
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
                  className="prose prose-sm max-w-none deal-summary-content"
                  dangerouslySetInnerHTML={{ __html: rightSideHTMLMap[activeRightTab] }}
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
                <div className="text-center py-12 text-gray-500">
                  <p>No content available for this tab</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DealSummaryTab
