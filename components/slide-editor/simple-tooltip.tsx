"use client"

import type { ReactNode } from "react"
import { useState } from "react"

interface SimpleTooltipProps {
  children: ReactNode
  content: string
  delay?: number
}

export function SimpleTooltip({ children, content, delay = 500 }: SimpleTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && (
        <div className="fixed z-[10000] pointer-events-none">
          <div
            className="absolute px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap"
            style={{
              bottom: "100%",
              left: "50%",
              transform: "translateX(-50%) translateY(-8px)",
            }}
          >
            {content}
            <div
              className="absolute w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
              style={{
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
