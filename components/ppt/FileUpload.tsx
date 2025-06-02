"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, File, FileText, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FileUploadProps {
  onFileSelect: (file: File) => void
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      handleFile(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      handleFile(file)
    }
  }

  const handleFile = (file: File) => {
    // Check if file is a valid type (PDF, DOCX, TXT)
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF, DOCX, or TXT file")
      return
    }

    setSelectedFile(file)
    onFileSelect(file)
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getFileIcon = () => {
    if (!selectedFile) return null

    if (selectedFile.type === "application/pdf") {
      return <File className="h-10 w-10 text-red-500" />
    } else if (selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      return <FileText className="h-10 w-10 text-blue-500" />
    } else {
      return <FileText className="h-10 w-10 text-yellow-500" />
    }
  }

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        className="hidden"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
      />

      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center transition-colors ${
              isDragging ? "border-purple-400 bg-purple-50" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-center space-x-4 mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                    stroke="#2563EB"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M14 2V8H20" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 13H8" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 17H8" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 9H9H8" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                    stroke="#DC2626"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M14 2V8H20" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="w-12 h-12 flex items-center justify-center bg-yellow-100 rounded">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M14 2V8H20" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 13H8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 17H8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 9H9H8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-500">PDF, DOCX or TXT (max. 10MB)</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            className="border-2 border-purple-200 bg-purple-50 rounded-lg p-6 flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-4">
              {getFileIcon()}
              <div>
                <p className="font-medium text-gray-800">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeFile()
              }}
              className="p-1.5 bg-white rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedFile && (
        <motion.div
          className="mt-4 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors">
            <Upload className="h-4 w-4" />
            <span>Generate from Document</span>
          </button>
        </motion.div>
      )}
    </div>
  )
}
