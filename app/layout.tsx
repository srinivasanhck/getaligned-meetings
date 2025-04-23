import type React from "react"
import type { Metadata } from "next"
import { Figtree } from "next/font/google"
import { ReduxProvider } from "@/lib/redux/provider"
import { ToastProvider } from "@/components/ui/toast"
import { AuthProvider } from "@/contexts/AuthContext"
import AuthLoadingScreen from "@/components/auth/AuthLoadingScreen"
import "./globals.css"
import { Suspense } from "react"

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

// Simple loading fallback component (customize as needed)
function AuthLoadingFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      {/* You can use a spinner or a minimal layout */}
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
    </div>
  );
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
            <Suspense fallback={<AuthLoadingFallback />}>
                <AuthLoadingScreen>
                  {children}
                </AuthLoadingScreen>
            </Suspense>
              </AuthProvider>
          </ToastProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
