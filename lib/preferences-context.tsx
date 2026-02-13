"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"

export interface UserPreferences {
  notificationsEnabled: boolean
  morningTime: string // HH:mm format
  eveningTime: string // HH:mm format
  onboardingCompleted: boolean
}

interface PreferencesContextType {
  preferences: UserPreferences
  updatePreferences: (prefs: Partial<UserPreferences>) => void
  requestNotificationPermission: () => Promise<boolean>
  completeOnboarding: () => void
}

const defaultPreferences: UserPreferences = {
  notificationsEnabled: false,
  morningTime: "08:00",
  eveningTime: "22:00",
  onboardingCompleted: false,
}

const PreferencesContext = createContext<PreferencesContextType>({
  preferences: defaultPreferences,
  updatePreferences: () => {},
  requestNotificationPermission: async () => false,
  completeOnboarding: () => {},
})

const STORAGE_KEY = "offstreak-preferences"

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPreferences({ ...defaultPreferences, ...parsed })
      } catch {
        // Ignore parse errors
      }
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
      
      // Schedule notifications if enabled
      if (preferences.notificationsEnabled && "serviceWorker" in navigator) {
        scheduleNotifications(preferences)
      }
    }
  }, [preferences, mounted])

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...prefs }))
  }

  const completeOnboarding = () => {
    setPreferences((prev) => ({ ...prev, onboardingCompleted: true }))
  }

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }

    return false
  }

  if (!mounted) {
    return (
      <PreferencesContext.Provider
        value={{
          preferences: defaultPreferences,
          updatePreferences,
          requestNotificationPermission,
          completeOnboarding,
        }}
      >
        {children}
      </PreferencesContext.Provider>
    )
  }

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        requestNotificationPermission,
        completeOnboarding,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}

export const usePreferences = () => useContext(PreferencesContext)

// Helper to schedule notifications
async function scheduleNotifications(prefs: UserPreferences) {
  if (!("serviceWorker" in navigator)) return

  try {
    const registration = await navigator.serviceWorker.ready
    
    // Clear existing notifications
    // Note: The actual scheduling needs to happen in the service worker
    // For now, we'll just store the preferences and check times
    
    // Store times in localStorage for the service worker to read
    localStorage.setItem("offstreak-notification-times", JSON.stringify({
      morning: prefs.morningTime,
      evening: prefs.eveningTime,
    }))
  } catch (error) {
    console.error("Error scheduling notifications:", error)
  }
}
