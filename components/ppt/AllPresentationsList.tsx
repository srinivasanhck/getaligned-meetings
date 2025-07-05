"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, Lock, ChevronDown, FileText, Calendar, MoreVertical, Eye, Share2, Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { getToken } from "@/services/authService"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PresentationInitialThumbnail from "./PresentationInitialThumbnail"
import type { Slide } from "@/types"
import { APIURLINTEGRATION } from "@/lib/utils"

interface SlideRequest {
  id: string
  title: string | null
  created_at: string
  updated_at: string
  user_id: string
  slide_json: {
    metadata?: {
      title?: string
      totalSlides?: number
    }
    presentation?: Array<{
      id: string
      titleForThumbnail?: string
      elements?: Array<{
        type: string
        content: string
        x?: number
        y?: number
        width?: number
        height?: number
        color?: string
        fontWeight?: string
        textAlign?: string
        backgroundColor?: string
        src?: string
        objectFit?: string
        fillColor?: string
        strokeWidth?: number
        strokeColor?: string
      }>
      background?: {
        type: string
        value?: string
        imageFit?: string
      }
      defaultElementTextColor?: string
    }>
  }
}

interface UserInfo {
  email: string
  name: string
  given_name: string
  family_name: string
}

interface ApiResponse {
  status: string
  slide_requests: SlideRequest[]
  user_info: UserInfo
  metadata: {
    total_returned: number
    has_more: boolean
    limit: number
    offset: number
  }
  summary: {
    total_presentations: number
    total_slides: number
    latest_created: string
    oldest_created: string
  }
}

const AllPresentationsList: React.FC = () => {
  const [presentations, setPresentations] = useState<SlideRequest[]>([])
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"lastViewed" | "title" | "created">("lastViewed")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchPresentations()
  }, [])

  const fetchPresentations = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = getToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${APIURLINTEGRATION}/user-slide-requests`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch presentations: ${response.status}`)
      }

      const data: ApiResponse = await response.json()

      if (data.status === "success") {
        setPresentations(data.slide_requests || [])
        setUserInfo(data.user_info)
      } else {
        throw new Error("API returned error status")
      }
    } catch (err) {
      console.error("Error fetching presentations:", err)
      setError(err instanceof Error ? err.message : "Failed to load presentations")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePresentation = async (presentationId: string, event: React.MouseEvent) => {
    event.stopPropagation()


    try {
      setDeletingIds((prev) => new Set(prev).add(presentationId))
      setDeleteError(null)

      const token = getToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${APIURLINTEGRATION}/v1/slides/${presentationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to delete presentation: ${response.status}`)
      }

      // Remove the presentation from the local state
      setPresentations((prev) => prev.filter((p) => p.id !== presentationId))

      // Show success message (optional)
      console.log("Presentation deleted successfully")
    } catch (err) {
      console.error("Error deleting presentation:", err)
      setDeleteError(err instanceof Error ? err.message : "Failed to delete presentation")

      // Show error to user (you might want to use a toast notification instead)
      alert(`Error deleting presentation: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(presentationId)
        return newSet
      })
    }
  }

  const handlePresentationClick = (id: string) => {
    router.push(`/generate-ppt/presentations/${id}`)
  }

  const getInitials = (name: string): string => {
    if (!name) return "U"
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

const formatTimeAgo = (dateString: string): string => {
  try {
    const utcDate = new Date(dateString)

    if (isNaN(utcDate.getTime())) {
      console.error("Invalid date string:", dateString)
      return "Unknown"
    }

    // Convert UTC date to IST
    const istOffset = 5.5 * 60 * 60 * 1000
    const istDate = new Date(utcDate.getTime() + istOffset)

    // Get current time directly (already in IST if system is set correctly)
    const now = new Date()

    const diffInMs = now.getTime() - istDate.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInMonths = Math.floor(diffInDays / 30)

    if (diffInMinutes < 1) {
      return "Just now"
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 30) {
      return `${diffInDays}d ago`
    } else if (diffInMonths === 1) {
      return "1mo ago"
    } else {
      return `${diffInMonths}mo ago`
    }
  } catch (error) {
    console.error("Error formatting date:", error, dateString)
    return "Unknown"
  }
}



  const formatDate = (dateString: string): string => {
    try {
      // Parse the UTC date from the API
      const utcDate = new Date(dateString)

      if (isNaN(utcDate.getTime())) {
        return "Unknown"
      }

      // Convert UTC to IST (UTC + 5:30)
      const istOffset = 5.5 * 60 * 60 * 1000 // 5.5 hours in milliseconds
      const istDate = new Date(utcDate.getTime() + istOffset)

      return istDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (error) {
      return "Unknown"
    }
  }

  const getPresentationTitle = (presentation: SlideRequest): string => {
    return presentation.slide_json?.metadata?.title || presentation.title || presentation?.slide_json?.presentation[0]?.titleForThumbnail ||  "Untitled Presentation"
  }

  const getSlideCount = (presentation: SlideRequest): number => {
    return presentation.slide_json?.metadata?.totalSlides || presentation.slide_json?.presentation?.length || 0
  }

  const getFirstSlide = (presentation: SlideRequest): Slide | undefined => {
    const firstSlideData = presentation.slide_json?.presentation?.[0]
    if (!firstSlideData) return undefined

    // Convert the API slide data to match our Slide type
    return {
      id: firstSlideData.id || "slide-1",
      elements: firstSlideData.elements || [],
      background: firstSlideData.background || { type: "color", value: "#334155" },
      titleForThumbnail: firstSlideData.titleForThumbnail,
      defaultElementTextColor: firstSlideData.defaultElementTextColor,
    } as any
  }

  const sortedPresentations = [...presentations].sort((a, b) => {
    if (sortBy === "lastViewed") {
      const dateA = new Date(a.updated_at).getTime()
      const dateB = new Date(b.updated_at).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    } else if (sortBy === "created") {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    } else {
      const titleA = getPresentationTitle(a).toLowerCase()
      const titleB = getPresentationTitle(b).toLowerCase()
      if (sortOrder === "desc") {
        return titleB.localeCompare(titleA)
      } else {
        return titleA.localeCompare(titleB)
      }
    }
  })

  const handleSort = (column: "lastViewed" | "title" | "created") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  if (isLoading) {
    return (
      <div className="mt-20">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-20">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Presentations</h2>
          <p className="text-gray-600">Manage and access all your generated presentations</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Failed to Load Presentations</h3>
            <p className="text-red-600 mb-6 max-w-md mx-auto">{error}</p>
            <Button
              onClick={fetchPresentations}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (presentations.length === 0) {
    return (
      <div className="mt-20">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Presentations</h2>
          <p className="text-gray-600">Manage and access all your generated presentations</p>
        </div>
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Presentations Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create your first presentation using the options above to get started
            </p>
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Create Presentation
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      className="mt-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Presentations</h2>
          <p className="text-gray-600">
            {presentations.length} presentation{presentations.length !== 1 ? "s" : ""} created
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <Button
              variant={sortBy === "lastViewed" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleSort("lastViewed")}
              className="text-xs"
            >
              Last viewed
              {sortBy === "lastViewed" && (
                <ChevronDown
                  className={`w-3 h-3 ml-1 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`}
                />
              )}
            </Button>
            <Button
              variant={sortBy === "title" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleSort("title")}
              className="text-xs"
            >
              Title
              {sortBy === "title" && (
                <ChevronDown
                  className={`w-3 h-3 ml-1 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`}
                />
              )}
            </Button>
            <Button
              variant={sortBy === "created" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleSort("created")}
              className="text-xs"
            >
              Created
              {sortBy === "created" && (
                <ChevronDown
                  className={`w-3 h-3 ml-1 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`}
                />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Error Display */}
      {deleteError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{deleteError}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteError(null)}
            className="mt-2 text-red-600 hover:text-red-700"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Presentations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedPresentations.map((presentation, index) => {
          const isDeleting = deletingIds.has(presentation.id)

          return (
            <motion.div
              key={presentation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-purple-100 hover:-translate-y-1 border-gray-200 hover:border-purple-300 ${
                  isDeleting ? "opacity-50 pointer-events-none" : ""
                }`}
                onClick={() => !isDeleting && handlePresentationClick(presentation.id)}
              >
                <CardContent className="p-6">
               {/* Header - Fixed height for consistent alignment */}
                  <div className="flex items-start justify-between mb-4 h-16">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold text-gray-900 text-lg leading-tight mb-1 group-hover:text-purple-700 transition-colors overflow-hidden"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          lineHeight: "1.4",
                          maxHeight: "2.8em", // 2 lines * 1.4 line-height
                        }}
                        title={getPresentationTitle(presentation)} // Show full title on hover
                      >
                        {getPresentationTitle(presentation)}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <FileText className="w-4 h-4" />
                        <span>{getSlideCount(presentation)} slides</span>
                      </div>
                    </div>
                  </div>

                  {/* Slide Thumbnail */}
                  <div className="mb-4 relative">
                    <PresentationInitialThumbnail
                      slide={getFirstSlide(presentation)}
                      className="w-full h-32 group-hover:scale-[1.02] transition-transform duration-200"
                    />
                    {isDeleting && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Lock className="w-3 h-3" />
                        <span>Private</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatTimeAgo(presentation.updated_at)}</span>
                        {console.log(formatTimeAgo(presentation.updated_at))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-medium">
                          {userInfo ? getInitials(userInfo.name) : "U"}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{userInfo?.name || "Unknown User"}</span>
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(presentation.created_at)}</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePresentationClick(presentation.id)
                        }}
                        disabled={isDeleting}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle share
                        }}
                        disabled={isDeleting}
                      >
                        <Share2 className="w-3 h-3 mr-1" />
                        Share
                      </Button> */}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => handleDeletePresentation(presentation.id, e)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

    </motion.div>
  )
}

export default AllPresentationsList
