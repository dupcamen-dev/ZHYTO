"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Minus, Plus, X } from 'lucide-react'
import Image from 'next/image'
import { img as imgPath } from '@/lib/constants'
const img = imgPath
import { ImageCompare } from '@/components/image-compare'
import { useCart } from '@/components/cart-context'
import { useLanguage } from '@/components/language-context'
import { toast } from 'sonner'

interface Product {
  id: number
  name: string
  name_uk?: string | null
  name_en?: string | null
  description: string
  description_uk?: string | null
  description_en?: string | null
  price: number
  unit: string
  image: string
  background_image: string
  badge: string
  category: string
  stock: number
  available: boolean
  ingredients: string
  cooking: string
  ingredients_uk: string
  ingredients_en: string
  recipe_uk: string
  recipe_en: string
}

interface ProductsSectionProps {
  onProductsChange?: (products: Product[]) => void
  setCartOpen: (open: boolean) => void
}

export default function ProductsSection({ onProductsChange, setCartOpen }: ProductsSectionProps) {
  const { t, lang } = useLanguage()
  const { cart, addToCart, removeFromCart, keepOnly } = useCart()
  const [products, setProducts] = useState<Product[] | null>(null)
  const [categoryOrder, setCategoryOrder] = useState<string[] | null>(null)
  const [categoryDescriptions, setCategoryDescriptions] = useState<Record<string, string>>({})
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({})
  const [categoryDescUk, setCategoryDescUk] = useState<Record<string, string>>({})
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        if (!res.ok) return
        const data = await res.json()
        const mapped = (data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          name_uk: p.name_uk,
          name_en: p.name_en,
          description: p.description,
          description_uk: p.description_uk,
          description_en: p.description_en,
          price: Number(p.price),
          unit: p.unit,
          image: img(p.image),
          background_image: p.background_image ? img(p.background_image) : '',
          badge: p.badge,
          category: p.category,
          stock: p.stock ?? 10,
          available: p.available ?? true,
          ingredients: p.ingredients,
          cooking: p.cooking,
          ingredients_uk: p.ingredients_uk,
          ingredients_en: p.ingredients_en,
          recipe_uk: p.recipe_uk,
          recipe_en: p.recipe_en,
        }))
        setProducts(mapped)
        if (mapped.length > 0) keepOnly(mapped.map((p: Product) => p.id))
        onProductsChange?.(mapped)
      } catch {}
    }
    fetchProducts()
  }, [keepOnly, onProductsChange])

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/public-settings')
        if (!res.ok) return
        const data = await res.json()
        if (data.categories) setCategoryOrder(data.categories as string[])
        if (data.categories_desc) setCategoryDescriptions(data.categories_desc as Record<string, string>)
        if (data.categories_names) setCategoryNames(data.categories_names as Record<string, string>)
        if (data.categories_desc_uk) setCategoryDescUk(data.categories_desc_uk as Record<string, string>)
      } catch {}
    }
    fetchSettings()
  }, [])

  const { scrollYProgress } = useScroll()
  const productsParallaxY = useTransform(scrollYProgress, [0, 0.25], [200, 0])

  const activeProducts = (products || []).filter(p => p.available !== false)

  return (
    <>
      <motion.section
        id="products"
        style={{ y: productsParallaxY, contentVisibility: 'auto' } as any}
        className="py-28 lg:py-36 relative z-20 section-orange"
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <p className="text-[46px] tracking-[0.35em] mb-5">
              <span className="relative inline-block font-script text-black">
                {t.products.ourMenu}
                <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-[55%] w-[150%] h-[280%] -z-10">
                  <Image src={img("/images/about-card.webp")} alt="" fill className="object-fill" />
                </div>
              </span>
            </p>

          </motion.div>

          {(categoryOrder || ['varenyky', 'syrnyky', 'pelmeni']).map((key: string, catIndex: number) => {
            const catProducts = activeProducts.filter(p => p.category === key)
            if (catProducts.length === 0) return null
            const label = (lang === 'uk' && categoryNames[key]) || (t.products.categories as any)[key] || key
            const desc = (lang === 'uk' && categoryDescUk[key]) || categoryDescriptions[key] || ''
            return (
              <div key={key} className={catIndex > 0 ? 'mt-16' : ''}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.6 }}
                  className="mb-8"
                >
                  <h3 className="font-serif text-5xl md:text-4xl lg:text-5xl text-foreground mb-2">{label}</h3>
                  <p className="text-base text-muted-foreground">{desc}</p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {catProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false }}
                      transition={{ duration: 0.5 }}
                      className="group flex flex-col relative sm:pt-7"
                    >
                      {product.badge && (
                          <span className="hidden sm:absolute sm:inline top-0 left-0 px-3 py-1 bg-primary text-primary-foreground text-[13px] tracking-[0.2em] uppercase whitespace-nowrap z-10">
                          {product.badge}
                        </span>
                      )}
                      <div className={'aspect-square overflow-hidden flex flex-col w-full' + (product.stock === 0 ? ' opacity-40' : '')}>
                        <div className="relative flex-1 overflow-hidden w-full">
                          <ImageCompare
                            frontImage={product.image}
                            backImage={product.background_image || img("/images/syrnyky-ingredients.webp")}
                            alt={product.name}
                          />
                          {product.badge && (
                            <span className="sm:hidden absolute top-2 right-2 px-2 py-0.5 bg-primary text-primary-foreground text-[11px] tracking-[0.15em] uppercase whitespace-nowrap">
                              {product.badge}
                            </span>
                          )}
                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                              <span className="px-4 py-2 bg-white/90 text-gray-900 text-[14px] tracking-[0.2em]">
                                {t.products.comingBackSoon}
                              </span>
                            </div>
                          )}
                        </div>

                        <button type="button" className="p-4 pt-5 w-full text-left group/btn transition-all duration-300 hover:bg-primary/5" onClick={() => product.stock > 0 && setSelectedProduct(product)}>
                          <h3 className="font-serif text-lg text-gray-900 leading-snug transition-colors duration-300 group-hover/btn:text-primary">{(product as any)[lang === 'uk' ? 'name_uk' : 'name_en'] || product.name}</h3>
                          <p className="text-sm text-gray-500 mt-1 transition-colors duration-300 group-hover/btn:text-primary/80">&pound;{product.price} {product.unit}</p>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </motion.section>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <div className="absolute inset-0 bg-black/40" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white w-full max-w-xl p-8 lg:p-12"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative h-48 lg:h-64 w-full mb-6">
                <ImageCompare
                  frontImage={selectedProduct.image}
                  backImage={selectedProduct.background_image || (selectedProduct.category === 'syrnyky' ? img("/images/syrnyky-ingredients.webp") : img("/images/syrnyky-ingredients.webp"))}
                  alt={selectedProduct.name}
                />
              </div>

              <h3 className="font-serif text-2xl text-gray-900 mb-2">{(selectedProduct as any)[lang === 'uk' ? 'name_uk' : 'name_en'] || selectedProduct.name}</h3>
              <p className="text-gray-600 text-[15px] leading-relaxed mb-4">{(selectedProduct as any)[lang === 'uk' ? 'description_uk' : 'description_en'] || selectedProduct.description}</p>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-primary font-serif text-3xl">&pound;{selectedProduct.price}</span>
                  <span className="text-sm text-gray-500 ml-1">{selectedProduct.unit}</span>
                </div>
              </div>

              {(selectedProduct as any)[lang === 'uk' ? 'ingredients_uk' : 'ingredients_en'] || selectedProduct.ingredients ? (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 tracking-[0.15em] mb-1">{t.productModal.ingredients}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{(selectedProduct as any)[lang === 'uk' ? 'ingredients_uk' : 'ingredients_en'] || selectedProduct.ingredients}</p>
                </div>
              ) : null}

              {(selectedProduct as any)[lang === 'uk' ? 'recipe_uk' : 'recipe_en'] || selectedProduct.cooking ? (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 tracking-[0.15em] mb-1">{t.productModal.cookingInstructions}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{(selectedProduct as any)[lang === 'uk' ? 'recipe_uk' : 'recipe_en'] || selectedProduct.cooking}</p>
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => removeFromCart(selectedProduct.id)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 hover:border-primary hover:text-primary transition-all text-gray-700 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg w-8 text-center font-medium text-gray-900">
                    {(cart[selectedProduct.id]?.qty || 0)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const added = addToCart(selectedProduct.id, selectedProduct.image, selectedProduct.stock)
                      if (added) {
                        toast.success(`${selectedProduct.name} ${t.productModal.addedToCart}`, { duration: 2000 })
                      } else {
                        toast.error(`Sorry, only ${selectedProduct.stock} of "${selectedProduct.name}" available`)
                      }
                    }}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 hover:border-primary hover:text-primary transition-all text-gray-700 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedProduct(null); setCartOpen(true) }}
                  className="text-sm tracking-[0.15em] text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  {t.productModal.viewCart} &rarr;
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
