"use client"

import { useState, useEffect } from "react"
import { FileText, Palette, Sparkles, CheckCircle, Clock } from "lucide-react"

interface SlideGenerationLoaderProps {
  requestId: string
}

const generationSteps = [
  {
    id: "analyzing",
    title: "Analyzing Content",
    description: "Understanding your requirements and structure",
    icon: FileText,
    duration: 6000,
  },
  {
    id: "generating",
    title: "Generating Slides",
    description: "Creating slide content and layout",
    icon: Sparkles,
    duration: 6000,
  },
  {
    id: "styling",
    title: "Applying Design",
    description: "Finalizing colors, fonts, and styling",
    icon: Palette,
    duration: 6000,
  },
]

export default function SlideGenerationLoader({ requestId }: SlideGenerationLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    // Timer for elapsed time
    const timeInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev // Cap at 95% until actual completion
        return prev + Math.random() * 2 + 0.5
      })
    }, 200)

    // Step progression
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < generationSteps.length - 1) {
          const nextStep = prev + 1
          setCompletedSteps((completed) => [...completed, generationSteps[prev].id])
          return nextStep
        }
        return prev
      })
    }, 3000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(progressInterval)
      clearInterval(stepInterval)
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Creating Your Presentation</h1>
          <p className="text-gray-600">Our AI is crafting a beautiful presentation just for you</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full bg-white bg-opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Generation Steps */}
        <div className="space-y-4 mb-8">
          {generationSteps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = index === currentStep
            const isPending = index > currentStep

            return (
              <div
                key={step.id}
                className={`flex items-center p-4 rounded-lg border transition-all duration-500 ${
                  isCompleted
                    ? "bg-green-50 border-green-200"
                    : isCurrent
                      ? "bg-blue-50 border-blue-200 shadow-md"
                      : "bg-gray-50 border-gray-200"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted ? "bg-green-500" : isCurrent ? "bg-blue-500 animate-pulse" : "bg-gray-300"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <step.icon className={`w-6 h-6 ${isCurrent ? "text-white" : "text-gray-500"}`} />
                  )}
                </div>

                <div className="ml-4 flex-1">
                  <h3
                    className={`font-semibold transition-colors ${
                      isCompleted ? "text-green-700" : isCurrent ? "text-blue-700" : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm transition-colors ${
                      isCompleted ? "text-green-600" : isCurrent ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>

                {isCurrent && (
                  <div className="flex-shrink-0">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Elapsed Time</p>
                <p className="font-semibold text-gray-900">{formatTime(elapsedTime)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Request ID</p>
                <p className="font-mono text-xs text-gray-900 truncate">{requestId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Did you know?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Our AI analyzes thousands of design patterns to create your perfect presentation</p>
            <p>• Each slide is optimized for visual impact and readability</p>
            <p>• You can edit and customize everything once generation is complete</p>
            <p>• AI images will be generated in the background after slides are ready</p>
          </div>
        </div>

        {/* Subtle animation dots */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
