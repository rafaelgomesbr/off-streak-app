"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import {
  X,
  Heart,
  CreditCard,
  QrCode,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react"

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
}

// Chave Pix (email, telefone ou aleatória) - não expira
const PIX_KEY = "rfasg@hotmail.com"
// Stripe Payment Link - configure com "Customer chooses price"
const STRIPE_LINK = "https://buy.stripe.com/test_cNifZh0Dq0HdczY5ED2ZO00"

export function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"pix" | "card">("pix")

  if (!isOpen) return null

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStripePayment = () => {
    window.open(STRIPE_LINK, "_blank")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div
        className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-2xl sm:rounded-3xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {t.donation.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-6">
          {t.donation.description}
        </p>

        {/* Payment Method Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("pix")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors ${
              activeTab === "pix"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            <QrCode className="h-4 w-4" />
            Pix
          </button>
          <button
            onClick={() => setActiveTab("card")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors ${
              activeTab === "card"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            {t.donation.cardTab}
          </button>
        </div>

        {/* Content */}
        {activeTab === "pix" ? (
          <div className="space-y-4">
            {/* Pix Info */}
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-secondary/50 p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <QrCode className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-sm text-center text-foreground font-medium">
                {t.donation.scanQR}
              </p>
            </div>

            {/* Copy Pix key */}
            <div className="flex items-center gap-3 rounded-xl bg-secondary p-4">
              <div className="flex-1 truncate text-sm text-foreground font-mono">
                {PIX_KEY}
              </div>
              <button
                onClick={handleCopyPix}
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            {copied && (
              <p className="text-center text-sm text-green-500">
                {t.donation.copied}
              </p>
            )}

            <p className="text-xs text-center text-muted-foreground">
              {t.donation.pixNote}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Card payment info */}
            <div className="rounded-2xl bg-secondary/50 p-6 text-center">
              <div className="flex justify-center gap-3 mb-4">
                <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-black text-white text-xs font-semibold">
                   Pay
                </div>
                <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-800">
                  G Pay
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.donation.cardDescription}
              </p>
            </div>

            <button
              onClick={handleStripePayment}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <ExternalLink className="h-4 w-4" />
              {t.donation.payButton}
            </button>

            <p className="text-xs text-center text-muted-foreground">
              {t.donation.securePayment}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            {t.donation.thankYou}
          </p>
        </div>
      </div>
    </div>
  )
}
