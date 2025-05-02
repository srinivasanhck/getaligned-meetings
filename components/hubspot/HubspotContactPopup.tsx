"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, User, Mail, Phone, Building2, Check, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createHubspotContact } from "@/services/hubspotService"

interface HubspotContactPopupProps {
  onClose: () => void
  onSuccess?: () => void
  initialData?: {
    name?: string
    email?: string
    company?: string
    phone?: string
  }
  dealData?: any // This will be dealSummary.right-side.dealData
  initialNote?: string
}

interface CustomerData {
  Name?: string
  Email?: string
  Company?: string
  Role?: string
  "Phone Number"?: string
  phone?: string
  // Add any other potential fields
}

const HubspotContactPopup = ({ onClose, onSuccess, initialData, dealData, initialNote }: HubspotContactPopupProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [extractedCustomers, setExtractedCustomers] = useState<CustomerData[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null)
  const [noteContent, setNoteContent] = useState<string>(initialNote || "")

  // Extract customer data from the dealData
  useEffect(() => {
    if (dealData) {
      try {
        console.log("Processing dealData:", typeof dealData, dealData)

        // Function to extract and process customers from a valid JSON object
        const processCustomersFromJSON = (jsonData: any) => {
          if (jsonData && typeof jsonData === "object") {
            // Check if there's a direct Customers array
            if (Array.isArray(jsonData.Customers) && jsonData.Customers.length > 0) {
              console.log("Found Customers array with", jsonData.Customers.length, "customers")
              console.log("First customer:", jsonData.Customers[0])
              setExtractedCustomers(jsonData.Customers)
              setSelectedCustomer(0)
              updateFormFromCustomer(jsonData.Customers[0])
              return true
            }
            // Check if there's a lowercase customers array
            else if (Array.isArray(jsonData.customers) && jsonData.customers.length > 0) {
              console.log("Found customers array with", jsonData.customers.length, "customers")
              console.log("First customer:", jsonData.customers[0])
              setExtractedCustomers(jsonData.customers)
              setSelectedCustomer(0)
              updateFormFromCustomer(jsonData.customers[0])
              return true
            }
            // Check if there's a Customer array (singular)
            else if (Array.isArray(jsonData.Customer) && jsonData.Customer.length > 0) {
              console.log("Found Customer array with", jsonData.Customer.length, "customers")
              console.log("First customer:", jsonData.Customer[0])
              setExtractedCustomers(jsonData.Customer)
              setSelectedCustomer(0)
              updateFormFromCustomer(jsonData.Customer[0])
              return true
            }
            // Check nested properties for Customers array
            else {
              for (const key in jsonData) {
                if (jsonData[key] && typeof jsonData[key] === "object") {
                  if (Array.isArray(jsonData[key].Customers) && jsonData[key].Customers.length > 0) {
                    console.log(`Found Customers array in ${key} with`, jsonData[key].Customers.length, "customers")
                    console.log("First customer:", jsonData[key].Customers[0])
                    setExtractedCustomers(jsonData[key].Customers)
                    setSelectedCustomer(0)
                    updateFormFromCustomer(jsonData[key].Customers[0])
                    return true
                  } else if (Array.isArray(jsonData[key].customers) && jsonData[key].customers.length > 0) {
                    console.log(`Found customers array in ${key} with`, jsonData[key].customers.length, "customers")
                    console.log("First customer:", jsonData[key].customers[0])
                    setExtractedCustomers(jsonData[key].customers)
                    setSelectedCustomer(0)
                    updateFormFromCustomer(jsonData[key].customers[0])
                    return true
                  }
                }
              }
            }
          }
          return false
        }

        // CASE 1: If dealData is already an object (JSON)
        if (typeof dealData === "object" && dealData !== null) {
          console.log("dealData is already an object, looking for Customers array")

          // If it has a content property that might be HTML
          if (dealData.content && typeof dealData.content === "string" && dealData.content.includes("<")) {
            console.log("Found HTML content in dealData.content, extracting JSON")
            const extractedJSON = extractJSONFromHTML(dealData.content)
            if (extractedJSON && processCustomersFromJSON(extractedJSON)) {
              return
            }
          }
          // Otherwise process the object directly
          else if (processCustomersFromJSON(dealData)) {
            return
          }
        }
        // CASE 2: If dealData is a string (might be HTML or JSON string)
        else if (typeof dealData === "string") {
          // Check if it's HTML
          if (dealData.includes("<") && dealData.includes(">")) {
            console.log("dealData is HTML, extracting JSON")
            const extractedJSON = extractJSONFromHTML(dealData)
            if (extractedJSON && processCustomersFromJSON(extractedJSON)) {
              return
            }
          }
          // Try parsing as JSON string
          else {
            try {
              console.log("Trying to parse dealData as JSON string")
              const parsedData = JSON.parse(dealData)
              if (processCustomersFromJSON(parsedData)) {
                return
              }
            } catch (e) {
              console.error("Failed to parse dealData as JSON string:", e)
            }
          }
        }

        // If we couldn't find customers through the standard methods, try fallback methods
        console.log("No Customers array found, trying fallback methods")
        if (typeof dealData === "string" && dealData.includes("<")) {
          // Try to extract customer data directly from HTML
          const customers = extractCustomersFromHtml(dealData)
          if (customers.length > 0) {
            console.log("Extracted customers from HTML:", customers)
            setExtractedCustomers(customers)
            setSelectedCustomer(0)
            updateFormFromCustomer(customers[0])
            return
          }
        }

        // Last resort: try to extract any customer-like data from the object
        if (typeof dealData === "object" && dealData !== null) {
          extractCustomersFromObject(dealData)
        }
      } catch (error) {
        console.error("Error processing dealData:", error)
      }
    }
  }, [dealData, initialData])

  // Add this new function to extract JSON from HTML content
  const extractJSONFromHTML = (html: string): any | null => {
    try {
      console.log("Extracting JSON from HTML")

      // Create a temporary DOM element to parse the HTML
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")

      // Get the text content
      const textContent = doc.body.textContent || ""

      // Look for JSON-like patterns in the text
      // First try: Look for content between curly braces
      const jsonRegex = /{[\s\S]*}/
      const match = textContent.match(jsonRegex)

      if (match && match[0]) {
        try {
          const jsonData = JSON.parse(match[0])
          console.log("Successfully extracted JSON from HTML:", jsonData)
          return jsonData
        } catch (e) {
          console.error("Failed to parse extracted JSON:", e)
        }
      }

      // Second try: Look for specific patterns like "Customers":[{...}]
      const customersRegex = /"Customer"\s*:\s*\[\s*{[\s\S]*?}\s*\]/
      const customersMatch = textContent.match(customersRegex)

      if (customersMatch && customersMatch[0]) {
        try {
          // Wrap in curly braces to make it valid JSON
          const jsonData = JSON.parse(`{${customersMatch[0]}}`)
          console.log("Successfully extracted Customers JSON from HTML:", jsonData)
          return jsonData
        } catch (e) {
          console.error("Failed to parse extracted Customers JSON:", e)
        }
      }

      return null
    } catch (error) {
      console.error("Error extracting JSON from HTML:", error)
      return null
    }
  }

  // Helper function to extract customer-like data from any object
  const extractCustomersFromObject = (obj: any) => {
    if (!obj || typeof obj !== "object") return

    console.log("Extracting customers from object")
    const customers: CustomerData[] = []

    // Function to recursively search for customer-like objects
    const findCustomers = (data: any, path = "") => {
      if (!data || typeof data !== "object") return

      // Check if this object looks like a customer
      if ((data.Name || data.name || data.email || data.Email) && typeof data !== "function" && !Array.isArray(data)) {
        console.log(`Found potential customer at ${path}:`, data)
        customers.push({
          Name: data.Name || data.name || "",
          Email: data.Email || data.email || "",
          Company: data.Company || data.company || "",
          Role: data.Role || data.role || "",
          "Phone Number": data["Phone Number"] || data.phone || data.phoneNumber || "",
        })
        return
      }

      // If it's an array, check each item
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          findCustomers(item, `${path}[${index}]`)
        })
        return
      }

      // Otherwise, check each property
      Object.entries(data).forEach(([key, value]) => {
        findCustomers(value, path ? `${path}.${key}` : key)
      })
    }

    findCustomers(obj)

    if (customers.length > 0) {
      console.log("Extracted customers from object:", customers)
      setExtractedCustomers(customers)
      setSelectedCustomer(0)
      updateFormFromCustomer(customers[0])
    }
  }

  // Helper function to extract potential customer data from text
  const extractCustomersFromText = (text: string) => {
    console.log("Extracting customers from text")
    const customers: CustomerData[] = []

    // Look for email patterns
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    const emails = text.match(emailRegex)

    if (emails && emails.length > 0) {
      console.log("Found emails in text:", emails)
      emails.forEach((email) => {
        customers.push({
          Email: email,
        })
      })

      setExtractedCustomers(customers)
      setSelectedCustomer(0)
      updateFormFromCustomer(customers[0])
    }
  }

  // Helper function to update form data from a customer object
  const updateFormFromCustomer = (customer: CustomerData) => {
    console.log("Updating form from customer:", customer)

    // Split name into first and last name if possible
    let firstName = ""
    let lastName = ""

    if (customer.Name) {
      const nameParts = customer.Name.split(" ")
      if (nameParts.length > 1) {
        firstName = nameParts[0]
        lastName = nameParts.slice(1).join(" ")
      } else {
        firstName = customer.Name
      }
    }

    // Clean up the email field - extract just the email part
    let email = ""
    if (customer.Email) {
      // Use regex to extract just the email address
      const emailMatch = customer.Email.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/)
      if (emailMatch) {
        email = emailMatch[0]
      } else {
        email = customer.Email
      }
    }

    // Clean up the company field
    const company = customer.Company || ""

    // Clean up the phone field
    const phone = customer["Phone Number"] || ""

    console.log("Cleaned form data:", { firstName, lastName, email, company, phone })

    setFormData({
      firstName,
      lastName,
      email,
      phone,
      company,
    })
  }

  // Set initial data if provided
  useEffect(() => {
    if (initialData) {
      // Split name into first and last name if possible
      let firstName = ""
      let lastName = ""
      if (initialData.name) {
        const nameParts = initialData.name.split(" ")
        if (nameParts.length > 1) {
          firstName = nameParts[0]
          lastName = nameParts.slice(1).join(" ")
        } else {
          firstName = initialData.name
        }
      }

      setFormData({
        firstName,
        lastName,
        email: initialData.email || "",
        phone: initialData.phone || "",
        company: initialData.company || "",
      })
    }
  }, [initialData])

  // Function to extract customer data from HTML (fallback method)
  const extractCustomersFromHtml = (html: string): CustomerData[] => {
    try {
      console.log("Extracting customers from HTML")
      // Create a temporary DOM element to parse the HTML
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")

      // Look for sections that might contain customer information
      const customers: CustomerData[] = []

      // Try to find a "Customers" section
      const customerSections = Array.from(doc.querySelectorAll("h2, h3")).filter(
        (el) =>
          el.textContent?.toLowerCase().includes("customer") ||
          el.textContent?.toLowerCase().includes("client") ||
          el.textContent?.toLowerCase().includes("stakeholder"),
      )

      if (customerSections.length > 0) {
        console.log("Found customer sections:", customerSections.length)
        console.log("Found customer sections:", customerSections)
        // For each potential customer section
        customerSections.forEach((section) => {
          // Look for lists that might contain customer data
          let listElement = section.nextElementSibling

          // Keep looking for a list element
          while (
            listElement &&
            listElement.tagName.toLowerCase() !== "ul" &&
            !["h2", "h3", "h4"].includes(listElement.tagName.toLowerCase())
          ) {
            listElement = listElement.nextElementSibling
          }

          // If we found a list
          if (listElement && listElement.tagName.toLowerCase() === "ul") {
            // Process each list item as a potential customer
            const listItems = listElement.querySelectorAll("li")
            console.log("Found list items:", listItems.length)

            listItems.forEach((item) => {
              // Check if this list item contains structured data (like "Name: John Doe")
              const customerData: CustomerData = {}

              // Look for structured data with labels
              const strongElements = item.querySelectorAll("strong")
              strongElements.forEach((strong) => {
                const label = strong.textContent?.replace(":", "").trim()
                if (label) {
                  // Get the text after the label
                  let value = ""
                  let nextNode = strong.nextSibling

                  // Skip any whitespace nodes
                  while (nextNode && nextNode.nodeType === 3 && nextNode.textContent?.trim() === "") {
                    nextNode = nextNode.nextSibling
                  }

                  // If the next node is a text node, use its content
                  if (nextNode && nextNode.nodeType === 3) {
                    value = nextNode.textContent?.trim() || ""
                    // Remove leading colon if present
                    value = value.replace(/^:\s*/, "")
                  } else if (nextNode && nextNode.nodeType === 1) {
                    // If it's an element node, use its text content
                    value = (nextNode as Element).textContent?.trim() || ""
                  }

                  if (value) {
                    customerData[label as keyof CustomerData] = value
                  }
                }
              })

              // If we found structured data, add it to our customers array
              if (Object.keys(customerData).length > 0) {
                console.log("Found customer data:", customerData)
                customers.push(customerData)
              }
            })
          }
        })
      }

      // If we couldn't find structured data, try to look for any email addresses
      if (customers.length === 0) {
        // Look for email patterns in the text
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
        const text = doc.body.textContent || ""
        const emails = text.match(emailRegex)

        if (emails && emails.length > 0) {
          console.log("Found emails in HTML:", emails)
          // For each email, create a customer entry
          emails.forEach((email) => {
            customers.push({
              Email: email,
            })
          })
        }
      }

      return customers
    } catch (error) {
      console.error("Error parsing HTML:", error)
      return []
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle customer selection
  const handleSelectCustomer = (index: number) => {
    const customer = extractedCustomers[index]
    updateFormFromCustomer(customer)
    setSelectedCustomer(index)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email) {
      setError("Email is required")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(false)

      const result = await createHubspotContact({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        company: formData.company,
      })

      console.log("Contact creation result:", result)

      setSuccess(true)

      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 1500)
      } else {
        // Otherwise close the popup after a delay
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    } catch (error: any) {
      console.error("Error creating contact:", error)
      setError(error.message || "Failed to create contact")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Add Contact to HubSpot</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Customer selection if we have extracted customers */}
        {extractedCustomers.length > 0 && (
          <div className="mb-4">
            <Label className="mb-2 block">Select a contact from the deal summary:</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
              {extractedCustomers.map((customer, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-md cursor-pointer ${selectedCustomer === index ? "bg-primary/10 border border-primary/30" : "hover:bg-gray-50"}`}
                  onClick={() => handleSelectCustomer(index)}
                >
                  <div className="font-medium">{customer.Name || "Unknown Name"}</div>
                  <div className="text-sm text-gray-500">
                    {customer.Email && <div>{customer.Email}</div>}
                    {customer.Company && <div>{customer.Company}</div>}
                    {customer.Role && <div>{customer.Role}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  className="pl-8"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
                <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  className="pl-8"
                  value={formData.lastName}
                  onChange={handleInputChange}
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
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                className="pl-8"
                required
                value={formData.email}
                onChange={handleInputChange}
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
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  className="pl-8"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <div className="relative">
                <Building2 className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="company"
                  name="company"
                  placeholder="Acme Inc."
                  className="pl-8"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>
            </div>
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
              Contact created successfully!
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full bg-[#ff7a59] text-white hover:bg-[#ff8f73]">
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                Creating...
              </>
            ) : (
              <>Add to HubSpot</>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default HubspotContactPopup
