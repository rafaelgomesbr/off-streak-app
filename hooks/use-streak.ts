"use client"

import { useState, useEffect, useCallback } from "react"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { usePreferences } from "@/lib/preferences-context"

interface StreakData {
  currentStreak: number
  bestStreak: number
  lastCheckDate: string | null
  lastStartDate: string | null // When user started the day
  name: string
}

type DayPhase = "active" | "inactive" // active = challenge time, inactive = rest time
type DayStatus = "not-started" | "in-progress" | "completed" | "failed"

export function useStreak() {
  const { user } = useAuth()
  const { preferences } = usePreferences()
  const [data, setData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dayStatus, setDayStatus] = useState<DayStatus>("not-started")
  const [currentPhase, setCurrentPhase] = useState<DayPhase>("inactive")

  const getTodayStr = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  }

  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours * 60 + minutes
  }

  const getCurrentPhase = useCallback((): DayPhase => {
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const startMinutes = parseTime(preferences.challengeStartTime)
    const endMinutes = parseTime(preferences.challengeEndTime)
    
    // Check if current time is within challenge period
    if (startMinutes <= endMinutes) {
      // Normal case: start is before end (e.g., 08:00 - 22:00)
      return currentMinutes >= startMinutes && currentMinutes < endMinutes ? "active" : "inactive"
    } else {
      // Overnight case: start is after end (e.g., 22:00 - 06:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes ? "active" : "inactive"
    }
  }, [preferences.challengeStartTime, preferences.challengeEndTime])

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const userRef = doc(db, "users", user.uid)
    const snap = await getDoc(userRef)
    if (snap.exists()) {
      const d = snap.data() as StreakData
      setData(d)
      const today = getTodayStr()
      const phase = getCurrentPhase()
      setCurrentPhase(phase)

      // Determine day status
      if (d.lastCheckDate === today) {
        // Already completed or failed today
        setDayStatus("completed")
      } else if (d.lastStartDate === today) {
        // Started but not finished
        setDayStatus("in-progress")
      } else {
        // New day, not started
        setDayStatus("not-started")
      }
    }
    setLoading(false)
  }, [user, getCurrentPhase])

  useEffect(() => {
    fetchData()
    // Update phase every minute
    const interval = setInterval(() => {
      setCurrentPhase(getCurrentPhase())
    }, 60000)
    return () => clearInterval(interval)
  }, [fetchData, getCurrentPhase])

  const startDay = async () => {
    if (!user || dayStatus !== "not-started") return
    const today = getTodayStr()
    const userRef = doc(db, "users", user.uid)
    await updateDoc(userRef, {
      lastStartDate: today,
    })
    setData((prev) =>
      prev ? { ...prev, lastStartDate: today } : prev
    )
    setDayStatus("in-progress")
  }

  const markSuccess = async () => {
    if (!user || dayStatus === "completed") return
    const today = getTodayStr()
    const userRef = doc(db, "users", user.uid)
    const newStreak = (data?.currentStreak ?? 0) + 1
    const newBest = Math.max(newStreak, data?.bestStreak ?? 0)
    await updateDoc(userRef, {
      currentStreak: newStreak,
      bestStreak: newBest,
      lastCheckDate: today,
    })
    setData((prev) =>
      prev
        ? { ...prev, currentStreak: newStreak, bestStreak: newBest, lastCheckDate: today }
        : prev
    )
    setDayStatus("completed")
  }

  const markFail = async () => {
    if (!user || dayStatus === "completed") return
    const today = getTodayStr()
    const userRef = doc(db, "users", user.uid)
    await updateDoc(userRef, {
      currentStreak: 0,
      lastCheckDate: today,
    })
    setData((prev) =>
      prev ? { ...prev, currentStreak: 0, lastCheckDate: today } : prev
    )
    setDayStatus("failed")
  }

  return {
    data,
    loading,
    dayStatus,
    currentPhase,
    startDay,
    markSuccess,
    markFail,
    refetch: fetchData,
  }
}
