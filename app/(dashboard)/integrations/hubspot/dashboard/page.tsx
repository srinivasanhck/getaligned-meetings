"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAllHubspotContacts, createHubspotContact, getHubspotPortalUrl } from "@/services/hubspotService"
import { ExternalLink, Plus, RefreshCw, Check, AlertCircle, User, Mail, Phone, Building2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/toast"
import NotePopup from "@/components/hubspot/NotePopup"

export default function HubspotDashboardPage() {
  const { showToast } = useToast()
  const [contacts, setContacts] = useState<any[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(true)
  const [contactsError, setContactsError] = useState<string | null>(null)

  const [selectedContact, setSelectedContact] = useState<any | null>(null)
  const [showNotePopup, setShowNotePopup] = useState(false)

  const [newContact, setNewContact] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    company: "",
  })
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  const [contactError, setContactError] = useState<string | null>(null)

  // Fetch contacts on page load
  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setIsLoadingContacts(true)
      setContactsError(null)
      const fetchedContacts = await getAllHubspotContacts()
      console.log("Fetched contacts:", fetchedContacts)
      setContacts(fetchedContacts)
    } catch (error: any) {
      console.error("Error fetching contacts:", error)
      setContactsError(error.message || "Failed to load contacts")
    } finally {
      setIsLoadingContacts(false)
    }
  }

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newContact.email) {
      setContactError("Email is required")
      return
    }

    try {
      setIsSubmittingContact(true)
      setContactError(null)
      setContactSuccess(false)

      const result = await createHubspotContact({
        email: newContact.email,
        firstName: newContact.firstName,
        lastName: newContact.lastName,
        phone: newContact.phone,
        company: newContact.company,
      })

      console.log("Contact creation result:", result)

      setContactSuccess(true)
      showToast("Contact created successfully!", "success")

      setNewContact({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        company: "",
      })

      // Refresh contacts list
      fetchContacts()
    } catch (error: any) {
      console.error("Error creating contact:", error)
      setContactError(error.message || "Failed to create contact")
      showToast(error.message || "Failed to create contact", "error")
    } finally {
      setIsSubmittingContact(false)
    }
  }

  const handleAddNote = (contact: any) => {
    setSelectedContact(contact)
    setShowNotePopup(true)
  }

  const handleNoteSuccess = () => {
    showToast("Note added successfully!", "success")
    setShowNotePopup(false)
    setSelectedContact(null)
  }

  return (
    <div className="container mx-auto p-6 h-screen overflow-y-auto custom-scrollbar">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HubSpot Integration</h1>
          <p className="text-muted-foreground mt-1">Manage your HubSpot contacts and notes</p>
        </div>
        <Link
          href={getHubspotPortalUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          Open HubSpot <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Contact</CardTitle>
            <CardDescription>Add a new contact to your HubSpot CRM</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      placeholder="John"
                      className="pl-8"
                      value={newContact.firstName}
                      onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="pl-8"
                      value={newContact.lastName}
                      onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    className="pl-8"
                    required
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      placeholder="+91"
                      className="pl-8"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <div className="relative">
                    <Building2 className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="company"
                      placeholder="Acme Inc."
                      className="pl-8"
                      value={newContact.company}
                      onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {contactError && (
                <div className="flex items-center rounded-md bg-red-50 p-2 text-sm text-red-600">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {contactError}
                </div>
              )}

              {contactSuccess && (
                <div className="flex items-center rounded-md bg-green-50 p-2 text-sm text-green-600">
                  <Check className="mr-2 h-4 w-4" />
                  Contact created successfully!
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmittingContact}
                className="w-full bg-[#ff7a59] text-white hover:bg-[#ff8f73]"
              >
                {isSubmittingContact ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Contact
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Contacts</CardTitle>
              <CardDescription>View and manage your HubSpot contacts</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchContacts} disabled={isLoadingContacts}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingContacts ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingContacts ? (
              <div className="flex h-40 items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#ff7a59]"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading contacts...</p>
                </div>
              </div>
            ) : contactsError ? (
              <div className="flex h-40 items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <p className="mt-2 text-sm text-red-500">{contactsError}</p>
                  <Button variant="outline" size="sm" onClick={fetchContacts} className="mt-4">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : contacts.length === 0 ? (
              <div className="flex h-40 items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <User className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No contacts found</p>
                  <p className="text-xs text-gray-400">Create your first contact above</p>
                </div>
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-2 border-b bg-gray-50 p-3 text-xs font-medium text-gray-500">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-4">Email</div>
                  <div className="col-span-3">Created</div>
                  <div className="col-span-2">Actions</div>
                </div>
                <div className="divide-y">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="grid grid-cols-12 gap-2 p-3 text-sm">
                      <div className="col-span-3 font-medium">
                        {contact.properties.firstname || ""} {contact.properties.lastname || ""}
                        {!contact.properties.firstname && !contact.properties.lastname && "No Name"}
                      </div>
                      <div className="col-span-4 truncate">{contact.properties.email || "No Email"}</div>
                      <div className="col-span-3 text-gray-500">{new Date(contact.createdAt).toLocaleDateString()}</div>
                      <div className="col-span-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-blue-600 hover:text-blue-800"
                          onClick={() => handleAddNote(contact)}
                        >
                          Add Note
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Note Popup */}
      {showNotePopup && selectedContact && (
        <NotePopup contact={selectedContact} onClose={() => setShowNotePopup(false)} onSuccess={handleNoteSuccess} />
      )}
    </div>
  )
}
