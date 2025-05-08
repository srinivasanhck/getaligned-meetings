"use client"

import { useState, useEffect } from "react"
import type React from "react"

import { X, Search, Calendar, Check } from "lucide-react"
import { getToken } from "@/services/authService"
import { APIURL } from "@/lib/utils"
import axios from "axios"
import DatePicker from "./DatePicker"

interface HubspotDealPopupProps {
  onClose: () => void
  onSuccess: () => void
  contacts: any[]
  isLoadingContacts: boolean
  dealData?: any
}

// Deal stage options
const DEAL_STAGES = [
  { label: "Appointment Scheduled", value: "appointmentscheduled" },
  { label: "Qualified To Buy", value: "qualifiedtobuy" },
  { label: "Presentation Scheduled", value: "presentationscheduled" },
  { label: "Decision Maker Bought-In", value: "decisionmakerboughtin" },
  { label: "Contract Sent", value: "contractsent" },
  { label: "Closed Won", value: "closedwon" },
  { label: "Closed Lost", value: "closedlost" },
]

// Deal type options
const DEAL_TYPES = [
  { label: "New Business", value: "newbusiness" },
  { label: "Existing Business", value: "existingbusiness" },
]

const HubspotDealPopup: React.FC<HubspotDealPopupProps> = ({
  onClose,
  onSuccess,
  contacts,
  isLoadingContacts,
  dealData,
}) => {
  // Form state
  const [dealName, setDealName] = useState("")
  const [dealStage, setDealStage] = useState(DEAL_STAGES[0].value)
  const [amount, setAmount] = useState("")
  const [closeDate, setCloseDate] = useState("")
  const [dealType, setDealType] = useState(DEAL_TYPES[0].value)
  const [description, setDescription] = useState("")
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showCalendar, setShowCalendar] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form with deal data if available
  useEffect(() => {
    if (dealData) {
      // Try to extract company name or other relevant info for the deal name
      if (dealData.company) {
        setDealName(`${dealData.company} Deal`)
      }

      // Set description from deal data if available
      if (dealData.description) {
        setDescription(dealData.description)
      }

      // Set amount if available
      if (dealData.amount) {
        setAmount(dealData.amount.toString())
      }
    }
  }, [dealData])

  // Filter contacts based on search term
  const filteredContacts = contacts.filter((contact) => {
    const firstName = (contact.properties.firstname || "").toLowerCase()
    const lastName = (contact.properties.lastname || "").toLowerCase()
    const email = (contact.properties.email || "").toLowerCase()
    const company = (contact.properties.company || "").toLowerCase()
    const search = searchTerm.toLowerCase()

    return firstName.includes(search) || lastName.includes(search) || email.includes(search) || company.includes(search)
  })

  // Toggle contact selection
  const toggleContactSelection = (contactId: string) => {
    setSelectedContactIds((prev) => {
      if (prev.includes(contactId)) {
        return prev.filter((id) => id !== contactId)
      } else {
        return [...prev, contactId]
      }
    })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!dealName.trim()) {
      setError("Deal name is required")
      return
    }

    if (!dealStage) {
      setError("Deal stage is required")
      return
    }

    if (selectedContactIds.length === 0) {
      setError("At least one contact must be selected")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const token = getToken()

      // Prepare the payload
      const payload = {
        dealName,
        pipeline: "default", // Fixed as default
        dealStage,
        contactIds: selectedContactIds,
      } as any

      // Add optional fields if they have values
      if (amount) payload.amount = Number.parseFloat(amount)
      if (closeDate) payload.closeDate = closeDate
      if (dealType) payload.dealType = dealType
      if (description) payload.description = description

      // Make the API call
      await axios.post(`${APIURL}/api/v1/hubspot/deal`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      onSuccess()
    } catch (err: any) {
      console.error("Error creating deal:", err)
      setError(err.response?.data?.message || "Failed to create deal. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Create HubSpot Deal</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Deal Name */}
            <div>
              <label htmlFor="dealName" className="block text-sm font-medium text-gray-700 mb-1">
                Deal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="dealName"
                value={dealName}
                onChange={(e) => setDealName(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                placeholder="Enter deal name"
                required
              />
            </div>

            {/* Pipeline (fixed as default) */}
            <div>
              <label htmlFor="pipeline" className="block text-sm font-medium text-gray-700 mb-1">
                Pipeline
              </label>
              <input
                type="text"
                id="pipeline"
                value="Default"
                className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-50"
                disabled
              />
            </div>

            {/* Deal Stage */}
            <div>
              <label htmlFor="dealStage" className="block text-sm font-medium text-gray-700 mb-1">
                Deal Stage <span className="text-red-500">*</span>
              </label>
              <select
                id="dealStage"
                value={dealStage}
                onChange={(e) => setDealStage(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                required
              >
                {DEAL_STAGES.map((stage) => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                placeholder="Enter deal amount"
                min="0"
                step="0.01"
              />
            </div>

            {/* Close Date */}
            <div className="relative">
              <label htmlFor="closeDate" className="block text-sm font-medium text-gray-700 mb-1">
                Close Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="closeDate"
                  value={closeDate ? new Date(closeDate).toLocaleDateString() : ""}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  placeholder="Select close date"
                  readOnly
                  onClick={() => setShowCalendar(!showCalendar)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </div>

              {showCalendar && (
                <div className="absolute z-10 mt-1">
                  <DatePicker
                    initialDate={closeDate ? new Date(closeDate) : null}
                    onSelect={(date) => {
                      setCloseDate(date.toISOString())
                      setShowCalendar(false)
                    }}
                  />
                </div>
              )}
            </div>

            {/* Deal Type */}
            <div>
              <label htmlFor="dealType" className="block text-sm font-medium text-gray-700 mb-1">
                Deal Type
              </label>
              <select
                id="dealType"
                value={dealType}
                onChange={(e) => setDealType(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              >
                {DEAL_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm min-h-[100px]"
                placeholder="Enter deal description"
              />
            </div>

            {/* Contact Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Associate Deal with Contacts <span className="text-red-500">*</span>
              </label>

              <div className="mb-2 relative">
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="w-full border border-gray-300 rounded-md p-2 text-sm pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <div className="border border-gray-200 rounded-md max-h-[200px] overflow-y-auto">
                {isLoadingContacts ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No contacts found</div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                        onClick={() => toggleContactSelection(contact.id)}
                      >
                        <div>
                          <div className="font-medium">
                            {contact.properties.firstname || ""} {contact.properties.lastname || ""}
                            {!contact.properties.firstname && !contact.properties.lastname && "No Name"}
                          </div>
                          <div className="text-xs text-gray-500">{contact.properties.email || "No Email"}</div>
                          {contact.properties.company && (
                            <div className="text-xs text-gray-400">{contact.properties.company}</div>
                          )}
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md border ${
                            selectedContactIds.includes(contact.id) ? "bg-primary border-primary" : "border-gray-300"
                          } flex items-center justify-center`}
                        >
                          {selectedContactIds.includes(contact.id) && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedContactIds.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  {selectedContactIds.length} contact{selectedContactIds.length !== 1 ? "s" : ""} selected
                </div>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">{error}</div>
            )}
          </div>

          <div className="p-4 border-t flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                isSubmitting ? "bg-primary/50 cursor-not-allowed" : "bg-primary hover:bg-primary/90"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span> Creating...
                </>
              ) : (
                "Create Deal"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HubspotDealPopup
