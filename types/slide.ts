import type React from "react"
export interface BaseSlideElement {
  id: string
  x: number
  y: number
  width: number
  height: number
  type?: string // To distinguish element types, e.g., 'text', 'image', 'shape'
}

export interface HtmlSlideElement extends BaseSlideElement {
  type?: "text" | "shape" | "table" | "list" | "heading | image" // More specific types
  html: string
}

export interface ImageSlideElement extends BaseSlideElement {
  type: "image"
  src: string
  alt?: string
  caption?: string
  style?: React.CSSProperties // For direct styling of the image
  html?: never // Ensure html is not used for image types
}

export type SlideElement = HtmlSlideElement | ImageSlideElement

export interface Slide {
  slide_id: string // Changed from id
  background: string
  content: SlideElement[] // Changed from elements
}

