"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Truck, Save, Loader } from 'lucide-react'

export default function AdminSettings() {
  const [settings, setSettings] = useState({ min_order: 10, free_threshold: 50, fee: 5 })
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!supabase) { setLoaded(true); return }
    supabase.from('settings').select('value').eq('key', 'delivery').single().then(({ data }) => {
      if (data?.value) setSettings(data.value as typeof settings)
      setLoaded(true)
    })
  }, [])

  const save = async () => {
    if (!supabase) return
    setSaving(true)
    await supabase.from('settings').upsert(
      { key: 'delivery', value: settings },
      { onConflict: 'key' }
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
              onClick={save}
              disabled={saving}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm tracking-[0.15em] hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'SAVING...' : saved ? 'SAVED ✓' : 'SAVE SETTINGS'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
