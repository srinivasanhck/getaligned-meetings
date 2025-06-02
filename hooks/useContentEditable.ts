"use client"

import type React from "react"

import { useRef, useCallback, useEffect } from "react"

export function useContentEditable(
  value: string,
  onChange: (value: string) => void,
  onBlur?: () => void,
  onKeyDown?: (e: React.KeyboardEvent) => void,
) {
  const ref = useRef<HTMLDivElement>(null)
  const isInitialized = useRef(false)

  // Initialize content
  useEffect(() => {
    if (ref.current && !isInitialized.current) {
      ref.current.textContent = value
      isInitialized.current = true
    }
  }, [value])

  // Save selection state
  const saveSelection = useCallback(() => {
    if (window.getSelection) {
      const sel = window.getSelection()
      if (sel && sel.getRangeAt && sel.rangeCount) {
        return sel.getRangeAt(0)
      }
    }
    return null
  }, [])

  // Restore selection state
  const restoreSelection = useCallback((range: Range | null) => {
    if (range && window.getSelection) {
      const sel = window.getSelection()
      if (sel) {
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }
  }, [])

  // Handle input changes
  const handleInput = useCallback(() => {
    if (ref.current) {
      const newValue = ref.current.textContent || ""
      onChange(newValue)
    }
  }, [onChange])

  // Handle blur event
  const handleBlur = useCallback(() => {
    if (onBlur) {
      onBlur()
    }
  }, [onBlur])

  // Handle keydown event
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (onKeyDown) {
        onKeyDown(e)
      }
    },
    [onKeyDown],
  )

  return {
    ref,
    handleInput,
    handleBlur,
    handleKeyDown,
    saveSelection,
    restoreSelection,
  }
}
