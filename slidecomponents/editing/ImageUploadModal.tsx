"use client"

import React, { useState, useRef } from "react"
import { X, Upload, Link, Image as ImageIcon, Loader, Check } from "lucide-react"
import { presentationService } from "@/services/presentationService"

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onImageSelect: (imageUrl: string, altText?: string) => void
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, onImageSelect }) => {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload")
  const [imageUrl, setImageUrl] = useState("")
  const [altText, setAltText] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file")
      return
    }

    // Show preview
    const fileUrl = URL.createObjectURL(file)
    setPreviewUrl(fileUrl)
    setUploadError(null)
    setIsUploading(true)

    try {
      const uploadedUrl = await presentationService.uploadImage(file)
      setIsUploading(false)
      
      // Auto-select the uploaded image
      onImageSelect(uploadedUrl, altText || file.name)
      onClose()
    } catch (error) {
      setIsUploading(false)
      setUploadError(error instanceof Error ? error.message : "Upload failed")
      setPreviewUrl(null)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) {
      setUploadError("Please enter a valid image URL")
      return
    }

    // Basic URL validation
    try {
      new URL(imageUrl)
    } catch {
      setUploadError("Please enter a valid URL")
      return
    }

    onImageSelect(imageUrl, altText || "Image")
    onClose()
  }

  const handleClose = () => {
    setActiveTab("upload")
    setImageUrl("")
    setAltText("")
    setUploadError(null)
    setPreviewUrl(null)
    setIsUploading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Add Image</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Upload an image or provide a URL
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="p-6 pb-4">
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all text-sm font-medium ${
                activeTab === "upload"
                  ? "bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </button>
            <button
              onClick={() => setActiveTab("url")}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all text-sm font-medium ${
                activeTab === "url"
                  ? "bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Link className="w-4 h-4" />
              <span>Image URL</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {activeTab === "upload" ? (
            <div className="space-y-4">
              {/* File Upload Area */}
              <div
                className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={isUploading}
                />
                
                {previewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-32 h-24 object-cover rounded-lg mx-auto"
                    />
                    {isUploading ? (
                      <div className="flex items-center justify-center space-x-2 text-blue-600">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Upload complete!</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        Drop an image here or click to browse
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Supports JPG, PNG, GIF, WebP (max 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{uploadError}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* URL Preview */}
              {imageUrl && (
                <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-3">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preview:</p>
                  <img
                    src={imageUrl}
                    alt="URL Preview"
                    className="w-full h-32 object-contain rounded border"
                    onError={() => setUploadError("Unable to load image from this URL")}
                    onLoad={() => setUploadError(null)}
                  />
                </div>
              )}

              {uploadError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{uploadError}</p>
                </div>
              )}
            </div>
          )}

          {/* Alt Text Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Alt Text (Optional)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for accessibility"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            {activeTab === "url" && (
              <button
                onClick={handleUrlSubmit}
                disabled={!imageUrl.trim() || isUploading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Add Image
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageUploadModal
