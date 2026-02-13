"use client"

import { useState, useEffect } from "react"
import { Download, X } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const { t } = useI18n()
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (!deferredPrompt || dismissed) return null

  const handleInstall = async () => {
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setDeferredPrompt(null)
    }
  }

  return (
    <div className="fixed left-4 right-4 top-4 z-50 flex items-center gap-3 rounded-2xl bg-card p-4 shadow-lg border border-border animate-fade-in-up">
      <Download className="h-5 w-5 text-primary flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{t.common.installTitle}</p>
        <p className="text-xs text-muted-foreground">
          {t.common.installDesc}
        </p>
      </div>
      <button
        onClick={handleInstall}
        className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
      >
        {t.common.install}
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-muted-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
