"use client"

import { useEffect, useCallback, useMemo } from "react"
import { usePreferences } from "@/lib/preferences-context"
import { useI18n } from "@/lib/i18n"

export function useNotifications() {
  const { preferences } = usePreferences()
  const { t, language } = useI18n()

  // Serialize notification times to avoid useEffect dependency array size changes
  const notificationTimesKey = useMemo(
    () => JSON.stringify(preferences.notificationTimes),
    [preferences.notificationTimes]
  )

  // Register service worker on mount
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[App] Service Worker registered:", registration.scope)
        })
        .catch((error) => {
          console.error("[App] Service Worker registration failed:", error)
        })
    }
  }, [])

  // Schedule notifications based on preferences
  useEffect(() => {
    if (!preferences.notificationsEnabled) return
    if (!("Notification" in window) || Notification.permission !== "granted") return

    const notificationTimes: string[] = JSON.parse(notificationTimesKey)

    // Set up interval to check times and show notifications
    const checkAndNotify = () => {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
      
      // Check all notification times
      if (notificationTimes.includes(currentTime)) {
        const hour = now.getHours()
        const isMorning = hour < 12
        const isEvening = hour >= 18
        
        let title: string
        let body: string
        
        if (isMorning) {
          title = language === "pt-BR" ? "☀️ Bom dia!" : "☀️ Good morning!"
          body = language === "pt-BR" 
            ? "Pronto para mais um dia de foco?" 
            : "Ready for another focused day?"
        } else if (isEvening) {
          title = language === "pt-BR" ? "🌙 Fim do dia!" : "🌙 End of day!"
          body = language === "pt-BR" 
            ? "Como você foi hoje? Hora de registrar!" 
            : "How did you do today? Time to check in!"
        } else {
          title = language === "pt-BR" ? "📱 Lembrete" : "📱 Reminder"
          body = language === "pt-BR" 
            ? "Hora de verificar seu progresso!" 
            : "Time to check your progress!"
        }
        
        showLocalNotification(title, body, `offstreak-${currentTime}`)
      }
    }

    // Check every minute
    const interval = setInterval(checkAndNotify, 60000)
    
    // Also check immediately
    checkAndNotify()

    return () => clearInterval(interval)
  }, [preferences.notificationsEnabled, notificationTimesKey, language])

  const showLocalNotification = useCallback(async (title: string, body: string, tag: string) => {
    if (!("serviceWorker" in navigator)) {
      // Fallback to basic notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, icon: "/icon.svg", tag })
      }
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      registration.active?.postMessage({
        type: "SHOW_NOTIFICATION",
        title,
        body,
        tag,
      })
    } catch (error) {
      console.error("[App] Failed to show notification:", error)
    }
  }, [])

  return {
    showLocalNotification,
  }
}
