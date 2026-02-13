"use client"

import { useAuth } from "@/lib/auth-context"
import { useStreak } from "@/hooks/use-streak"
import { useI18n } from "@/lib/i18n"
import { usePreferences } from "@/lib/preferences-context"
import { useState, useEffect } from "react"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DonationModal } from "@/components/donation-modal"
import { NetworkStatsCard } from "@/components/network-stats"
import { NetworkSelection } from "@/components/network-selection"
import { TimeInput24h } from "@/components/ui/time-input-24h"
import { SOCIAL_NETWORKS, type SocialNetworkId } from "@/lib/social-networks"
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
  Share2,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  MessageCircle,
  Music,
  AtSign,
  Ghost,
} from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  instagram: <Instagram className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  "message-circle": <MessageCircle className="h-4 w-4" />,
  music: <Music className="h-4 w-4" />,
  "at-sign": <AtSign className="h-4 w-4" />,
  ghost: <Ghost className="h-4 w-4" />,
}

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
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [selectedNetworks, setSelectedNetworks] = useState<SocialNetworkId[]>([])
  const [editingNetworks, setEditingNetworks] = useState(false)
  const [savingNetworks, setSavingNetworks] = useState(false)

  // Fetch user's selected networks
  useEffect(() => {
    const fetchNetworks = async () => {
      if (!user) return
      const userRef = doc(db, "users", user.uid)
      const snap = await getDoc(userRef)
      if (snap.exists()) {
        const data = snap.data()
        setSelectedNetworks(data.selectedNetworks || [])
      }
    }
    fetchNetworks()
  }, [user])

  const handleSaveNetworks = async () => {
    if (!user || selectedNetworks.length === 0) return
    setSavingNetworks(true)
    try {
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, { selectedNetworks })
      setEditingNetworks(false)
    } catch (e) {
      console.error("Error saving networks:", e)
    }
    setSavingNetworks(false)
  }

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
    if (notificationLoading) return
    setNotificationLoading(true)
    
    try {
      if (!preferences.notificationsEnabled) {
        // Check if notifications are supported
        if (!("Notification" in window)) {
          console.log("Notifications not supported")
          alert(language === "pt-BR" 
            ? "Seu navegador não suporta notificações" 
            : "Your browser doesn't support notifications")
          return
        }
        
        const granted = await requestNotificationPermission()
        console.log("Notification permission result:", granted)
        if (granted) {
          updatePreferences({ notificationsEnabled: true })
        } else {
          alert(language === "pt-BR" 
            ? "Permissão de notificações negada. Verifique as configurações do navegador." 
            : "Notification permission denied. Check your browser settings.")
        }
      } else {
        updatePreferences({ notificationsEnabled: false })
      }
    } catch (e) {
      console.error("Error toggling notifications:", e)
    } finally {
      setNotificationLoading(false)
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

      {/* Network Stats */}
      <NetworkStatsCard />

      {/* Selected Networks */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {language === "pt-BR" ? "Minhas Redes" : "My Networks"}
          </h3>
          <button
            onClick={() => setEditingNetworks(!editingNetworks)}
            className="text-xs text-primary font-medium"
          >
            {editingNetworks 
              ? (language === "pt-BR" ? "Cancelar" : "Cancel")
              : (language === "pt-BR" ? "Editar" : "Edit")}
          </button>
        </div>
        
        {editingNetworks ? (
          <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 border border-border">
            <p className="text-xs text-muted-foreground text-center mb-2">
              {language === "pt-BR" 
                ? "Selecione as redes sociais que você quer evitar"
                : "Select the social networks you want to avoid"}
            </p>
            <NetworkSelection
              selectedNetworks={selectedNetworks}
              onChange={setSelectedNetworks}
              compact
            />
            <button
              onClick={handleSaveNetworks}
              disabled={savingNetworks || selectedNetworks.length === 0}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {savingNetworks 
                ? (language === "pt-BR" ? "Salvando..." : "Saving...")
                : (language === "pt-BR" ? "Salvar" : "Save")}
            </button>
          </div>
        ) : selectedNetworks.length > 0 ? (
          <div className="flex flex-wrap gap-2 rounded-2xl bg-card p-4 border border-border">
            {selectedNetworks.map((networkId) => {
              const network = SOCIAL_NETWORKS.find((n) => n.id === networkId)
              if (!network) return null
              return (
                <div
                  key={networkId}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5"
                  style={{ backgroundColor: `${network.color}15` }}
                >
                  <span style={{ color: network.color }}>
                    {iconMap[network.icon]}
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {network.name}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <button
            onClick={() => setEditingNetworks(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-card p-4 border border-dashed border-border text-muted-foreground hover:bg-secondary transition-colors"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-sm">
              {language === "pt-BR" 
                ? "Selecionar redes sociais"
                : "Select social networks"}
            </span>
          </button>
        )}
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
          disabled={notificationLoading}
          className={`flex items-center gap-4 rounded-2xl bg-card px-4 py-3 border border-border transition-all hover:bg-secondary ${notificationLoading ? "opacity-50" : ""}`}
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
              {notificationLoading 
                ? (language === "pt-BR" ? "Aguarde..." : "Please wait...")
                : preferences.notificationsEnabled
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

        {/* Challenge Schedule */}
        <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 border border-border">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <span className="text-sm font-medium text-foreground">
                {t.settings.challengeSchedule}
              </span>
              <p className="text-xs text-muted-foreground">
                {t.settings.challengeScheduleDesc}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">{t.settings.challengeStart}</label>
              <TimeInput24h
                value={preferences.challengeStartTime}
                onChange={(value) => updatePreferences({ challengeStartTime: value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">{t.settings.challengeEnd}</label>
              <TimeInput24h
                value={preferences.challengeEndTime}
                onChange={(value) => updatePreferences({ challengeEndTime: value })}
              />
            </div>
          </div>
        </div>

        {/* Notification Times */}
        {preferences.notificationsEnabled && (
          <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 border border-border animate-fade-in-up">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">
                  {t.settings.notificationTimes}
                </span>
                <p className="text-xs text-muted-foreground">
                  {t.settings.notificationTimesDesc}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {preferences.notificationTimes.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <TimeInput24h
                    value={time}
                    onChange={(value) => {
                      const newTimes = [...preferences.notificationTimes]
                      newTimes[index] = value
                      updatePreferences({ notificationTimes: newTimes })
                    }}
                  />
                  {preferences.notificationTimes.length > 1 && (
                    <button
                      onClick={() => {
                        const newTimes = preferences.notificationTimes.filter((_, i) => i !== index)
                        updatePreferences({ notificationTimes: newTimes })
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {preferences.notificationTimes.length < 5 && (
              <button
                onClick={() => {
                  const newTimes = [...preferences.notificationTimes, "12:00"]
                  updatePreferences({ notificationTimes: newTimes })
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80"
              >
                <span>+</span>
                {t.settings.addNotification}
              </button>
            )}
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
