export interface SlideBackground {
  type: "color" | "gradient" | "image"
  value: string
  imageFit?: "cover" | "contain"
  overlayOpacity?: number
}

export interface Slide {
  id: string
  titleForThumbnail?: string
  elements: SlideElement[]
  background: SlideBackground
  defaultElementTextColor?: string
}

export interface SlideElement {
  id: string
  type: "text" | "image" | "chart" | "shape"
  x: number
  y: number
  width: number
  height: number
  zIndex?: number
  locked?: boolean
  opacity?: number
}

export interface TextElementProps extends SlideElement {
  type: "text"
  content: string
  fontSize: number
  fontWeight?: string
  color?: string
  textAlign?: "left" | "center" | "right"
  lineHeight?: number
  letterSpacing?: number
  paddingTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
  semanticType?: string
}

export interface ImageElementProps extends SlideElement {
  type: "image"
  src: string
  alt?: string
  objectFit?: "cover" | "contain" | "fill"
}

export interface ChartElementProps extends SlideElement {
  type: "chart"
  chartType: "bar" | "line" | "pie" | "doughnut"
  data: any
  options?: any
}

export interface ShapeElementProps extends SlideElement {
  type: "shape"
  shapeType: "rectangle" | "circle" | "triangle"
  fill?: string
  stroke?: string
  strokeWidth?: number
}

export interface ParentDimensions {
  width: number
  height: number
}

export interface CanvasInfo {
  width: number
  height: number
  scale: number
}

// Additional types for presentation management
export interface Presentation {
  id: string
  title: string
  slides: Slide[]
  createdAt: string
  updatedAt: string
}

export interface PresentationRequest {
  id: string
  title: string
  status: "pending" | "processing" | "completed" | "failed"
  slides?: Slide[]
  createdAt: string
}
