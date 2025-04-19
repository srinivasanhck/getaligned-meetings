"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MoreVertical, Minimize, MessageCircle, Copy, Trash2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { APIURL } from "@/lib/utils"
import { getToken } from "@/services/authService"
import { useToast } from "@/components/ui/toast"

interface AskMeAnythingProps {
  meetingTitle?: string
  meetingId?: string
}

interface UserInfo {
  name: string
  email: string
  id: number
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp?: string
}

interface PastConversation {
  question: string
  answer: string
  question_time: string
  answer_time: string
}

interface PastConversationsResponse {
  past_conversations: PastConversation[]
}

interface QuestionResponse {
  answer: string
}

const AskMeAnything = ({ meetingTitle = "this meeting", meetingId }: AskMeAnythingProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState<string>("there")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isClearingChat, setIsClearingChat] = useState(false)

  // States for past conversations
  const [isPastConversationsLoading, setIsPastConversationsLoading] = useState(false)
  const [pastConversationsError, setPastConversationsError] = useState<string | null>(null)
  const [hasFetchedPastConversations, setHasFetchedPastConversations] = useState(false)

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  // Suggestions for questions
  const suggestions = [
    "Who were the meeting participants and their roles?",
    "What processes or workflows were discussed?",
    "What issues, feedback, or requests were brought up?",
  ]

  // Fetch user info on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = getToken()
        if (!token) return

        const response = await fetch(`${APIURL}/api/v1/users/userInfo`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch user info: ${response.status}`)
        }

        const data: UserInfo = await response.json()
        if (data.name) {
          // Extract first name
          const firstName = data.name.split(" ")[0]
          setUserName(firstName)
        }
      } catch (error) {
        console.error("Error fetching user info:", error)
      }
    }

    fetchUserInfo()
  }, [])

  // Fetch past conversations when the component opens
  useEffect(() => {
    if (isOpen && meetingId && !hasFetchedPastConversations) {
      fetchPastConversations()
    }
  }, [isOpen, meetingId, hasFetchedPastConversations])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsMenuOpen(false)
      }

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        event.target !== document.querySelector('[data-menu-trigger="true"]')
      ) {
        setIsMenuOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, isMenuOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Format message content with proper HTML
  const formatMessageContent = (content: string) => {
    if (!content) return ""

    // Replace markdown-style bold with HTML bold
    let formattedContent = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // Replace double newlines with paragraph breaks
    formattedContent = formattedContent.replace(/\n\n/g, "</p><p>")

    // Replace single newlines with line breaks
    formattedContent = formattedContent.replace(/\n/g, "<br />")

    // Handle numbered lists
    formattedContent = formattedContent.replace(/(\d+)\.\s/g, "<strong>$1.</strong> ")

    // Wrap in paragraph tags if not already
    if (!formattedContent.startsWith("<p>")) {
      formattedContent = `<p>${formattedContent}</p>`
    }

    return formattedContent
  }

  // Fetch past conversations
  const fetchPastConversations = async () => {
    if (!meetingId) return

    setIsPastConversationsLoading(true)
    setPastConversationsError(null)

    try {
      const token = getToken()
      if (!token) throw new Error("Authentication required")

      const response = await fetch(`${APIURL}/api/v1/meeting-bot/meeting-conversations?meetingId=${meetingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch past conversations: ${response.status}`)
      }

      const data: PastConversationsResponse = await response.json()

      // Convert past conversations to chat messages
      if (data.past_conversations && data.past_conversations.length > 0) {
        const conversationMessages: ChatMessage[] = []

        data.past_conversations.forEach((convo) => {
          conversationMessages.push({
            role: "user",
            content: convo.question,
            timestamp: convo.question_time,
          })

          conversationMessages.push({
            role: "assistant",
            content: convo.answer,
            timestamp: convo.answer_time,
          })
        })

        // Sort messages by timestamp (newest first)
        conversationMessages.sort((a, b) => {
          if (!a.timestamp || !b.timestamp) return 0
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        })

        setMessages(conversationMessages)
      }

      setHasFetchedPastConversations(true)
    } catch (error) {
      console.error("Error fetching past conversations:", error)
      setPastConversationsError(error instanceof Error ? error.message : "Failed to fetch past conversations")
    } finally {
      setIsPastConversationsLoading(false)
    }
  }

  // Ask a question
  const askQuestion = async (question: string) => {
    if (!meetingId || !question.trim()) return

    setIsLoading(true)

    try {
      const token = getToken()
      if (!token) throw new Error("Authentication required")

      const response = await fetch(
        `${APIURL}/api/v1/meeting-bot/ask-meeting-question?meetingId=${meetingId}&question=${encodeURIComponent(question)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to get answer: ${response.status}`)
      }

      const data: QuestionResponse = await response.json()

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error asking question:", error)

      // Add error message as assistant response
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `Sorry, I couldn't process your question. ${error instanceof Error ? error.message : "Please try again later."}`,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, errorMessage])
      showToast("Failed to get answer", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Clear input
    const questionText = query
    setQuery("")

    // Ask the question
    askQuestion(questionText)
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: suggestion,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Ask the question
    askQuestion(suggestion)
  }

  const handleClearChat = async () => {
    if (!meetingId) {
      showToast("Meeting ID is required to clear conversations", "error")
      return
    }

    setIsClearingChat(true)
    setIsMenuOpen(false)

    try {
      const token = getToken()
      if (!token) throw new Error("Authentication required")

      const response = await fetch(`${APIURL}/api/v1/meeting-bot/clear-meeting-conversations?meetingId=${meetingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to clear conversations: ${response.status}`)
      }

      // Clear local messages state
      setMessages([])
      showToast("Chat history cleared successfully", "success")

      // Reset the past conversations fetch flag so it will reload if needed
      setHasFetchedPastConversations(false)
    } catch (error) {
      console.error("Error clearing chat history:", error)
      showToast(error instanceof Error ? error.message : "Failed to clear chat history. Please try again.", "error")
    } finally {
      setIsClearingChat(false)
    }
  }

  const handleCopyConversation = () => {
    const conversationText = messages
      .map((msg) => `${msg.role === "user" ? "You" : "GetAligned"}: ${msg.content}`)
      .join("\n\n")

    navigator.clipboard
      .writeText(conversationText)
      .then(() => {
        showToast("Conversation copied to clipboard", "success")
        setIsMenuOpen(false)
      })
      .catch((err) => {
        console.error("Failed to copy conversation:", err)
        showToast("Failed to copy conversation", "error")
      })
  }

  return (
    <div className="fixed bottom-4 right-0 z-50">
      {/* Floating button */}
      {!isOpen && (
        <div className="relative group">
          <button
            onClick={() => setIsOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all"
            aria-label="Ask GetAligned"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
          <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            Ask GetAligned
          </div>
        </div>
      )}

      {/* Chat container */}
      <div
        ref={chatContainerRef}
        className={cn(
          "bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out flex flex-col",
          isOpen ? "opacity-100 scale-100 w-[30vw] h-[85vh]" : "opacity-0 scale-95 w-0 h-0 pointer-events-none",
        )}
        style={{ maxHeight: "calc(100vh - 100px)" }}
      >
        {/* Header - sticky */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white p-3 sticky top-0 z-10">
          <div className="flex items-center">
            <h3 className="text-base font-medium text-gray-800">Getting Started with GetAligned</h3>
          </div>
          <div className="flex items-center space-x-1">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="More options"
                data-menu-trigger="true"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {/* Dropdown menu */}
              {isMenuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-full mt-1 rounded-md border border-gray-200 bg-white shadow-lg z-10"
                >
                  <div className="py-2 w-max">
                    <button
                      onClick={handleCopyConversation}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Copy className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="whitespace-nowrap">Copy conversation</span>
                    </button>
                    <button
                      onClick={handleClearChat}
                      disabled={isClearingChat}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                      {isClearingChat ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-600"></div>
                          Clearing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Clear chat
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Minimize"
            >
              <Minimize className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chat content - scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {/* Loading state for past conversations */}
          {isPastConversationsLoading && (
            <div className="flex justify-center items-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
              <span className="ml-2 text-sm text-gray-500">Loading conversations...</span>
            </div>
          )}

          {/* Error state for past conversations */}
          {pastConversationsError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Failed to load past conversations</p>
                  <p className="text-xs text-red-700 mt-1">{pastConversationsError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty state - no messages */}
          {!isPastConversationsLoading && messages.length === 0 ? (
            <div className="mb-6">
              <p className="text-[16px] font-medium text-gray-800">
                Hi {userName}! What do you want to know about this meeting?
              </p>
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-500">Suggestions</p>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full rounded-md bg-gray-100 px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-200 transition-colors"
                      disabled={isLoading}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-lg p-2",
                    message.role === "user"
                      ? "bg-primary/10 text-gray-800 ml-auto w-fit max-w-[85%]"
                      : "bg-gray-100 text-gray-800 w-full",
                  )}
                >
                  {message.role === "user" ? (
                    <p className="text-sm">{message.content}</p>
                  ) : (
                    <div
                      className="text-sm"
                      dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                    />
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="bg-gray-100 rounded-lg p-3 max-w-[85%]">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div
                      className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area - sticky at bottom */}
        <div className="border-t border-gray-200 p-3 bg-white sticky bottom-0 z-10">
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask GetAligned about this meeting"
              className="w-full rounded-full border border-gray-300 pl-4 pr-10 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1",
                isLoading ? "text-gray-400" : "text-primary hover:bg-primary/10",
              )}
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AskMeAnything
