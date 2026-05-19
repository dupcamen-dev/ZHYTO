"use client"

import { createContext, useContext, useState, ReactNode } from 'react'
import { translations, TranslationKeys } from '@/lib/translations'

type Lang = 'en' | 'uk'

interface LangContextType {
  lang: Lang
  t: TranslationKeys
  toggleLang: () => void
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  t: translations.en,
  toggleLang: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  const toggleLang = () => setLang(prev => prev === 'en' ? 'uk' : 'en')

  return <LangContext.Provider value={{ lang, t: translations[lang], toggleLang }}>{children}</LangContext.Provider>
}

export function useLanguage() {
  return useContext(LangContext)
}
