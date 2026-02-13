"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Clock, X } from "lucide-react"

interface TimeInput24hProps {
  value: string // HH:mm format
  onChange: (value: string) => void
  className?: string
}

// Create infinite array for smooth circular scrolling
const createInfiniteArray = (max: number, repeats: number = 5) => {
  const base = Array.from({ length: max }, (_, i) => String(i).padStart(2, "0"))
  const result: string[] = []
  for (let i = 0; i < repeats; i++) {
    result.push(...base)
  }
  return result
}

export function TimeInput24h({ value, onChange, className }: TimeInput24hProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [tempHours, setTempHours] = React.useState("00")
  const [tempMinutes, setTempMinutes] = React.useState("00")
  const [mounted, setMounted] = React.useState(false)
  const hoursRef = React.useRef<HTMLDivElement>(null)
  const minutesRef = React.useRef<HTMLDivElement>(null)

  // Infinite arrays (5 repetitions each)
  const infiniteHours = React.useMemo(() => createInfiniteArray(24, 5), [])
  const infiniteMinutes = React.useMemo(() => createInfiniteArray(60, 5), [])

  // Wait for client-side mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const [h, m] = value.split(":")
    setTempHours(h || "00")
    setTempMinutes(m || "00")
  }, [value])

  React.useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = "hidden"
      
      // Scroll to center (middle repetition) of selected values
      setTimeout(() => {
        scrollToCenter(hoursRef.current, tempHours, 24)
        scrollToCenter(minutesRef.current, tempMinutes, 60)
      }, 50)
      
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [isOpen])

  const scrollToCenter = (container: HTMLDivElement | null, value: string, max: number) => {
    if (!container) return
    const centerIndex = Math.floor(5 / 2) * max + parseInt(value)
    const element = container.children[centerIndex + 1] as HTMLElement // +1 for spacer
    if (element) {
      element.scrollIntoView({ block: "center", behavior: "instant" })
    }
  }

  // Reset scroll position when it gets too far from center
  const handleScroll = (container: HTMLDivElement | null, max: number, setValue: (v: string) => void) => {
    if (!container) return
    
    const scrollTop = container.scrollTop
    const itemHeight = 56 // h-14 = 3.5rem = 56px
    const spacerHeight = 112
    
    // Calculate which item is in center
    const centerOffset = (container.clientHeight / 2) - (itemHeight / 2)
    const scrollCenter = scrollTop + centerOffset - spacerHeight
    const currentIndex = Math.round(scrollCenter / itemHeight)
    
    if (currentIndex >= 0) {
      const actualValue = String(currentIndex % max).padStart(2, "0")
      setValue(actualValue)
    }
  }

  const handleConfirm = () => {
    const newValue = `${tempHours}:${tempMinutes}`
    document.body.style.overflow = ""
    setIsOpen(false)
    onChange(newValue)
  }

  const handleCancel = () => {
    const [h, m] = value.split(":")
    setTempHours(h || "00")
    setTempMinutes(m || "00")
    document.body.style.overflow = ""
    setIsOpen(false)
  }

  const overlay = (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-background animate-in fade-in-0 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border bg-background">
        <button
          type="button"
          onClick={handleCancel}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        <span className="text-lg font-semibold text-foreground tabular-nums">
          {tempHours}:{tempMinutes}
        </span>
        <button
          type="button"
          onClick={handleConfirm}
          className="px-4 py-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          OK
        </button>
      </div>

      {/* Picker Area */}
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="relative flex items-center">
          {/* Selection Highlight */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-14 bg-primary/10 border-y border-primary/30 pointer-events-none z-0 rounded-xl" />

          {/* Hours Column */}
          <div
            ref={hoursRef}
            onScroll={() => handleScroll(hoursRef.current, 24, setTempHours)}
            className="h-[280px] w-24 overflow-y-auto scroll-smooth scrollbar-hide relative z-10"
          >
            <div className="h-[112px]" />
            {infiniteHours.map((h, idx) => (
              <button
                key={`h-${idx}`}
                type="button"
                onClick={() => {
                  setTempHours(h)
                  scrollToCenter(hoursRef.current, h, 24)
                }}
                className={cn(
                  "w-full h-14 flex items-center justify-center text-3xl font-semibold tabular-nums transition-all",
                  tempHours === h
                    ? "text-foreground scale-100"
                    : "text-muted-foreground/50 scale-90"
                )}
              >
                {h}
              </button>
            ))}
            <div className="h-[112px]" />
          </div>

          {/* Separator */}
          <div className="w-8 flex items-center justify-center z-10">
            <span className="text-4xl font-bold text-foreground">:</span>
          </div>

          {/* Minutes Column */}
          <div
            ref={minutesRef}
            onScroll={() => handleScroll(minutesRef.current, 60, setTempMinutes)}
            className="h-[280px] w-24 overflow-y-auto scroll-smooth scrollbar-hide relative z-10"
          >
            <div className="h-[112px]" />
            {infiniteMinutes.map((m, idx) => (
              <button
                key={`m-${idx}`}
                type="button"
                onClick={() => {
                  setTempMinutes(m)
                  scrollToCenter(minutesRef.current, m, 60)
                }}
                className={cn(
                  "w-full h-14 flex items-center justify-center text-3xl font-semibold tabular-nums transition-all",
                  tempMinutes === m
                    ? "text-foreground scale-100"
                    : "text-muted-foreground/50 scale-90"
                )}
              >
                {m}
              </button>
            ))}
            <div className="h-[112px]" />
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="p-6 mb-8 safe-area-bottom bg-background">
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full rounded-2xl bg-primary py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          Confirmar
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 rounded-xl bg-secondary/80 backdrop-blur-sm border border-border/50 px-4 py-2.5 text-lg font-semibold text-foreground tabular-nums transition-all hover:bg-secondary active:scale-[0.98]",
          className
        )}
      >
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span>{value}</span>
      </button>

      {/* Full Screen Overlay - Rendered via Portal */}
      {mounted && isOpen && createPortal(overlay, document.body)}
    </>
  )
}
