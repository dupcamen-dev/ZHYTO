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

const LangContext = createContext<LangContextType>({
  lang: 'en',
  t: translations.en,
  toggleLang: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setLang(getInitialLang())
    setMounted(true)
  }, [])

  const toggleLang = () => setLang(prev => {
    const next = prev === 'en' ? 'uk' : 'en'
    localStorage.setItem(LS_KEY, next)
    return next
  })

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
      <div data-lang={lang} style={{ display: 'contents' }}>
        {children}
      </div>
    </LangContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LangContext)
}
