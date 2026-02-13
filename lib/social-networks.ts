// Social networks that users can track
export const SOCIAL_NETWORKS = [
  { id: "instagram", name: "Instagram", icon: "instagram", color: "#E4405F" },
  { id: "facebook", name: "Facebook", icon: "facebook", color: "#1877F2" },
  { id: "tiktok", name: "TikTok", icon: "music", color: "#000000" },
  { id: "twitter", name: "X (Twitter)", icon: "twitter", color: "#000000" },
  { id: "youtube", name: "YouTube", icon: "youtube", color: "#FF0000" },
  { id: "threads", name: "Threads", icon: "at-sign", color: "#000000" },
  { id: "snapchat", name: "Snapchat", icon: "ghost", color: "#FFFC00" },
  { id: "linkedin", name: "LinkedIn", icon: "linkedin", color: "#0A66C2" },
  { id: "reddit", name: "Reddit", icon: "message-circle", color: "#FF4500" },
  { id: "whatsapp", name: "WhatsApp", icon: "message-circle", color: "#25D366" },
] as const

export type SocialNetworkId = (typeof SOCIAL_NETWORKS)[number]["id"]

export interface DailyNetworkResult {
  date: string // YYYY-MM-DD
  networks: Record<SocialNetworkId, boolean> // true = avoided, false = accessed
  score: number // percentage of networks avoided
}

export interface UserNetworkData {
  selectedNetworks: SocialNetworkId[]
  dailyResults: DailyNetworkResult[]
  totalDaysTracked: number
  averageScore: number // average percentage of networks avoided
}
