import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/context/auth-context"
import { LanguageProvider } from "@/context/language-context"
import { ChatbotProvider } from "@/components/chatbot/chatbot-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AgriConnect - Connect Farmers with Markets",
  description: "Platform connecting farmers with traders for better prices and opportunities",
  generator: "v0.app",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <LanguageProvider>
          <AuthProvider>
            {children}
            <ChatbotProvider />
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
