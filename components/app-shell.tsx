"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n"
import { usePreferences } from "@/lib/preferences-context"
import { useNotifications } from "@/hooks/use-notifications"
import { LoginScreen } from "@/components/login-screen"
import { HomeScreen } from "@/components/home-screen"
import { RankingScreen } from "@/components/ranking-screen"
import { ProfileScreen } from "@/components/profile-screen"
import { BottomNav } from "@/components/bottom-nav"
import { InstallPrompt } from "@/components/install-prompt"
import { Onboarding } from "@/components/onboarding"
import { LandingPage } from "@/components/landing-page"
import { Flame } from "lucide-react"

type Tab = "home" | "ranking" | "profile"

export function AppShell() {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  const { preferences, completeOnboarding } = usePreferences()
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [showLanding, setShowLanding] = useState(true)
  const [isPWA, setIsPWA] = useState(false)
  
  // Initialize notifications
  useNotifications()

  // Detect if running as PWA (installed app)
  useEffect(() => {
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://")
    
    setIsPWA(isStandalone)
    
    // If it's a PWA, skip landing page
    if (isStandalone) {
      setShowLanding(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Flame className="h-10 w-10 animate-pulse text-primary" />
          <p className="text-sm text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    )
  }

  // Show landing page for browser users (not PWA) who aren't logged in
  if (!user && showLanding && !isPWA) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />
  }

  if (!user) {
    return <LoginScreen />
  }

  // Show onboarding for new users
  if (!preferences.onboardingCompleted) {
    return <Onboarding onComplete={completeOnboarding} />
  }

  return (
    <div className="mx-auto min-h-screen max-w-md">
      <InstallPrompt />
      {activeTab === "home" && <HomeScreen />}
      {activeTab === "ranking" && <RankingScreen />}
      {activeTab === "profile" && <ProfileScreen />}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}
