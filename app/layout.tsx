import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from '@/lib/auth-context'
import { CurrencyProvider } from "@/lib/currency-context"
import AutoLogout from '@/components/AutoLogout'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "InvesTrack - Investment Portfolio Tracker",
  description: "Track and manage your investments in one place",
  generator: 'v0.dev',
  icons: {
    icon: 'https://ouoydyymdhofhzrrvndv.supabase.co/storage/v1/object/public/public-assets//favicon.svg'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  console.log('Root layout rendering, will include AutoLogout component');
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AutoLogout />
          <CurrencyProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              {children}
            </ThemeProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
