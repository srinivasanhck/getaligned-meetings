// Image reference tracking system

export interface ImageLocation {
  slideId: string
  type: "background" | "element"
  elementId?: string // only for element images
}

export interface ImageReference {
  localUrl: string // base64 data URL
  file?: File // original file for upload
  locations: ImageLocation[]
  uploaded?: boolean
  serverUrl?: string
}

export class ImageTracker {
  private imageReferences: Map<string, ImageReference> = new Map()

  // Add a new image reference
  addImage(localUrl: string, file: File, location: ImageLocation): void {
    const existing = this.imageReferences.get(localUrl)

    if (existing) {
      // Add new location if it doesn't already exist
      const locationExists = existing.locations.some(
        (loc) => loc.slideId === location.slideId && loc.type === location.type && loc.elementId === location.elementId,
      )

      if (!locationExists) {
        existing.locations.push(location)
      }
    } else {
      // Create new reference
      this.imageReferences.set(localUrl, {
        localUrl,
        file,
        locations: [location],
        uploaded: false,
      })
    }
  }

  // Remove an image location
  removeImageLocation(localUrl: string, location: ImageLocation): void {
    const reference = this.imageReferences.get(localUrl)
    if (!reference) return

    reference.locations = reference.locations.filter(
      (loc) =>
        !(loc.slideId === location.slideId && loc.type === location.type && loc.elementId === location.elementId),
    )

    // Remove the entire reference if no locations remain
    if (reference.locations.length === 0) {
      this.imageReferences.delete(localUrl)
    }
  }

  // Get all unique local images that need to be uploaded
  getImagesToUpload(): ImageReference[] {
    return Array.from(this.imageReferences.values()).filter((ref) => !ref.uploaded && ref.file)
  }

  // Mark an image as uploaded with its server URL
  markAsUploaded(localUrl: string, serverUrl: string): void {
    const reference = this.imageReferences.get(localUrl)
    if (reference) {
      reference.uploaded = true
      reference.serverUrl = serverUrl
    }
  }

  // Get server URL for a local URL
  getServerUrl(localUrl: string): string | null {
    const reference = this.imageReferences.get(localUrl)
    return reference?.serverUrl || null
  }

  // Get all image references (for debugging)
  getAllReferences(): ImageReference[] {
    return Array.from(this.imageReferences.values())
  }

  // Create URL mapping for replacing in slide data
  createUrlMapping(): Record<string, string> {
    const mapping: Record<string, string> = {}

    for (const [localUrl, reference] of this.imageReferences) {
      if (reference.uploaded && reference.serverUrl) {
        mapping[localUrl] = reference.serverUrl
      }
    }

    return mapping
  }

  // Check if URL is a local image (base64 data URL)
  static isLocalImage(url: string): boolean {
    return url.startsWith("data:image/")
  }

  // Extract all local image URLs from slide data
  static extractLocalImageUrls(slides: any[]): string[] {
    const localUrls = new Set<string>()

    slides.forEach((slide) => {
      // Check background
      if (slide.background && this.isLocalImage(slide.background)) {
        // Extract URL from CSS background
        const urlMatch = slide.background.match(/url$$['"]?([^'"]+)['"]?$$/)
        if (urlMatch && this.isLocalImage(urlMatch[1])) {
          localUrls.add(urlMatch[1])
        }
      }

      // Check elements
      slide.content?.forEach((element: any) => {
        if (element.type === "image" && element.src && this.isLocalImage(element.src)) {
          localUrls.add(element.src)
        }
      })
    })

    return Array.from(localUrls)
  }

  // Replace URLs in slide data using mapping
  static replaceUrlsInSlides(slides: any[], urlMapping: Record<string, string>): any[] {
    return slides.map((slide) => ({
      ...slide,
      background: this.replaceUrlInString(slide.background, urlMapping),
      content: slide.content?.map((element: any) => {
        if (element.type === "image" && element.src) {
          return {
            ...element,
            src: urlMapping[element.src] || element.src,
          }
        }
        return element
      }),
    }))
  }

  // Replace URLs in a string (for background CSS)
  private static replaceUrlInString(str: string, urlMapping: Record<string, string>): string {
    if (!str) return str

    let result = str
    for (const [localUrl, serverUrl] of Object.entries(urlMapping)) {
      result = result.replace(localUrl, serverUrl)
    }
    return result
  }
}

// Global instance
export const imageTracker = new ImageTracker()
