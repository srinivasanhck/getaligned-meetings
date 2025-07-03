import type { Slide, SlideElement, SlideBackground } from "@/types"

export function convertApiSlideToInternalSlide(apiSlide: any): Slide {
  console.log("Converting API slide:", apiSlide)

  // Convert background
  const background: SlideBackground = {
    type: apiSlide.background?.type || "color",
    value: apiSlide.background?.value || "#ffffff",
    // Handle additional background properties if they exist
    ...(apiSlide.background?.imageFit && { imageFit: apiSlide.background.imageFit }),
    ...(apiSlide.background?.overlayOpacity && { overlayOpacity: apiSlide.background.overlayOpacity }),
  }

  console.log("Converted background:", background)

  // Convert elements - the API format looks like it matches our internal format already
  const elements: SlideElement[] = (apiSlide.elements || []).map((element: any) => {
    console.log("Converting element:", element)

    // The element structure from API looks compatible with our internal format
    const convertedElement = {
      ...element, // Spread all properties as they seem to match
      // Ensure required properties exist
      id: element.id || `element-${Date.now()}-${Math.random()}`,
      type: element.type || "text",
      x: element.x || 0,
      y: element.y || 0,
      width: element.width || 100,
      height: element.height || 20,
      zIndex: element.zIndex || 10,
      locked: element.locked || false,
      opacity: element.opacity || 1,
    } as SlideElement

    console.log("Converted element:", convertedElement)
    return convertedElement
  })

  const convertedSlide: Slide = {
    id: apiSlide.id,
    background,
    elements,
    titleForThumbnail: apiSlide.titleForThumbnail || apiSlide.title || "Untitled Slide",
    iconNameForThumbnail: (apiSlide.iconNameForThumbnail as any) || "file-text",
    defaultElementTextColor: apiSlide.defaultElementTextColor || "#000000",
  }

  console.log("Final converted slide:", convertedSlide)
  return convertedSlide
}
