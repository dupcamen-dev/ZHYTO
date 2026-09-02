"use client"

import { LegalLayout } from '@/components/legal-layout'
import { useLanguage } from '@/components/language-context'

export default function PrivacyPage() {
  const { t } = useLanguage()
  const { privacy } = t
  
  return (
    <LegalLayout>
      <h1 className="text-foreground">{privacy.title}</h1>
      <p className="date text-muted-foreground">{privacy.lastUpdated}</p>

      <h2 className="text-primary">{privacy.headings[0]}</h2>
      <p className="text-foreground/80">{privacy.bodies[0]}</p>

      <h2 className="text-primary">{privacy.headings[1]}</h2>
      <p className="text-foreground/80">{privacy.bodies[1]}</p>
      <ul className="text-foreground/80">
        <li>{privacy.list[0]}</li>
        <li>{privacy.list[1]}</li>
        <li>{privacy.list[2]}</li>
      </ul>

      <h2 className="text-primary">{privacy.headings[2]}</h2>
      <p className="text-foreground/80">{privacy.bodies[2]}</p>

      <h2 className="text-primary">{privacy.headings[3]}</h2>
      <p className="text-foreground/80">{privacy.bodies[3]}</p>

      <h2 className="text-primary">{privacy.headings[4]}</h2>
      <p className="text-foreground/80">{privacy.bodies[4]}</p>
    </LegalLayout>
  )
}
