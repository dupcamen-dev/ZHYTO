"use client"

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Truck, Save, Loader, Percent, X, Tag, FolderOpen, Languages, RotateCcw, Upload, Trash2, Camera, Plus } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import TextEditor from '@/components/text-editor'
import { translations } from '@/lib/translations'
import { img } from '@/lib/constants'

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
  const [siteTexts, setSiteTexts] = useState<{ en: Record<string, unknown>; uk: Record<string, unknown> } | null>(null)
  const [siteTextsLoaded, setSiteTextsLoaded] = useState(false)
  const [siteTextsFromCode, setSiteTextsFromCode] = useState(false)
  const [aboutImages, setAboutImages] = useState<{ src: string; name: string }[] | null>(null)
  const [aboutImagesLoaded, setAboutImagesLoaded] = useState(false)
  const carouselInputRef = useRef<HTMLInputElement>(null)
  const addPhotoInputRef = useRef<HTMLInputElement>(null)
  const [carouselEditIndex, setCarouselEditIndex] = useState<number | null>(null)

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
    if (!supabase) { setSiteTextsLoaded(true); return }
    supabase.from('settings').select('value').eq('key', 'site_texts').single().then(({ data }) => {
      if (data?.value?.en && data?.value?.uk) {
        setSiteTexts(data.value as { en: Record<string, unknown>; uk: Record<string, unknown> })
      } else {
        setSiteTexts(null)
      }
      setSiteTextsLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!supabase) { setPromoLoaded(true); return }
    supabase.from('settings').select('value').eq('key', 'promo_codes').single().then(({ data }) => {
      if (data?.value) setPromoCodes(data.value as typeof promoCodes)
      setPromoLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!supabase) { setAboutImagesLoaded(true); return }
    supabase.from('settings').select('value').eq('key', 'about_images').single().then(({ data }) => {
      if (data?.value?.images) {
        setAboutImages(data.value.images as { src: string; name: string }[])
      } else {
        setAboutImages([
          { src: "/images/about-us.webp", name: "Illia" },
          { src: "/images/about-us-2.webp", name: "Victor" },
          { src: "/images/about-us-3.webp", name: "Nataliia" },
        ])
      }
      setAboutImagesLoaded(true)
    })
  }, [])

  const uploadImage = async (file: File): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return null
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }))
      toast.error(`Upload failed: ${err.error || res.statusText}`)
      return null
    }
    const data = await res.json()
    return data.url || null
  }

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

      {/* Site Texts */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Languages className="w-6 h-6 text-primary" />
          <h2 className="font-serif text-xl text-foreground">Site Texts</h2>
        </div>

        {!siteTextsLoaded ? (
          <div className="flex items-center justify-center py-10">
            <Loader className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : (
          <>
            {!siteTexts || siteTextsFromCode ? (
              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-muted-foreground">
                  {siteTextsFromCode
                    ? 'Editing from code defaults. Make your changes below and save to publish.'
                    : 'No custom texts saved yet. Load from code to start editing.'}
                </p>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-muted-foreground">
                  Editing saved custom texts. Make your changes below and save to publish.
                </p>
              </div>
            )}

            {!siteTexts && !siteTextsFromCode && (
              <button
                onClick={() => {
                  setSiteTexts({
                    en: JSON.parse(JSON.stringify(translations.en)) as Record<string, unknown>,
                    uk: JSON.parse(JSON.stringify(translations.uk)) as Record<string, unknown>,
                  })
                  setSiteTextsFromCode(true)
                }}
                className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-lg text-sm tracking-[0.15em] hover:bg-primary/20 transition-colors cursor-pointer mb-6"
              >
                <RotateCcw className="w-4 h-4" />
                LOAD FROM CODE
              </button>
            )}

            {siteTexts && (
              <>
                <div className="max-h-[600px] overflow-y-auto border border-border/30 rounded-lg p-4 bg-background/50">
                  <TextEditor
                    en={siteTexts.en}
                    uk={siteTexts.uk}
                    onChange={(newEn, newUk) => setSiteTexts({ en: newEn, uk: newUk })}
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
                  {(siteTextsFromCode || !siteTexts) && (
                    <button
                      onClick={() => {
                        setSiteTexts(null)
                        setSiteTextsFromCode(false)
                      }}
                      className="flex items-center gap-2 px-6 py-3 border border-border/50 text-muted-foreground rounded-lg text-sm tracking-[0.15em] hover:bg-border/20 transition-colors cursor-pointer"
                    >
                      CANCEL
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* About Images */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Camera className="w-6 h-6 text-primary" />
          <h2 className="font-serif text-xl text-foreground">About Images</h2>
        </div>

        {!aboutImagesLoaded ? (
          <div className="flex items-center justify-center py-10">
            <Loader className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : (
          <>
            {/* Carousel Images */}
            <div>
              <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-3">Carousel Images</label>
              <div className="space-y-3">
                {(aboutImages || []).map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-lg border border-border/30 bg-background/30">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border/50 shrink-0 bg-background/50">
                      <Image src={img(item.src)} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-xs tracking-[0.1em] text-muted-foreground block mb-1">Name</label>
                      <input
                        value={item.name}
                        onChange={e => {
                          const newImages = [...(aboutImages || [])]
                          newImages[i] = { ...newImages[i], name: e.target.value }
                          setAboutImages(newImages)
                        }}
                        className="w-full bg-transparent border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none mb-2"
                        placeholder="Name"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setCarouselEditIndex(i)
                            carouselInputRef.current?.click()
                          }}
                          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
                        >
                          <Upload className="w-3 h-3" /> Change photo
                        </button>
                        <button
                          onClick={() => {
                            setAboutImages((aboutImages || []).filter((_, j) => j !== i))
                          }}
                          className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addPhotoInputRef.current?.click()}
                className="mt-3 flex items-center gap-2 px-4 py-2 border border-dashed border-border/50 text-muted-foreground rounded-lg text-sm tracking-[0.15em] hover:bg-border/20 transition-colors w-full justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4" /> ADD PHOTO
              </button>
              <input
                ref={addPhotoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const url = await uploadImage(file)
                  if (url) {
                    setAboutImages(prev => [...(prev || []), { src: url, name: '' }])
                  }
                  e.target.value = ''
                }}
              />
            </div>

            <input
              ref={carouselInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0]
                if (!file || carouselEditIndex === null) return
                const url = await uploadImage(file)
                if (url && aboutImages) {
                  const newImages = [...aboutImages]
                  newImages[carouselEditIndex] = { ...newImages[carouselEditIndex], src: url }
                  setAboutImages(newImages)
                }
                setCarouselEditIndex(null)
                e.target.value = ''
              }}
            />

            <button
              onClick={async () => {
                if (!aboutImages) return
                try {
                  await upsertSetting('about_images', { images: aboutImages })
                  toast.success('About images saved')
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : 'Failed to save')
                }
              }}
              disabled={!aboutImages || aboutImages.length === 0}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm tracking-[0.15em] hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              SAVE ABOUT IMAGES
            </button>
          </>
        )}
      </div>
    </div>
  )
}
