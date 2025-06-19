"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import Sidebar from "./sidebar"
import Toolbar from "./toolbar"
import SlideCanvas from "./slide-canvas"
import type { Slide, SlideElement, HtmlSlideElement, ImageSlideElement } from "@/types/slide"
import ShapeMenu from "./shapes/shape-menu"
import { basicShapes } from "./shapes/shape-data"
import AiSidebar from "./ai-sidebar"
import { editSlideContent, saveSlides, uploadMultipleFiles } from "@/lib/api"
import { imageTracker, ImageTracker, type ImageLocation } from "@/lib/image-tracker"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"


export default function SlideEditor({ initialSlides, requestId }: any) {
  const [slides, setSlides] = useState<Slide[]>(
    initialSlides?.map((slide:any) => ({
        ...slide,
        // Ensure all elements have a type, default to 'text' if not image and html exists
        content: slide.content.map((el:any) => {
          if (el.type === "image") return el
          if (!el.type && (el as HtmlSlideElement).html) return { ...el, type: "text" } as HtmlSlideElement
          return el
        }),
      })),
  )

  // Update slides when initialSlides prop changes
  useEffect(() => {
    if (initialSlides) {
      console.log("SlideEditor: Updating slides from props", initialSlides)
      const transformedSlides = initialSlides.map((slide:any) => ({
        ...slide,
        content: slide.content.map((el:any) => {
          if (el.type === "image") return el
          if (!el.type && (el as HtmlSlideElement).html) return { ...el, type: "text" } as HtmlSlideElement
          return el
        }),
      }))
      setSlides(transformedSlides)
      // Force update counter to trigger re-renders
      setUpdateCounter((prev) => prev + 1)
    }
  }, [initialSlides])

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingElementId, setEditingElementId] = useState<string | null>(null)
  const [shapeMenuOpen, setShapeMenuOpen] = useState(false)
  const [isAIProcessing, setIsAIProcessing] = useState(false)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  // Add a counter to force re-renders
  const [updateCounter, setUpdateCounter] = useState(0)

  const [history, setHistory] = useState<Slide[][]>([
    initialSlides?.map((slide:any) => ({
        ...slide,
        content: slide.content.map((el:any) => {
          if (el.type === "image") return el
          if (!el.type && (el as HtmlSlideElement).html) return { ...el, type: "text" } as HtmlSlideElement
          return el
        }),
      })),
  ])
  const [historyIndex, setHistoryIndex] = useState(0)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const slideCanvasContainerRef = useRef<HTMLDivElement>(null)

  const currentSlide = slides[currentSlideIndex]

  const updateElementStyle = (element: Element, property: string, value: string) => {
    // ... (same as before) ...
    const currentStyle = element.getAttribute("style") || ""
    const styles: Record<string, string> = {}
    if (currentStyle) {
      currentStyle.split(";").forEach((declaration) => {
        const colonIndex = declaration.indexOf(":")
        if (colonIndex > 0) {
          const prop = declaration.substring(0, colonIndex).trim()
          const val = declaration.substring(colonIndex + 1).trim()
          if (prop && val) styles[prop] = val
        }
      })
    }
    if (value === "" || value === null) delete styles[property]
    else styles[property] = value
    const newStyle = Object.entries(styles)
      .map(([prop, val]) => `${prop}:${val}`)
      .join(";")
    element.setAttribute("style", newStyle)
  }

  const saveToHistory = (newSlides: Slide[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newSlides)))
    if (newHistory.length > 50) newHistory.shift()
    else setHistoryIndex(historyIndex + 1) // Correctly increment if not shifting
    setHistory(newHistory)
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setSlides(JSON.parse(JSON.stringify(history[newIndex])))
      setSelectedElementId(null)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setSlides(JSON.parse(JSON.stringify(history[newIndex])))
      setSelectedElementId(null)
    }
  }

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  // Force a re-render of the entire slide editor
  const forceUpdate = useCallback(() => {
    setUpdateCounter((prev) => prev + 1)
  }, [])

  // Helper function to add image to tracker
  const addImageToTracker = (localUrl: string, file: File, location: ImageLocation) => {
    imageTracker.addImage(localUrl, file, location)
  }

  // Helper function to remove image from tracker
  const removeImageFromTracker = (localUrl: string, location: ImageLocation) => {
    imageTracker.removeImageLocation(localUrl, location)
  }

  const editElementWithAI = async (
    slideId: string,
    elementId: string,
    prompt: string,
  ): Promise<Partial<SlideElement>> => {
    console.log(`=== AI EDITING ELEMENT === Slide ID: ${slideId}, Element ID: ${elementId}, Prompt: ${prompt}`)

    if (!requestId) {
      throw new Error("Request ID is required for AI editing")
    }

    try {
      const response = await editSlideContent({
        request_id: requestId,
        slide_id: slideId,
        content_id: elementId,
        prompt: prompt,
      })

      console.log("AI element edit response:", response)
      if (response?.data) {
        return response.data
      }

      throw new Error("No updated element found in response")
    } catch (error) {
      console.error("Error in AI element editing:", error)
      throw error
    }
  }

  const editSlideWithAI = async (slideId: string, prompt: string): Promise<Slide> => {
    console.log(`=== AI EDITING SLIDE === Slide ID: ${slideId}, Prompt: ${prompt}`)

    if (!requestId) {
      throw new Error("Request ID is required for AI editing")
    }

    try {
      const response = await editSlideContent({
        request_id: requestId,
        slide_id: slideId,
        prompt: prompt,
      })

      console.log("AI slide edit response:", response)

      // Check if we have the editedSlide in the response
      if (!response.data.editedSlide) {
        throw new Error("No edited slide data found in response")
      }

      // Extract the edited slide data from the nested structure
      const editedSlideData = response.data.editedSlide

      // Construct the updated slide from the response
      const updatedSlide: Slide = {
        slide_id: editedSlideData.slide_id || slideId,
        background: editedSlideData.background || currentSlide.background,
        content: editedSlideData.content || currentSlide.content,
      }

      console.log("Constructed updated slide:", updatedSlide)
      return updatedSlide
    } catch (error) {
      console.error("Error in AI slide editing:", error)
      throw error
    }
  }

  const [aiSidebarOpen, setAiSidebarOpen] = useState(false)
  const [aiSidebarMode, setAiSidebarMode] = useState<"slide" | "element">("slide")
  const [aiSidebarTarget, setAiSidebarTarget] = useState<{ id: string; content?: SlideElement }>({ id: "" }) // Store full element for context
  const [aiPrompt, setAiPrompt] = useState("")

  const handleSlideSelect = (index: number) => {
    /* ... (same as before) ... */ setCurrentSlideIndex(index)
    setSelectedElementId(null)
    setIsEditing(false)
    setEditingElementId(null)
  }

  const handleAddSlide = () => {
    const newSlide: Slide = { slide_id: `slide_${Date.now()}`, background: "#ffffff", content: [] }
    setSlides((prevSlides) => {
      const newSlides = [...prevSlides]
      newSlides.splice(currentSlideIndex + 1, 0, newSlide)
      saveToHistory(newSlides)
      return newSlides
    })
    setCurrentSlideIndex(currentSlideIndex + 1)
    setSelectedElementId(null)
  }

  const handleDeleteSlide = () => {
    if (slides.length <= 1) return
    setSlides((prevSlides) => {
      const newSlides = [...prevSlides]
      newSlides.splice(currentSlideIndex, 1)
      saveToHistory(newSlides)
      return newSlides
    })
    setCurrentSlideIndex(Math.min(currentSlideIndex, slides.length - 2))
    setSelectedElementId(null)
  }

  const handleDuplicateSlide = () => {
    const slideToClone = slides[currentSlideIndex]
    const newSlide: Slide = {
      ...slideToClone,
      slide_id: `slide_${Date.now()}`,
      content: slideToClone.content.map((element) => ({ ...element, id: `${element.id}_copy_${Date.now()}` })),
    }
    setSlides((prevSlides) => {
      const newSlides = [...prevSlides]
      newSlides.splice(currentSlideIndex + 1, 0, newSlide)
      saveToHistory(newSlides)
      return newSlides
    })
    setCurrentSlideIndex(currentSlideIndex + 1)
    setSelectedElementId(null)
  }

  const handleChangeBackground = (background: string) => {
    // If the new background contains a local image, track it
    if (background.startsWith("url(") && ImageTracker.isLocalImage(background)) {
      const urlMatch = background.match(/url$$['"]?([^'"]+)['"]?$$/)
      if (urlMatch && urlMatch[1]) {
        // Note: We can't get the original file here, so we'll need to handle this differently
        // This would happen when setting background through color picker with image
        console.log("Background image needs to be tracked:", urlMatch[1])
      }
    }

    setSlides((prevSlides) => {
      const newSlides = [...prevSlides]
      newSlides[currentSlideIndex] = { ...newSlides[currentSlideIndex], background }
      saveToHistory(newSlides)
      return newSlides
    })
  }

  const handleEditingChange = (editing: boolean, elementId: string) => {
    setIsEditing(editing)
    setEditingElementId(editing ? elementId : null)
  }

  const handleOpenEditSlideWithAI = (slideId: string) => {
    // Renamed to avoid conflict
    setAiSidebarMode("slide")
    setAiSidebarTarget({ id: slideId, content: slides.find((s) => s.slide_id === slideId) })
    setAiPrompt("")
    setAiSidebarOpen(true)
  }

  const handleOpenEditElementWithAI = (slideId: string, elementId: string) => {
    // Renamed
    const slide = slides.find((s) => s.slide_id === slideId)
    const element = slide?.content.find((el) => el.id === elementId)
    setAiSidebarMode("element")
    setAiSidebarTarget({ id: elementId, content: element })
    setAiPrompt("")
    setAiSidebarOpen(true)
  }

  const processAiPrompt = async (prompt: string) => {
    console.log(`Processing AI Prompt - Mode: ${aiSidebarMode}, Target: ${aiSidebarTarget.id}, Prompt: ${prompt}`)
    setIsAIProcessing(true)

    try {
      if (aiSidebarMode === "slide" && aiSidebarTarget.id) {
        const aiGeneratedSlide = await editSlideWithAI(aiSidebarTarget.id, prompt)
        setSlides((prevSlides) => {
          const newSlides = prevSlides.map((s) => (s.slide_id === aiSidebarTarget.id ? aiGeneratedSlide : s))
          saveToHistory(newSlides)
          return newSlides
        })
      } else if (aiSidebarMode === "element" && aiSidebarTarget.id && currentSlide) {
        const aiEnhancedContent = await editElementWithAI(currentSlide.slide_id, aiSidebarTarget.id, prompt)

        // Create a completely new slides array with the updated element
        const newSlides = slides.map((s) => {
          if (s.slide_id === currentSlide.slide_id) {
            return {
              ...s,
              content: s.content.map((el) => {
                if (el.id === aiSidebarTarget.id) {
                  // Create a completely new element object
                  return {
                    ...el,
                    ...aiEnhancedContent,
                    // Add a timestamp to ensure the object reference changes
                    _timestamp: Date.now(),
                  }
                }
                return el
              }),
            }
          }
          return s
        })

        // Update state with the new slides array
        setSlides(newSlides)
        saveToHistory(newSlides)

        // Force a complete re-render
        forceUpdate()
      }
      setAiSidebarOpen(false)
    } catch (error) {
      console.error("Error during AI processing:", error)
      // You might want to show an error message to the user here
      alert(`Error during AI processing: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsAIProcessing(false)
    }
  }

  const handleBackgroundColorChange = (color: string) => {
    if (!selectedElementId) return
    const currentElement = currentSlide.content.find((el) => el.id === selectedElementId)
    if (currentElement && currentElement.type !== "image") {
      // Only for HTML elements
      // This logic might need to be more specific if elements can have their own background
      // For now, assuming it's for shapes or text block backgrounds
      updateElementContent(selectedElementId, {
        html: `<div style="background-color:${color};">${(currentElement as HtmlSlideElement).html}</div>`,
      })
    } else if (currentElement && currentElement.type === "image") {
      // For images, update the style property if we want to add a background to the image container
      const imgEl = currentElement as ImageSlideElement
      updateElementContent(selectedElementId, { style: { ...imgEl.style, backgroundColor: color } })
    }
  }

  const updateElementPosition = (elementId: string, x: number, y: number) => {
    setSlides((prevSlides) => {
      const newSlides = prevSlides.map((slide) => {
        if (slide.slide_id === currentSlide.slide_id) {
          return {
            ...slide,
            content: slide.content.map((el) => (el.id === elementId ? { ...el, x, y, _timestamp: Date.now() } : el)),
          }
        }
        return slide
      })
      saveToHistory(newSlides)
      return newSlides
    })
  }

  const updateElementSize = (elementId: string, width: number, height: number) => {
    setSlides((prevSlides) => {
      const newSlides = prevSlides.map((slide) => {
        if (slide.slide_id === currentSlide.slide_id) {
          return {
            ...slide,
            content: slide.content.map((el) =>
              el.id === elementId ? { ...el, width, height, _timestamp: Date.now() } : el,
            ),
          }
        }
        return slide
      })
      saveToHistory(newSlides)
      return newSlides
    })
  }

  const updateElementContent = (elementId: string, newContent: Partial<SlideElement>) => {
    setSlides((prevSlides:any) => {
      const newSlides = prevSlides.map((s:any) => {
        if (s.slide_id === currentSlide.slide_id) {
          return {
            ...s,
            content: s.content.map((el:any) => {
              if (el.id === elementId) {
                // Create completely new object with timestamp to ensure reference changes
                return {
                  ...el,
                  ...newContent,
                  id: el.id,
                  _timestamp: Date.now(),
                }
              }
              return el
            }),
          }
        }
        return s
      })
      saveToHistory(newSlides)
      return newSlides
    })

    // Force a complete re-render
    forceUpdate()
  }

  const deleteElement = (elementId: string) => {
    // Remove image tracking if this was an image element
    const elementToDelete = currentSlide.content.find((el) => el.id === elementId)
    if (elementToDelete?.type === "image" && ImageTracker.isLocalImage((elementToDelete as ImageSlideElement).src)) {
      const location: ImageLocation = {
        slideId: currentSlide.slide_id,
        type: "element",
        elementId: elementId,
      }
      removeImageFromTracker((elementToDelete as ImageSlideElement).src, location)
    }

    setSlides((prevSlides) => {
      const newSlides = prevSlides.map((s) =>
        s.slide_id === currentSlide.slide_id
          ? {
              ...s,
              content: s.content.filter((el) => el.id !== elementId),
            }
          : s,
      )
      saveToHistory(newSlides)
      return newSlides
    })
    if (selectedElementId === elementId) setSelectedElementId(null)
  }

  const insertTextBox = () => {
    const newTextBoxId = `textbox_${Date.now()}`
    const newTextBox: HtmlSlideElement = {
      id: newTextBoxId,
      type: "text",
      x: 100,
      y: 100,
      width: 300,
      height: 100,
      html: '<p style="font-size:18px;color:#000000;">Click to add text</p>',
    }
    setSlides((prevSlides) => {
      const newSlides = prevSlides.map((s) =>
        s.slide_id === currentSlide.slide_id
          ? {
              ...s,
              content: [...s.content, newTextBox],
            }
          : s,
      )
      saveToHistory(newSlides)
      return newSlides
    })
    setSelectedElementId(newTextBoxId)
  }

  const insertTable = (rows: number, cols: number) => {
    const generateTableHTML = (r: number, c: number) => {
      /* ... (same as before) ... */
      let tableHTML = `<table style="width:100%;border-collapse:collapse;font-size:16px;font-family:Arial,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.1);border-radius:8px;overflow:hidden;background-color:#ffffff;">`
      for (let i = 0; i < r; i++) {
        tableHTML += "<tr>"
        for (let j = 0; j < c; j++) {
          if (i === 0)
            tableHTML += `<th style="border:1px solid #e2e8f0;padding:12px 16px;background-color:#f8fafc;font-weight:600;text-align:left;color:#374151;">Header ${j + 1}</th>`
          else
            tableHTML += `<td style="border:1px solid #e2e8f0;padding:12px 16px;background-color:#ffffff;color:#374151;">Cell ${i},${j + 1}</td>`
        }
        tableHTML += "</tr>"
      }
      tableHTML += "</table>"
      return tableHTML
    }
    const newTableId = `table_${Date.now()}`
    const newTable: HtmlSlideElement = {
      id: newTableId,
      type: "table",
      x: 100,
      y: 100,
      width: Math.min(800, Math.max(300, cols * 120)),
      height: Math.min(400, Math.max(150, rows * 45)),
      html: generateTableHTML(rows, cols),
    }
    setSlides((prevSlides) => {
      const newSlides = prevSlides.map((s) =>
        s.slide_id === currentSlide.slide_id
          ? {
              ...s,
              content: [...s.content, newTable],
            }
          : s,
      )
      saveToHistory(newSlides)
      return newSlides
    })
    setSelectedElementId(newTableId)
  }

  const insertImage = () => imageInputRef.current?.click()

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      const img = new Image()
      img.onload = () => {
        let width = img.width,
          height = img.height
        const maxWidth = 500,
          maxHeight = 350
        if (width > maxWidth) {
          const r = maxWidth / width
          width = maxWidth
          height *= r
        }
        if (height > maxHeight) {
          const r = maxHeight / height
          height = maxHeight
          width *= r
        }
        const newImageId = `image_${Date.now()}`
        const newImage: ImageSlideElement = {
          id: newImageId,
          type: "image",
          x: (1280 - width) / 2,
          y: (720 - height) / 2,
          width,
          height,
          src: imageUrl, // This will be a base64 data URL
          alt: file.name,
          caption: "New Image",
          style: { objectFit: "contain" },
        }

        // Track this image
        const location: ImageLocation = {
          slideId: currentSlide.slide_id,
          type: "element",
          elementId: newImageId,
        }
        addImageToTracker(imageUrl, file, location)

        setSlides((prevSlides) => {
          const newSlides = prevSlides.map((s) =>
            s.slide_id === currentSlide.slide_id
              ? {
                  ...s,
                  content: [...s.content, newImage],
                }
              : s,
          )
          saveToHistory(newSlides)
          return newSlides
        })
        setSelectedElementId(newImageId)
      }
      img.src = imageUrl
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const insertShape = (shapeId: string) => {
    const shapeDefinition = basicShapes.find((shape) => shape.id === shapeId)
    if (!shapeDefinition) return
    const newShapeId = `shape_${Date.now()}`
    const getShapeTextPosition = (id: string) => {
      /* ... (same as before) ... */
      switch (id) {
        case "triangle":
          return "top:25%;left:0;width:100%;height:50%;"
        case "right-triangle":
          return "top:30%;left:20%;width:60%;height:50%;"
        case "trapezoid":
          return "top:20%;left:0;width:100%;height:60%;"
        case "pentagon":
          return "top:10%;left:0;width:100%;height:80%;"
        case "hexagon":
          return "top:5%;left:0;width:100%;height:90%;"
        case "star":
          return "top:15%;left:0;width:100%;height:70%;"
        case "arrow-right":
          return "top:0;left:0;width:70%;height:100%;"
        case "speech-bubble":
          return "top:0;left:0;width:100%;height:75%;"
        default:
          return "top:0;left:0;width:100%;height:100%;"
      }
    }
    const shapeTextPosition = getShapeTextPosition(shapeId)
    const shapeTextStyle = `position:absolute;${shapeTextPosition}pointer-events:none;padding:8px;box-sizing:border-box;overflow:hidden;display:flex;align-items:center;justify-content:center;`
    let shapeHtml = ""
    if (shapeDefinition.type === "svg") {
      shapeHtml = `<div class="shape-container" data-shape-id="${shapeId}" style="position:relative;width:100%;height:100%;"><svg viewBox="${shapeDefinition.viewBox}" style="width:100%;height:100%;"><path d="${shapeDefinition.svgPath}" fill="#ffffff" stroke="#000000" strokeWidth="2"></path></svg><div class="shape-text" style="${shapeTextStyle}"><div style="text-align:center;word-wrap:break-word;white-space:normal;line-height:1.4;max-width:100%;max-height:100%;overflow:hidden;"><p style="font-size:18px;color:#000000;margin:0;">Add text</p></div></div></div>`
    } else {
      const cssProps = Object.entries(shapeDefinition.cssProperties || {})
        .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}:${value}`)
        .join(";")
      shapeHtml = `<div class="shape-container" data-shape-id="${shapeId}" style="position:relative;${cssProps};"><div class="shape-text" style="${shapeTextStyle}"><div style="text-align:center;word-wrap:break-word;white-space:normal;line-height:1.4;max-width:100%;max-height:100%;overflow:hidden;"><p style="font-size:18px;color:#000000;margin:0;">Add text</p></div></div></div>`
    }
    const newShape: HtmlSlideElement = {
      id: newShapeId,
      type: "shape",
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      html: shapeHtml,
    }
    setSlides((prevSlides) => {
      const newSlides = prevSlides.map((s) =>
        s.slide_id === currentSlide.slide_id
          ? {
              ...s,
              content: [...s.content, newShape],
            }
          : s,
      )
      saveToHistory(newSlides)
      return newSlides
    })
    setSelectedElementId(newShapeId)
  }

  const handleInsertItem = (type: string, data?: any) => {
    console.log(`handleInsertItem called with type: ${type}, data:`, data)

    if (type === "Text box") {
      insertTextBox()
    } else if (type === "Image") {
      insertImage()
    } else if (type === "Shape") {
      // Check if we have shape data from the new hover menu
      if (data && data.shapeId) {
        console.log(`Inserting shape with ID: ${data.shapeId}`)
        insertShape(data.shapeId)
      } else {
        // Fallback to old shape menu (shouldn't happen with new UI)
        console.log("Opening old shape menu as fallback")
        setShapeMenuOpen(true)
      }
    } else if (type === "Table") {
      if (data && data.rows && data.cols) {
        insertTable(data.rows, data.cols)
      } else {
        insertTable(3, 3)
      }
    }
  }

  // Upload images and create URL mapping
  const uploadImagesAndCreateMapping = async (): Promise<Record<string, string>> => {
    const imagesToUpload = imageTracker.getImagesToUpload()

    if (imagesToUpload.length === 0) {
      console.log("No local images to upload")
      return {}
    }

    console.log(`Uploading ${imagesToUpload.length} images...`)

    try {
      // Extract files to upload
      const filesToUpload = imagesToUpload.map((ref:any) => ref.file).filter((file:any): file is File => file !== undefined)

      if (filesToUpload.length === 0) {
        console.log("No files available for upload")
        return {}
      }

      // Upload all files
      const uploadResults = await uploadMultipleFiles(filesToUpload)

      // Create mapping and mark as uploaded
      const urlMapping: Record<string, string> = {}

      uploadResults.forEach((result:any, index:any) => {
        const imageRef = imagesToUpload[index]
        if (imageRef && result.success) {
          urlMapping[imageRef.localUrl] = result.url
          imageTracker.markAsUploaded(imageRef.localUrl, result.url)
          console.log(`Mapped: ${imageRef.localUrl} -> ${result.url}`)
        }
      })

      console.log("Image upload mapping created:", urlMapping)
      return urlMapping
    } catch (error) {
      console.error("Error uploading images:", error)
      throw new Error(`Failed to upload images: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const prepareSlidesForSave = async () => {
    // First, upload all local images and get URL mapping
    const urlMapping = await uploadImagesAndCreateMapping()

    // Replace URLs in slide data
    const slidesWithServerUrls = ImageTracker.replaceUrlsInSlides(slides, urlMapping)

    // Clean up the slides data before sending to API
    return slidesWithServerUrls.map((slide:any) => ({
      slide_id: slide.slide_id,
      background: slide.background,
      content: slide.content.map((element:any) => {
        // Remove any temporary properties like _timestamp
        const { _timestamp, ...cleanElement } = element as any
        return cleanElement
      }),
    }))
  }

  const handleSave = async () => {
    if (!requestId) {
      alert("Error: No request ID available for saving")
      return
    }

    setIsSaving(true)

    try {
      console.log("Preparing slides data for save...")

      // Show upload progress if there are images
      const imagesToUpload = imageTracker.getImagesToUpload()
      if (imagesToUpload.length > 0) {
        console.log(`Uploading ${imagesToUpload.length} images before saving...`)
      }

      const cleanedSlides = await prepareSlidesForSave()

      console.log("Slides data to be saved:", {
        requestId,
        slidesCount: cleanedSlides.length,
        slides: cleanedSlides,
      })

      const response = await saveSlides(requestId, { slides: cleanedSlides })

      console.log("Save response:", response)

      if (response.status === "success") {
        // Show success message
        const successToast = document.createElement("div")
        successToast.innerHTML = `
          <div style="position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:8px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
            ✅ ${response.message}
          </div>
        `
        document.body.appendChild(successToast)
        setTimeout(() => {
          if (document.body.contains(successToast)) {
            document.body.removeChild(successToast)
          }
        }, 3000)
      } else {
        throw new Error(response.message || "Save failed")
      }
    } catch (error) {
      console.error("Error saving presentation:", error)

      // Show error message
      const errorToast = document.createElement("div")
      errorToast.innerHTML = `
        <div style="position:fixed;top:20px;right:20px;background:#ef4444;color:white;padding:12px 20px;border-radius:8px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
          ❌ Failed to save: ${error instanceof Error ? error.message : "Unknown error"}
        </div>
      `
      document.body.appendChild(errorToast)
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast)
        }
      }, 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true)
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1280, 720] })
    const slideElements = document.querySelectorAll(".slide-canvas-render-for-pdf") // A temporary class

    // Temporarily render all slides for capture
    const tempRenderContainer = document.createElement("div")
    tempRenderContainer.style.position = "absolute"
    tempRenderContainer.style.left = "-9999px" // Off-screen
    tempRenderContainer.style.width = "1280px" // Fixed width for rendering
    tempRenderContainer.style.height = "720px" // Fixed height for rendering
    document.body.appendChild(tempRenderContainer)

    for (let i = 0; i < slides.length; i++) {
      const slideData = slides[i]

      // Create a div for the slide
      const slideDiv = document.createElement("div")
      slideDiv.id = `pdf-slide-${i}`
      slideDiv.style.width = "1280px"
      slideDiv.style.height = "720px"
      slideDiv.style.position = "relative" // Needed for absolute positioning of elements
      slideDiv.style.background = slideData.background
      slideDiv.style.overflow = "hidden" // Ensure content stays within bounds

      // Render elements onto this div
      slideData.content.forEach((element) => {
        const elDiv = document.createElement("div")
        elDiv.style.position = "absolute"
        elDiv.style.left = `${element.x}px`
        elDiv.style.top = `${element.y}px`
        elDiv.style.width = `${element.width}px`
        elDiv.style.height = `${element.height}px`
        elDiv.style.overflow = "hidden" // Prevent content spill

        if (element.type === "image") {
          const img = document.createElement("img")
          img.src = (element as ImageSlideElement).src
          img.alt = (element as ImageSlideElement).alt || ""
          img.style.width = "100%"
          img.style.height = "100%"
          if ((element as ImageSlideElement).style) {
            Object.assign(img.style, (element as ImageSlideElement).style)
          }
          elDiv.appendChild(img)
          if ((element as ImageSlideElement).caption) {
            const captionDiv = document.createElement("div")
            captionDiv.textContent = (element as ImageSlideElement).caption!
            captionDiv.style.position = "absolute"
            captionDiv.style.bottom = "0"
            captionDiv.style.left = "0"
            captionDiv.style.right = "0"
            captionDiv.style.backgroundColor = "rgba(0,0,0,0.5)"
            captionDiv.style.color = "white"
            captionDiv.style.padding = "2px"
            captionDiv.style.fontSize = "10px" // Smaller for PDF
            captionDiv.style.textAlign = "center"
            elDiv.appendChild(captionDiv)
          }
        } else {
          elDiv.innerHTML = (element as HtmlSlideElement).html
        }
        slideDiv.appendChild(elDiv)
      })
      tempRenderContainer.appendChild(slideDiv)

      // Capture this specific slideDiv
      const canvas = await html2canvas(slideDiv, {
        width: 1280,
        height: 720,
        scale: 1, // Use scale 1 for exact pixel dimensions
        useCORS: true,
        logging: false, // Reduce console noise
        onclone: (doc) => {
          // Ensure all images are loaded before capture
          const promises: Promise<void>[] = []
          doc.querySelectorAll("img").forEach((img) => {
            if (!img.complete) {
              promises.push(
                new Promise((resolve) => {
                  img.onload = img.onerror = () => resolve()
                }),
              )
            }
          })
          return Promise.all(promises)
        },
      })

      const imgData = canvas.toDataURL("image/png", 1.0)
      if (i > 0) pdf.addPage([1280, 720], "landscape")
      pdf.addImage(imgData, "PNG", 0, 0, 1280, 720)

      tempRenderContainer.removeChild(slideDiv) // Clean up the rendered slide
    }

    document.body.removeChild(tempRenderContainer) // Clean up container
    pdf.save(`presentation-${Date.now()}.pdf`)
    setIsDownloadingPDF(false)
  }

  return (
    <div className="flex flex-col h-screen" key={updateCounter}>
      <Toolbar
        onInsertItem={handleInsertItem}
        selectedElementId={selectedElementId}
        onBackgroundColorChange={handleBackgroundColorChange}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onSave={handleSave}
        slides={slides} // Pass slides for PDF download
        onDownloadPDF={handleDownloadPDF}
        isDownloadingPDF={isDownloadingPDF}
        isSaving={isSaving}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          onSlideSelect={handleSlideSelect}
          onAddSlide={handleAddSlide}
          onDeleteSlide={handleDeleteSlide}
          onDuplicateSlide={handleDuplicateSlide}
        />
        <div
          ref={slideCanvasContainerRef}
          className="flex-1 bg-gray-100 overflow-auto p-8 flex justify-center items-center"
        >
          {isAIProcessing && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
              {" "}
              {/* Higher z-index */}
              <div className="bg-white rounded-lg p-6 flex items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="text-lg">AI is enhancing your content...</span>
              </div>
            </div>
          )}
          {currentSlide && (
            <SlideCanvas
              slide={currentSlide}
              currentSlideIndex={currentSlideIndex}
              selectedElementId={selectedElementId}
              setSelectedElementId={setSelectedElementId}
              updateElementPosition={updateElementPosition}
              updateElementSize={updateElementSize}
              updateElementContent={updateElementContent}
              onEditingChange={handleEditingChange}
              deleteElement={deleteElement}
              onChangeBackground={handleChangeBackground}
              onDuplicateSlide={handleDuplicateSlide}
              onDeleteSlide={handleDeleteSlide}
              onEditSlideWithAI={handleOpenEditSlideWithAI} // Pass renamed handler
              onEditElementWithAI={handleOpenEditElementWithAI} // Pass renamed handler
            />
          )}
        </div>
      </div>
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelected} className="hidden" />
      <ShapeMenu isOpen={shapeMenuOpen} onClose={() => setShapeMenuOpen(false)} onSelectShape={insertShape} />
      <AiSidebar
        isOpen={aiSidebarOpen}
        onClose={() => setAiSidebarOpen(false)}
        mode={aiSidebarMode}
        targetId={aiSidebarTarget.id}
        targetContent={
          aiSidebarTarget.content?.type === "image"
            ? (aiSidebarTarget.content as ImageSlideElement).src
            : (aiSidebarTarget.content as HtmlSlideElement)?.html
        }
        slideData={currentSlide}
        prompt={aiPrompt}
        onPromptChange={setAiPrompt}
        onSubmit={processAiPrompt}
        isProcessing={isAIProcessing}
      />
    </div>
  )
}
