import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { I18nProvider } from "@/lib/i18n"
import { PreferencesProvider } from "@/lib/preferences-context"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "No Scroll Streak - Track Your Social Media Detox",
  description:
    "Track your days without social media. Stay strong, compete with friends, and build healthy habits.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "No Scroll Streak",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
}

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <I18nProvider>
          <AuthProvider>
            <PreferencesProvider>
              {children}
            </PreferencesProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
