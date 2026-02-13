"use client"

import { useAuth } from "@/lib/auth-context"
import { useStreak } from "@/hooks/use-streak"
import { useI18n } from "@/lib/i18n"
import { usePreferences } from "@/lib/preferences-context"
import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DonationModal } from "@/components/donation-modal"
import {
  User,
  Flame,
  Trophy,
  LogOut,
  Pencil,
  Check,
  Bell,
  BellOff,
  Coffee,
  X,
  Globe,
  Clock,
  ChevronRight,
} from "lucide-react"

export function ProfileScreen() {
  const { user, signOut } = useAuth()
  const { data, refetch } = useStreak()
  const { t, language, setLanguage } = useI18n()
  const { preferences, updatePreferences, requestNotificationPermission } = usePreferences()
  
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(data?.name ?? "")
  const [saving, setSaving] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleSaveName = async () => {
    if (!user || !name.trim()) return
    setSaving(true)
    const userRef = doc(db, "users", user.uid)
    await updateDoc(userRef, { name: name.trim() })
    await refetch()
    setEditing(false)
    setSaving(false)
  }

  const handleToggleNotifications = async () => {
    if (!preferences.notificationsEnabled) {
      const granted = await requestNotificationPermission()
      if (granted) {
        updatePreferences({ notificationsEnabled: true })
      }
    } else {
      updatePreferences({ notificationsEnabled: false })
    }
  }

  const handleLanguageChange = (lang: "pt-BR" | "en") => {
    setLanguage(lang)
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-secondary/80 border-2 border-border shadow-lg">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
        </div>

        {editing ? (
          <div className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl bg-secondary px-4 py-2 text-center text-foreground outline-none focus:ring-2 focus:ring-primary"
              autoFocus
              maxLength={20}
            />
            <button
              onClick={handleSaveName}
              disabled={saving}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setName(data?.name ?? "")
              setEditing(true)
            }}
            className="flex items-center gap-2 text-xl font-bold text-foreground"
          >
            {data?.name ?? "Anonymous"}
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-card p-4 border border-border">
          <Flame className="h-6 w-6 text-primary" />
          <span className="text-2xl font-bold text-foreground">
            {data?.currentStreak ?? 0}
          </span>
          <span className="text-xs text-muted-foreground">{t.profile.currentStreak}</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-card p-4 border border-border">
          <Trophy className="h-6 w-6 text-primary" />
          <span className="text-2xl font-bold text-foreground">
            {data?.bestStreak ?? 0}
          </span>
          <span className="text-xs text-muted-foreground">{t.profile.bestStreak}</span>
        </div>
      </div>

      {/* Settings */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
          {t.profile.settings}
        </h3>

        {/* Language Selector */}
        <div className="flex flex-col gap-2 rounded-2xl bg-card p-4 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">{t.profile.language}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleLanguageChange("pt-BR")}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                language === "pt-BR"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              🇧🇷 Português
            </button>
            <button
              onClick={() => handleLanguageChange("en")}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                language === "en"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              🇺🇸 English
            </button>
          </div>
        </div>

        {/* Notifications Toggle */}
        <button
          onClick={handleToggleNotifications}
          className="flex items-center gap-4 rounded-2xl bg-card px-4 py-3 border border-border transition-all hover:bg-secondary"
        >
          {preferences.notificationsEnabled ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          <div className="flex flex-1 flex-col items-start">
            <span className="text-sm font-medium text-foreground">
              {t.profile.notifications}
            </span>
            <span className="text-xs text-muted-foreground">
              {preferences.notificationsEnabled
                ? t.profile.notificationsOn
                : t.profile.notificationsOff}
            </span>
          </div>
          <div
            className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
              preferences.notificationsEnabled ? "bg-primary" : "bg-secondary"
            }`}
          >
            <div
              className={`h-5 w-5 rounded-full bg-card shadow-sm transition-transform ${
                preferences.notificationsEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </button>

        {/* Notification Times */}
        {preferences.notificationsEnabled && (
          <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 border border-border animate-fade-in-up">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {t.settings.notificationTime}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">{t.profile.morningTime}</label>
                <input
                  type="time"
                  value={preferences.morningTime}
                  onChange={(e) => updatePreferences({ morningTime: e.target.value })}
                  className="rounded-xl bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">{t.profile.eveningTime}</label>
                <input
                  type="time"
                  value={preferences.eveningTime}
                  onChange={(e) => updatePreferences({ eveningTime: e.target.value })}
                  className="rounded-xl bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Support */}
        <button
          onClick={() => setShowSupport(true)}
          className="flex items-center gap-4 rounded-2xl bg-card px-4 py-3 border border-border transition-all hover:bg-secondary"
        >
          <Coffee className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {t.profile.support}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
        </button>

        {/* Sign Out */}
        <button
          onClick={signOut}
          className="flex items-center gap-4 rounded-2xl bg-card px-4 py-3 border border-border transition-all hover:bg-secondary"
        >
          <LogOut className="h-5 w-5 text-destructive" />
          <span className="text-sm font-medium text-destructive">
            {t.profile.signOut}
          </span>
        </button>
      </div>

      {/* Support Modal */}
      <DonationModal isOpen={showSupport} onClose={() => setShowSupport(false)} />
    </div>
  )
}
