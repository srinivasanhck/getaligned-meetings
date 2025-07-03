"use client"

import { useCallback } from "react"

import { useEffect } from "react"

import { useState } from "react"

import { useRef } from "react"

/**
 * Slide Canvas Manager
 * Handles viewport-based coordinate system and zoom-aware calculations
 */

export interface SlideCanvasInfo {
  width: number // actual rendered slide width in pixels
  height: number // actual rendered slide height in pixels
  scale: number // current zoom/scale factor
  offsetX: number // canvas offset from viewport
  offsetY: number // canvas offset from viewport
  zoomLevel: number // browser zoom level
}

export interface ViewportCoordinates {
  x: number // pixels from left edge of slide
  y: number // pixels from top edge of slide
  width: number // pixel width
  height: number // pixel height
}

export class SlideCanvasManager {
  private canvasRef: HTMLDivElement | null = null
  private resizeObserver: ResizeObserver | null = null
  private callbacks: Set<(info: SlideCanvasInfo) => void> = new Set()

  // Standard slide dimensions (16:9 ratio) - 1920x1080
  static readonly SLIDE_ASPECT_RATIO = 16 / 9
  static readonly BASE_WIDTH = 1920
  static readonly BASE_HEIGHT = 1080

  constructor() {
    this.setupResizeObserver()
  }

  setCanvasRef(ref: HTMLDivElement | null) {
    if (this.canvasRef === ref) return

    this.canvasRef = ref

    if (ref && this.resizeObserver) {
      this.resizeObserver.observe(ref)
    }

    this.notifyCallbacks()
  }

  getCanvasInfo(): SlideCanvasInfo {
    if (!this.canvasRef) {
      return this.getDefaultCanvasInfo()
    }

    const rect = this.canvasRef.getBoundingClientRect()
    const zoomLevel = this.detectZoomLevel()
    const scale = this.calculateScale(rect, zoomLevel)

    return {
      width: rect.width,
      height: rect.height,
      scale,
      offsetX: rect.left,
      offsetY: rect.top,
      zoomLevel,
    }
  }

  private getDefaultCanvasInfo(): SlideCanvasInfo {
    return {
      width: SlideCanvasManager.BASE_WIDTH,
      height: SlideCanvasManager.BASE_HEIGHT,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      zoomLevel: 1,
    }
  }

  private calculateScale(rect: DOMRect, zoomLevel: number): number {
    // Calculate how much the slide is scaled compared to base dimensions
    const widthScale = rect.width / SlideCanvasManager.BASE_WIDTH
    const heightScale = rect.height / SlideCanvasManager.BASE_HEIGHT

    // Use the smaller scale to maintain aspect ratio
    const baseScale = Math.min(widthScale, heightScale)

    // Account for browser zoom
    return baseScale * zoomLevel
  }

  private detectZoomLevel(): number {
    // Multiple methods to detect zoom level
    const devicePixelRatio = window.devicePixelRatio || 1

    // Method 1: Compare outer/inner width (works for most browsers)
    const widthZoom = window.outerWidth / window.innerWidth

    // Method 2: Use device pixel ratio as fallback
    const pixelRatioZoom = devicePixelRatio

    // Use width zoom if available, otherwise fall back to pixel ratio
    return !isNaN(widthZoom) && widthZoom > 0 ? widthZoom : pixelRatioZoom
  }

  private setupResizeObserver() {
    if (typeof window === "undefined") return

    this.resizeObserver = new ResizeObserver((entries) => {
      this.notifyCallbacks()
    })
  }

  // Subscribe to canvas info changes
  subscribe(callback: (info: SlideCanvasInfo) => void) {
    this.callbacks.add(callback)

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback)
    }
  }

  private notifyCallbacks() {
    const info = this.getCanvasInfo()
    this.callbacks.forEach((callback) => callback(info))
  }

  // Coordinate conversion utilities
  static coordinateConverter = {
    // Convert percentage to viewport pixels
    percentToViewport: (percent: number, dimension: number): number => {
      return (percent / 100) * dimension
    },

    // Convert viewport pixels to percentage
    viewportToPercent: (pixels: number, dimension: number): number => {
      return (pixels / dimension) * 100
    },

    // Convert element percentage coordinates to pixel coordinates
    elementToPixels: (
      element: { x: number; y: number; width: number; height: number },
      canvasInfo: SlideCanvasInfo,
    ): ViewportCoordinates => {
      return {
        x: SlideCanvasManager.coordinateConverter.percentToViewport(element.x, canvasInfo.width),
        y: SlideCanvasManager.coordinateConverter.percentToViewport(element.y, canvasInfo.height),
        width: SlideCanvasManager.coordinateConverter.percentToViewport(element.width, canvasInfo.width),
        height: SlideCanvasManager.coordinateConverter.percentToViewport(element.height, canvasInfo.height),
      }
    },

    // Convert pixel coordinates back to element percentage coordinates
    pixelsToElement: (
      coords: ViewportCoordinates,
      canvasInfo: SlideCanvasInfo,
    ): { x: number; y: number; width: number; height: number } => {
      return {
        x: SlideCanvasManager.coordinateConverter.viewportToPercent(coords.x, canvasInfo.width),
        y: SlideCanvasManager.coordinateConverter.viewportToPercent(coords.y, canvasInfo.height),
        width: SlideCanvasManager.coordinateConverter.viewportToPercent(coords.width, canvasInfo.width),
        height: SlideCanvasManager.coordinateConverter.viewportToPercent(coords.height, canvasInfo.height),
      }
    },

    // Clamp coordinates within slide boundaries
    clampToSlide: (coords: { x: number; y: number; width: number; height: number }) => {
      return {
        x: Math.max(0, Math.min(100 - coords.width, coords.x)),
        y: Math.max(0, Math.min(100 - coords.height, coords.y)),
        width: Math.max(1, Math.min(100 - coords.x, coords.width)),
        height: Math.max(1, Math.min(100 - coords.y, coords.height)),
      }
    },

    // Handle zoom-aware mouse/touch coordinates
    screenToSlide: (screenX: number, screenY: number, canvasInfo: SlideCanvasInfo): { x: number; y: number } => {
      const relativeX = screenX - canvasInfo.offsetX
      const relativeY = screenY - canvasInfo.offsetY

      return {
        x: SlideCanvasManager.coordinateConverter.viewportToPercent(relativeX, canvasInfo.width),
        y: SlideCanvasManager.coordinateConverter.viewportToPercent(relativeY, canvasInfo.height),
      }
    },
  }

  // Cleanup
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    this.callbacks.clear()
    this.canvasRef = null
  }
}

// Hook for using slide canvas manager in React components
export const useSlideCanvas = () => {
  const managerRef = useRef<SlideCanvasManager | null>(null)
  const [canvasInfo, setCanvasInfo] = useState<SlideCanvasInfo | null>(null)

  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new SlideCanvasManager()
    }

    const unsubscribe = managerRef.current.subscribe(setCanvasInfo)

    return () => {
      unsubscribe()
      if (managerRef.current) {
        managerRef.current.destroy()
        managerRef.current = null
      }
    }
  }, [])

  const setCanvasRef = useCallback((ref: HTMLDivElement | null) => {
    if (managerRef.current) {
      managerRef.current.setCanvasRef(ref)
    }
  }, [])

  return {
    canvasInfo,
    setCanvasRef,
    manager: managerRef.current,
  }
}
