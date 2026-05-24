"use client"

import { useState } from 'react'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import TextEditor from '@/components/text-editor'

const TABS = [
  { id: 'nav', label: 'Navigation', keys: ['nav'] },
  { id: 'header', label: 'Header', keys: ['header'] },
  { id: 'hero', label: 'Hero', keys: ['hero'] },
  { id: 'products', label: 'Products', keys: ['products'] },
  { id: 'about', label: 'About', keys: ['about'] },
  { id: 'delivery', label: 'Delivery', keys: ['delivery'] },
  { id: 'faq', label: 'FAQ', keys: ['faq'] },
  { id: 'reviews', label: 'Reviews', keys: ['reviews'] },
  { id: 'contact', label: 'Contact', keys: ['contact'] },
  { id: 'mobileMenu', label: 'Mobile Menu', keys: ['mobileMenu'] },
  { id: 'cartCheckout', label: 'Cart & Checkout', keys: ['cart', 'checkout'] },
  { id: 'signInModal', label: 'Sign In Modal', keys: ['signInModal'] },
  { id: 'productModal', label: 'Product Modal', keys: ['productModal'] },
  { id: 'footer', label: 'Footer', keys: ['footer'] },
  { id: 'legal', label: 'Legal', keys: ['privacy', 'terms', 'legalLayout'] },
  { id: 'general', label: 'General', keys: ['general'] },
]

function pickKeys(obj: Record<string, unknown>, keys: string[]) {
  const result: Record<string, unknown> = {}
  for (const k of keys) {
    if (k in obj) result[k] = obj[k]
  }
  return result
}

interface SiteTextsTabsProps {
  siteTexts: { en: Record<string, unknown>; uk: Record<string, unknown>; pl: Record<string, unknown> }
  onChange: (val: { en: Record<string, unknown>; uk: Record<string, unknown>; pl: Record<string, unknown> }) => void
  siteTextsFromCode: boolean
  setSiteTextsFromCode: (val: boolean) => void
  upsertSetting: (key: string, value: any) => Promise<void>
  onCancel?: () => void
}

export default function SiteTextsTabs({ siteTexts, onChange, siteTextsFromCode, setSiteTextsFromCode, upsertSetting, onCancel }: SiteTextsTabsProps) {
  const [activeTab, setActiveTab] = useState(TABS[0].id)

  const tab = TABS.find(t => t.id === activeTab) || TABS[0]

  return (
    <div>
      <div className="flex gap-1 mb-4 overflow-x-auto pb-2 -mx-1 px-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`whitespace-nowrap px-3 py-1.5 text-xs tracking-[0.1em] rounded-lg transition-colors cursor-pointer shrink-0 ${
              activeTab === t.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80 border border-border/30'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-h-[600px] overflow-y-auto border border-border/30 rounded-lg p-4 bg-background/50">
        <TextEditor
          en={pickKeys(siteTexts.en, tab.keys)}
          uk={pickKeys(siteTexts.uk, tab.keys)}
          pl={pickKeys(siteTexts.pl, tab.keys)}
          onChange={(newEn, newUk, newPl) => {
            onChange({
              en: { ...siteTexts.en, ...newEn },
              uk: { ...siteTexts.uk, ...newUk },
              pl: { ...siteTexts.pl, ...newPl },
            })
          }}
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={async () => {
            try {
              await upsertSetting('site_texts', siteTexts)
              setSiteTextsFromCode(false)
              toast.success('Site texts saved')
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'Failed to save')
            }
          }}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm tracking-[0.15em] hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          SAVE SITE TEXTS
        </button>
        {(siteTextsFromCode) && (
          <button
            onClick={() => {
              onCancel?.()
            }}
            className="flex items-center gap-2 px-6 py-3 border border-border/50 text-muted-foreground rounded-lg text-sm tracking-[0.15em] hover:bg-border/20 transition-colors cursor-pointer"
          >
            CANCEL
          </button>
        )}
      </div>
    </div>
  )
}