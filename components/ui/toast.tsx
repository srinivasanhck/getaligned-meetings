"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "warning" | "info"

interface ToastProps {
  message: string
  type: ToastType
  duration?: number
  onClose: () => void
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType; duration: number } | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const showToast = (message: string, type: ToastType, duration = 5000) => {
    setToast({ message, type, duration })
    setIsVisible(true)
  }

  const hideToast = () => {
    setIsVisible(false)
    setTimeout(() => setToast(null), 300) // Wait for animation to complete
  }

  useEffect(() => {
    if (isVisible && toast) {
      const timer = setTimeout(hideToast, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, toast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={cn(
            "fixed bottom-4 right-4 z-50 transition-all duration-300",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
        >
          <Toast message={toast.message} type={toast.type} onClose={hideToast} />
        </div>
      )}
    </ToastContext.Provider>
  )
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5" />
      case "error":
        return <AlertCircle className="h-5 w-5" />
      case "warning":
        return <AlertTriangle className="h-5 w-5" />
      case "info":
        return <Info className="h-5 w-5" />
    }
  }

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg px-4 py-3 text-white shadow-lg min-w-[300px] max-w-md",
        bgColor[type],
      )}
      role="alert"
    >
      <div className="flex items-center">
        <span className="mr-2">{getIcon()}</span>
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="ml-4 rounded-full p-1 hover:bg-white/20" aria-label="Close">
        <X size={16} />
      </button>
    </div>
  )
}
