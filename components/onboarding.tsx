"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { usePreferences } from "@/lib/preferences-context"
import {
  Sparkles,
  Bell,
  Clock,
  ChevronRight,
  Check,
  Sun,
  Moon,
} from "lucide-react"

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useI18n()
  const { preferences, updatePreferences, requestNotificationPermission } = usePreferences()
  const [step, setStep] = useState(0)
  const [morningTime, setMorningTime] = useState(preferences.morningTime)
  const [eveningTime, setEveningTime] = useState(preferences.eveningTime)

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      handleFinish()
    }
  }

  const handleFinish = async () => {
    // Save preferences
    updatePreferences({
      morningTime,
      eveningTime,
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

    await onComplete()
  }

  const steps = [
    {
      icon: <Sparkles className="h-16 w-16 text-primary" />,
      title: t.onboarding.welcomeTitle,
      description: t.onboarding.welcomeDesc,
    },
    {
      icon: <Bell className="h-16 w-16 text-primary" />,
      title: t.onboarding.howItWorksTitle,
      description: t.onboarding.howItWorksDesc,
    },
    {
      icon: <Clock className="h-16 w-16 text-primary" />,
      title: t.onboarding.scheduleTitle,
      description: t.onboarding.scheduleDesc,
      hasTimePickers: true,
    },
  ]

  const currentStep = steps[step]

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === step ? "bg-primary" : i < step ? "bg-primary/50" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8">
        {/* Icon with glow */}
        <div className="relative">
          <div className="absolute inset-0 blur-2xl opacity-30 bg-primary rounded-full scale-150" />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            {currentStep.icon}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-foreground">
          {currentStep.title}
        </h1>

        {/* Description */}
        <p className="text-center text-muted-foreground max-w-sm">
          {currentStep.description}
        </p>

        {/* Time pickers (only on last step) */}
        {currentStep.hasTimePickers && (
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
              <input
                type="time"
                value={morningTime}
                onChange={(e) => setMorningTime(e.target.value)}
                className="rounded-lg bg-background px-3 py-2 text-sm text-foreground border border-border"
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
              <input
                type="time"
                value={eveningTime}
                onChange={(e) => setEveningTime(e.target.value)}
                className="rounded-lg bg-background px-3 py-2 text-sm text-foreground border border-border"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div className="p-8">
        <button
          onClick={handleNext}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
        >
          {step === 2 ? (
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

        {step < 2 && (
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
