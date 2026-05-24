"use client"

import { useState, useRef } from 'react'
import { Save, Download, Upload } from 'lucide-react'
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
  const importRef = useRef<HTMLInputElement>(null)

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

      <div className="flex flex-wrap gap-3 mt-6">
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
        <div className="flex-1" />
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(siteTexts, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'site-texts.json'
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="flex items-center gap-2 px-4 py-3 border border-border/50 text-muted-foreground rounded-lg text-sm tracking-[0.15em] hover:text-foreground hover:bg-border/20 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          DOWNLOAD JSON
        </button>
        <input ref={importRef} type="file" accept=".json" className="hidden" onChange={e => {
          const file = e.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = (ev) => {
            try {
              const parsed = JSON.parse(ev.target?.result as string)
              if (!parsed?.en || !parsed?.uk || !parsed?.pl) {
                toast.error('Invalid JSON: must contain en, uk, pl objects')
                return
              }
              onChange(parsed)
              toast.success('Site texts imported')
            } catch {
              toast.error('Invalid JSON file')
            }
          }
          reader.readAsText(file)
          e.target.value = ''
        }} />
        <button
          onClick={() => importRef.current?.click()}
          className="flex items-center gap-2 px-4 py-3 border border-border/50 text-muted-foreground rounded-lg text-sm tracking-[0.15em] hover:text-foreground hover:bg-border/20 transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          UPLOAD JSON
        </button>
      </div>
    </div>
  )
}