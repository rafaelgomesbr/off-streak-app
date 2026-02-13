"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { SOCIAL_NETWORKS, type SocialNetworkId } from "@/lib/social-networks"
import { Check } from "lucide-react"
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

interface NetworkSelectionProps {
  selectedNetworks: SocialNetworkId[]
  onChange: (networks: SocialNetworkId[]) => void
  compact?: boolean
}

const iconMap: Record<string, React.ReactNode> = {
  instagram: <Instagram className="h-6 w-6" />,
  facebook: <Facebook className="h-6 w-6" />,
  twitter: <Twitter className="h-6 w-6" />,
  youtube: <Youtube className="h-6 w-6" />,
  linkedin: <Linkedin className="h-6 w-6" />,
  "message-circle": <MessageCircle className="h-6 w-6" />,
  music: <Music className="h-6 w-6" />,
  "at-sign": <AtSign className="h-6 w-6" />,
  ghost: <Ghost className="h-6 w-6" />,
}

export function NetworkSelection({ selectedNetworks, onChange, compact }: NetworkSelectionProps) {
  const { t } = useI18n()

  const toggleNetwork = (networkId: SocialNetworkId) => {
    if (selectedNetworks.includes(networkId)) {
      onChange(selectedNetworks.filter((id) => id !== networkId))
    } else {
      onChange([...selectedNetworks, networkId])
    }
  }

  return (
    <div className={`grid ${compact ? "grid-cols-4 gap-2" : "grid-cols-3 gap-3"} w-full`}>
      {SOCIAL_NETWORKS.map((network) => {
        const isSelected = selectedNetworks.includes(network.id)
        return (
          <button
            key={network.id}
            onClick={() => toggleNetwork(network.id)}
            className={`relative flex flex-col items-center justify-center rounded-xl p-3 transition-all ${
              isSelected
                ? "bg-primary/20 border-2 border-primary"
                : "bg-secondary/50 border-2 border-transparent hover:bg-secondary"
            } ${compact ? "p-2" : "p-4"}`}
          >
            {isSelected && (
              <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
            <div
              className={`flex items-center justify-center ${compact ? "h-8 w-8" : "h-12 w-12"} rounded-full`}
              style={{ backgroundColor: `${network.color}20` }}
            >
              <span style={{ color: network.color }}>
                {iconMap[network.icon]}
              </span>
            </div>
            {!compact && (
              <span className={`mt-2 text-xs font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                {network.name}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
