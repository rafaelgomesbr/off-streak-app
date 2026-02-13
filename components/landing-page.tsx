"use client"

import { useI18n } from "@/lib/i18n"
import { Flame, Clock, Users, ArrowRight, Sparkles } from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const { t, language, setLanguage } = useI18n()

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Flame className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">No Scroll Streak</span>
        </div>
        
        {/* Language toggle */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          <button
            onClick={() => setLanguage("pt-BR")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              language === "pt-BR" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            PT
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            EN
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 px-6 pt-12 pb-8">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 bg-secondary/80 backdrop-blur-sm border border-border px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">{t.landing.badge}</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center leading-tight mb-6">
          {t.landing.heroTitle1}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
            {" "}{t.landing.heroHighlight}
          </span>
          <br />
          {t.landing.heroTitle2}
        </h1>

        {/* Description */}
        <p className="text-center text-muted-foreground text-lg max-w-md mx-auto mb-10">
          {t.landing.heroDescription}
        </p>

        {/* CTA Button */}
        <div className="flex justify-center mb-16">
          <button
            onClick={onGetStarted}
            className="group flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-100"
          >
            <Flame className="h-6 w-6" />
            {t.landing.ctaButton}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Phone mockup */}
        <div className="flex justify-center mb-16">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full scale-75" />
            
            {/* Phone */}
            <div className="relative w-64 h-[500px] bg-card border-4 border-border rounded-[40px] p-3 shadow-2xl">
              {/* Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-background rounded-full" />
              
              {/* Screen */}
              <div className="w-full h-full bg-gradient-to-b from-background to-secondary rounded-[32px] flex flex-col items-center justify-center gap-4">
                <Flame className="h-16 w-16 text-primary" />
                <span className="text-6xl font-extrabold text-primary">21</span>
                <span className="text-sm text-muted-foreground">{t.landing.daysStreak}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4 max-w-md mx-auto">
          <div className="flex items-start gap-4 bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t.landing.feature1Title}</h3>
              <p className="text-sm text-muted-foreground">{t.landing.feature1Desc}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t.landing.feature2Title}</h3>
              <p className="text-sm text-muted-foreground">{t.landing.feature2Desc}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t.landing.feature3Title}</h3>
              <p className="text-sm text-muted-foreground">{t.landing.feature3Desc}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 px-6 border-t border-border mt-12">
        <p className="text-sm text-muted-foreground">
          {t.landing.footer}
        </p>
      </footer>
    </div>
  )
}
