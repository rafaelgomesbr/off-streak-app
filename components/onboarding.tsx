"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { usePreferences } from "@/lib/preferences-context"
import { NetworkSelection } from "@/components/network-selection"
import { TimeInput24h } from "@/components/ui/time-input-24h"
import { type SocialNetworkId } from "@/lib/social-networks"
import {
  Sparkles,
  Bell,
  Clock,
  ChevronRight,
  Check,
  Sun,
  Moon,
  Share2,
} from "lucide-react"

interface OnboardingProps {
  onComplete: (selectedNetworks: SocialNetworkId[]) => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useI18n()
  const { preferences, updatePreferences, requestNotificationPermission } = usePreferences()
  const [step, setStep] = useState(0)
  const [challengeStartTime, setChallengeStartTime] = useState(preferences.challengeStartTime)
  const [challengeEndTime, setChallengeEndTime] = useState(preferences.challengeEndTime)
  const [selectedNetworks, setSelectedNetworks] = useState<SocialNetworkId[]>([
    "instagram",
    "tiktok",
    "twitter",
  ])

  const totalSteps = 4

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1)
    } else {
      handleFinish()
    }
  }

  const handleFinish = async () => {
    // Save preferences
    updatePreferences({
      challengeStartTime,
      challengeEndTime,
      notificationTimes: [challengeStartTime, challengeEndTime],
    })

    // Request notification permission
    try {
      const granted = await requestNotificationPermission()
      if (granted) {
        updatePreferences({ notificationsEnabled: true })
      }
    } catch (e) {
      console.log("Notification permission error:", e)
    }

    await onComplete(selectedNetworks)
  }

  const canProceed = step !== 2 || selectedNetworks.length > 0

  const renderContent = () => {
    switch (step) {
      case 0:
        return (
          <>
            <div className="relative">
              <div className="absolute inset-0 blur-2xl opacity-30 bg-primary rounded-full scale-150" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Sparkles className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-foreground">
              {t.onboarding.welcomeTitle}
            </h1>
            <p className="text-center text-muted-foreground max-w-sm">
              {t.onboarding.welcomeDesc}
            </p>
          </>
        )
      case 1:
        return (
          <>
            <div className="relative">
              <div className="absolute inset-0 blur-2xl opacity-30 bg-primary rounded-full scale-150" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Bell className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-foreground">
              {t.onboarding.howItWorksTitle}
            </h1>
            <p className="text-center text-muted-foreground max-w-sm">
              {t.onboarding.howItWorksDesc}
            </p>
          </>
        )
      case 2:
        return (
          <>
            <div className="relative">
              <div className="absolute inset-0 blur-2xl opacity-30 bg-primary rounded-full scale-150" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Share2 className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-foreground">
              {t.networks.selectTitle}
            </h1>
            <p className="text-center text-muted-foreground max-w-sm text-sm">
              {t.networks.selectDesc}
            </p>
            <div className="w-full max-w-sm mt-2">
              <NetworkSelection
                selectedNetworks={selectedNetworks}
                onChange={setSelectedNetworks}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground/70">
              {t.networks.selectHint}
            </p>
          </>
        )
      case 3:
        return (
          <>
            <div className="relative">
              <div className="absolute inset-0 blur-2xl opacity-30 bg-primary rounded-full scale-150" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Clock className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-foreground">
              {t.onboarding.scheduleTitle}
            </h1>
            <p className="text-center text-muted-foreground max-w-sm">
              {t.onboarding.scheduleDesc}
            </p>
            <div className="flex flex-col gap-4 w-full max-w-xs mt-4">
              {/* Morning time */}
              <div className="flex items-center gap-4 rounded-2xl bg-secondary/50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
                  <Sun className="h-6 w-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {t.onboarding.morningLabel}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.onboarding.morningHint}
                  </p>
                </div>
                <TimeInput24h
                  value={challengeStartTime}
                  onChange={(value) => setChallengeStartTime(value)}
                />
              </div>

              {/* Evening time */}
              <div className="flex items-center gap-4 rounded-2xl bg-secondary/50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20">
                  <Moon className="h-6 w-6 text-indigo-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {t.onboarding.eveningLabel}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.onboarding.eveningHint}
                  </p>
                </div>
                <TimeInput24h
                  value={challengeEndTime}
                  onChange={(value) => setChallengeEndTime(value)}
                />
              </div>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === step ? "bg-primary" : i < step ? "bg-primary/50" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 overflow-y-auto py-4">
        {renderContent()}
      </div>

      {/* Bottom button */}
      <div className="p-8 pt-4">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-semibold shadow-lg transition-transform active:scale-[0.98] ${
            canProceed
              ? "bg-primary text-primary-foreground shadow-primary/20"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {step === totalSteps - 1 ? (
            <>
              <Check className="h-5 w-5" />
              {t.onboarding.finishButton}
            </>
          ) : (
            <>
              {t.onboarding.nextButton}
              <ChevronRight className="h-5 w-5" />
            </>
          )}
        </button>

        {step < totalSteps - 1 && (
          <button
            onClick={handleFinish}
            className="mt-4 w-full text-center text-sm text-muted-foreground"
          >
            {t.onboarding.skipButton}
          </button>
        )}
      </div>
    </div>
  )
}
