import type React from "react"
import type { Metadata } from "next"
import { Figtree } from "next/font/google"
import { ReduxProvider } from "@/lib/redux/provider"
import { ToastProvider } from "@/components/ui/toast"
import { AuthProvider } from "@/contexts/AuthContext"
import AuthLoadingScreen from "@/components/auth/AuthLoadingScreen"
import "./globals.css"

// Properly initialize the Figtree font
const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "GetAligned",
  description: "Efficiently manage your meetings and stay aligned with your team",
  icons: {
    icon: 'https://s3.ap-south-1.amazonaws.com/getaligned.work/GetAligned+1.png'
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={figtree.className} suppressHydrationWarning>
        <ReduxProvider>
          <ToastProvider>
            <AuthProvider>
              <AuthLoadingScreen>
                {children}
              </AuthLoadingScreen>
            </AuthProvider>
          </ToastProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
