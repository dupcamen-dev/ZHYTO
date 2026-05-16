"use client"

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, X, Check, Package, AlertCircle, Upload } from 'lucide-react'
import { img } from '@/lib/constants'

interface Product {
  id: number
  name: string
  description: string
  price: number
  unit: string
  image: string
  badge: string | null
  category: string
  available: boolean
  stock: number
  sort_order: number
}

const categories = ['varenyky', 'syrnyky', 'pelmeni']

const fallbackProducts: Product[] = [
  { id: 1, name: 'Varenyky with potato', description: 'Classic Ukrainian varenyky with creamy mashed potato', price: 12, unit: '/ kg', image: '/images/hero-varenyky.jpg', badge: 'Traditional', category: 'varenyky', available: true, stock: 10, sort_order: 1 },
  { id: 2, name: 'Varenyky with cabbage', description: 'Hearty varenyky with savoury braised cabbage', price: 12, unit: '/ kg', image: '/images/hero-varenyky.jpg', badge: null, category: 'varenyky', available: true, stock: 10, sort_order: 2 },
  { id: 3, name: 'Varenyky with mushroom', description: 'Rich varenyky with wild forest mushroom filling', price: 12, unit: '/ kg', image: '/images/hero-varenyky.jpg', badge: null, category: 'varenyky', available: true, stock: 10, sort_order: 3 },
  { id: 4, name: 'Varenyky with cheese & cherries', description: 'Sweet varenyky filled with cottage cheese and cherries', price: 13, unit: '/ kg', image: '/images/hero-varenyky.jpg', badge: 'Seasonal', category: 'varenyky', available: true, stock: 10, sort_order: 4 },
  { id: 5, name: 'Varenyky with cheese & spinach', description: 'Savory varenyky with cottage cheese and fresh spinach', price: 13, unit: '/ kg', image: '/images/hero-varenyky.jpg', badge: null, category: 'varenyky', available: true, stock: 10, sort_order: 5 },
  { id: 6, name: 'Syrnyky', description: 'Traditional Ukrainian cheese fritters, golden and fluffy', price: 10, unit: '/ 600g', image: '/images/syrnyky.webp', badge: "Chef's Choice", category: 'syrnyky', available: true, stock: 10, sort_order: 6 },
  { id: 7, name: 'Syrnyky with chocolate', description: 'Decadent syrnyky with rich chocolate chunks', price: 11, unit: '/ 600g', image: '/images/syrnyky.webp', badge: null, category: 'syrnyky', available: true, stock: 10, sort_order: 7 },
  { id: 8, name: 'Syrnyky with blueberries', description: 'Fluffy syrnyky bursting with wild blueberries', price: 11, unit: '/ 600g', image: '/images/syrnyky.webp', badge: null, category: 'syrnyky', available: true, stock: 10, sort_order: 8 },
  { id: 9, name: 'Pelmeni (beef & pork)', description: 'Hearty Ukrainian dumplings with seasoned beef and pork filling', price: 15, unit: '/ kg', image: '/images/pelmeni.webp', badge: 'Bestseller', category: 'pelmeni', available: true, stock: 10, sort_order: 9 },
  { id: 10, name: 'Pelmeni (chicken & turkey)', description: 'Light and tender pelmeni with poultry filling', price: 15, unit: '/ kg', image: '/images/pelmeni.webp', badge: null, category: 'pelmeni', available: true, stock: 10, sort_order: 10 },
]
const emptyProduct = {
  name: '', description: '', price: 0, unit: '/ kg',
  image: '/images/hero-varenyky.jpg', badge: null,
  category: 'varenyky', available: true, stock: 10, sort_order: 0,
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Product> | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchProducts = () => {
    if (!supabase) { setProducts(fallbackProducts); setLoading(false); return }
    supabase.from('products').select('*').order('sort_order').then(({ data, error }) => {
      if (!error && data) setProducts(data as Product[])
      setLoading(false)
    })
  }

  useEffect(() => { fetchProducts() }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return

    // Show local preview via data URL
    const reader = new FileReader()
    reader.onload = (ev) => {
      setEditing(f => ({ ...f, image: ev.target?.result as string || f?.image }))
    }
    reader.readAsDataURL(file)

    // Try uploading to Supabase Storage
    if (supabase) {
      const ext = file.name.split('.').pop()
      const fileName = `product-${Date.now()}.${ext}`
      const { data: uploadData } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: true })
      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(uploadData.path)
        if (urlData) {
          setEditing(f => ({ ...f, image: urlData.publicUrl }))
        }
      }
    }
  }

  const save = async () => {
    if (!editing) return
    if (!editing.name?.trim()) { setError('Name is required'); return }
    if (!editing.price || editing.price <= 0) { setError('Price must be > 0'); return }
    setError('')
    setSaving(true)

    const payload = {
      name: editing.name, description: editing.description, price: editing.price,
      unit: editing.unit, image: editing.image || '/images/hero-varenyky.jpg',
      badge: editing.badge || null, category: editing.category,
      available: editing.available ?? true, stock: editing.stock ?? 10,
    }

    if (!supabase) {
      // Mock save — update local state
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
        await supabase.from('products').update(payload).eq('id', editing.id)
      } else {
        await supabase.from('products').insert({ ...payload, sort_order: products.length })
      }
      setSaving(false)
      setEditing(null)
      fetchProducts()
    } catch {
      setError('Failed to save. Check your connection.')
      setSaving(false)
    }
  }

  const toggleAvailable = async (product: Product) => {
    if (!supabase) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, available: !p.available } : p))
      return
    }
    await supabase.from('products').update({ available: !product.available }).eq('id', product.id)
    fetchProducts()
  }

  const deleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return
    if (!supabase) {
      setProducts(prev => prev.filter(p => p.id !== id))
      return
    }
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
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

      {/* Product list */}
      <div className="space-y-3">
        {products.map(product => (
          <div key={product.id} className={`glass-card rounded-xl p-5 flex items-center gap-5 ${!product.available ? 'opacity-50' : ''}`}>
            <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
              <Image src={img(product.image)} alt={product.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-0.5">
                <h3 className="font-serif text-lg text-foreground">{product.name}</h3>
                {product.badge && (
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-[11px] tracking-[0.15em] rounded">
                    {product.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{product.description}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-primary text-base font-serif">£{product.price}{product.unit}</span>
                <span className="text-sm tracking-[0.15em] text-muted-foreground uppercase">{product.category}</span>
                <span className={`text-sm tracking-[0.1em] ${product.stock === 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {product.stock === 0 ? 'OUT OF STOCK' : `STOCK: ${product.stock}`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleAvailable(product)}
                className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                  product.available
                    ? 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'
                    : 'border-border/50 text-muted-foreground hover:border-foreground/50'
                }`}
                title={product.available ? 'Disable' : 'Enable'}
              >
                {product.available ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setEditing({ ...product })}
                className="w-10 h-10 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors cursor-pointer"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteProduct(product.id)}
                className="w-10 h-10 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:border-red-400/50 transition-colors cursor-pointer"
                title="Delete"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="bg-card border border-border/30 rounded-xl p-6 w-full max-w-lg mx-4 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
                <label className="text-sm tracking-[0.1em] text-muted-foreground block mb-1">Image</label>
                <div className="flex gap-3 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      value={editing.image || ''}
                      onChange={e => setEditing(f => ({ ...f, image: e.target.value }))}
                      className="w-full bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-base text-foreground focus:border-primary outline-none"
                      placeholder="/images/hero-varenyky.jpg"
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
                    <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-border/30">
                      <Image src={img(editing.image)} alt="preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
              <div className="grid grid-cols-2 gap-3">
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
      )}

      {products.length === 0 && !loading && (
        <div className="text-center py-20 glass-card rounded-xl">
          <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No products yet. Add your first product.</p>
        </div>
      )}
    </div>
  )
}
