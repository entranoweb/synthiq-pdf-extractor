import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import { cn } from "@/lib/utils"
import "./globals.css"

export const metadata: Metadata = {
  title: "Synthiq PDF Data Extractor",
  description: "Extract structured data from PDF files using AI",
}

const fontHeading = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["400", "600", "700"]
})

const fontBody = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500"]
})

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          fontHeading.variable,
          fontBody.variable
        )}
      >
        {children}
      </body>
    </html>
  )
}