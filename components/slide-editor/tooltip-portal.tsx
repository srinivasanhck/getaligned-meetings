"use client"

import type { ReactNode } from "react"
import { useState, useRef, useEffect } from "react"

interface TooltipPortalProps {
  children: ReactNode
  content: string
  delay?: number
}

export function TooltipPortal({ children, content, delay = 300 }: TooltipPortalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8,
      })
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      <div ref={triggerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative">
        {children}
      </div>

      {isVisible && (
        <div
          className="fixed z-[10000] pointer-events-none"
          style={{
            left: position.x,
            top: position.y,
            transform: "translateX(-50%)",
          }}
        >
          <div className="px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap">
            {content}
            <div
              className="absolute w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"
              style={{
                bottom: "100%",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
