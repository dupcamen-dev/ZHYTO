"use client"

import { useState } from 'react'
import { Plus, X } from 'lucide-react'

const SKIP_KEYS = new Set(['productList', 'categories'])
const TEXTAREA_THRESHOLD = 80

function keyLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

interface FieldInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

function FieldInput({ value, onChange, placeholder }: FieldInputProps) {
  const isLong = value.length > TEXTAREA_THRESHOLD || (placeholder?.length ?? 0) > TEXTAREA_THRESHOLD
  if (isLong) {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-transparent border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none resize-y min-h-[60px]"
      />
    )
  }
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
    />
  )
}

interface ArrayItemEditorProps {
  en: Record<string, string>
  uk: Record<string, string>
  pl: Record<string, string>
  onChange: (en: Record<string, string>, uk: Record<string, string>, pl: Record<string, string>) => void
}

function ArrayItemEditor({ en, uk, pl, onChange }: ArrayItemEditorProps) {
  const keys = Object.keys(en)
  return (
    <div className="space-y-2 pl-4 border-l-2 border-border/30">
      {keys.map(k => (
        <div key={k}>
          <label className="text-xs tracking-[0.1em] text-muted-foreground block mb-1">{keyLabel(k)}</label>
          <div className="grid grid-cols-3 gap-2">
            <FieldInput value={en[k] || ''} onChange={val => onChange({ ...en, [k]: val }, uk, pl)} />
            <FieldInput value={uk[k] || ''} onChange={val => onChange(en, { ...uk, [k]: val }, pl)} />
            <FieldInput value={pl[k] || ''} onChange={val => onChange(en, uk, { ...pl, [k]: val })} />
          </div>
        </div>
      ))}
    </div>
  )
}

interface TextEditorProps {
  en: Record<string, unknown>
  uk: Record<string, unknown>
  pl: Record<string, unknown>
  onChange: (en: Record<string, unknown>, uk: Record<string, unknown>, pl: Record<string, unknown>) => void
  depth?: number
}

export default function TextEditor({ en, uk, pl, onChange, depth = 0 }: TextEditorProps) {
  return (
    <div className={depth > 0 ? 'pl-4 border-l-2 border-border/20 space-y-3' : 'space-y-4'}>
      {Object.keys(en).map(key => {
        if (SKIP_KEYS.has(key)) return null

        const enVal = en[key]
        const ukVal = uk[key]
        const plVal = pl[key]

        // skip if all three values are empty
        if (!enVal && !ukVal && !plVal) return null

        // string leaf
        if (typeof enVal === 'string' && typeof ukVal === 'string' && typeof plVal === 'string') {
          return (
            <div key={key}>
              <label className="text-xs tracking-[0.1em] text-muted-foreground block mb-1.5">{keyLabel(key)}</label>
              <div className="grid grid-cols-3 gap-2">
                <FieldInput value={enVal} onChange={val => onChange({ ...en, [key]: val }, uk, pl)} />
                <FieldInput value={ukVal} onChange={val => onChange(en, { ...uk, [key]: val }, pl)} />
                <FieldInput value={plVal} onChange={val => onChange(en, uk, { ...pl, [key]: val })} />
              </div>
            </div>
          )
        }

        // number leaf
        if (typeof enVal === 'number' && typeof ukVal === 'number' && typeof plVal === 'number') {
          return (
            <div key={key}>
              <label className="text-xs tracking-[0.1em] text-muted-foreground block mb-1.5">{keyLabel(key)}</label>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" value={enVal} onChange={e => onChange({ ...en, [key]: parseFloat(e.target.value) || 0 }, uk, pl)} className="w-full bg-transparent border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none" />
                <input type="number" value={ukVal} onChange={e => onChange(en, { ...uk, [key]: parseFloat(e.target.value) || 0 }, pl)} className="w-full bg-transparent border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none" />
                <input type="number" value={plVal} onChange={e => onChange(en, uk, { ...pl, [key]: parseFloat(e.target.value) || 0 })} className="w-full bg-transparent border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none" />
              </div>
            </div>
          )
        }

        // array
        if (Array.isArray(enVal) && Array.isArray(ukVal) && Array.isArray(plVal)) {
          const isStringArray = enVal.length === 0 || typeof enVal[0] === 'string'
          if (isStringArray) {
            return (
              <div key={key}>
                <label className="text-xs tracking-[0.1em] text-muted-foreground block mb-1.5">{keyLabel(key)}</label>
                <div className="space-y-1.5">
                  {(enVal as string[]).map((_, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <FieldInput value={enVal[i] as string} onChange={val => { const newEn = [...enVal as string[]]; newEn[i] = val; onChange({ ...en, [key]: newEn }, uk, pl) }} />
                      </div>
                      <div className="flex-1">
                        <FieldInput value={ukVal[i] as string} onChange={val => { const newUk = [...ukVal as string[]]; newUk[i] = val; onChange(en, { ...uk, [key]: newUk }, pl) }} />
                      </div>
                      <div className="flex-1">
                        <FieldInput value={plVal[i] as string} onChange={val => { const newPl = [...plVal as string[]]; newPl[i] = val; onChange(en, uk, { ...pl, [key]: newPl }) }} />
                      </div>
                      <button onClick={() => { const newEn = [...enVal as string[]]; const newUk = [...ukVal as string[]]; const newPl = [...plVal as string[]]; newEn.splice(i, 1); newUk.splice(i, 1); newPl.splice(i, 1); onChange({ ...en, [key]: newEn }, { ...uk, [key]: newUk }, { ...pl, [key]: newPl }) }} className="p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer shrink-0"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => onChange({ ...en, [key]: [...enVal as string[], ''] }, { ...uk, [key]: [...ukVal as string[], ''] }, { ...pl, [key]: [...plVal as string[], ''] })} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"><Plus className="w-3 h-3" /> Add {keyLabel(key)}</button>
                </div>
              </div>
            )
          }
          // array of objects (faq.items, etc.)
          return (
            <div key={key}>
              <label className="text-xs tracking-[0.1em] text-muted-foreground block mb-1.5">{keyLabel(key)}</label>
              <div className="space-y-3">
                {(enVal as Record<string, string>[]).map((_, i) => (
                  <div key={i} className="relative bg-background/50 rounded-lg p-3 border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground/60">Item {i + 1}</span>
                      <button onClick={() => { const newEn = [...enVal as Record<string, string>[]]; const newUk = [...ukVal as Record<string, string>[]]; const newPl = [...plVal as Record<string, string>[]]; newEn.splice(i, 1); newUk.splice(i, 1); newPl.splice(i, 1); onChange({ ...en, [key]: newEn }, { ...uk, [key]: newUk }, { ...pl, [key]: newPl }) }} className="p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                    </div>
                    <ArrayItemEditor en={enVal[i] as Record<string, string>} uk={ukVal[i] as Record<string, string>} pl={plVal[i] as Record<string, string>} onChange={(newEn, newUk, newPl) => { const newEnArr = [...enVal as Record<string, string>[]]; const newUkArr = [...ukVal as Record<string, string>[]]; const newPlArr = [...plVal as Record<string, string>[]]; newEnArr[i] = newEn; newUkArr[i] = newUk; newPlArr[i] = newPl; onChange({ ...en, [key]: newEnArr }, { ...uk, [key]: newUkArr }, { ...pl, [key]: newPlArr }) }} />
                  </div>
                ))}
                <button onClick={() => { const template = enVal[0] as Record<string, string> | undefined; const empty = template ? Object.fromEntries(Object.keys(template).map(k => [k, ''])) : {}; onChange({ ...en, [key]: [...enVal as Record<string, string>[], { ...empty }] }, { ...uk, [key]: [...ukVal as Record<string, string>[], { ...empty }] }, { ...pl, [key]: [...plVal as Record<string, string>[], { ...empty }] }) }} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"><Plus className="w-3 h-3" /> Add {keyLabel(key)}</button>
              </div>
            </div>
          )
        }

        // nested object
        if (typeof enVal === 'object' && enVal !== null && typeof ukVal === 'object' && ukVal !== null && typeof plVal === 'object' && plVal !== null) {
          return (
            <div key={key}>
              <h4 className="text-sm font-medium text-foreground mb-2 tracking-[0.05em] uppercase">{keyLabel(key)}</h4>
              <TextEditor en={enVal as Record<string, unknown>} uk={ukVal as Record<string, unknown>} pl={plVal as Record<string, unknown>} onChange={(newEn, newUk, newPl) => onChange({ ...en, [key]: newEn }, { ...uk, [key]: newUk }, { ...pl, [key]: newPl })} depth={depth + 1} />
            </div>
          )
        }

        return null
      })}
    </div>
  )
}