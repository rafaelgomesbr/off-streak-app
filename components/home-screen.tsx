"use client"

import { useStreak } from "@/hooks/use-streak"
import { useI18n } from "@/lib/i18n"
import { Flame, Trophy, Sun, Moon, Play, ShieldCheck, ShieldX, Sparkles } from "lucide-react"
import { useRef, useState } from "react"
import confetti from "canvas-confetti"

export function HomeScreen() {
  const { data, loading, dayStatus, currentPhase, startDay, markSuccess, markFail } = useStreak()
  const { t } = useI18n()
  const [showResult, setShowResult] = useState<"success" | "fail" | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleStartDay = async () => {
    if (isAnimating) return
    setIsAnimating(true)
    await startDay()
    // Small celebration
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ["#f97316", "#fbbf24"],
    })
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handleSuccess = async () => {
    if (dayStatus === "completed" || isAnimating) return
    setIsAnimating(true)
    await markSuccess()
    setShowResult("success")
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f97316", "#fb923c", "#fbbf24", "#f59e0b"],
    })
    setTimeout(() => setIsAnimating(false), 1000)
  }

  const handleFail = async () => {
    if (dayStatus === "completed" || isAnimating) return
    setIsAnimating(true)
    await markFail()
    setShowResult("fail")
    setTimeout(() => setIsAnimating(false), 1000)
  }

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Flame className="h-8 w-8 animate-pulse text-primary" />
      </div>
    )
  }

  const encouragements = t.home.encouragements
  const failMessages = t.home.failMessages
  const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)]
  const randomFailMsg = failMessages[Math.floor(Math.random() * failMessages.length)]

  return (
    <div
      ref={containerRef}
      className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-6 pb-24"
    >
      {/* Phase Indicator */}
      <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 border border-border animate-fade-in-up">
        {currentPhase === "morning" ? (
          <>
            <Sun className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-muted-foreground">
              {t.morning.greeting}
            </span>
          </>
        ) : (
          <>
            <Moon className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-muted-foreground">
              {t.evening.greeting}
            </span>
          </>
        )}
      </div>

      {/* Streak Counter */}
      <div className="flex flex-col items-center gap-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-card to-card/80 border border-border shadow-2xl">
          <div className="flex flex-col items-center">
            <span
              className={`text-7xl font-black tabular-nums text-foreground ${
                showResult === "success" ? "animate-count-up" : ""
              } ${showResult === "fail" ? "animate-shake" : ""}`}
            >
              {data?.currentStreak ?? 0}
            </span>
          </div>
          {(data?.currentStreak ?? 0) > 0 && (
            <div className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 animate-pulse-glow shadow-lg">
              <Flame className="h-6 w-6 text-primary-foreground" />
            </div>
          )}
          {dayStatus === "in-progress" && (
            <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 animate-pulse">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
        <p className="text-lg font-medium text-muted-foreground">
          {t.home.daysWithout}
        </p>
      </div>

      {/* Best Streak */}
      <div className="flex items-center gap-2 rounded-2xl bg-card px-5 py-3 border border-border animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
        <Trophy className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          {t.home.bestStreak}:
        </span>
        <span className="text-sm font-bold text-foreground">
          {data?.bestStreak ?? 0} {t.home.days}
        </span>
      </div>

      {/* Result Message */}
      {showResult && (
        <div
          className={`animate-fade-in-up rounded-2xl px-6 py-3 text-center text-sm font-medium ${
            showResult === "success"
              ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {showResult === "success" ? randomEncouragement : randomFailMsg}
        </div>
      )}

      {/* Action Section */}
      <div className="flex w-full max-w-xs flex-col gap-3 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        {/* Morning Phase - Start Day */}
        {currentPhase === "morning" && dayStatus === "not-started" && (
          <>
            <p className="text-center text-sm text-muted-foreground mb-2">
              {t.morning.question}
            </p>
            <button
              onClick={handleStartDay}
              disabled={isAnimating}
              className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-primary/90 px-6 py-4 text-base font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-40"
            >
              <Play className="h-5 w-5" />
              {t.morning.startButton}
            </button>
          </>
        )}

        {/* Day In Progress - Morning */}
        {currentPhase === "morning" && dayStatus === "in-progress" && (
          <div className="rounded-2xl bg-card px-6 py-4 text-center border border-border">
            <p className="text-sm font-medium text-foreground">
              {t.morning.alreadyStarted}
            </p>
          </div>
        )}

        {/* Evening Phase - Not Started */}
        {currentPhase === "evening" && dayStatus === "not-started" && (
          <div className="rounded-2xl bg-card px-6 py-4 text-center border border-border">
            <p className="text-sm text-muted-foreground">
              {t.evening.notStarted}
            </p>
          </div>
        )}

        {/* Evening Phase - Can Answer */}
        {currentPhase === "evening" && dayStatus === "in-progress" && !showResult && (
          <>
            <p className="text-center text-sm text-muted-foreground mb-2">
              {t.evening.question}
            </p>
            <button
              onClick={handleSuccess}
              disabled={isAnimating}
              className="flex items-center justify-center gap-3 rounded-2xl bg-[hsl(var(--success))] px-6 py-4 text-base font-semibold text-[hsl(var(--success-foreground))] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
            >
              <ShieldCheck className="h-5 w-5" />
              {t.evening.successButton}
            </button>

            <button
              onClick={handleFail}
              disabled={isAnimating}
              className="flex items-center justify-center gap-3 rounded-2xl bg-destructive px-6 py-4 text-base font-semibold text-destructive-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
            >
              <ShieldX className="h-5 w-5" />
              {t.evening.failButton}
            </button>
          </>
        )}

        {/* Already Completed */}
        {(dayStatus === "completed" || dayStatus === "failed") && !showResult && (
          <div className="rounded-2xl bg-card px-6 py-4 text-center border border-border">
            <p className="text-sm text-muted-foreground">
              {t.evening.alreadyAnswered}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
