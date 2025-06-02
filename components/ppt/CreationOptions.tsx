"use client"

import { Bot, FileText, FileUp, Link } from "lucide-react"
import { motion } from "framer-motion"

interface CreationOptionsProps {
  selectedOption: string
  onSelectOption: (option: string) => void
}

export function CreationOptions({ selectedOption, onSelectOption }: CreationOptionsProps) {
  const options = [
    { id: "chat", name: "Chat to Generate", icon: <Bot className="h-5 w-5" /> },
    { id: "documents", name: "Import Documents", icon: <FileText className="h-5 w-5" /> },
    { id: "drive", name: "Import from Google Drive", icon: <FileUp className="h-5 w-5" /> },
    { id: "url", name: "Import from URL", icon: <Link className="h-5 w-5" /> },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {options.map((option) => (
        <motion.button
          key={option.id}
          className={`flex flex-col items-center justify-center p-6 rounded-xl border transition-all ${
            selectedOption === option.id
              ? "bg-white border-purple-200 shadow-sm text-purple-600"
              : "bg-white/80 border-gray-200 text-gray-600 hover:bg-white hover:shadow-sm"
          }`}
          onClick={() => onSelectOption(option.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
              selectedOption === option.id ? "bg-purple-100" : "bg-gray-100"
            }`}
          >
            {option.icon}
          </div>
          <span className="text-sm font-medium">{option.name}</span>
        </motion.button>
      ))}
    </div>
  )
}
