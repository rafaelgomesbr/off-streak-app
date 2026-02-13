"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { translations, type Language, type TranslationKeys } from "./translations"

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: TranslationKeys
}

const I18nContext = createContext<I18nContextType>({
  language: "pt-BR",
  setLanguage: () => {},
  t: translations["pt-BR"],
})

const STORAGE_KEY = "offstreak-language"

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt-BR")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load saved language or detect from browser
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null
    if (saved && translations[saved]) {
      setLanguageState(saved)
    } else {
      // Detect from browser
      const browserLang = navigator.language
      if (browserLang.startsWith("pt")) {
        setLanguageState("pt-BR")
      } else {
        setLanguageState("en")
      }
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <I18nContext.Provider
        value={{
          language: "pt-BR",
          setLanguage,
          t: translations["pt-BR"],
        }}
      >
        {children}
      </I18nContext.Provider>
    )
  }

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => useContext(I18nContext)
