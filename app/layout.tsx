import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { Figtree } from "next/font/google"
import { ReduxProvider } from "@/lib/redux/provider"
import { AuthProvider } from "@/components/auth-provider"
import "./globals.css"

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={figtree.variable} suppressHydrationWarning>
      <body className="font-figtree" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ReduxProvider>
            <AuthProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </AuthProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
