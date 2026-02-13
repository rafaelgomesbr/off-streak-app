"use client"

import { Flame, Trophy, User } from "lucide-react"
import { useI18n } from "@/lib/i18n"

type Tab = "home" | "ranking" | "profile"

interface BottomNavProps {
  active: Tab
  onChange: (tab: Tab) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  const { t } = useI18n()
  
  const tabs: { key: Tab; label: string; icon: typeof Flame }[] = [
    { key: "home", label: t.nav.home, icon: Flame },
    { key: "ranking", label: t.nav.ranking, icon: Trophy },
    { key: "profile", label: t.nav.profile, icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/80 backdrop-blur-lg safe-area-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-2">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex flex-1 flex-col items-center gap-1 py-2 transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "scale-110" : ""} transition-transform`} />
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <div className="h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
