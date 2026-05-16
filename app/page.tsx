"use client"

import { useState, useEffect } from 'react'
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

// Product data
const products = [
  {
    id: 1,
    name: "Pelmeni (beef & pork)",
    description: "Hearty Ukrainian dumplings with seasoned beef and pork filling",
    price: 15,
    unit: "/ kg",
    image: img("/images/pelmeni.webp"),
    badge: "Bestseller",
    category: "pelmeni",
    stock: 10
  },
  {
    id: 2,
    name: "Pelmeni (chicken & turkey)",
    description: "Light and tender pelmeni with poultry filling",
    price: 15,
    unit: "/ kg",
    image: img("/images/pelmeni.webp"),
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
    image: img("/images/hero-varenyky.jpg"),
    badge: "Traditional",
    category: "varenyky",
    stock: 10
  },
  {
    id: 4,
    name: "Varenyky with cabbage",
    description: "Hearty varenyky with savoury braised cabbage",
    price: 12,
    unit: "/ kg",
    image: img("/images/hero-varenyky.jpg"),
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
    image: img("/images/hero-varenyky.jpg"),
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
    image: img("/images/hero-varenyky.jpg"),
    badge: "Seasonal",
    category: "varenyky",
    stock: 10
  },
  {
    id: 7,
    name: "Varenyky with cheese & spinach",
    description: "Savory varenyky with cottage cheese and fresh spinach",
    price: 13,
    unit: "/ kg",
    image: img("/images/hero-varenyky.jpg"),
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
    image: img("/images/syrnyky.webp"),
    badge: "Chef's Choice",
    category: "syrnyky",
    stock: 10
  },
  {
    id: 9,
    name: "Syrnyky with chocolate",
    description: "Decadent syrnyky with rich chocolate chunks",
    price: 11,
    unit: "/ 600g",
    image: img("/images/syrnyky.webp"),
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
    image: img("/images/syrnyky.webp"),
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
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [dbProducts, setDbProducts] = useState<typeof products | null>(null)
  const { scrollYProgress } = useScroll()

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
  const hero3dScale = useTransform(heroScale, [1, 0.95], [1, 1 / 0.95])
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 150)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 glass-nav"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#" className="text-2xl font-serif tracking-[0.15em] text-foreground">
              zhyto.london
            </a>

            {/* Nav Links - Desktop */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-[13px] tracking-[0.2em] text-foreground/80 hover:text-primary transition-colors duration-300"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Cart, Auth & Mobile Toggle */}
            <div className="flex items-center gap-4">
              {/* User button */}
              {!loading && (
                user ? (
                  <div className="flex items-center gap-3">
                      <Link
                        href="/account"
                        className="hidden sm:flex w-8 h-8 rounded-full border border-border/50 items-center justify-center hover:border-primary hover:text-primary transition-all"
                        title="My Account"
                      >
                        <User className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href="/admin"
                        className="hidden sm:flex w-8 h-8 rounded-full border border-border/50 items-center justify-center hover:border-primary hover:text-primary transition-all text-[10px] tracking-[0.1em] font-medium"
                        title="Admin"
                      >
                        A
                    </Link>
                    <button
                      onClick={signOut}
                      className="hidden sm:flex w-8 h-8 rounded-full border border-border/50 items-center justify-center hover:border-destructive hover:text-destructive transition-all"
                      title="Sign out"
                    >
                      <LogOut className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setCheckoutOpen(true)}
                    className="hidden sm:inline-flex items-center gap-2 text-[12px] tracking-[0.15em] text-foreground/70 hover:text-primary transition-colors border border-border/50 rounded-full px-4 py-1.5 hover:border-primary/50 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    SIGN IN
                  </button>
                )
              )}
              <button
                onClick={() => setCartOpen(true)}
                aria-label="Open cart"
                className="relative w-10 h-10 rounded-full border border-border/50 flex items-center justify-center hover:border-primary hover:text-primary transition-all duration-300"
              >
                <ShoppingCart className="w-4 h-4" />
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                className="lg:hidden w-10 h-10 rounded-full border border-border/50 flex items-center justify-center hover:border-primary hover:text-primary transition-all duration-300"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
        </nav>

      {/* Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-[100dvh] flex items-center"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 grayscale brightness-[0.6] contrast-[1.1]">
            <Image
              src={img("/images/hero-bg.jpg")}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        </div>

        {/* Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-20 sm:pt-24 pb-16">
          <div className="flex flex-col lg:flex-row items-center lg:items-center justify-start gap-8 lg:gap-12">
            <div className="w-full lg:w-auto max-w-lg xl:max-w-xl">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-[12px] tracking-[0.35em] text-primary mb-5"
              >
                AUTHENTIC. HANDMADE. TIMELESS.
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-light leading-[1.05] mb-6"
              >
                <span className="text-foreground block">Dumplings</span>
                <span className="font-script text-primary text-[1.1em]">with soul</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="w-12 h-px bg-primary/60 mb-6"
              />

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-base md:text-lg text-foreground/80 leading-[1.8] mb-8 max-w-md"
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
                  className="group inline-flex items-center gap-4 text-primary text-[13px] tracking-[0.25em] hover:gap-6 transition-all duration-300"
                >
                  <span className="border-b border-primary/60 pb-1">ORDER NOW</span>
                  <ArrowRight className="w-4 h-4 opacity-80" />
                </a>
              </motion.div>
            </div>

            {/* 3D Model — desktop only */}
            <motion.div
              style={{ scale: hero3dScale }}
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
                <p className="text-[10px] tracking-[0.2em] text-muted-foreground">NATURAL</p>
                <p className="text-[11px] tracking-[0.15em] text-foreground">INGREDIENTS</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] text-muted-foreground">HANDMADE</p>
                <p className="text-[11px] tracking-[0.15em] text-foreground">WITH CARE</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center">
                <Snowflake className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] text-muted-foreground">FROZEN</p>
                <p className="text-[11px] tracking-[0.15em] text-foreground">FOR FRESHNESS</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Products Section */}
      <section id="products" className="py-28 lg:py-36 relative section-light">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <p className="text-[13px] tracking-[0.35em] text-foreground mb-5">OUR MENU</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light">
              <span className="font-script text-primary text-[1.15em]">Crafted</span>{" "}
              <span className="text-foreground">with tradition</span>
            </h2>
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
                  <h3 className="font-serif text-2xl text-foreground mb-1">{category.label}</h3>
                  <p className="text-[13px] text-muted-foreground">{category.desc}</p>
                </motion.div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {catProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false }}
                      transition={{ duration: 0.5 }}
                      className="group flex"
                    >
                      <div className={`card-dark rounded-lg overflow-hidden flex flex-col w-full ${product.stock === 0 ? 'opacity-40' : ''}`}>
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          {product.badge && (
                            <span className="absolute top-4 left-4 px-3 py-1.5 bg-primary text-primary-foreground text-[10px] tracking-[0.2em] uppercase">
                              {product.badge}
                            </span>
                          )}
                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                              <span className="px-4 py-2 bg-background/80 text-foreground text-[11px] tracking-[0.2em] rounded-lg">
                                COMING BACK SOON
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="font-serif text-lg mb-2 text-foreground">{product.name}</h3>
                          <p className="text-[14px] text-muted-foreground mb-5 leading-relaxed flex-1">{product.description}</p>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <div>
                              <span className="text-primary font-serif text-xl">£{product.price}</span>
                              <span className="text-[11px] text-muted-foreground ml-1">{product.unit}</span>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-3">
                                {cart[product.id] ? (
                                  <button 
                                    onClick={() => removeFromCart(product.id)}
                                    aria-label={`Decrease quantity of ${product.name}`}
                                    className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center hover:border-primary hover:text-primary transition-all"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                ) : (
                                  <span className="w-8 h-8 flex items-center justify-center text-muted-foreground/30">
                                    <Minus className="w-3 h-3" />
                                  </span>
                                )}
                                <span className={`text-sm w-5 text-center font-medium ${cart[product.id] ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {cart[product.id] || 0}
                                </span>
                                <button 
                                  onClick={() => { addToCart(product.id); toast.success(`${product.name} added to cart`, { duration: 2000 }) }}
                                  aria-label={`Increase quantity of ${product.name}`}
                                  disabled={product.stock === 0}
                                  className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              {cart[product.id] ? (
                                <button 
                                  onClick={() => setCartOpen(true)}
                                  className="text-[11px] tracking-[0.15em] text-primary hover:text-primary/80 transition-colors border-b border-primary/60 pb-0.5"
                                >
                                  VIEW CART →
                                </button>
                              ) : null}
                            </div>
                          </div>
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
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
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
              
              <p className="text-muted-foreground leading-[1.9] mb-6 text-[16px]">
                Every dumpling we create carries generations of tradition. Using recipes passed down through my family, I bring authentic Ukrainian flavours to London, one handcrafted piece at a time.
              </p>
              
              <p className="text-muted-foreground leading-[1.9] mb-10 text-[16px]">
                Each batch is made with locally sourced ingredients and the same love my grandmother put into every meal. No shortcuts, no compromises — just pure, honest food.
              </p>
              
              <a 
                href="#contact" 
                className="inline-flex items-center gap-4 text-primary text-[12px] tracking-[0.25em] hover:gap-6 transition-all duration-300"
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
              <div className="relative h-[520px] rounded-lg overflow-hidden">
                <Image
                  src={img("/images/about-us.webp")}
                  alt="Handmade varenyky process"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 glass-strong p-8 rounded-lg">
                <p className="text-4xl font-script text-primary mb-1">15+</p>
                <p className="text-[11px] tracking-[0.2em] text-muted-foreground">YEARS OF TRADITION</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ingredients Section */}
      <section id="ingredients" className="py-28 lg:py-36 relative section-light overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
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
                <div className="rounded-2xl overflow-hidden bg-card shadow-xl aspect-square">
                  <div className="w-full h-full flex items-center justify-center p-6">
                    <div className="w-full h-full relative -rotate-90">
                      <Image
                        src={img("/images/ingredients.jpg")}
                        alt="Natural ingredients"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 glass-strong px-5 py-3 rounded-xl shadow-lg">
                  <p className="text-2xl font-script text-primary">100%</p>
                  <p className="text-[9px] tracking-[0.2em] text-muted-foreground">NATURAL</p>
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
                    className="group glass-card rounded-xl p-6 cursor-pointer transition-all duration-500 hover:scale-[1.04] hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <WheatIcon className="w-10 h-10 text-primary mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
                    <h3 className="font-serif text-[17px] mb-2 text-foreground">{item.title}</h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Delivery Section */}
      <section id="delivery" className="py-28 lg:py-36 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <div className="glass-card p-10 rounded-lg">
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
                    <span className="text-primary">£25</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Free Delivery</span>
                    <span className="text-primary">Orders over £50</span>
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
              <p className="text-muted-foreground leading-[1.9] mb-6 text-[16px]">
                Our dumplings are flash-frozen to preserve freshness and delivered in insulated packaging. Simply cook from frozen in 5-7 minutes.
              </p>
              <p className="text-muted-foreground leading-[1.9] text-[16px]">
                We deliver across London, bringing the taste of authentic Ukrainian cuisine directly to your kitchen.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-28 lg:py-36 relative overflow-hidden section-light">
        {/* Background image with subtle cream tint */}
        <div className="absolute inset-0">
          <Image
            src={img("/images/fornofone.png")}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0" style={{ background: 'oklch(0.95 0.02 85 / 0.35)' }} />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(circle at 50% 50%, transparent 50%, oklch(0.95 0.02 85 / 0.5) 100%)'
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-[13px] tracking-[0.35em] text-primary mb-5">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light">
              <span className="font-script text-primary text-[1.15em]">Got</span>{" "}
              <span className="text-foreground">questions?</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-3">
            {[
              { q: "How to cook?", a: "Cook pelmeni and varenyky from frozen in boiling salted water for 5–7 minutes. For syrnyky, fry in butter over medium heat for 3–4 minutes per side until golden." },
              { q: "How to store?", a: "Keep frozen. Our products stay fresh for up to 3 months in the freezer. Once thawed, do not refreeze. Always cook directly from frozen." },
              { q: "Delivery zones?", a: "We deliver across all London zones. Same-day delivery available for Zones 1–3. Next-day delivery for all London and select surrounding areas." },
              { q: "What is the minimum order?", a: "Minimum order is £25. Delivery is £5 for orders between £25–£49, and completely free for orders over £50." },
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
                  className="w-full glass-card rounded-lg px-6 py-5 text-left flex items-center justify-between gap-4 hover:border-primary/30 transition-all cursor-pointer bg-white/70"
                >
                  <span className="font-serif text-[17px] text-foreground">{item.q}</span>
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
                      <div className="px-6 py-4 text-foreground/70 text-[15px] leading-relaxed bg-white/60 rounded-b-lg">
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

        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto glass-card rounded-2xl p-12 md:p-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-[13px] tracking-[0.35em] text-primary mb-5">GET IN TOUCH</p>
              <h2 className="text-4xl md:text-5xl font-serif font-light mb-8">
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
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 tracking-[0.2em] text-[11px] rounded-none gold-glow"
                  >
                    ORDER NOW
                  </Button>
                </a>
                <a 
                  href="mailto:hello@zhyto.london"
                  className="text-[12px] tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors border-b border-border/50 hover:border-primary pb-1"
                >
                  HELLO@ZHYTO.LONDON
                </a>
              </div>
              
              <div className="flex items-center justify-center gap-8 pt-6 border-t border-border/20">
                <a href="https://www.instagram.com/zhyto.london/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-[11px] tracking-[0.2em]">
                  INSTAGRAM
                </a>
                <span className="text-border/40">|</span>
                <a href="https://wa.me/440000000000" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-[11px] tracking-[0.2em]">
                  WHATSAPP
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-14 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-2xl font-serif tracking-[0.15em]">
              zhyto.london
            </div>
            
            <div className="flex flex-col items-center md:items-center gap-1">
              <p className="text-[12px] text-foreground/70 tracking-[0.15em]">
                © 2026 zhyto.london. ALL RIGHTS RESERVED.
              </p>
              <p className="text-[11px] text-muted-foreground/50 tracking-[0.1em]">
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
              <Link href="/privacy" className="text-[11px] text-muted-foreground hover:text-primary transition-colors tracking-[0.15em]">
                PRIVACY
              </Link>
              <Link href="/terms" className="text-[11px] text-muted-foreground hover:text-primary transition-colors tracking-[0.15em]">
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
