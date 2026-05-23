"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Truck, Save, Loader, Percent, X, Tag, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'

const CATEGORY_KEYS = ['varenyky', 'syrnyky', 'pelmeni']

export default function AdminSettings() {
  const [settings, setSettings] = useState({ min_order: 10, free_threshold: 50, fee: 5 })
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [promoCodes, setPromoCodes] = useState<{ code: string; type: 'percentage' | 'free_delivery'; value: number }[]>([])
  const [newPromoCode, setNewPromoCode] = useState('')
  const [newPromoType, setNewPromoType] = useState<'percentage' | 'free_delivery'>('percentage')
  const [newPromoValue, setNewPromoValue] = useState(10)
  const [promoLoaded, setPromoLoaded] = useState(false)
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({})
  const [categoryNamesLoaded, setCategoryNamesLoaded] = useState(false)

  useEffect(() => {
    if (!supabase) { setLoaded(true); return }
    supabase.from('settings').select('value').eq('key', 'delivery').single().then(({ data }) => {
      if (data?.value) setSettings(data.value as typeof settings)
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!supabase) { setCategoryNamesLoaded(true); return }
    supabase.from('settings').select('value').eq('key', 'categories_names').single().then(({ data }) => {
      if (data?.value) setCategoryNames(data.value as Record<string, string>)
      setCategoryNamesLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!supabase) { setPromoLoaded(true); return }
    supabase.from('settings').select('value').eq('key', 'promo_codes').single().then(({ data }) => {
      if (data?.value) setPromoCodes(data.value as typeof promoCodes)
      setPromoLoaded(true)
    })
  }, [])

  const upsertSetting = async (key: string, value: any) => {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ key, value }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to save' }))
      throw new Error(err.error || 'Failed to save')
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await upsertSetting('delivery', settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save')
    }
    setSaving(false)
  }

  const savePromoCodes = async (newList: typeof promoCodes) => {
    setPromoCodes(newList)
    if (!supabase) return
    await upsertSetting('promo_codes', newList)
  }

  const addPromoCode = () => {
    const code = newPromoCode.trim().toUpperCase().replace(/\s+/g, '')
    if (!code || promoCodes.some(p => p.code === code)) return
    savePromoCodes([...promoCodes, { code, type: newPromoType, value: newPromoValue }])
    setNewPromoCode('')
    setNewPromoValue(10)
  }

  const removePromoCode = (code: string) => {
    savePromoCodes(promoCodes.filter(p => p.code !== code))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Settings</h1>
        <p className="text-muted-foreground text-base mt-1">Configure your shop</p>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Truck className="w-6 h-6 text-primary" />
          <h2 className="font-serif text-xl text-foreground">Delivery Settings</h2>
        </div>

        {!loaded ? (
          <div className="flex items-center justify-center py-10">
            <Loader className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-2">Minimum Order (£)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={settings.min_order}
                  onChange={e => setSettings(f => ({ ...f, min_order: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-3 text-base text-foreground focus:border-primary outline-none"
                />
                <p className="text-sm text-muted-foreground/60 mt-1">Orders below this cannot be placed</p>
              </div>
              <div>
                <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-2">Free Delivery Above (£)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={settings.free_threshold}
                  onChange={e => setSettings(f => ({ ...f, free_threshold: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-3 text-base text-foreground focus:border-primary outline-none"
                />
                <p className="text-sm text-muted-foreground/60 mt-1">Orders at or above this get free delivery</p>
              </div>
              <div>
                <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-2">Delivery Fee (£)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={settings.fee}
                  onChange={e => setSettings(f => ({ ...f, fee: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-3 text-base text-foreground focus:border-primary outline-none"
                />
                <p className="text-sm text-muted-foreground/60 mt-1">Standard delivery charge</p>
              </div>
            </div>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm tracking-[0.15em] hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'SAVING...' : saved ? 'SAVED ✓' : 'SAVE SETTINGS'}
            </button>
          </>
        )}
      </div>

      {/* Category Names */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <FolderOpen className="w-6 h-6 text-primary" />
          <h2 className="font-serif text-xl text-foreground">Category Names (Ukrainian)</h2>
        </div>

        {!categoryNamesLoaded ? (
          <div className="flex items-center justify-center py-10">
            <Loader className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-3 gap-4">
              {CATEGORY_KEYS.map(key => (
                <div key={key}>
                  <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-2 capitalize">{key}</label>
                  <input
                    value={categoryNames[key] || ''}
                    onChange={e => setCategoryNames(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-3 text-base text-foreground focus:border-primary outline-none"
                    placeholder={`Enter Ukrainian name for ${key}`}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={async () => {
                try {
                  await upsertSetting('categories_names', categoryNames)
                  toast.success('Category names saved')
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : 'Failed to save')
                }
              }}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm tracking-[0.15em] hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              SAVE CATEGORY NAMES
            </button>
          </>
        )}
      </div>

      {/* Promo Codes */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Percent className="w-6 h-6 text-primary" />
          <h2 className="font-serif text-xl text-foreground">Promo Codes</h2>
        </div>

        {!promoLoaded ? (
          <div className="flex items-center justify-center py-10">
            <Loader className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : (
          <>
            {promoCodes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {promoCodes.map(p => (
                  <span
                    key={p.code}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-lg"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {p.code}
                    <span className="text-muted-foreground text-xs">
                      {p.type === 'percentage' ? `-${p.value}%` : 'FREE DELIVERY'}
                    </span>
                    <button
                      onClick={() => removePromoCode(p.code)}
                      className="hover:text-destructive transition-colors cursor-pointer ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-xs tracking-[0.1em] text-muted-foreground block mb-1">Code</label>
                <input
                  value={newPromoCode}
                  onChange={e => setNewPromoCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addPromoCode()}
                  className="bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none w-32"
                  placeholder="e.g. SUMMER20"
                />
              </div>
              <div>
                <label className="text-xs tracking-[0.1em] text-muted-foreground block mb-1">Type</label>
                <select
                  value={newPromoType}
                  onChange={e => setNewPromoType(e.target.value as 'percentage' | 'free_delivery')}
                  className="bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none"
                >
                  <option value="percentage">% Discount</option>
                  <option value="free_delivery">Free Delivery</option>
                </select>
              </div>
              {newPromoType === 'percentage' && (
                <div>
                  <label className="text-xs tracking-[0.1em] text-muted-foreground block mb-1">Value (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newPromoValue}
                    onChange={e => setNewPromoValue(parseInt(e.target.value) || 0)}
                    className="bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none w-20"
                  />
                </div>
              )}
              <button
                onClick={addPromoCode}
                className="px-4 py-2.5 bg-primary text-primary-foreground text-sm tracking-[0.15em] rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                ADD
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
