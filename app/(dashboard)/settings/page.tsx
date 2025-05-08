"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getBotInfo, updateBotName } from "@/services/settingsService"
import { useToast } from "@/components/ui/toast"
import { Loader2, Bot, Save, CheckCircle2, AlertCircle, RefreshCw, Info } from "lucide-react"

export default function SettingsPage() {
  const [botName, setBotName] = useState("")
  const [originalBotName, setOriginalBotName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isNewBot, setIsNewBot] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const { showToast } = useToast()

  // Generate a suggested bot name
  const generateSuggestedName = () => {
    return "Meeting Assistant"
  }

  // Fetch the current bot name
  const fetchBotInfo = async () => {
    setIsFetching(true)
    setFetchError(null)
    setIsNewBot(false)

    try {
      const botInfo = await getBotInfo()
      setBotName(botInfo.botName)
      setOriginalBotName(botInfo.botName)
    } catch (error: any) {
      console.error("Error fetching bot info:", error)

      // Handle the specific "Bot not found" error
      if (error.response?.status === 404 || error.isBotNotFoundError) {
        setIsNewBot(true)
        const suggestedName = generateSuggestedName()
        setBotName(suggestedName)
        setOriginalBotName("") // Empty original name to enable the save button
        showToast("You haven't set up a bot name yet. We've suggested one for you.", "info")
      } else {
        setFetchError("Failed to load bot information. Please try again.")
        showToast("Failed to load bot information", "error")
      }
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchBotInfo()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!botName.trim()) {
      showToast("Please enter a bot name", "error")
      return
    }

    setIsLoading(true)
    setSaveSuccess(false)

    try {
      const result = await updateBotName(botName)

      if (result.success) {
        showToast(isNewBot ? "Bot name created successfully" : "Bot name updated successfully", "success")
        setOriginalBotName(botName)
        setSaveSuccess(true)
        setIsNewBot(false) // No longer a new bot after saving

        // Reset success indicator after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false)
        }, 3000)
      } else {
        showToast(result.message, "error")
      }
    } catch (error) {
      showToast("An unexpected error occurred", "error")
      console.error("Error updating bot name:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const hasChanges = botName !== originalBotName

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <Card className="border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
            <div className="flex items-center">
              <Bot className="h-6 w-6 mr-3 text-primary" />
              <div>
                <CardTitle>Meeting Bot Settings</CardTitle>
                <CardDescription>Customize how your meeting assistant appears to participants</CardDescription>
              </div>
            </div>
          </CardHeader>

          {isFetching ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-gray-500">Loading bot settings...</p>
            </div>
          ) : fetchError ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
              <p className="text-gray-700 mb-2">{fetchError}</p>
              <Button variant="outline" size="sm" onClick={fetchBotInfo} className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-6 space-y-6">
                {isNewBot && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start mb-4">
                    <div className="bg-amber-100 rounded-full p-2 mr-3 mt-0.5">
                      <Info className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-800">First Time Setup</h4>
                      <p className="text-sm text-amber-600 mt-1">
                        You haven't set up a bot name yet. We've suggested one for you, but feel free to change it.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="botName" className="text-base font-medium">
                    Bot Display Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="botName"
                      className="pl-10 py-6 text-base"
                      placeholder="Enter bot name"
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      disabled={isLoading}
                    />
                    <Bot className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    {saveSuccess && (
                      <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    This name will be displayed when the bot joins your meetings. Choose a name that is professional and
                    easily recognizable.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-3 mt-0.5">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800">Preview</h4>
                    <p className="text-sm text-blue-600 mt-1">
                      In meetings, participants will see:{" "}
                      <span className="font-medium">{botName || "Meeting Assistant"}</span> has joined the meeting
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBotName(isNewBot ? generateSuggestedName() : originalBotName)}
                  disabled={isLoading || (!hasChanges && !isNewBot)}
                >
                  {isNewBot ? "Reset Suggestion" : "Cancel"}
                </Button>
                <Button type="submit" disabled={isLoading || (!hasChanges && !isNewBot)} className="min-w-[120px]">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isNewBot ? "Creating..." : "Saving..."}
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {isNewBot ? "Created!" : "Saved!"}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isNewBot ? "Create Bot Name" : "Save Changes"}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
