"use client"

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, X, Check, Package, AlertCircle, Upload, FolderKanban, ChevronUp, ChevronDown } from 'lucide-react'
import { img } from '@/lib/constants'
import { toast } from 'sonner'

interface Product {
  id: number
  name: string
  description: string
  price: number
  unit: string
  image: string
  background_image?: string
  badge: string | null
  category: string
  available: boolean
  stock: number
  sort_order: number
  recipe_uk?: string | null
  recipe_en?: string | null
  ingredients_uk?: string | null
  ingredients_en?: string | null
}

const defaultCategories = ['varenyky', 'syrnyky', 'pelmeni']
const emptyProduct = {
  name: '', description: '', price: 0, unit: '/ kg',
  image: '/images/syrnyky-new.webp', background_image: '', badge: null,
  category: 'varenyky', available: true, stock: 10, sort_order: 0,
  recipe_uk: '', recipe_en: '', ingredients_uk: '', ingredients_en: '',
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Product> | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [categories, setCategories] = useState<string[]>(defaultCategories)
  const [categoryDescriptions, setCategoryDescriptions] = useState<Record<string, string>>({})
  const [newCategory, setNewCategory] = useState('')
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bgFileInputRef = useRef<HTMLInputElement>(null)

  const fetchProducts = () => {
    supabase.from('products').select('*').order('sort_order').then(({ data, error }) => {
      if (!error && data) setProducts(data as Product[])
      setLoading(false)
    })
  }

  const fetchCategories = () => {
    supabase.from('settings').select('value').eq('key', 'categories').single().then(({ data }) => {
      if (data?.value) setCategories(data.value as string[])
    })
    supabase.from('settings').select('value').eq('key', 'categories_desc').single().then(({ data }) => {
      if (data?.value) setCategoryDescriptions(data.value as Record<string, string>)
    })
  }

  useEffect(() => { fetchProducts(); fetchCategories() }, [])

  const saveCategories = async (newList: string[]) => {
    setCategories(newList)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ key: 'categories', value: newList }),
    })
  }

  const updateCategoryDesc = async (cat: string, desc: string) => {
    const next = { ...categoryDescriptions, [cat]: desc }
    setCategoryDescriptions(next)
    if (!supabase) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ key: 'categories_desc', value: next }),
    })
  }

  const addCategory = () => {
    const trimmed = newCategory.trim().toLowerCase().replace(/\s+/g, '-')
    if (!trimmed || categories.includes(trimmed)) return
    saveCategories([...categories, trimmed])
    setNewCategory('')
  }

  const removeCategory = (cat: string) => {
    saveCategories(categories.filter(c => c !== cat))
  }

  const moveCategory = (index: number, direction: -1 | 1) => {
    const newList = [...categories]
    const target = index + direction
    if (target < 0 || target >= newList.length) return
    ;[newList[index], newList[target]] = [newList[target], newList[index]]
    saveCategories(newList)
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    const { data: { session } } = await supabase!.auth.getSession()
    if (!session?.access_token) return null

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: formData,
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.url || null
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      setEditing(f => ({ ...f, image: ev.target?.result as string || f?.image }))
    }
    reader.readAsDataURL(file)

    const url = await uploadFile(file)
    if (url) {
      setEditing(f => ({ ...f, image: url }))
    }
  }

  const handleBgFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      setEditing(f => ({ ...f, background_image: ev.target?.result as string || f?.background_image }))
    }
    reader.readAsDataURL(file)

    const url = await uploadFile(file)
    if (url) {
      setEditing(f => ({ ...f, background_image: url }))
    }
  }

  const apiCall = async (method: string, body?: any) => {
    const { data: { session } } = await supabase!.auth.getSession()
    if (!session?.access_token) throw new Error('Not authenticated')
    const res = await fetch('/api/admin/products', {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(err.error || 'Request failed')
    }
    return res.json()
  }

  const save = async () => {
    if (!editing) return
    if (!editing.name?.trim()) { setError('Name is required'); return }
    if (!editing.price || editing.price <= 0) { setError('Price must be > 0'); return }
    setError('')
    setSaving(true)

    const payload = {
      name: editing.name, description: editing.description, price: editing.price,
      unit: editing.unit, image: editing.image || '/images/syrnyky-new.webp',
      background_image: editing.background_image || null, badge: editing.badge || null, category: editing.category,
      available: editing.available ?? true, stock: editing.stock ?? 10,
      recipe_uk: editing.recipe_uk || null, recipe_en: editing.recipe_en || null,
      ingredients_uk: editing.ingredients_uk || null, ingredients_en: editing.ingredients_en || null,
    }

    if (!supabase) {
      setProducts(prev => {
        if (editing.id) {
          return prev.map(p => p.id === editing.id ? { ...p, ...payload } as Product : p)
        } else {
          const newId = Math.max(0, ...prev.map(p => p.id)) + 1
          return [...prev, { id: newId, sort_order: prev.length, ...payload } as Product]
        }
      })
      setSaving(false)
      setEditing(null)
      setSuccessMsg('Saved (mock mode)')
      setTimeout(() => setSuccessMsg(''), 2000)
      return
    }

    try {
      if (editing.id) {
        await apiCall('PUT', { id: editing.id, ...payload })
      } else {
        await apiCall('POST', { ...payload, sort_order: products.length })
      }
      setSaving(false)
      setEditing(null)
      setSuccessMsg('Saved')
      setTimeout(() => setSuccessMsg(''), 2000)
      fetchProducts()
    } catch (e: any) {
      setError(e?.message || 'Failed to save')
      setSaving(false)
    }
  }

  const toggleAvailable = async (product: Product) => {
    if (!supabase) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, available: !p.available } : p))
      return
    }
    try {
      await apiCall('PUT', { id: product.id, available: !product.available })
      fetchProducts()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update')
    }
  }

  const deleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return
    if (!supabase) {
      setProducts(prev => prev.filter(p => p.id !== id))
      return
    }
    try {
      const { data: { session } } = await supabase!.auth.getSession()
      if (!session?.access_token) return
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) throw new Error('Failed to delete')
      fetchProducts()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Menu</h1>
          <p className="text-muted-foreground text-base mt-1">Manage your products</p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyProduct })}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm tracking-[0.15em] rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          ADD PRODUCT
        </button>
      </div>

      {successMsg && (
        <div className="text-sm text-emerald-400 bg-emerald-400/10 rounded-lg px-4 py-3">{successMsg}</div>
      )}

      {/* Categories management */}
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => setCategoriesOpen(!categoriesOpen)}
          className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-border/10 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <FolderKanban className="w-5 h-5 text-primary" />
            <span className="font-serif text-lg text-foreground">Categories</span>
          </div>
          <span className={`text-muted-foreground transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </button>
        {categoriesOpen && (
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-border/30 pt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat, i) => (
                <div key={cat} className="flex flex-col gap-1 w-full sm:w-auto">
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-lg">
                    {cat}
                    <button onClick={() => moveCategory(i, -1)} disabled={i === 0} className="hover:text-foreground transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-default p-0.5">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => moveCategory(i, 1)} disabled={i === categories.length - 1} className="hover:text-foreground transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-default p-0.5">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeCategory(cat)}
                      className="hover:text-destructive transition-colors cursor-pointer ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    value={categoryDescriptions[cat] || ''}
                    onChange={e => updateCategoryDesc(cat, e.target.value)}
                    className="w-full sm:w-64 bg-transparent border border-border/20 rounded px-2 py-1 text-xs text-muted-foreground focus:border-primary outline-none"
                    placeholder="Subtitle (e.g. Traditional meat-filled dumplings)"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCategory()}
                className="flex-1 bg-transparent border border-border/50 rounded-lg px-4 py-2 text-sm text-foreground focus:border-primary outline-none"
                placeholder="New category name"
              />
              <button
                onClick={addCategory}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm tracking-[0.15em] rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                ADD
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product list */}
      <div className="space-y-3">
        {products.map(product => (
          <div key={product.id} className={`glass-card p-4 sm:p-5 ${!product.available ? 'opacity-50' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <div className="flex items-start gap-3 sm:gap-0">
                <div className="flex flex-col items-start shrink-0">
                  {product.badge && (
                    <span className="hidden sm:inline px-2 py-0.5 bg-primary text-primary-foreground text-[11px] tracking-[0.15em] rounded font-semibold leading-none mb-0.5">
                      {product.badge}
                    </span>
                  )}
                  <div className="relative w-14 h-14 sm:w-20 sm:h-20 overflow-hidden shrink-0">
                    <img src={img(product.image)} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/images/syrnyky-new.webp' }} />
                  </div>
                </div>
                <div className="flex-1 min-w-0 sm:hidden ml-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base text-foreground truncate">{product.name}</h3>
                    {product.badge && (
                      <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[11px] tracking-[0.15em] rounded shrink-0">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.description}</p>
                </div>
              </div>
              <div className="hidden sm:block flex-1 min-w-0">
                <h3 className="font-serif text-lg text-foreground mb-0.5">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-primary text-sm sm:text-base font-serif">£{product.price}{product.unit}</span>
                <span className="text-xs sm:text-sm tracking-[0.15em] text-muted-foreground uppercase">{product.category}</span>
                <span className={`text-xs sm:text-sm tracking-[0.1em] ${product.stock === 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {product.stock === 0 ? 'OUT OF STOCK' : `STOCK: ${product.stock}`}
                </span>
              </div>
              <div className="flex items-center gap-2 justify-end sm:justify-start shrink-0 sm:ml-auto">
                <button
                  onClick={() => toggleAvailable(product)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                    product.available
                      ? 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'
                      : 'border-border/50 text-muted-foreground hover:border-foreground/50'
                  }`}
                  title={product.available ? 'Disable' : 'Enable'}
                >
                  {product.available ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>
                <button
                  onClick={() => setEditing({ ...product })}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:border-red-400/50 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create modal */}
      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="min-h-full sm:min-h-screen flex items-center justify-center p-3 sm:p-4">
            <div className="bg-card border border-border/30 p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="font-serif text-xl text-foreground">{editing.id ? 'Edit Product' : 'Add Product'}</h2>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-1">Name</label>
                <input
                  value={editing.name || ''}
                  onChange={e => setEditing(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-base text-foreground focus:border-primary outline-none"
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-1">Description</label>
                <textarea
                  value={editing.description || ''}
                  onChange={e => setEditing(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-base text-foreground focus:border-primary outline-none min-h-[60px]"
                  placeholder="Product description"
                />
              </div>
              <div>
                <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-1">Recipe (Ukrainian)</label>
                <textarea
                  value={editing.recipe_uk || ''}
                  onChange={e => setEditing(f => ({ ...f, recipe_uk: e.target.value }))}
                  className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-base text-foreground focus:border-primary outline-none min-h-[80px]"
                  placeholder="Рецепт приготування українською"
                />
              </div>
              <div>
                <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-1">Recipe (English)</label>
                <textarea
                  value={editing.recipe_en || ''}
                  onChange={e => setEditing(f => ({ ...f, recipe_en: e.target.value }))}
                  className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-base text-foreground focus:border-primary outline-none min-h-[80px]"
                  placeholder="Cooking instructions in English"
                />
              </div>
              <div>
                <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-1">Ingredients (Ukrainian)</label>
                <textarea
                  value={editing.ingredients_uk || ''}
                  onChange={e => setEditing(f => ({ ...f, ingredients_uk: e.target.value }))}
                  className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-base text-foreground focus:border-primary outline-none min-h-[80px]"
                  placeholder="Склад / інгредієнти українською"
                />
              </div>
              <div>
                <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-1">Ingredients (English)</label>
                <textarea
                  value={editing.ingredients_en || ''}
                  onChange={e => setEditing(f => ({ ...f, ingredients_en: e.target.value }))}
                  className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-base text-foreground focus:border-primary outline-none min-h-[80px]"
                  placeholder="Ingredients / composition in English"
                />
              </div>
              <div>
                <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-1">Image</label>
                <div className="flex gap-3 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      value={editing.image || ''}
                      onChange={e => setEditing(f => ({ ...f, image: e.target.value }))}
                      className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-base text-foreground focus:border-primary outline-none"
                      placeholder="/images/syrnyky-new.webp"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 border border-border/50 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Browse files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                  {editing.image && (
                    <div className="relative w-20 h-20 shrink-0 overflow-hidden border border-border/30">
                      <img src={img(editing.image)} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/images/syrnyky-new.webp' }} />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-1">Background Image (for ImageCompare slider)</label>
                <div className="flex gap-3 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      value={editing.background_image || ''}
                      onChange={e => setEditing(f => ({ ...f, background_image: e.target.value }))}
                      className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-base text-foreground focus:border-primary outline-none"
                      placeholder="/images/syrnyky-ingredients.webp"
                    />
                    <button
                      type="button"
                      onClick={() => bgFileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 border border-border/50 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Browse files
                    </button>
                    <input
                      ref={bgFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBgFileSelect}
                    />
                  </div>
                  {editing.background_image && (
                    <div className="relative w-20 h-20 shrink-0 overflow-hidden border border-border/30">
                      <img src={img(editing.background_image)} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/images/syrnyky-new.webp' }} />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-1">Price (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editing.price || ''}
                    onChange={e => setEditing(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-base text-foreground focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-1">Unit</label>
                  <input
                    value={editing.unit || '/ kg'}
                    onChange={e => setEditing(f => ({ ...f, unit: e.target.value }))}
                    className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-base text-foreground focus:border-primary outline-none"
                    placeholder="/ kg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-1">Category</label>
                  <select
                    value={editing.category || 'varenyky'}
                    onChange={e => setEditing(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-base text-foreground focus:border-primary outline-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-1">Badge</label>
                  <input
                    value={editing.badge || ''}
                    onChange={e => setEditing(f => ({ ...f, badge: e.target.value || null }))}
                    className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-base text-foreground focus:border-primary outline-none"
                    placeholder="e.g. Bestseller"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-1">Stock (0 = out of stock)</label>
                <input
                  type="number"
                  min="0"
                  value={editing.stock ?? ''}
                  onChange={e => setEditing(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-base text-foreground focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 px-4 py-3 border border-border/50 rounded-lg text-sm tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm tracking-[0.15em] hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'SAVING...' : 'SAVE'}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="text-center py-20 glass-card">
          <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No products yet. Add your first product.</p>
        </div>
      )}
    </div>
  )
}
