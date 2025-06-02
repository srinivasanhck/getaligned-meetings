/**
 * Unified Styling System
 *
 * This module provides consistent styling functions and constants
 * that are shared between the SlideViewer and the Editor components.
 *
 * Any styling logic should be defined here to ensure consistency.
 */

// Slide dimensions (16:9 aspect ratio)
export const SLIDE_WIDTH = 960
export const SLIDE_HEIGHT = 540

// Font sizes
export const FONT_SIZES = {
  heading: {
    h1: "40px",
    h2: "32px",
    h3: "24px",
  },
  paragraph: "16px",
  list: "16px",
  table: "14px",
}

// Spacing
export const SPACING = {
  list: {
    itemGap: "8px",
    indentation: "1.5rem",
  },
  paragraph: {
    lineHeight: 1.5,
  },
}

// Convert percentage string to pixel number
export function percentToPixel(percent: string | undefined, dimension: number): number {
  if (!percent) return 0
  if (!percent.endsWith("%")) return Number.parseFloat(percent)
  return (Number.parseFloat(percent) / 100) * dimension
}

// Convert pixel number to percentage string
export function pixelToPercent(pixel: number, dimension: number): string {
  return `${(pixel / dimension) * 100}%`
}

// Extract numeric value from CSS size
export function extractSize(size: string | undefined): number {
  if (!size) return 0
  return Number.parseInt(size.replace(/px|%|em|rem/g, ""))
}

// Get background style based on background type
export function getBackgroundStyle(background: { type: string; value: string } | undefined) {
  if (!background) {
    return { backgroundColor: "#ffffff" }
  }

  switch (background.type) {
    case "gradient":
      return { background: background.value }
    case "image":
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    case "color":
    default:
      return { backgroundColor: background.value || "#ffffff" }
  }
}

// Create a style object with all properties preserved
export function createStyleObject(styleObj: Record<string, any> | undefined): Record<string, any> {
  if (!styleObj) return {}
  return { ...styleObj }
}

// Deep clone an object to avoid reference issues
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}
