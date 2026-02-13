"use client"

import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n"
import { Flame, Shield, Users, TrendingUp, Sparkles } from "lucide-react"

export function LoginScreen() {
  const { signInWithGoogle, signInAnon } = useAuth()
  const { t } = useI18n()

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pt-12 pb-8">
        {/* Logo with glow effect */}
        <div className="relative animate-fade-in-up">
          <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full scale-150" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary to-primary/80 shadow-2xl shadow-primary/30">
            <Flame className="h-14 w-14 text-primary-foreground drop-shadow-lg" />
          </div>
          <div className="absolute -right-1 -top-1">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-3 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            {t.login.title}
          </h1>
          <p className="text-center text-muted-foreground text-lg leading-relaxed max-w-xs">
            {t.login.subtitle}
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-col gap-3 w-full max-w-xs animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <FeatureItem 
            icon={<TrendingUp className="h-4 w-4" />}
            text={t.login.features.track}
          />
          <FeatureItem 
            icon={<Users className="h-4 w-4" />}
            text={t.login.features.compete}
          />
          <FeatureItem 
            icon={<Shield className="h-4 w-4" />}
            text={t.login.features.build}
          />
        </div>
      </div>

      {/* Bottom Section with Buttons */}
      <div className="px-6 pb-10 safe-area-bottom">
        <div className="flex w-full max-w-xs mx-auto flex-col gap-3 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          {/* Google Button */}
          <button
            onClick={signInWithGoogle}
            className="group relative flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-base font-semibold text-gray-800 shadow-xl shadow-black/10 transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-red-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <GoogleIcon />
            <span className="relative">{t.login.continueGoogle}</span>
          </button>

          {/* Anonymous Button */}
          <button
            onClick={signInAnon}
            className="flex items-center justify-center gap-3 rounded-2xl bg-secondary/80 backdrop-blur-sm px-6 py-4 text-base font-semibold text-secondary-foreground transition-all hover:scale-[1.02] hover:bg-secondary active:scale-[0.98] border border-border/50"
          >
            <Shield className="h-5 w-5 text-primary" />
            {t.login.tryAnonymously}
          </button>
        </div>

        {/* Tagline */}
        <p className="text-center text-xs text-muted-foreground mt-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          {t.login.tagline}
        </p>
      </div>
    </div>
  )
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card/50 backdrop-blur-sm px-4 py-3 border border-border/50">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <span className="text-sm font-medium text-foreground">{text}</span>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
