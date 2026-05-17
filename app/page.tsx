"use client"

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { img } from '@/lib/constants'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ShoppingCart, ArrowRight, Minus, Plus, Leaf, Heart, Snowflake, Menu, X, ChevronDown, User, LogOut, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart-context'
import { useAuth } from '@/components/auth-context'
import { supabase } from '@/lib/supabase'
import { CartDrawer } from '@/components/cart-drawer'
import { CheckoutModal } from '@/components/checkout-modal'
import { Hero3D } from '@/components/hero-3d'
import { useDeliverySettings } from '@/lib/use-delivery'
import { toast } from 'sonner'

// Wheat icon for badge
function WheatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="currentColor">
      <circle cx="30" cy="12" r="4" />
      <ellipse cx="30" cy="8" rx="2" ry="6" />
      <path d="M30 16 L30 55" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M30 20 Q24 24 18 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M30 20 Q36 24 42 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M30 28 Q22 34 14 28" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M30 28 Q38 34 46 28" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M30 36 Q20 44 10 36" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M30 36 Q40 44 50 36" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

// Pastel brushstroke divider
function PastelDivider({ className }: { className?: string }) {
  return (
    <div className={`flex justify-center ${className || ''}`}>
      <svg width="180" height="32" viewBox="0 0 180 32" fill="none" className="opacity-40">
        <path d="M10 16 Q30 4 60 14 Q90 26 120 12 Q150 2 170 16"
          stroke="#0749f7" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.3" />
        <path d="M15 20 Q35 8 65 18 Q95 30 125 16 Q155 6 175 20"
          stroke="#c19e74" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.25" />
        <path d="M5 12 Q25 0 55 10 Q85 22 115 8 Q145 -2 165 12"
          stroke="#c19e74" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.15" />
      </svg>
    </div>
  )
}

// Product data
const products = [
  {
    id: 1,
    name: "Pelmeni (beef & pork)",
    description: "Hearty Ukrainian dumplings with seasoned beef and pork filling",
    price: 15,
    unit: "/ kg",
    image: img("/images/pelmeni-removebg-preview.png"),
    badge: null,
    category: "pelmeni",
    stock: 10
  },
  {
    id: 2,
    name: "Pelmeni (chicken & turkey)",
    description: "Light and tender pelmeni with poultry filling",
    price: 15,
    unit: "/ kg",
    image: img("/images/pelmeni-removebg-preview.png"),
    badge: null,
    category: "pelmeni",
    stock: 10
  },
  {
    id: 3,
    name: "Varenyky with potato",
    description: "Classic Ukrainian varenyky with creamy mashed potato",
    price: 12,
    unit: "/ kg",
    image: img("/images/varenyky-new.png"),
    badge: null,
    category: "varenyky",
    stock: 10
  },
  {
    id: 4,
    name: "Varenyky with cabbage",
    description: "Hearty varenyky with savoury braised cabbage",
    price: 12,
    unit: "/ kg",
    image: img("/images/varenyky-new.png"),
    badge: null,
    category: "varenyky",
    stock: 10
  },
  {
    id: 5,
    name: "Varenyky with mushroom",
    description: "Rich varenyky with wild forest mushroom filling",
    price: 12,
    unit: "/ kg",
    image: img("/images/varenyky-new.png"),
    badge: null,
    category: "varenyky",
    stock: 10
  },
  {
    id: 6,
    name: "Varenyky with cheese & cherries",
    description: "Sweet varenyky filled with cottage cheese and cherries",
    price: 13,
    unit: "/ kg",
    image: img("/images/varenyky-new.png"),
    badge: null,
    category: "varenyky",
    stock: 10
  },
  {
    id: 7,
    name: "Varenyky with cheese & spinach",
    description: "Savory varenyky with cottage cheese and fresh spinach",
    price: 13,
    unit: "/ kg",
    image: img("/images/varenyky-new.png"),
    badge: null,
    category: "varenyky",
    stock: 10
  },
  {
    id: 8,
    name: "Syrnyky",
    description: "Traditional Ukrainian cheese fritters, golden and fluffy",
    price: 10,
    unit: "/ 600g",
    image: img("/images/syrnyky-new.png"),
    badge: null,
    category: "syrnyky",
    stock: 10
  },
  {
    id: 9,
    name: "Syrnyky with chocolate",
    description: "Decadent syrnyky with rich chocolate chunks",
    price: 11,
    unit: "/ 600g",
    image: img("/images/syrnyky-new.png"),
    badge: null,
    category: "syrnyky",
    stock: 10
  },
  {
    id: 10,
    name: "Syrnyky with blueberries",
    description: "Fluffy syrnyky bursting with wild blueberries",
    price: 11,
    unit: "/ 600g",
    image: img("/images/syrnyky-new.png"),
    badge: null,
    category: "syrnyky",
    stock: 10
  },
]

// Navigation links
const navLinks = [
  { name: "DUMPLINGS", href: "#products" },
  { name: "ABOUT US", href: "#about" },
  { name: "INGREDIENTS", href: "#ingredients" },
  { name: "DELIVERY", href: "#delivery" },
  { name: "FAQ", href: "#faq" },
  { name: "CONTACT", href: "#contact" },
]

export default function Home() {
  const { cart, addToCart, removeFromCart, totalItems } = useCart()
  const { user, loading, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [dbProducts, setDbProducts] = useState<typeof products | null>(null)
  const { scrollYProgress } = useScroll()
  const { settings: delivery } = useDeliverySettings()

  useEffect(() => {
    if (!supabase) return
    supabase.from('products').select('*').order('sort_order').then(({ data, error }) => {
      if (!error && data && data.length > 0) {
        setDbProducts(data.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          unit: p.unit,
          image: img(p.image),
          badge: p.badge,
          category: p.category,
          stock: p.stock ?? 10,
        })))
      }
    })
  }, [])

  const activeProducts = dbProducts || products
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  const [showScrollTop, setShowScrollTop] = useState(false)
  const [headerMode, setHeaderMode] = useState<'tall' | 'normal' | 'hidden'>('tall')
  const headerModeRef = useRef(headerMode)
  headerModeRef.current = headerMode
  const prevScrollY = useRef(0)
  const productsTopRef = useRef(0)

  useEffect(() => {
    const el = document.getElementById('products')
    if (el) productsTopRef.current = el.offsetTop
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      const maxY = document.documentElement.scrollHeight - window.innerHeight
      const atTop = y < 50
      const atBottom = y > maxY - 100
      const goingDown = y > prevScrollY.current

      setShowScrollTop(y > 150)

      if (atTop) {
        setHeaderMode('tall')
      } else if (atBottom) {
        setHeaderMode('normal')
      } else if (goingDown && y >= productsTopRef.current - 100) {
        setHeaderMode('hidden')
      } else if (goingDown) {
        setHeaderMode('normal')
      } else {
        setHeaderMode('normal')
      }

      prevScrollY.current = y
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 overflow-hidden"
        style={{ backgroundColor: '#c19e74' }}
        initial={{ y: -80 }}
        animate={{ y: headerMode === 'hidden' ? -300 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <div className={`max-w-7xl mx-auto transition-all duration-[400ms] ease-in-out ${headerMode === 'tall' ? 'px-8 lg:px-14' : 'px-5 lg:px-10'}`} style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <motion.div
            className="flex items-center justify-between"
            animate={{ height: headerMode === 'tall' ? '14rem' : '7rem' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {/* Logo */}
            <motion.a
              href="#"
              className={`flex items-center transition-all duration-[400ms] ease-in-out ${headerMode === 'tall' ? '-ml-10 sm:-ml-14' : '-ml-7 sm:-ml-10'}`}
              whileHover={{ scale: 1.06, rotate: -0.5 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            >
              <Image
                src={img("/images/logo-header.png")}
                alt="zhyto.london"
                width={360}
                height={90}
                className="h-[72px] sm:h-[90px] w-auto transition-all duration-[400ms] ease-in-out"
                priority
              />
            </motion.a>

            {/* Nav Links - Desktop */}
            <div className="hidden lg:flex items-center gap-12 xl:gap-14">
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="relative text-[13px] tracking-[0.15em] text-foreground/80 hover:text-primary transition-colors duration-300 font-medium"
                  whileHover={{ y: -1 }}
                >
                  {link.name}
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary rounded-full"
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileHover={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </div>

            {/* Cart, Auth & Mobile Toggle */}
            <div className="flex items-center gap-4">
              {/* User button */}
              {!loading && (
                user ? (
                  <div className="flex items-center gap-3">
                      <motion.a
                        href="/account"
                        className="hidden sm:flex w-9 h-9 rounded-full border-2 border-foreground/20 items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                        title="My Account"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <User className="w-4 h-4" />
                      </motion.a>
                      <motion.a
                        href="/admin"
                        className="hidden sm:flex w-9 h-9 rounded-full border-2 border-foreground/20 items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-[13px] tracking-[0.1em] font-medium"
                        title="Admin"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        A
                    </motion.a>
                    <motion.button
                      onClick={signOut}
                      className="hidden sm:flex w-9 h-9 rounded-full border-2 border-foreground/20 items-center justify-center hover:border-destructive hover:text-destructive hover:bg-destructive/5 transition-all cursor-pointer"
                      title="Sign out"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    onClick={() => setCheckoutOpen(true)}
                    className="hidden sm:inline-flex items-center gap-2 text-[13px] tracking-[0.12em] text-foreground hover:text-primary transition-colors border-2 border-primary/20 rounded-full px-5 py-2 hover:border-primary/50 cursor-pointer bg-primary/5"
                    whileHover={{ scale: 1.05, borderColor: '#0749f780' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <User className="w-4 h-4" />
                    SIGN IN
                  </motion.button>
                )
              )}
              <motion.button
                onClick={() => setCartOpen(true)}
                aria-label="Open cart"
                className="relative w-11 h-11 rounded-full border-2 border-foreground/20 flex items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shadow-lg"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </motion.button>
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                className="lg:hidden w-11 h-11 rounded-full border-2 border-foreground/20 flex items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ rotate: 90, scale: 0.95 }}
              >
                {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
              </motion.button>
            </div>
          </motion.div>
        </div>
        </motion.nav>

      {/* Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity }}
        className="relative min-h-[120dvh] flex items-center overflow-hidden"
      >
        {/* Background photo */}
        <div className="absolute left-0 right-0 bottom-0 z-0" style={{ top: '14rem' }}>
          <Image
            src={img("/images/hero-bg.jpg")}
            alt=""
            fill
            className="object-contain"
            priority
          />
        </div>
        {/* Pastel brushstroke decoration behind heading */}
        <div className="absolute left-6 lg:left-12 top-1/3 -translate-y-1/2 pointer-events-none opacity-25 hidden lg:block">
          <svg width="500" height="300" viewBox="0 0 500 300" fill="none">
            <ellipse cx="200" cy="150" rx="280" ry="120" fill="#0749f7" opacity="0.06" />
            <path d="M50 160 Q150 80 250 150 Q350 220 450 140" stroke="#c19e74" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.3" />
            <path d="M30 140 Q130 60 230 130 Q330 200 430 120" stroke="#0749f7" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.15" />
          </svg>
        </div>

        {/* Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-5 lg:px-10 pt-36 sm:pt-48 pb-32">
          <div className="flex flex-col lg:flex-row items-center lg:items-center justify-start gap-8 lg:gap-12">
            <div className="w-full lg:w-auto max-w-lg xl:max-w-xl bg-background p-8 lg:p-12">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-[14px] tracking-[0.35em] text-black mb-5">
                AUTHENTIC. HANDMADE. TIMELESS.
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-light leading-[1.05] mb-6"
                >
                  <span className="text-foreground block">Dumplings</span>
                  <span className="font-script text-primary text-[1em]">with soul</span>
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="w-14 h-px bg-primary/60 mb-6"
                />

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="text-lg md:text-xl text-foreground/80 leading-[1.8] mb-8 max-w-md"
                >
                  We create premium dumplings using natural ingredients and traditional recipes. Taste the heritage in every bite.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                >
                  <a 
                    href="#products" 
                    className="group inline-flex items-center gap-4 text-primary text-[16px] tracking-[0.25em] hover:gap-6 transition-all duration-300"
                  >
                    <span className="border-b border-primary/60 pb-1">ORDER NOW</span>
                    <ArrowRight className="w-4 h-4 opacity-80" />
                  </a>
                </motion.div>
            </div>

            {/* 3D Model — desktop only */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="hidden lg:flex items-center justify-center shrink-0"
            >
              <Hero3D />
            </motion.div>
          </div>

          {/* Feature badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-wrap items-center gap-6 md:gap-10 mt-12"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[13px] tracking-[0.2em] text-muted-foreground">NATURAL</p>
                <p className="text-[14px] tracking-[0.15em] text-foreground">INGREDIENTS</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[13px] tracking-[0.2em] text-muted-foreground">HANDMADE</p>
                <p className="text-[14px] tracking-[0.15em] text-foreground">WITH CARE</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center">
                <Snowflake className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[13px] tracking-[0.2em] text-muted-foreground">FROZEN</p>
                <p className="text-[14px] tracking-[0.15em] text-foreground">FOR FRESHNESS</p>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Divider at bottom of hero so bg extends to meet products */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center" style={{ transform: 'translateY(50%)' }}>
          <PastelDivider />
        </div>
      </motion.section>

      {/* Products Section */}
      <section id="products" className="py-28 lg:py-36 relative section-orange">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <p className="text-[14px] tracking-[0.35em] text-foreground mb-5">OUR MENU</p>
            <div className="bg-primary px-6 py-3 inline-block">
              <h2 className="text-5xl md:text-6xl font-serif font-light text-transparent" style={{ background: '#ff5f01', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
                <span className="font-script text-[1.15em]">Crafted</span>{" "}
                <span>with tradition</span>
              </h2>
            </div>
          </motion.div>

          {/* Product categories */}
          {[
            { key: 'varenyky', label: 'Varenyky', desc: 'Classic Ukrainian dumplings' },
            { key: 'syrnyky', label: 'Syrnyky', desc: 'Golden cheese fritters' },
            { key: 'pelmeni', label: 'Pelmeni', desc: 'Traditional meat-filled dumplings' },
          ].map((category, catIndex) => {
            const catProducts = activeProducts.filter(p => p.category === category.key)
            if (catProducts.length === 0) return null
            return (
              <div key={category.key} className={catIndex > 0 ? 'mt-16' : ''}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.6 }}
                  className="mb-8"
                >
                  <h3 className="font-serif text-5xl text-foreground mb-2">{category.label}</h3>
                  <p className="text-base text-muted-foreground">{category.desc}</p>
                </motion.div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {catProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false }}
                      transition={{ duration: 0.5 }}
                      className="group flex"
                    >
                      <div className={'aspect-square overflow-hidden flex flex-col w-full' + (product.stock === 0 ? ' opacity-40' : '')}>
                        <button onClick={() => product.stock > 0 && setSelectedProduct(product)} className="relative flex-1 overflow-hidden w-full text-left cursor-pointer">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
                          />
                          {product.badge && (
                            <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-[13px] tracking-[0.2em] uppercase">
                              {product.badge}
                            </span>
                          )}
                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                              <span className="px-4 py-2 bg-white/90 text-gray-900 text-[14px] tracking-[0.2em]">
                                COMING BACK SOON
                              </span>
                            </div>
                          )}
                        </button>

                        <div className="p-4">
                          <h3 className="font-serif text-lg text-gray-900 leading-snug">{product.name}</h3>

                      </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-28 lg:py-36 relative bg-background">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-[13px] tracking-[0.35em] text-primary mb-5">OUR STORY</p>
              <h2 className="text-4xl md:text-5xl font-serif font-light mb-10">
                <span className="text-foreground">A taste of</span>
                <br />
                <span className="font-script text-primary text-[1.15em]">home</span>
              </h2>
              
              <div className="w-10 h-px bg-primary/60 mb-10" />
              
              <p className="text-muted-foreground leading-[1.9] mb-6 text-xl">
                Every dumpling we create carries generations of tradition. Using recipes passed down through my family, I bring authentic Ukrainian flavours to London, one handcrafted piece at a time.
              </p>
              
              <p className="text-muted-foreground leading-[1.9] mb-10 text-xl">
                Each batch is made with locally sourced ingredients and the same love my grandmother put into every meal. No shortcuts, no compromises — just pure, honest food.
              </p>
              
              <a 
                href="#contact" 
                className="inline-flex items-center gap-4 text-primary text-[15px] tracking-[0.25em] hover:gap-6 transition-all duration-300"
              >
                <span className="border-b border-primary/60 pb-1">GET IN TOUCH</span>
                <ArrowRight className="w-4 h-4 opacity-80" />
              </a>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative h-[520px] overflow-hidden">
                <Image
                  src={img("/images/about-us.webp")}
                  alt="Handmade varenyky process"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
            className="object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 sm:w-60 sm:h-60 overflow-hidden">
                <Image
                  src={img("/images/about-card.png")}
                  alt=""
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
                  <span className="text-5xl sm:text-[3.5rem] font-bold leading-none mb-2 drop-shadow-lg">15+</span>
                  <span className="text-xs sm:text-sm tracking-[0.3em] drop-shadow-lg">YEARS OF TRADITION</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <PastelDivider className="py-6 -mb-10" />

      {/* Ingredients Section */}
      <section id="ingredients" className="py-28 lg:py-36 relative section-orange overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <p className="text-[13px] tracking-[0.35em] text-primary mb-5">QUALITY FIRST</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light">
              <span className="font-script text-primary text-[1.15em]">Natural</span>{" "}
              <span className="text-foreground">ingredients only</span>
            </h2>
          </motion.div>

          {/* Content */}
          <div className="grid lg:grid-cols-5 gap-16 items-center">
            {/* Image - takes 2/5 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-2 relative"
            >
              <div className="relative">
                <div className="overflow-hidden aspect-square">
                  <div className="w-full h-full flex items-center justify-center p-6">
                    <div className="w-full h-full relative -rotate-90">
                      <Image
                        src={img("/images/ingredients-new.png")}
                        alt="Natural ingredients"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Text + Features - takes 3/5 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="w-12 h-px bg-primary/60 mb-8" />
              <p className="text-muted-foreground leading-[1.9] text-[18px] mb-10">
                We source the finest local ingredients. No preservatives, no artificial additives — just wholesome, natural food the way it should be.
              </p>

              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { title: "Organic Flour", desc: "Stone-ground from heritage wheat varieties" },
                  { title: "Premium Dairy", desc: "Rich cottage cheese & fresh cream" },
                  { title: "Fresh Produce", desc: "Seasonal vegetables and fruits" },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="group p-6 cursor-pointer transition-all duration-500 hover:scale-[1.04] hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 border border-transparent"
                  >
                    <WheatIcon className="w-10 h-10 text-primary mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
                    <h3 className="font-serif text-[17px] mb-2 text-foreground">{item.title}</h3>
                    <p className="text-[16px] text-muted-foreground leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Delivery Section */}
      <section id="delivery" className="py-28 lg:py-36 bg-background">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <div className="relative overflow-hidden p-10 border border-white/20">
                <div className="absolute inset-0 -z-10">
                  <Image
                    src={img("/images/about-card.png")}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-serif text-2xl mb-8 text-foreground">Delivery Information</h3>
                <div className="space-y-5 text-[15px]">
                  <div className="flex justify-between border-b border-border/30 pb-5">
                    <span className="text-muted-foreground">Same Day Delivery</span>
                    <span className="text-primary">London Zones 1-3</span>
                  </div>
                  <div className="flex justify-between border-b border-border/30 pb-5">
                    <span className="text-muted-foreground">Next Day Delivery</span>
                    <span className="text-primary">All London</span>
                  </div>
                  <div className="flex justify-between border-b border-border/30 pb-5">
                    <span className="text-muted-foreground">Minimum Order</span>
                    <span className="text-primary">£{delivery.min_order}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Free Delivery</span>
                    <span className="text-primary">Orders over £{delivery.free_threshold}</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <p className="text-[13px] tracking-[0.35em] text-primary mb-5">DELIVERY</p>
              <h2 className="text-4xl md:text-5xl font-serif font-light mb-10">
                <span className="font-script text-primary text-[1.15em]">Fresh</span>{" "}
                <span className="text-foreground">to your door</span>
              </h2>
              <div className="w-10 h-px bg-primary/60 mb-10" />
              <p className="text-muted-foreground leading-[1.9] mb-6 text-xl">
                Our dumplings are flash-frozen to preserve freshness and delivered in insulated packaging. Simply cook from frozen in 5-7 minutes.
              </p>
              <p className="text-muted-foreground leading-[1.9] text-xl">
                We deliver across London, bringing the taste of authentic Ukrainian cuisine directly to your kitchen.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-28 lg:py-36 relative section-orange">
        <div className="max-w-7xl mx-auto px-5 lg:px-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-[14px] tracking-[0.35em] text-primary mb-5">FAQ</p>
            <h2 className="text-5xl md:text-6xl font-serif font-light">
              <span className="font-script text-primary text-[1.15em]">Got</span>{" "}
              <span className="text-black">questions?</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-3">
            {[
              { q: "How to cook?", a: "Cook pelmeni and varenyky from frozen in boiling salted water for 5–7 minutes. For syrnyky, fry in butter over medium heat for 3–4 minutes per side until golden." },
              { q: "How to store?", a: "Keep frozen. Our products stay fresh for up to 3 months in the freezer. Once thawed, do not refreeze. Always cook directly from frozen." },
              { q: "Delivery zones?", a: "We deliver across all London zones. Same-day delivery available for Zones 1–3. Next-day delivery for all London and select surrounding areas." },
              { q: "How do I order?", a: "Browse our menu, add items to your cart, checkout with your delivery details, and we'll confirm your order via email or phone." },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full glass-card rounded-none px-6 py-5 text-left flex items-center justify-between gap-4 hover:border-primary/30 transition-all cursor-pointer bg-white"
                >
                  <span className="font-serif text-[19px] text-black">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-primary shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-4 text-black text-xl leading-relaxed bg-white">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-28 lg:py-36 relative bg-background overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full border border-primary/10 -z-10" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full border border-primary/10 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-primary/5 -z-10" />

        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="max-w-2xl mx-auto p-12 md:p-16 text-center relative overflow-hidden border border-white/20">
            <div className="absolute inset-0 -z-10">
              <Image
                src={img("/images/about-card.png")}
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-[14px] tracking-[0.35em] text-primary mb-5">GET IN TOUCH</p>
              <h2 className="text-5xl md:text-6xl font-serif font-light mb-8">
                <span className="text-foreground">Ready to</span>{" "}
                <span className="font-script text-primary text-[1.15em]">order?</span>
              </h2>
              <p className="text-muted-foreground leading-[1.9] mb-12 text-[16px]">
                Contact us for orders, catering inquiries, or just to say hello.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
                <a href="#products">
                  <Button 
                    size="lg" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 tracking-[0.2em] text-[14px] rounded-none gold-glow"
                  >
                    ORDER NOW
                  </Button>
                </a>
                <a 
                  href="mailto:hello@zhyto.london"
                  className="text-[15px] tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors border-b border-border/50 hover:border-primary pb-1"
                >
                  HELLO@ZHYTO.LONDON
                </a>
              </div>
              
              <div className="flex items-center justify-center gap-8 pt-6 border-t border-border/20">
                <a href="https://www.instagram.com/zhyto.london/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-[14px] tracking-[0.2em]">
                  INSTAGRAM
                </a>
                <span className="text-border/40">|</span>
                <a href="https://wa.me/440000000000" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-[14px] tracking-[0.2em]">
                  WHATSAPP
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-14 bg-background">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-2xl font-serif tracking-[0.15em]">
              zhyto.london
            </div>
            
            <div className="flex flex-col items-center md:items-center gap-1">
              <p className="text-[15px] text-foreground/70 tracking-[0.15em]">
                © 2026 zhyto.london. ALL RIGHTS RESERVED.
              </p>
              <p className="text-[14px] text-muted-foreground/50 tracking-[0.1em]">
                Designed &amp; Built by{' '}
                <a
                  href="https://millionpixels.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground/50 hover:text-primary transition-colors"
                >
                  Million Pixels
                </a>
              </p>
            </div>
            
            <div className="flex items-center gap-8">
              <Link href="/privacy" className="text-[14px] text-muted-foreground hover:text-primary transition-colors tracking-[0.15em]">
                PRIVACY
              </Link>
              <Link href="/terms" className="text-[14px] text-muted-foreground hover:text-primary transition-colors tracking-[0.15em]">
                TERMS
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" onClick={() => setMobileMenuOpen(false)} />
            <motion.nav
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="relative z-50 flex flex-col items-center justify-center h-full gap-10"
            >
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg tracking-[0.25em] text-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </motion.a>
              ))}
              {!loading && (
                user ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: navLinks.length * 0.1 }}
                    >
                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg tracking-[0.25em] text-primary hover:text-primary/80 transition-colors"
                      >
                        MY ACCOUNT
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (navLinks.length + 1) * 0.1 }}
                    >
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg tracking-[0.25em] text-primary hover:text-primary/80 transition-colors"
                      >
                        ADMIN
                      </Link>
                    </motion.div>
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (navLinks.length + 2) * 0.1 }}
                      onClick={() => { signOut(); setMobileMenuOpen(false) }}
                      className="text-lg tracking-[0.25em] text-destructive/60 hover:text-destructive transition-colors"
                    >
                      SIGN OUT
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: navLinks.length * 0.1 }}
                    onClick={() => { setMobileMenuOpen(false); setCheckoutOpen(true) }}
                    className="text-lg tracking-[0.25em] text-primary hover:text-primary/80 transition-colors"
                  >
                    SIGN IN
                  </motion.button>
                )
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="relative bg-white w-full max-w-md p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative h-48 w-full mb-6">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  className="object-contain"
                />
              </div>

              <h3 className="font-serif text-2xl text-gray-900 mb-2">{selectedProduct.name}</h3>
              <p className="text-gray-600 text-[15px] leading-relaxed mb-4">{selectedProduct.description}</p>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-primary font-serif text-3xl">£{selectedProduct.price}</span>
                  <span className="text-sm text-gray-500 ml-1">{selectedProduct.unit}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => removeFromCart(selectedProduct.id)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 hover:border-primary hover:text-primary transition-all text-gray-700 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg w-8 text-center font-medium text-gray-900">
                    {cart[selectedProduct.id] || 0}
                  </span>
                  <button
                    onClick={() => { addToCart(selectedProduct.id); toast.success(`${selectedProduct.name} added to cart`, { duration: 2000 }) }}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 hover:border-primary hover:text-primary transition-all text-gray-700 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setCartOpen(true)}
                  className="text-sm tracking-[0.15em] text-primary hover:text-primary/80 transition-colors"
                >
                  VIEW CART →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        products={activeProducts}
        onCheckout={() => setCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        products={activeProducts}
      />
      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
            className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors gold-glow"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  )
}
