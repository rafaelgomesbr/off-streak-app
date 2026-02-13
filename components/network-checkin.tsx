"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { SOCIAL_NETWORKS, type SocialNetworkId } from "@/lib/social-networks"
import { Check, X, Sparkles } from "lucide-react"
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

interface NetworkCheckInProps {
  selectedNetworks: SocialNetworkId[]
  onSubmit: (results: Record<SocialNetworkId, boolean>) => void
  onCancel: () => void
}

const iconMap: Record<string, React.ReactNode> = {
  instagram: <Instagram className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  "message-circle": <MessageCircle className="h-5 w-5" />,
  music: <Music className="h-5 w-5" />,
  "at-sign": <AtSign className="h-5 w-5" />,
  ghost: <Ghost className="h-5 w-5" />,
}

export function NetworkCheckIn({ selectedNetworks, onSubmit, onCancel }: NetworkCheckInProps) {
  const { t } = useI18n()
  // Initialize all networks as avoided (true)
  const [results, setResults] = useState<Record<SocialNetworkId, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    selectedNetworks.forEach((id) => {
      initial[id] = true // default to avoided
    })
    return initial as Record<SocialNetworkId, boolean>
  })

  const toggleNetwork = (networkId: SocialNetworkId) => {
    setResults((prev) => ({
      ...prev,
      [networkId]: !prev[networkId],
    }))
  }

  const networksData = selectedNetworks
    .map((id) => SOCIAL_NETWORKS.find((n) => n.id === id))
    .filter(Boolean)

  const avoidedCount = Object.values(results).filter(Boolean).length
  const totalCount = selectedNetworks.length
  const score = Math.round((avoidedCount / totalCount) * 100)
  const isPerfect = score === 100

  const handleSubmit = () => {
    onSubmit(results)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 pt-8 px-6">
        <h1 className="text-2xl font-bold text-foreground">{t.networks.checkInTitle}</h1>
        <p className="text-sm text-muted-foreground text-center">{t.networks.checkInDesc}</p>
      </div>

      {/* Score preview */}
      <div className="flex justify-center py-6">
        <div className={`flex flex-col items-center gap-1 rounded-2xl px-8 py-4 ${isPerfect ? "bg-green-500/20" : "bg-secondary/50"}`}>
          {isPerfect ? (
            <>
              <Sparkles className="h-8 w-8 text-green-500" />
              <span className="text-lg font-bold text-green-500">{t.networks.perfect}</span>
            </>
          ) : (
            <>
              <span className="text-3xl font-bold text-foreground">{score}%</span>
              <span className="text-xs text-muted-foreground">{t.networks.partial}</span>
            </>
          )}
        </div>
      </div>

      {/* Network list */}
      <div className="flex-1 overflow-y-auto px-6">
        <div className="flex flex-col gap-3">
          {networksData.map((network) => {
            if (!network) return null
            const avoided = results[network.id]
            return (
              <button
                key={network.id}
                onClick={() => toggleNetwork(network.id)}
                className={`flex items-center gap-4 rounded-xl p-4 transition-all ${
                  avoided
                    ? "bg-green-500/10 border-2 border-green-500/50"
                    : "bg-red-500/10 border-2 border-red-500/50"
                }`}
              >
                {/* Network icon */}
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${network.color}20` }}
                >
                  <span style={{ color: network.color }}>
                    {iconMap[network.icon]}
                  </span>
                </div>

                {/* Network name */}
                <span className="flex-1 text-left font-medium text-foreground">
                  {network.name}
                </span>

                {/* Status indicator */}
                <div
                  className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                    avoided
                      ? "bg-green-500/20 text-green-500"
                      : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {avoided ? (
                    <>
                      <Check className="h-4 w-4" />
                      {t.networks.avoided}
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      {t.networks.accessed}
                    </>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="p-6 flex flex-col gap-3">
        <button
          onClick={handleSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
        >
          <Check className="h-5 w-5" />
          {t.networks.saveResults}
        </button>
        <button
          onClick={onCancel}
          className="w-full text-center text-sm text-muted-foreground py-2"
        >
          {t.common.cancel}
        </button>
      </div>
    </div>
  )
}
