"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"

export interface UserPreferences {
  notificationsEnabled: boolean
  // Challenge schedule (when the meta starts/ends)
  challengeStartTime: string // HH:mm format (24h)
  challengeEndTime: string // HH:mm format (24h)
  // Notification times
  notificationTimes: string[] // Array of HH:mm times
  onboardingCompleted: boolean
}

interface PreferencesContextType {
  preferences: UserPreferences
  updatePreferences: (prefs: Partial<UserPreferences>) => void
  requestNotificationPermission: () => Promise<boolean>
  completeOnboarding: () => Promise<void>
  loading: boolean
}

const defaultPreferences: UserPreferences = {
  notificationsEnabled: false,
  challengeStartTime: "08:00",
  challengeEndTime: "22:00",
  notificationTimes: ["08:00", "22:00"],
  onboardingCompleted: false,
}

const PreferencesContext = createContext<PreferencesContextType>({
  preferences: defaultPreferences,
  updatePreferences: () => {},
  requestNotificationPermission: async () => false,
  completeOnboarding: async () => {},
  loading: true,
})

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [loading, setLoading] = useState(true)

  // Migrate from localStorage to Firestore (one-time migration)
  const migrateFromLocalStorage = async (userId: string): Promise<UserPreferences | null> => {
    const LEGACY_KEY = "offstreak-preferences"
    const saved = localStorage.getItem(LEGACY_KEY)
    
    if (!saved) return null
    
    try {
      const parsed = JSON.parse(saved)
      console.log("[Preferences] Found localStorage data to migrate:", parsed)
      
      // Map old field names to new ones
      const migrated: UserPreferences = {
        notificationsEnabled: parsed.notificationsEnabled ?? defaultPreferences.notificationsEnabled,
        challengeStartTime: parsed.challengeStartTime ?? parsed.morningTime ?? defaultPreferences.challengeStartTime,
        challengeEndTime: parsed.challengeEndTime ?? parsed.eveningTime ?? defaultPreferences.challengeEndTime,
        notificationTimes: parsed.notificationTimes ?? [
          parsed.morningTime ?? defaultPreferences.challengeStartTime,
          parsed.eveningTime ?? defaultPreferences.challengeEndTime
        ],
        onboardingCompleted: parsed.onboardingCompleted ?? defaultPreferences.onboardingCompleted,
      }
      
      // Save to Firestore
      const prefsRef = doc(db, "users", userId, "settings", "preferences")
      await setDoc(prefsRef, migrated)
      console.log("[Preferences] Migrated localStorage to Firestore:", migrated)
      
      // Clear old localStorage
      localStorage.removeItem(LEGACY_KEY)
      console.log("[Preferences] Removed legacy localStorage key")
      
      return migrated
    } catch (error) {
      console.error("[Preferences] Migration error:", error)
      return null
    }
  }

  // Load preferences from Firestore when user changes
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        setPreferences(defaultPreferences)
        setLoading(false)
        return
      }

      try {
        const prefsRef = doc(db, "users", user.uid, "settings", "preferences")
        const snap = await getDoc(prefsRef)
        
        if (snap.exists()) {
          const data = snap.data() as Partial<UserPreferences>
          setPreferences({ ...defaultPreferences, ...data })
        } else {
          // First time - check for localStorage migration
          const migrated = await migrateFromLocalStorage(user.uid)
          if (migrated) {
            setPreferences(migrated)
          } else {
            // No migration, save defaults to Firestore
            await setDoc(prefsRef, defaultPreferences)
            setPreferences(defaultPreferences)
          }
        }
      } catch (error) {
        console.error("Error loading preferences:", error)
        setPreferences(defaultPreferences)
      }
      
      setLoading(false)
    }

    loadPreferences()
  }, [user])

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    const newPrefs = { ...preferences, ...prefs }
    setPreferences(newPrefs)
    console.log("[Preferences] Updating:", prefs)
    console.log("[Preferences] New prefs:", newPrefs)
    console.log("[Preferences] User:", user?.uid)

    // Save to Firestore
    if (user) {
      try {
        const prefsRef = doc(db, "users", user.uid, "settings", "preferences")
        await setDoc(prefsRef, newPrefs, { merge: true })
        console.log("[Preferences] Saved to Firestore successfully")
      } catch (error) {
        console.error("[Preferences] Error saving to Firestore:", error)
      }
    } else {
      console.warn("[Preferences] No user, preferences not saved to Firestore")
    }

    // Schedule notifications if enabled
    if (newPrefs.notificationsEnabled && "serviceWorker" in navigator) {
      scheduleNotifications(newPrefs)
    }
  }

  const completeOnboarding = async () => {
    await updatePreferences({ onboardingCompleted: true })
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

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        requestNotificationPermission,
        completeOnboarding,
        loading,
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
    await navigator.serviceWorker.ready
    
    // Store times in localStorage for the service worker to read (SW can't access Firestore)
    localStorage.setItem("offstreak-notification-times", JSON.stringify({
      times: prefs.notificationTimes,
      challengeStart: prefs.challengeStartTime,
      challengeEnd: prefs.challengeEndTime,
    }))
  } catch (error) {
    console.error("Error scheduling notifications:", error)
  }
}
