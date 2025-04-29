"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HubspotIcon } from "@/components/icons/HubspotIcon"
import { getHubspotAuthUrl, isHubspotConnected } from "@/services/hubspotService"
import { CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

export default function IntegrationsPage() {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const connected = await isHubspotConnected()
        setIsConnected(connected)
      } catch (error) {
        console.error("Error checking connection:", error)
        setError("Failed to check connection status")
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  const handleConnectHubspot = () => {
    const authUrl = getHubspotAuthUrl()
    window.location.href = authUrl
  }

  const handleManageHubspot = () => {
    router.push("/integrations/hubspot/dashboard")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-2">Connect your GetAligned account with your favorite tools</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden border-2 border-transparent transition-all hover:border-orange-200 hover:shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <HubspotIcon size={48} />
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-600">CRM</span>
            </div>
            <CardTitle className="mt-4 text-xl">HubSpot</CardTitle>
            <CardDescription>Sync your meeting data with HubSpot CRM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-start">
                <div className="mr-2 mt-0.5 h-4 w-4 rounded-full bg-green-100 text-center text-[10px] font-bold text-green-600">
                  ✓
                </div>
                <p>Automatically create contacts in HubSpot</p>
              </div>
              <div className="flex items-start">
                <div className="mr-2 mt-0.5 h-4 w-4 rounded-full bg-green-100 text-center text-[10px] font-bold text-green-600">
                  ✓
                </div>
                <p>Log meetings and notes to your HubSpot timeline</p>
              </div>
              <div className="flex items-start">
                <div className="mr-2 mt-0.5 h-4 w-4 rounded-full bg-green-100 text-center text-[10px] font-bold text-green-600">
                  ✓
                </div>
                <p>Create deals and tasks based on meeting outcomes</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            {isLoading ? (
              <Button disabled className="w-full">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                Checking connection...
              </Button>
            ) : error ? (
              <div className="flex w-full flex-col items-center gap-2">
                <div className="flex w-full items-center justify-center rounded-md bg-red-50 py-2 text-sm text-red-600">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {error}
                </div>
                <Button onClick={handleConnectHubspot} className="w-full bg-[#ff7a59] text-white hover:bg-[#ff8f73]">
                  Connect HubSpot
                </Button>
              </div>
            ) : isConnected ? (
              <div className="flex w-full flex-col items-center gap-2">
                <div className="flex w-full items-center justify-center rounded-md bg-green-50 py-2 text-sm text-green-600">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Connected to HubSpot
                </div>
                <Button onClick={handleManageHubspot} className="w-full bg-[#ff7a59] text-white hover:bg-[#ff8f73]">
                  Manage HubSpot
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={handleConnectHubspot} className="w-full bg-[#ff7a59] text-white hover:bg-[#ff8f73]">
                Connect HubSpot
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Placeholder for future integrations */}
        <Card className="border-dashed border-gray-300 bg-gray-50/50">
          <CardHeader>
            <CardTitle className="text-gray-500">More integrations coming soon</CardTitle>
            <CardDescription>
              We're working on adding more integrations to help streamline your workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="flex h-40 items-center justify-center">
            <p className="text-center text-sm text-gray-500">
              Have a suggestion? Let us know what tools you'd like to see integrated.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
