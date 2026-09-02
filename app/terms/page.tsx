"use client"

import { LegalLayout } from '@/components/legal-layout'
import { useLanguage } from '@/components/language-context'

export default function TermsPage() {
  const { t } = useLanguage()
  const { terms } = t
  
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
        <li>{terms.list[2]}</li>
        <li>{terms.list[3]}</li>
      </ul>

      <h2 className="text-primary">{terms.headings[3]}</h2>
      <p className="text-foreground/80">{terms.bodies[3]}</p>

      <h2 className="text-primary">{terms.headings[4]}</h2>
      <p className="text-foreground/80">{terms.bodies[4]}</p>
    </LegalLayout>
  )
}
