"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Sparkles, Wand2, Lightbulb } from "lucide-react"
import type { Slide, SlideElement, ImageSlideElement, HtmlSlideElement } from "@/types/slide"

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
  mode: "slide" | "element"
  targetId: string
  targetContent?: string | SlideElement
  slideData: Slide
  prompt: string
  onPromptChange: (prompt: string) => void
  onSubmit: (prompt: string) => void
  isProcessing: boolean
}

export default function AiSidebar({
  isOpen,
  onClose,
  mode,
  targetId,
  targetContent,
  slideData,
  prompt,
  onPromptChange,
  onSubmit,
  isProcessing,
}: AiSidebarProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null)

  if (!isOpen) return null

  const extractTextContent = (htmlOrElement: string | SlideElement | undefined): string => {
    if (!htmlOrElement) return ""
    if (typeof htmlOrElement === "string") {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlOrElement, "text/html")
      return doc.body.textContent || ""
    }
    if (htmlOrElement.type === "image") {
      return (htmlOrElement as ImageSlideElement).alt || "Image Element"
    }
    return extractTextContent((htmlOrElement as HtmlSlideElement).html)
  }

  const getContentPreview = (): string => {
    if (mode === "element" && targetContent) {
      const text = extractTextContent(targetContent)
      return text.length > 100 ? text.substring(0, 100) + "..." : text
    }
    return ""
  }

  const getTargetElementType = (): string => {
    if (mode === "element" && targetContent && typeof targetContent !== "string") {
      if (targetContent.type === "image") return "Image"
      if (targetContent.type === "shape") return "Shape"
      if (targetContent.type === "table") return "Table"
      if ((targetContent as HtmlSlideElement).html?.includes("<h1")) return "Heading"
      if (
        (targetContent as HtmlSlideElement).html?.includes("<ul") ||
        (targetContent as HtmlSlideElement).html?.includes("<ol")
      )
        return "List"
    }
    if (typeof targetContent === "string") {
      if (targetContent.includes("<img")) return "Image"
      if (targetContent.includes("<table")) return "Table"
      if (targetContent.includes("data-shape-id")) return "Shape"
    }
    return "Text"
  }

  const getTitle = (): string => {
    if (mode === "slide") return "Remix Slide"
    return `Remix ${getTargetElementType()}`
  }

  const getSuggestions = () => {
    const elementType = getTargetElementType()

    if (mode === "slide") {
      return [
        "Make it more engaging and visually appealing",
        "Improve the layout and spacing",
        "Add more visual elements",
        "Enhance the color scheme",
        "Make the content more concise",
        "Add animations and transitions",
      ]
    }

    // Element suggestions
    if (elementType === "Image") {
      return [
        "Enhance image quality and clarity",
        "Add artistic filters or effects",
        "Improve lighting and contrast",
        "Add a decorative frame or border",
        "Apply professional styling",
        "Optimize for presentation",
      ]
    } else if (elementType === "Table") {
      return [
        "Improve table design and readability",
        "Add better colors and styling",
        "Convert to a visual chart",
        "Enhance data presentation",
        "Add icons and visual elements",
        "Make it more professional",
      ]
    } else if (elementType === "Shape") {
      return [
        "Add gradient colors and effects",
        "Improve the shape design",
        "Add shadow and depth",
        "Enhance the text inside",
        "Make it more modern",
        "Add visual appeal",
      ]
    } else if (elementType === "Heading") {
      return [
        "Make the heading more impactful",
        "Improve typography and styling",
        "Add visual effects",
        "Enhance readability",
        "Make it more engaging",
        "Add creative elements",
      ]
    } else if (elementType === "List") {
      return [
        "Improve list formatting",
        "Add icons and visual elements",
        "Enhance readability",
        "Make it more engaging",
        "Add better styling",
        "Convert to visual format",
      ]
    } else {
      // Text elements
      return [
        "Improve the writing and clarity",
        "Make it more engaging",
        "Enhance formatting and style",
        "Add visual elements",
        "Make it more concise",
        "Improve readability",
      ]
    }
  }

  const getTemplates = () => {
    const elementType = getTargetElementType()
    if (mode === "slide") {
      return [
        {
          title: "Modern Clean",
          description: "Clean design, modern typography",
          image: "/placeholder.svg?height=120&width=200",
        },
        {
          title: "Bold Impact",
          description: "High contrast, vibrant colors",
          image: "/placeholder.svg?height=120&width=200",
        },
      ]
    }

    if (elementType === "Image") {
      return [
        {
          title: "Enhance Image",
          description: "Improve quality, subtle effects",
          image: "/placeholder.svg?height=120&width=200",
        },
        {
          title: "Add Frame",
          description: "Decorative frame, shadow effects",
          image: "/placeholder.svg?height=120&width=200",
        },
      ]
    } else if (elementType === "Table") {
      return [
        {
          title: "Modern Table",
          description: "Clean design, improved readability",
          image: "/placeholder.svg?height=120&width=200",
        },
        {
          title: "Data Visualization",
          description: "Convert table to visual",
          image: "/placeholder.svg?height=120&width=200",
        },
      ]
    } else {
      return [
        {
          title: "Enhance Content",
          description: "Improve wording, formatting",
          image: "/placeholder.svg?height=120&width=200",
        },
        {
          title: "Creative Style",
          description: "Add creative styling, visuals",
          image: "/placeholder.svg?height=120&width=200",
        },
      ]
    }
  }

  const suggestions = getSuggestions()
  const templates = getTemplates()

  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion)
    onPromptChange(suggestion)
  }

  const handleSubmit = () => {
    if (prompt.trim() || selectedTemplate !== null) {
      let finalPrompt = prompt
      if (selectedTemplate !== null) {
        const template = templates[selectedTemplate]
        finalPrompt = `${finalPrompt}\n\nUse template: ${template.title} - ${template.description}`
      }
      onSubmit(finalPrompt)
    }
  }

  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 z-50 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
          <h2 className="text-lg font-medium">{getTitle()}</h2>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Current content preview for elements */}
        {mode === "element" && targetContent && (
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Current content:</p>
            <p className="text-sm">{getContentPreview()}</p>
          </div>
        )}

        {/* AI Suggestions */}
        <div>
          <div className="flex items-center mb-3">
            <Lightbulb className="h-4 w-4 text-yellow-500 mr-2" />
            <label className="block text-sm font-medium text-gray-700">AI Suggestions</label>
          </div>
          <p className="text-sm text-gray-500 mb-3">
            Quick suggestions to improve your {mode === "slide" ? "slide" : getTargetElementType().toLowerCase()}
          </p>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                  selectedSuggestion === suggestion
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Templates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select a layout</label>
          <div className="space-y-3">
            {templates.map((template, index) => (
              <div
                key={index}
                className={`border rounded-md overflow-hidden cursor-pointer transition-all ${selectedTemplate === index ? "ring-2 ring-purple-500 border-purple-500" : "border-gray-200 hover:border-gray-300"}`}
                onClick={() => setSelectedTemplate(index)}
              >
                <div className="bg-gray-100 h-32 flex items-center justify-center">
                  <img
                    src={template.image || "/placeholder.svg"}
                    alt={template.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium">{template.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Prompt Input - Moved to Bottom */}
      <div className="border-t border-gray-200 p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Custom Instructions</label>
          <p className="text-sm text-gray-500 mb-3">
            Add specific instructions for how you'd like to improve this{" "}
            {mode === "slide" ? "slide" : getTargetElementType().toLowerCase()}.
          </p>
          <textarea
            className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
            placeholder={`Describe how you'd like to enhance this ${mode === "slide" ? "slide" : getTargetElementType().toLowerCase()}...`}
            value={prompt}
            onChange={(e) => {
              onPromptChange(e.target.value)
              setSelectedSuggestion(null) // Clear suggestion selection when typing custom prompt
            }}
            disabled={isProcessing}
          />
        </div>

        <Button
          className="w-full py-2 flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white"
          onClick={handleSubmit}
          disabled={isProcessing || (!prompt.trim() && selectedTemplate === null)}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              <span>Remix {mode === "slide" ? "Current Slide" : getTargetElementType()}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
