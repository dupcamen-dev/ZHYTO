"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { translations, TranslationKeys } from '@/lib/translations'

type Lang = 'en' | 'uk'

interface LangContextType {
  lang: Lang
  t: TranslationKeys
  toggleLang: () => void
}

const LS_KEY = 'zhyto-lang'

function getInitialLang(): Lang {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LS_KEY)
    if (stored === 'en' || stored === 'uk') return stored
  }
  return 'en'
}

function deepMerge<T extends Record<string, any>>(defaults: T, overrides: Partial<T>): T {
  const result = { ...defaults }
  for (const key of Object.keys(overrides)) {
    const val = overrides[key]
    if (val === null || val === undefined) continue
    if (Array.isArray(val) || Array.isArray(result[key])) {
      ;(result as any)[key] = val
    } else if (typeof val === 'object' && typeof result[key] === 'object') {
      ;(result as any)[key] = deepMerge(result[key] as any, val as any)
    } else if (typeof val === typeof result[key]) {
      ;(result as any)[key] = val
    }
  }
  return result
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  t: translations.en,
  toggleLang: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const [customTexts, setCustomTexts] = useState<{ en: Record<string, any>; uk: Record<string, any> } | null>(null)

  useEffect(() => {
    setLang(getInitialLang())
    fetch('/api/public/texts')
      .then(r => r.json())
      .then(data => {
        if (data?.en && data?.uk) setCustomTexts(data)
      })
      .catch(() => {})
  }, [])

  const merged = customTexts
    ? {
        en: deepMerge(translations.en, customTexts.en),
        uk: deepMerge(translations.uk, customTexts.uk),
      }
    : translations

  const toggleLang = () => setLang(prev => {
    const next = prev === 'en' ? 'uk' : 'en'
    localStorage.setItem(LS_KEY, next)
    return next
  })

  return (
    <LangContext.Provider value={{ lang, t: merged[lang], toggleLang }}>
      <div data-lang={lang} style={{ display: 'contents' }}>
        {children}
      </div>
    </LangContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LangContext)
}
