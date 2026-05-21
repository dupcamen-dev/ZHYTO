"use client"

import { useEffect, useState } from 'react'
import { LegalLayout } from '@/components/legal-layout'
import { useLanguage } from '@/components/language-context'
import { supabase } from '@/lib/supabase'

interface DeliverySettings {
  min_order: number
  free_threshold: number
}

export default function TermsPage() {
  const { t } = useLanguage()
  const { terms } = t
  const [settings, setSettings] = useState<DeliverySettings>({ min_order: 10, free_threshold: 50 })

  useEffect(() => {
    if (!supabase) return
    supabase.from('settings').select('value').eq('key', 'delivery').single().then(({ data }) => {
      if (data?.value) {
        const v = data.value as DeliverySettings
        setSettings({ min_order: v.min_order, free_threshold: v.free_threshold })
      }
    })
  }, [])

  const interpolate = (s: string) =>
    s.replace('{min_order}', String(settings.min_order)).replace('{free_threshold}', String(settings.free_threshold))

  return (
    <LegalLayout>
      <h1 className="text-foreground">{terms.title}</h1>
      <p className="date text-muted-foreground">{terms.lastUpdated}</p>

      <h2 className="text-primary">{terms.headings[0]}</h2>
      <p className="text-foreground/80">{terms.bodies[0]}</p>

      <h2 className="text-primary">{terms.headings[1]}</h2>
      <p className="text-foreground/80">{terms.bodies[1]}</p>

      <h2 className="text-primary">{terms.headings[2]}</h2>
      <p className="text-foreground/80">{terms.bodies[2]}</p>
      <ul className="text-foreground/80">
        <li>{terms.list[0]}</li>
        <li>{terms.list[1]}</li>
        <li>{interpolate(terms.list[2])}</li>
        <li>{interpolate(terms.list[3])}</li>
      </ul>

      <h2 className="text-primary">{terms.headings[3]}</h2>
      <p className="text-foreground/80">{terms.bodies[3]}</p>

      <h2 className="text-primary">{terms.headings[4]}</h2>
      <p className="text-foreground/80">{terms.bodies[4]}</p>
    </LegalLayout>
  )
}
