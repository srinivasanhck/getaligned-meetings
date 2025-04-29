"use client"

import type React from "react"

import { useState } from "react"
import { X, Check, AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createHubspotNote } from "@/services/hubspotService"

interface NotePopupProps {
  contact: any
  onClose: () => void
  onSuccess: () => void
}

export default function NotePopup({ contact, onClose, onSuccess }: NotePopupProps) {
  const [noteBody, setNoteBody] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!noteBody.trim()) {
      setError("Note content is required")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(false)

      const result = await createHubspotNote({
        contactObjectId: contact.id,
        noteBody: noteBody,
      })

      console.log("Note creation result:", result)

      setSuccess(true)

      // Call onSuccess after a short delay to show the success message
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (error: any) {
      console.error("Error creating note:", error)
      setError(error.message || "Failed to create note")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Add Note to {contact.properties.firstname || ""} {contact.properties.lastname || ""}
            {!contact.properties.firstname && !contact.properties.lastname && "Contact"}
          </h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700">
              Note Content <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="note"
              placeholder="Enter your note here..."
              rows={5}
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="flex items-center rounded-md bg-red-50 p-2 text-sm text-red-600">
              <AlertCircle className="mr-2 h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center rounded-md bg-green-50 p-2 text-sm text-green-600">
              <Check className="mr-2 h-4 w-4" />
              Note created successfully!
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#ff7a59] text-white hover:bg-[#ff8f73]">
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                  Saving...
                </>
              ) : (
                "Save Note"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
