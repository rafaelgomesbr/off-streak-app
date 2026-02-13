"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n"
import { Trophy, Flame, Crown, Medal } from "lucide-react"

interface LeaderboardUser {
  uid: string
  name: string
  currentStreak: number
  bestStreak: number
}

export function RankingScreen() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      const q = query(
        collection(db, "users"),
        orderBy("currentStreak", "desc"),
        limit(50)
      )
      const snap = await getDocs(q)
      const list: LeaderboardUser[] = []
      snap.forEach((doc) => {
        list.push({
          uid: doc.id,
          name: doc.data().name || "Anonymous",
          currentStreak: doc.data().currentStreak || 0,
          bestStreak: doc.data().bestStreak || 0,
        })
      })
      setUsers(list)
      setLoading(false)
    }
    fetchLeaderboard()
  }, [])

  const getPositionIcon = (pos: number) => {
    if (pos === 0) return <Crown className="h-5 w-5 text-[#fbbf24]" />
    if (pos === 1) return <Medal className="h-5 w-5 text-[#94a3b8]" />
    if (pos === 2) return <Medal className="h-5 w-5 text-[#d97706]" />
    return (
      <span className="flex h-5 w-5 items-center justify-center text-xs font-bold text-muted-foreground">
        {pos + 1}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Flame className="h-8 w-8 animate-pulse text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-24 pt-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">{t.ranking.title}</h2>
      </div>

      {users.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            {t.ranking.noUsers}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((u, i) => {
            const isCurrentUser = user?.uid === u.uid
            return (
              <div
                key={u.uid}
                className={`flex items-center gap-4 rounded-2xl px-4 py-3 transition-all ${
                  isCurrentUser
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-card border border-border"
                }`}
                style={{
                  animationDelay: `${i * 0.03}s`,
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center">
                  {getPositionIcon(i)}
                </div>
                <div className="flex flex-1 flex-col">
                  <span
                    className={`text-sm font-semibold ${
                      isCurrentUser ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {u.name}
                    {isCurrentUser && ` ${t.ranking.you}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t.home.bestStreak}: {u.bestStreak} {t.ranking.daysStreak}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-primary" />
                  <span className="text-lg font-bold tabular-nums text-foreground">
                    {u.currentStreak}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
