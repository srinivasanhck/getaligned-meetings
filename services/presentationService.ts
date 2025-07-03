import { getToken } from "@/services/authService"
import type { Slide, SlideElement, TextElementProps, ImageElementProps, SlideBackground, Presentation } from "@/types"
import { DYNAMIC_BACKGROUND_COLORS } from "@/constants"

const API_BASE_URL = "https://api.getaligned.work/integration/api"

export interface SlideGenerationRequest {
  contentTopic: string
  isFirstSlide: boolean
  presentationTopicSummary: string
  slideTitle: string
  theme: {
    name: string
    accentColorPrimary: string
    bodyTextColor: string
    isDarkTheme: boolean
    overlayStyle: {
      backgroundColor: string
    }
    subtitleTextColor: string
  }
  useSearch: boolean
  visualTopic: string
}

export interface SlideContentResponse {
  heading?: string
  subheading?: string
  paragraph?: string
  bulletPoints?: string[]
  iconSuggestion?: string
  imagePrompt?: string
  imageUrl?: string
  visualPlacement?: "left" | "right" | "top" | "background" | "full" | "none"
  dataVisualization?: any
  structuredContent?: { title: string; description: string; iconKeyword?: string }[]
  keyStats?: { value: string; label: string }[]
}

export interface ExistingSlidesResponse {
  success: boolean
  data: {
    id: string
    created_at: string
    updated_at: string
    mindmap_json: {
      id: number
      title: string
      outline: Array<{
        contentTopic: string
        slideTitle: string
        visualTopic: string
      }>
    }
    slide_json: {
      presentation: Array<{
        id: string
        background: {
          type: string
          value: string
          imageFit?: string
          overlayOpacity?: number
        }
        defaultElementTextColor: string
        elements: Array<{
          id: string
          type: string
          content?: string
          x: number
          y: number
          width: number
          height: number
          fontSize?: number
          fontWeight?: string
          color?: string
          textAlign?: string
          zIndex?: number
          locked?: boolean
          opacity?: number
          paddingTop?: number
          paddingRight?: number
          paddingBottom?: number
          paddingLeft?: number
          lineHeight?: number
          semanticType?: string
          [key: string]: any
        }>
        titleForThumbnail: string
        iconNameForThumbnail?: string
      }>
    }
    user_id: string | null
  }
}

export interface SavePresentationResponse {
  message: string
  slide_requests_id: string
  success: boolean
}

// FIXED LAYOUT CONSTANTS - Consistent spacing
const Gutter = 1 // % - Minimal edge spacing
const VisualTextGap = 3 // % - Adequate gap between image and text
const SLIDE_MAX_HEIGHT = 96 // % - Leave small bottom margin
const MIN_FONT_SIZE = 12 // px - Minimum readable font size

// IMPROVED SPACING CONSTANTS
const STANDARD_LINE_HEIGHT = 1.5 // Better line height for readability
const ELEMENT_SPACING = 3 // % - CONSISTENT spacing between all elements
const SECTION_SPACING = 4 // % - Larger spacing between sections
const MIN_ELEMENT_HEIGHT = 5 // % - Minimum height for any text element

// PADDING CONSTANTS - More generous for better appearance
const TEXT_PADDING = 8 // px - Comfortable padding
const TITLE_PADDING = 12 // px - Extra padding for titles

/**
 * FIXED: More accurate text height estimation with proper rounding
 */
const estimateTextHeight = (
  content: string,
  fontSize: number,
  width: number,
  lineHeight: number = STANDARD_LINE_HEIGHT,
): number => {
  if (!content || content.trim().length === 0) return MIN_ELEMENT_HEIGHT

  // More accurate character width calculation
  const avgCharWidth = fontSize * 0.55 // Slightly more accurate
  const availableWidthPx = (width / 100) * 800 // Assuming slide width ~800px
  const effectiveWidth = availableWidthPx - TEXT_PADDING * 2 // Account for padding
  const charsPerLine = Math.max(20, Math.floor(effectiveWidth / avgCharWidth)) // Minimum 20 chars per line

  // Account for word wrapping - add 20% buffer for natural breaks
  const estimatedLines = Math.ceil((content.length * 1.2) / charsPerLine)
  const textHeightPx = estimatedLines * fontSize * lineHeight

  // Convert to percentage and add padding
  const textHeightPercent = (textHeightPx / 600) * 100
  const paddingPercent = ((TEXT_PADDING * 2) / 600) * 100
  const totalHeight = textHeightPercent + paddingPercent

  // FIXED: Round to 1 decimal place and ensure minimum height
  return Math.max(MIN_ELEMENT_HEIGHT, Math.round(totalHeight * 10) / 10)
}

/**
 * FIXED: Layout calculation with proper spacing and positioning
 */
const calculateOptimalLayout = (rawContent: SlideContentResponse, isFirstSlide: boolean) => {
  const hasVisual = !!(rawContent.imageUrl || rawContent.dataVisualization)
  const visualPlacement = rawContent.visualPlacement || "none"

  const layout = {
    textX: Gutter + 1, // Small additional margin
    textY: isFirstSlide ? 15 : 3, // Better starting position
    textWidth: 100 - 2 * (Gutter + 1),
    visualX: 0,
    visualY: 0,
    visualWidth: 0,
    visualHeight: 0,
    hasVisualElement: false,
    availableTextHeight: 0,
  }

  if (isFirstSlide) {
    layout.availableTextHeight = 70
    return layout
  }

  if (hasVisual && (visualPlacement === "left" || visualPlacement === "right")) {
    const visualWidth = 45 // % - Good balance

    if (visualPlacement === "left") {
      layout.visualX = 0
      layout.visualY = 0
      layout.textX = visualWidth + VisualTextGap // Proper gap
    } else {
      layout.visualX = 100 - visualWidth
      layout.visualY = 0
      layout.textX = Gutter + 1 // Consistent left margin
    }

    layout.visualWidth = visualWidth
    layout.visualHeight = 100 // Full height
    layout.textWidth = 100 - visualWidth - VisualTextGap - (Gutter + 1)
    layout.textY = 3 // Consistent top margin
    layout.hasVisualElement = true
    layout.availableTextHeight = 90 // Leave bottom margin
  } else if (hasVisual && visualPlacement === "top") {
    layout.visualX = 0
    layout.visualY = 0
    layout.visualWidth = 100
    layout.visualHeight = 40
    layout.textY = layout.visualHeight + VisualTextGap
    layout.hasVisualElement = true
    layout.availableTextHeight = 100 - layout.textY - 3
  } else {
    layout.textX = Gutter + 2
    layout.textWidth = 100 - 2 * (Gutter + 2)
    layout.availableTextHeight = SLIDE_MAX_HEIGHT - layout.textY
  }

  return layout
}

/**
 * FIXED: Element creation with consistent spacing and proper positioning
 */
const mapRawContentToElements = (
  rawContent: SlideContentResponse,
  slideId: string,
  isFirstSlide: boolean,
  theme: any,
): SlideElement[] => {
  const elements: SlideElement[] = []
  let elementIdCounter = 0

  const layout = calculateOptimalLayout(rawContent, isFirstSlide)
  let currentY = layout.textY

  console.log("=== FIXED SLIDE LAYOUT CALCULATION ===")
  console.log("Layout calculated:", layout)
  console.log("Raw content received:", {
    heading: rawContent.heading,
    subheading: rawContent.subheading,
    paragraph: rawContent.paragraph,
    bulletPoints: rawContent.bulletPoints,
    structuredContent: rawContent.structuredContent,
    keyStats: rawContent.keyStats,
    imageUrl: rawContent.imageUrl ? "Present" : "None",
    visualPlacement: rawContent.visualPlacement,
  })

  // Handle first slide (title slide)
  if (isFirstSlide) {
    if (rawContent.heading) {
      const headingHeight = estimateTextHeight(rawContent.heading, 40, layout.textWidth)
      const headingElement = {
        id: `${slideId}-el-${elementIdCounter++}`,
        type: "text",
        content: rawContent.heading,
        x: layout.textX,
        y: currentY,
        width: layout.textWidth,
        height: headingHeight,
        fontSize: 40,
        fontWeight: "bold",
        textAlign: "center",
        zIndex: 10,
        locked: false,
        opacity: 1,
        color: theme.accentColorPrimary,
        semanticType: "title",
        paddingTop: TITLE_PADDING,
        paddingBottom: TITLE_PADDING,
        paddingLeft: TEXT_PADDING,
        paddingRight: TEXT_PADDING,
        lineHeight: STANDARD_LINE_HEIGHT,
      } as TextElementProps

      elements.push(headingElement)
      console.log("Created title element:", headingElement)
      currentY += headingHeight + SECTION_SPACING
    }

    if (rawContent.subheading) {
      const subheadingHeight = estimateTextHeight(rawContent.subheading, 24, layout.textWidth)
      const subheadingElement = {
        id: `${slideId}-el-${elementIdCounter++}`,
        type: "text",
        content: rawContent.subheading,
        x: layout.textX,
        y: currentY,
        width: layout.textWidth,
        height: subheadingHeight,
        fontSize: 24,
        fontWeight: "normal",
        textAlign: "center",
        zIndex: 10,
        locked: false,
        opacity: 1,
        color: theme.subtitleTextColor,
        semanticType: "heading2",
        paddingTop: TEXT_PADDING,
        paddingBottom: TEXT_PADDING,
        paddingLeft: TEXT_PADDING,
        paddingRight: TEXT_PADDING,
        lineHeight: STANDARD_LINE_HEIGHT,
      } as TextElementProps

      elements.push(subheadingElement)
      console.log("Created subtitle element:", subheadingElement)
    }

    console.log("=== TITLE SLIDE COMPLETE ===")
    return elements
  }

  // Add visual element with full height
  if (layout.hasVisualElement) {
    if (rawContent.imageUrl) {
      console.log("Creating FULL HEIGHT image element")
      const imageSrc = rawContent.imageUrl.startsWith("http")
        ? rawContent.imageUrl
        : `data:image/jpeg;base64,${rawContent.imageUrl}`

      const imageElement = {
        id: `${slideId}-el-${elementIdCounter++}`,
        type: "image",
        src: imageSrc,
        alt: rawContent.imagePrompt || "Generated image",
        x: layout.visualX,
        y: layout.visualY,
        width: layout.visualWidth,
        height: layout.visualHeight,
        objectFit: "cover",
        zIndex: 5,
        locked: false,
        opacity: 1,
      } as ImageElementProps

      elements.push(imageElement)
      console.log("Created FULL HEIGHT image element:", {
        id: imageElement.id,
        type: imageElement.type,
        position: { x: imageElement.x, y: imageElement.y },
        dimensions: { width: imageElement.width, height: imageElement.height },
        src: imageElement.src.substring(0, 50) + "...",
        alt: imageElement.alt,
        objectFit: imageElement.objectFit,
        zIndex: imageElement.zIndex,
        locked: imageElement.locked,
        opacity: imageElement.opacity,
      })
    } else if (rawContent.dataVisualization) {
      const chartElement = {
        id: `${slideId}-el-${elementIdCounter++}`,
        type: "chart",
        chartProperties: rawContent.dataVisualization,
        x: layout.visualX,
        y: layout.visualY,
        width: layout.visualWidth,
        height: layout.visualHeight,
        zIndex: 5,
        locked: false,
        opacity: 1,
      } as any

      elements.push(chartElement)
      console.log("Created FULL HEIGHT chart element:", {
        id: chartElement.id,
        type: chartElement.type,
        position: { x: chartElement.x, y: chartElement.y },
        dimensions: { width: chartElement.width, height: chartElement.height },
        chartProperties: chartElement.chartProperties,
        zIndex: chartElement.zIndex,
        locked: chartElement.locked,
        opacity: chartElement.opacity,
      })
    }
  }

  // FIXED: Content elements with consistent spacing
  const remainingHeight = layout.availableTextHeight
  let usedHeight = 0

  // Prepare content elements with proper sizing
  const contentElements = []
  if (rawContent.heading) contentElements.push({ type: "heading", content: rawContent.heading, fontSize: 26 })
  if (rawContent.subheading) contentElements.push({ type: "subheading", content: rawContent.subheading, fontSize: 20 })

  // Handle structured content
  if (rawContent.structuredContent && rawContent.structuredContent.length > 0) {
    rawContent.structuredContent.forEach((item, index) => {
      contentElements.push({
        type: "structured-title",
        content: item.title,
        fontSize: 18,
        isSection: true, // Mark as section for extra spacing
      })
      contentElements.push({
        type: "structured-desc",
        content: item.description,
        fontSize: 15,
      })
    })
  } else if (rawContent.paragraph) {
    contentElements.push({ type: "paragraph", content: rawContent.paragraph, fontSize: 16 })
  } else if (rawContent.bulletPoints && rawContent.bulletPoints.length > 0) {
    contentElements.push({ type: "bullets", content: rawContent.bulletPoints.join("\n"), fontSize: 16 })
  }

  // Add key stats
  if (rawContent.keyStats && rawContent.keyStats.length > 0) {
    rawContent.keyStats.forEach((stat) => {
      contentElements.push({ type: "stat-value", content: stat.value, fontSize: 28 })
      contentElements.push({ type: "stat-label", content: stat.label, fontSize: 14 })
    })
  }

  console.log("Content elements to render:", contentElements.length)
  console.log("Text area details:", {
    x: layout.textX,
    y: layout.textY,
    width: layout.textWidth,
    availableHeight: remainingHeight,
  })

  // Calculate total height needed with proper spacing
  let totalEstimatedHeight = 0
  contentElements.forEach((element, index) => {
    const elementHeight = estimateTextHeight(element.content, element.fontSize, layout.textWidth)
    totalEstimatedHeight += elementHeight

    // Add spacing (section spacing for titles, regular spacing for others)
    if (index < contentElements.length - 1) {
      totalEstimatedHeight += (element as any).isSection ? SECTION_SPACING : ELEMENT_SPACING
    }
  })

  // Scale if needed
  let scaleFactor = 1
  if (totalEstimatedHeight > remainingHeight) {
    scaleFactor = Math.max(0.8, remainingHeight / totalEstimatedHeight)
    console.log("Content scaling required. Factor:", scaleFactor)
    console.log("Total estimated height:", totalEstimatedHeight, "Available height:", remainingHeight)
  }

  // FIXED: Create elements with consistent positioning
  contentElements.forEach((element, index) => {
    const scaledFontSize = Math.max(MIN_FONT_SIZE, element.fontSize * scaleFactor)
    const elementHeight = estimateTextHeight(element.content, scaledFontSize, layout.textWidth)

    // Check boundaries
    if (currentY + elementHeight > SLIDE_MAX_HEIGHT) {
      console.log("⚠️ SKIPPING ELEMENT - Exceeds slide bounds:", {
        elementType: element.type,
        requiredHeight: elementHeight,
        currentY: currentY,
        maxHeight: SLIDE_MAX_HEIGHT,
      })
      return
    }

    // Determine styling
    let textAlign: TextElementProps["textAlign"] = "left"
    let fontWeight = "normal"
    let color = theme.bodyTextColor
    let semanticType = "paragraph"
    let paddingTop = TEXT_PADDING
    let paddingBottom = TEXT_PADDING

    switch (element.type) {
      case "heading":
        textAlign = "left"
        fontWeight = "bold"
        color = theme.accentColorPrimary
        semanticType = "heading1"
        paddingTop = TITLE_PADDING
        paddingBottom = TITLE_PADDING
        break
      case "subheading":
        textAlign = "left"
        fontWeight = "600"
        color = theme.subtitleTextColor
        semanticType = "heading2"
        paddingTop = TITLE_PADDING
        paddingBottom = TEXT_PADDING
        break
      case "structured-title":
        fontWeight = "bold"
        color = theme.subtitleTextColor
        semanticType = "heading3"
        paddingTop = TITLE_PADDING
        paddingBottom = TEXT_PADDING
        break
      case "stat-value":
        textAlign = "center"
        fontWeight = "bold"
        color = theme.accentColorPrimary
        break
      case "stat-label":
        textAlign = "center"
        color = theme.bodyTextColor
        break
    }

    const textElement = {
      id: `${slideId}-el-${elementIdCounter++}`,
      type: "text",
      content: element.content,
      x: layout.textX,
      y: Math.round(currentY * 10) / 10, // FIXED: Round Y position
      width: layout.textWidth,
      height: Math.round(elementHeight * 10) / 10, // FIXED: Round height
      fontSize: Math.round(scaledFontSize),
      fontWeight: fontWeight,
      textAlign: textAlign,
      zIndex: 10,
      locked: false,
      opacity: 1,
      color: color,
      semanticType: semanticType,
      paddingTop: paddingTop,
      paddingBottom: paddingBottom,
      paddingLeft: TEXT_PADDING,
      paddingRight: TEXT_PADDING,
      lineHeight: STANDARD_LINE_HEIGHT,
      ...(element.type === "bullets" && {
        isList: true,
        listType: "bullet",
        paddingLeft: TEXT_PADDING + 16,
      }),
    } as TextElementProps

    elements.push(textElement)

    // COMPREHENSIVE CONSOLE LOGGING
    console.log(`✅ Created text element ${index + 1}:`, {
      id: textElement.id,
      type: textElement.type,
      content: textElement.content.substring(0, 100) + (textElement.content.length > 100 ? "..." : ""),
      position: { x: textElement.x, y: textElement.y },
      dimensions: { width: textElement.width, height: textElement.height },
      styling: {
        fontSize: textElement.fontSize,
        fontWeight: textElement.fontWeight,
        color: textElement.color,
        textAlign: textElement.textAlign,
        lineHeight: textElement.lineHeight,
      },
      padding: {
        top: textElement.paddingTop,
        right: textElement.paddingRight,
        bottom: textElement.paddingBottom,
        left: textElement.paddingLeft,
      },
      semanticType: textElement.semanticType,
      zIndex: textElement.zIndex,
      locked: textElement.locked,
      opacity: textElement.opacity,
    })

    // FIXED: Consistent spacing calculation
    const spacingToAdd = (element as any).isSection ? SECTION_SPACING : ELEMENT_SPACING
    currentY += elementHeight + spacingToAdd
    usedHeight += elementHeight + spacingToAdd
  })

  console.log("=== FINAL LAYOUT SUMMARY ===")
  console.log("Total elements created:", elements.length)
  console.log("Layout efficiency:", {
    startY: layout.textY,
    finalY: Math.round(currentY * 10) / 10,
    usedHeight: Math.round(usedHeight * 10) / 10,
    availableHeight: remainingHeight,
    remainingSpace: Math.round((remainingHeight - usedHeight) * 10) / 10,
    utilizationPercent: Math.round((usedHeight / remainingHeight) * 100),
  })

  console.log(
    "All created elements summary:",
    elements.map((el, idx) => ({
      index: idx,
      id: el.id,
      type: el.type,
      position: { x: el.x, y: el.y },
      dimensions: { width: el.width, height: el.height },
      content: el.type === "text" ? (el as any).content?.substring(0, 30) + "..." : "N/A",
      fontSize: el.type === "text" ? (el as any).fontSize : "N/A",
      color: el.type === "text" ? (el as any).color : "N/A",
    })),
  )

  return elements
}

export const presentationService = {
  // Check if slides already exist for a request ID
  getExistingSlides: async (requestId: string): Promise<ExistingSlidesResponse> => {
    try {
      const token = getToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const response = await fetch(`${API_BASE_URL}/get_slide_request/${requestId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("SLIDES_NOT_FOUND")
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.message || `HTTP Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching existing slides:", error)
      throw error
    }
  },

  // Generate a single slide content
  generateSlideContent: async (request: SlideGenerationRequest): Promise<Slide> => {
    try {
      const token = getToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const response = await fetch(`${API_BASE_URL}/generate_slide_content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.message || `HTTP Error: ${response.status} ${response.statusText}`)
      }

      const rawContent: SlideContentResponse = await response.json()

      // Generate slide ID
      const slideId = `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      console.log("=== STARTING SLIDE GENERATION ===")
      console.log("Slide ID:", slideId)
      console.log("Is first slide:", request.isFirstSlide)
      console.log("Theme:", request.theme)
      console.log("Raw content from API:", rawContent)

      // Map raw content to slide elements with FIXED layout
      const elements = mapRawContentToElements(rawContent, slideId, request.isFirstSlide, request.theme)

      console.log("=== SLIDE GENERATION COMPLETE ===")
      console.log("Total elements created:", elements.length)

      // Determine background
      let slideBackground: SlideBackground = {
        type: "color",
        value: DYNAMIC_BACKGROUND_COLORS[Math.floor(Math.random() * DYNAMIC_BACKGROUND_COLORS.length)],
        overlayOpacity: 0.5,
      }

      // Handle background image
      if (
        rawContent.imageUrl &&
        (rawContent.visualPlacement === "background" || rawContent.visualPlacement === "full")
      ) {
        slideBackground = {
          type: "image",
          value: rawContent.imageUrl.startsWith("http")
            ? rawContent.imageUrl
            : `data:image/jpeg;base64,${rawContent.imageUrl}`,
          imageFit: "cover",
          overlayOpacity: 0.5,
        }
      }

      // Create slide object
      const slide: Slide = {
        id: slideId,
        elements,
        background: slideBackground,
        titleForThumbnail: rawContent.heading || request.slideTitle,
        iconNameForThumbnail: rawContent.imageUrl ? "photo" : "documentText",
        defaultElementTextColor: request.theme.bodyTextColor,
      }

      console.log("Final slide object created:", {
        id: slide.id,
        elementsCount: slide.elements.length,
        background: slide.background,
        titleForThumbnail: slide.titleForThumbnail,
        iconNameForThumbnail: slide.iconNameForThumbnail,
        defaultElementTextColor: slide.defaultElementTextColor,
      })

      return slide
    } catch (error) {
      console.error("Error generating slide content:", error)
      throw error
    }
  },

  // Save the complete presentation to backend
  savePresentation: async (requestId: string, presentation: Presentation): Promise<SavePresentationResponse> => {
    try {
      const token = getToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const requestBody = {
        slide_json: {
          presentation: presentation,
        },
      }

      console.log("Saving presentation with fixed layout:", {
        requestId,
        presentationLength: presentation.length,
        totalElements: presentation.reduce((sum, slide) => sum + slide.elements.length, 0),
      })

      const response = await fetch(`${API_BASE_URL}/update_slide_data/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.message || `HTTP Error: ${response.status} ${response.statusText}`)
      }

      const data: SavePresentationResponse = await response.json()
      console.log("Presentation saved successfully:", data)
      return data
    } catch (error) {
      console.error("Error saving presentation:", error)
      throw error
    }
  },

  // Upload image file for backgrounds
  uploadImage: async (file: File): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append("file", file, file.name)

      const response = await fetch("https://api.getaligned.work/ppt/api/v1/files/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error("Upload failed: " + (result.message || "Unknown error"))
      }

      return result.url
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    }
  },
}
