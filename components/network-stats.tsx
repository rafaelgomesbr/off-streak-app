"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { SOCIAL_NETWORKS, type SocialNetworkId, type DailyNetworkResult } from "@/lib/social-networks"
import { TrendingUp, Target, AlertTriangle, Calendar } from "lucide-react"
import {
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

interface NetworkStats {
  avgScore: number
  totalDays: number
  mostAvoided: { id: SocialNetworkId; rate: number } | null
  leastAvoided: { id: SocialNetworkId; rate: number } | null
  networkRates: Record<SocialNetworkId, number>
}

export function NetworkStatsCard() {
  const { t } = useI18n()
  const { user } = useAuth()
  const [stats, setStats] = useState<NetworkStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
      setLoading(true)
      try {
        const userRef = doc(db, "users", user.uid)
        const snap = await getDoc(userRef)
        if (snap.exists()) {
          const data = snap.data()
          const dailyResults: DailyNetworkResult[] = data.dailyResults || []
          const selectedNetworks: SocialNetworkId[] = data.selectedNetworks || []

          if (dailyResults.length === 0 || selectedNetworks.length === 0) {
            setStats(null)
            setLoading(false)
            return
          }

          // Calculate average score
          const avgScore = Math.round(
            dailyResults.reduce((sum, r) => sum + r.score, 0) / dailyResults.length
          )

          // Calculate per-network avoidance rates
          const networkCounts: Record<string, { avoided: number; total: number }> = {}
          selectedNetworks.forEach((id) => {
            networkCounts[id] = { avoided: 0, total: 0 }
          })

          dailyResults.forEach((result) => {
            Object.entries(result.networks).forEach(([networkId, avoided]) => {
              if (networkCounts[networkId]) {
                networkCounts[networkId].total++
                if (avoided) networkCounts[networkId].avoided++
              }
            })
          })

          const networkRates: Record<string, number> = {}
          let mostAvoided: { id: SocialNetworkId; rate: number } | null = null
          let leastAvoided: { id: SocialNetworkId; rate: number } | null = null

          Object.entries(networkCounts).forEach(([id, counts]) => {
            const rate = counts.total > 0 ? Math.round((counts.avoided / counts.total) * 100) : 0
            networkRates[id] = rate

            if (!mostAvoided || rate > mostAvoided.rate) {
              mostAvoided = { id: id as SocialNetworkId, rate }
            }
            if (!leastAvoided || rate < leastAvoided.rate) {
              leastAvoided = { id: id as SocialNetworkId, rate }
            }
          })

          setStats({
            avgScore,
            totalDays: dailyResults.length,
            mostAvoided,
            leastAvoided,
            networkRates: networkRates as Record<SocialNetworkId, number>,
          })
        }
      } catch (e) {
        console.error("Error fetching network stats:", e)
      }
      setLoading(false)
    }
    fetchStats()
  }, [user])

  if (loading) {
    return (
      <div className="rounded-2xl bg-card p-4 border border-border animate-pulse">
        <div className="h-4 w-24 bg-muted rounded mb-4" />
        <div className="h-16 bg-muted rounded" />
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const getNetworkInfo = (id: SocialNetworkId) => 
    SOCIAL_NETWORKS.find((n) => n.id === id)

  return (
    <div className="rounded-2xl bg-card p-4 border border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        {t.networks.stats}
      </h3>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-secondary/50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">{t.networks.avgScore}</span>
          </div>
          <span className="text-xl font-bold text-foreground">{stats.avgScore}%</span>
        </div>
        <div className="rounded-xl bg-secondary/50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">{t.networks.daysTracked}</span>
          </div>
          <span className="text-xl font-bold text-foreground">{stats.totalDays}</span>
        </div>
      </div>

      {/* Most/Least avoided */}
      {stats.mostAvoided && stats.leastAvoided && (
        <div className="flex flex-col gap-2 mb-4">
          {/* Most avoided */}
          <div className="flex items-center gap-3 rounded-xl bg-green-500/10 p-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: `${getNetworkInfo(stats.mostAvoided.id)?.color}20` }}
            >
              <span style={{ color: getNetworkInfo(stats.mostAvoided.id)?.color }}>
                {iconMap[getNetworkInfo(stats.mostAvoided.id)?.icon || ""]}
              </span>
            </div>
            <div className="flex-1">
              <span className="text-xs text-muted-foreground">{t.networks.mostAvoided}</span>
              <p className="text-sm font-medium text-foreground">
                {getNetworkInfo(stats.mostAvoided.id)?.name}
              </p>
            </div>
            <span className="text-sm font-bold text-green-500">{stats.mostAvoided.rate}%</span>
          </div>

          {/* Least avoided */}
          <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 p-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: `${getNetworkInfo(stats.leastAvoided.id)?.color}20` }}
            >
              <span style={{ color: getNetworkInfo(stats.leastAvoided.id)?.color }}>
                {iconMap[getNetworkInfo(stats.leastAvoided.id)?.icon || ""]}
              </span>
            </div>
            <div className="flex-1">
              <span className="text-xs text-muted-foreground">{t.networks.leastAvoided}</span>
              <p className="text-sm font-medium text-foreground">
                {getNetworkInfo(stats.leastAvoided.id)?.name}
              </p>
            </div>
            <span className="text-sm font-bold text-amber-500">{stats.leastAvoided.rate}%</span>
          </div>
        </div>
      )}

      {/* Per-network breakdown */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground mb-2">{t.networks.networkStats}</h4>
        <div className="space-y-2">
          {Object.entries(stats.networkRates).map(([id, rate]) => {
            const network = getNetworkInfo(id as SocialNetworkId)
            if (!network) return null
            return (
              <div key={id} className="flex items-center gap-2">
                <span style={{ color: network.color }}>{iconMap[network.icon]}</span>
                <span className="flex-1 text-xs text-foreground">{network.name}</span>
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                  {rate}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
