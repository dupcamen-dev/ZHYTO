"use client"

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { img } from '@/lib/constants'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ShoppingCart, ArrowRight, Minus, Plus, Leaf, Heart, Snowflake, Menu, X, User, LogOut, ArrowUp, HelpCircle, ChevronDown, ArrowDown, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart-context'
import { useAuth } from '@/components/auth-context'
import { supabase } from '@/lib/supabase'
import { CartDrawer } from '@/components/cart-drawer'
import { CheckoutModal } from '@/components/checkout-modal'
import { ImageCompare } from '@/components/image-compare'
import { ImageCarousel } from '@/components/image-carousel'
import { useDeliverySettings } from '@/lib/use-delivery'
import { useLanguage } from '@/components/language-context'
import { toast } from 'sonner'

// Product data
const products = [
  {
    id: 1,
    name: "Pelmeni (beef & pork)",
    description: "Hearty Ukrainian dumplings with seasoned beef and pork filling",
    price: 15,
    unit: "/ kg",
    image: img("/images/syrnyky-new.webp"),
    background_image: '',
    badge: null,
    category: "pelmeni",
    stock: 10,
    ingredients: "Dough: flour, water, eggs, salt. Filling: beef, pork, onion, garlic, salt, black pepper.",
    cooking: "Boil in salted water for 5-7 minutes until they float. Serve with butter, sour cream or your favourite sauce."
  },
  {
    id: 2,
    name: "Pelmeni (chicken & turkey)",
    description: "Light and tender pelmeni with poultry filling",
    price: 15,
    unit: "/ kg",
    image: img("/images/syrnyky-new.webp"),
    background_image: '',
    badge: null,
    category: "pelmeni",
    stock: 10,
    ingredients: "Dough: flour, water, eggs, salt. Filling: chicken, turkey, onion, garlic, salt, black pepper.",
    cooking: "Boil in salted water for 5-7 minutes until they float. Serve with butter, sour cream or your favourite sauce."
  },
  {
    id: 3,
    name: "Varenyky with potato",
    description: "Classic Ukrainian varenyky with creamy mashed potato",
    price: 12,
    unit: "/ kg",
    image: img("/images/syrnyky-new.webp"),
    background_image: '',
    badge: null,
    category: "varenyky",
    stock: 10,
    ingredients: "Dough: flour, water, eggs, salt. Filling: mashed potato, fried onion, butter, salt, black pepper.",
    cooking: "Boil in salted water for 5-7 minutes until they float. Serve with fried onions, sour cream and fresh dill."
  },
  {
    id: 4,
    name: "Varenyky with cabbage",
    description: "Hearty varenyky with savoury braised cabbage",
    price: 12,
    unit: "/ kg",
    image: img("/images/syrnyky-new.webp"),
    background_image: '',
    badge: null,
    category: "varenyky",
    stock: 10,
    ingredients: "Dough: flour, water, eggs, salt. Filling: braised cabbage, carrot, onion, tomato paste, salt, black pepper.",
    cooking: "Boil in salted water for 5-7 minutes until they float. Serve with sour cream and fresh herbs."
  },
  {
    id: 5,
    name: "Varenyky with mushroom",
    description: "Rich varenyky with wild forest mushroom filling",
    price: 12,
    unit: "/ kg",
    image: img("/images/syrnyky-new.webp"),
    background_image: '',
    badge: null,
    category: "varenyky",
    stock: 10,
    ingredients: "Dough: flour, water, eggs, salt. Filling: wild mushrooms, onion, butter, salt, black pepper.",
    cooking: "Boil in salted water for 5-7 minutes until they float. Serve with sour cream and fresh dill."
  },
  {
    id: 6,
    name: "Varenyky with cheese & cherries",
    description: "Sweet varenyky filled with cottage cheese and cherries",
    price: 13,
    unit: "/ kg",
    image: img("/images/syrnyky-new.webp"),
    background_image: '',
    badge: null,
    category: "varenyky",
    stock: 10,
    ingredients: "Dough: flour, water, eggs, salt. Filling: cottage cheese, cherries, sugar, vanilla extract.",
    cooking: "Boil in salted water for 5-7 minutes until they float. Serve with sour cream, honey or a dusting of icing sugar."
  },
  {
    id: 7,
    name: "Varenyky with cheese & spinach",
    description: "Savory varenyky with cottage cheese and fresh spinach",
    price: 13,
    unit: "/ kg",
    image: img("/images/syrnyky-new.webp"),
    background_image: '',
    badge: null,
    category: "varenyky",
    stock: 10,
    ingredients: "Dough: flour, water, eggs, salt. Filling: cottage cheese, spinach, garlic, salt, black pepper.",
    cooking: "Boil in salted water for 5-7 minutes until they float. Serve with sour cream and fresh herbs."
  },
  {
    id: 8,
    name: "Syrnyky",
    description: "Traditional Ukrainian cheese fritters, golden and fluffy",
    price: 10,
    unit: "/ 600g",
    image: img("/images/syrnyky-new.webp"),
    background_image: '',
    badge: null,
    category: "syrnyky",
    stock: 10,
    ingredients: "Cottage cheese, eggs, flour, sugar, vanilla extract, salt. Served with sour cream.",
    cooking: "Fry in butter over medium heat for 3-4 minutes per side until golden brown. Serve warm with sour cream, jam or honey."
  },
  {
    id: 9,
    name: "Syrnyky with chocolate",
    description: "Decadent syrnyky with rich chocolate chunks",
    price: 11,
    unit: "/ 600g",
    image: img("/images/syrnyky-new.webp"),
    background_image: '',
    badge: null,
    category: "syrnyky",
    stock: 10,
    ingredients: "Cottage cheese, eggs, flour, sugar, vanilla extract, dark chocolate chunks, salt.",
    cooking: "Fry in butter over medium heat for 3-4 minutes per side until golden brown. Serve warm with sour cream or a drizzle of melted chocolate."
  },
  {
    id: 10,
    name: "Syrnyky with blueberries",
    description: "Fluffy syrnyky bursting with wild blueberries",
    price: 11,
    unit: "/ 600g",
    image: img("/images/syrnyky-new.webp"),
    background_image: '',
    badge: null,
    category: "syrnyky",
    stock: 10,
    ingredients: "Cottage cheese, eggs, flour, sugar, vanilla extract, wild blueberries, salt.",
    cooking: "Fry in butter over medium heat for 3-4 minutes per side until golden brown. Serve warm with sour cream or honey."
  },
]

export default function Home() {
  const router = useRouter()
  const { t, lang, toggleLang } = useLanguage()

  const navLinks = [
    { name: t.nav.ourMenu, href: "#products" },
    { name: t.nav.aboutUs, href: "#about" },
    { name: t.nav.delivery, href: "#delivery" },
    { name: t.nav.reviews, href: "#reviews" },
    { name: t.nav.faq, href: "#faq" },
    { name: t.nav.contact, href: "#contact" },
  ]
  const translatedProducts = useMemo(() => 
    products.map((p, i) => ({
      ...p,
      name: t.products.productList[i]?.name || p.name,
      description: t.products.productList[i]?.desc || p.description,
      unit: p.unit === '/ 600g' ? t.products.item : t.products.per,
    })),
  [lang])
  const { cart, addToCart, removeFromCart, totalItems } = useCart()
  const { user, loading, signOut, signInWithGoogle, signInWithApple } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [dbProducts, setDbProducts] = useState<typeof products | null>(null)
  const [reviews, setReviews] = useState<{ id: number; user_name: string; rating: number; comment: string; created_at: string }[]>([])
  const [reviewFormOpen, setReviewFormOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [signInModalOpen, setSignInModalOpen] = useState(false)
  const [aboutImageIndex, setAboutImageIndex] = useState(0)
  const aboutNames = ["Illia", "Victor", "Nataliia", "Anna", "Kateryna", "Iryna"]
  const { scrollYProgress } = useScroll()
  const { settings: delivery } = useDeliverySettings()
  const aboutRef = useRef<HTMLElement>(null)
  const { scrollYProgress: aboutScroll } = useScroll({
    target: aboutRef,
    offset: ["start end", "end start"]
  })
  const aboutImageY = useTransform(aboutScroll, [0, 1], ["-20%", "20%"])

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
          background_image: p.background_image ? img(p.background_image) : '',
          badge: p.badge,
          category: p.category,
          stock: p.stock ?? 10,
          ingredients: p.ingredients,
          cooking: p.cooking,
        })))
      }
    })
  }, [])

  useEffect(() => {
    if (!supabase) return
    supabase.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setReviews(data)
    })
  }, [])

  const submitReview = async () => {
    if (!user) {
      toast.error(t.reviews.pleaseSignIn)
      return
    }
    if (!reviewComment.trim()) {
      toast.error(t.reviews.pleaseWriteComment)
      return
    }
    setReviewSubmitting(true)
    const { error } = await supabase!.from('reviews').insert({
      user_id: user.id,
      user_name: user.user_metadata?.full_name || user.email || 'Anonymous',
      rating: reviewRating,
      comment: reviewComment.trim(),
    })
    setReviewSubmitting(false)
    if (error) {
      toast.error(t.reviews.failedSubmit)
    } else {
      toast.success(t.reviews.reviewSubmitted)
      setReviewComment('')
      setReviewRating(5)
      setReviewFormOpen(false)
      const { data } = await supabase!.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false })
      if (data) setReviews(data)
    }
  }

  const activeProducts = dbProducts || translatedProducts
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])
  const productsParallaxY = useTransform(scrollYProgress, [0, 0.25], [200, 0])

  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showScrollBottom, setShowScrollBottom] = useState(true)
  const [isOnProducts, setIsOnProducts] = useState(false)
  const [headerMode, setHeaderMode] = useState<'tall' | 'normal' | 'hidden'>('normal')
  const headerModeRef = useRef(headerMode)
  headerModeRef.current = headerMode
  const prevScrollY = useRef(0)
  const productsTopRef = useRef(0)
  const aboutTopRef = useRef(0)

  useEffect(() => {
    const el = document.getElementById('products')
    if (el) productsTopRef.current = el.offsetTop
    const aboutEl = document.getElementById('about')
    if (aboutEl) aboutTopRef.current = aboutEl.offsetTop
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      const maxY = document.documentElement.scrollHeight - window.innerHeight
      const atTop = y < 50
      const atBottom = y > maxY - 100
      const goingDown = y > prevScrollY.current
      const isMobile = window.innerWidth < 1024

      setShowScrollTop(y > 300)
      setShowScrollBottom(y < maxY - 100)
      if (isMobile && aboutTopRef.current > 0) {
        setIsOnProducts(y >= productsTopRef.current - 100 && y < aboutTopRef.current - 100)
      } else {
        setIsOnProducts(false)
      }

      if (atTop) {
        setHeaderMode(window.innerWidth >= 1024 ? 'tall' : 'normal')
      } else if (!goingDown) {
        setHeaderMode('normal')
      } else if (atBottom) {
        setHeaderMode('normal')
      } else if (goingDown && y >= productsTopRef.current - 100) {
        setHeaderMode('hidden')
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
        className="fixed top-0 left-0 right-0 z-50 overflow-visible"
        style={{ backgroundColor: '#c2a57b' }}
        initial={{ y: -80 }}
        animate={{ y: headerMode === 'hidden' ? -300 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <div className={`max-w-7xl mx-auto transition-all duration-[400ms] ease-in-out ${headerMode === 'tall' ? 'px-8 lg:px-14' : 'px-5 lg:px-10'}`} style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <motion.div
            className="flex items-center justify-between"
            animate={{ height: headerMode === 'tall' ? '12rem' : '9rem' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {/* Cart - Mobile Left */}
            <div className="lg:hidden flex items-center">
              <motion.button
                onClick={() => setCartOpen(true)}
                aria-label={t.header.openCart}
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
            </div>

            {/* Logo */}
            <motion.a
              href="#"
              className={`flex items-center transition-all duration-[400ms] ease-in-out ${headerMode === 'tall' ? 'lg:-ml-14' : 'lg:-ml-10'} absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0`}
              whileHover={{ scale: 1.06, rotate: -0.5 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            >
              <Image
                src={img("/images/logo-header.webp")}
                alt="zhyto.london"
                width={520}
                height={130}
                className="h-16 sm:h-[90px] lg:h-[130px] w-auto max-w-[220px] sm:max-w-none"
                priority
              />
            </motion.a>

            {/* Nav Links - Desktop */}
            <div className="hidden lg:flex items-center gap-7 xl:gap-8">
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' }) }}
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

            {/* Cart (desktop), Auth & Mobile Toggle */}
            <div className="flex items-center gap-4 lg:ml-8">
              {/* Cart - Desktop */}
              <motion.button
                onClick={() => setCartOpen(true)}
                aria-label={t.header.openCart}
                className="hidden lg:flex relative w-11 h-11 rounded-full border-2 border-foreground/20 items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300"
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

              {/* User button */}
              {!loading && (
                user ? (
                  <div className="flex items-center gap-3">
                      <motion.button
                        onClick={() => router.push('/account')}
                        className="hidden sm:flex w-9 h-9 rounded-full border-2 border-foreground/20 items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                        title={t.header.myAccount}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <User className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => router.push('/admin')}
                        className="hidden sm:flex w-9 h-9 rounded-full border-2 border-foreground/20 items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-[13px] tracking-[0.1em] font-medium cursor-pointer"
                        title={t.header.admin}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        A
                      </motion.button>
                    <motion.button
                      onClick={signOut}
                      className="hidden sm:flex w-9 h-9 rounded-full border-2 border-foreground/20 items-center justify-center hover:border-destructive hover:text-destructive hover:bg-destructive/5 transition-all cursor-pointer"
                      title={t.header.signOut}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    onClick={() => setSignInModalOpen(true)}
                    className="hidden sm:inline-flex items-center gap-2 text-[13px] tracking-[0.12em] text-foreground hover:text-primary transition-colors border-2 border-primary/20 rounded-full px-5 py-2 hover:border-primary/50 cursor-pointer bg-primary/5"
                    whileHover={{ scale: 1.05, borderColor: '#0058d280' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <User className="w-4 h-4" />
                    {t.header.signIn}
                  </motion.button>
                )
              )}
              {/* Language Toggle - desktop only */}
              <button
                onClick={toggleLang}
                className="hidden lg:flex w-10 h-10 rounded-full border-2 border-foreground/20 items-center justify-center text-[13px] tracking-[0.12em] font-medium text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                aria-label={lang === 'en' ? 'Switch to Ukrainian' : 'Переключити на англійську'}
              >
                {t.header.lang}
              </button>
              {/* Mobile Menu Toggle */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? t.header.closeMenu : t.header.openMenu}
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
        className="relative min-h-[120dvh] flex flex-col items-center justify-center overflow-hidden bg-background"
      >
        <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-10 text-center pt-20 sm:pt-24 lg:pt-36">

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-serif font-light leading-[1.1] mb-10 relative tracking-[0.05em]"
          >
            <span className="text-white block tracking-[0.2em] font-konstrukt">{t.hero.dumplings}</span>
            <span className="font-script text-foreground text-[0.6em] uppercase relative inline-block tracking-[0.15em]">
              {t.hero.withSoul}
              <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-[46%] w-[500%] h-[500%] -z-10">
                <Image
                  src={img("/images/hero-soul-bg.png")}
                  alt=""
                  fill
                  className="object-contain rotate-[5deg]"
                  priority
                />
              </div>
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-20 h-px bg-primary/60 mb-8 mx-auto"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl sm:text-2xl md:text-3xl text-[#f5ead6] leading-[1.8] mb-12 max-w-2xl mx-auto"
          >
            {t.hero.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <a
              href="#products"
              className="group inline-flex items-center gap-5 bg-[#c2a57b] text-white text-2xl sm:text-3xl lg:text-4xl tracking-[0.35em] hover:bg-[#b08f64] transition-all duration-300 px-10 py-5 sm:px-14 sm:py-6"
            >
              <span className="pb-1">{t.hero.orderNow}</span>
              <ArrowRight className="w-7 h-7 sm:w-9 sm:h-9" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="mt-20"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-white/60"
            >
              <ChevronDown className="w-5 h-5 mx-auto" />
              <span className="text-[10px] tracking-[0.3em] block mt-1">{t.hero.scroll}</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Products Section */}
      <motion.section 
        id="products" 
        className="py-28 lg:py-36 relative z-20 section-orange"
        style={{ y: productsParallaxY }}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <p className="text-[14px] tracking-[0.35em] text-foreground mb-5">{t.products.ourMenu}</p>
            <h2 className="text-5xl md:text-6xl font-serif font-light">
              <span className="font-script text-[1.15em] text-primary uppercase">{t.products.crafted}</span>{" "}
              <span className="text-black">{t.products.withTradition}</span>
            </h2>
          </motion.div>

          {/* Product categories */}
          {[
            { key: 'varenyky', label: t.products.categories.varenyky, desc: t.products.categories.varenykyDesc },
            { key: 'syrnyky', label: t.products.categories.syrnyky, desc: t.products.categories.syrnykyDesc },
            { key: 'pelmeni', label: t.products.categories.pelmeni, desc: t.products.categories.pelmeniDesc },
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
                        <div className="relative flex-1 overflow-hidden w-full">
                          <ImageCompare
                            frontImage={product.image}
                            backImage={product.background_image || img("/images/syrnyky-ingredients.webp")}
                            alt={product.name}
                          />
                          {product.badge && (
                            <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-[13px] tracking-[0.2em] uppercase">
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
                          <h3 className="font-serif text-lg text-gray-900 leading-snug transition-colors duration-300 group-hover/btn:text-primary">{product.name}</h3>
                          <p className="text-sm text-gray-500 mt-1 transition-colors duration-300 group-hover/btn:text-primary/80">£{product.price} {product.unit}</p>
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

      {/* About Section */}
      <section id="about" ref={aboutRef} className="py-28 lg:py-36 relative bg-background">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-1"
            >
              <p className="text-[13px] tracking-[0.35em] text-primary mb-5">{t.about.ourStory}</p>
              <h2 className="text-4xl md:text-5xl font-serif font-light mb-10">
                <span className="text-foreground">{t.about.tasteOf}</span>
                <br />
                <span className="font-script text-primary text-[1.15em]">{t.about.home}</span>
              </h2>
              
              <div className="w-10 h-px bg-primary/60 mb-10" />
              
              <p className="text-muted-foreground leading-[1.9] mb-6 text-xl">
                {t.about.para1}
              </p>
              
              <p className="text-muted-foreground leading-[1.9] mb-10 text-xl">
                {t.about.para2}
              </p>
              
              <a 
                href="#contact" 
                className="inline-flex items-center gap-4 text-primary text-[15px] tracking-[0.25em] hover:gap-6 transition-all duration-300"
              >
                <span className="border-b border-primary/60 pb-1">{t.about.getInTouch}</span>
                <ArrowRight className="w-4 h-4 opacity-80" />
              </a>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="relative order-2 lg:order-2"
            >
              <div className="relative min-h-[500px] lg:min-h-[800px] overflow-hidden">
                <motion.div
                  className="absolute inset-0"
                  style={{ y: aboutImageY }}
                >
                  <div className="relative w-full h-full">
                    <ImageCarousel
                      images={[
                        { src: img("/images/about-us.webp"), alt: "Handmade varenyky process" },
                        { src: img("/images/about-us-2.webp"), alt: "Handmade varenyky process" },
                        { src: img("/images/about-us-3.webp"), alt: "Handmade varenyky process" },
                      ]}
                      onChange={setAboutImageIndex}
                    />
                  </div>
                </motion.div>
              </div>
              <div className="absolute -bottom-8 -left-8 lg:-bottom-12 lg:-left-12 w-56 h-56 lg:w-72 lg:h-72 overflow-hidden">
                <Image
                  src={img("/images/about-card.webp")}
                  alt=""
                  fill
                  className="object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl lg:text-4xl font-script leading-none text-black">{aboutNames[aboutImageIndex]}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Delivery Section */}
      <section id="delivery" className="py-28 lg:py-36 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <div className="sm:px-12 py-16 relative">
                <h3 className="font-script text-5xl mb-6 lg:text-left text-center text-black relative z-10 inline-block uppercase lg:ml-8">
                  {t.delivery.heading}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%] w-[500px] aspect-[661/252] -z-10">
                    <img
                      src={img("/images/delivery-art.webp")}
                      alt=""
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  </div>
                </h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm mt-24 lg:mt-32 max-w-[500px] mx-auto lg:mx-0 lg:ml-8">
                  <span className="text-foreground font-medium">{t.delivery.sameDay}</span>
                  <span className="text-foreground text-right">{t.delivery.zones1to3}</span>
                  <span className="text-foreground font-medium">{t.delivery.nextDay}</span>
                  <span className="text-foreground text-right">{t.delivery.allLondon}</span>
                  <span className="text-foreground font-medium">{t.delivery.minOrder}</span>
                  <span className="text-foreground text-right">£{delivery.min_order}</span>
                  <span className="text-foreground font-medium">{t.delivery.freeDelivery}</span>
                  <span className="text-foreground text-right">{t.delivery.ordersOver} £{delivery.free_threshold}</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2 px-5 lg:px-0"
            >
              <h2 className="text-4xl md:text-5xl font-serif font-light mb-10">
                <span className="font-script text-primary text-[1.15em]">{t.delivery.fresh}</span>{" "}
                <span className="text-foreground">{t.delivery.toYourDoor}</span>
              </h2>
              <div className="w-10 h-px bg-primary/60 mb-10" />
              <p className="text-muted-foreground leading-[1.9] mb-6 text-xl">
                {t.delivery.para1}
              </p>
              <p className="text-muted-foreground leading-[1.9] text-xl">
                {t.delivery.para2}
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
            <p className="text-[14px] tracking-[0.35em] text-primary mb-5">{t.faq.heading}</p>
            <h2 className="text-5xl md:text-6xl font-serif font-light">
              <span className="font-script text-primary text-[1.15em]">{t.faq.got}</span>{" "}
              <span className="text-black">{t.faq.questions}</span>
            </h2>
            <div className="flex items-center justify-center gap-3 mt-8">
              <span className="w-12 h-px bg-primary/30" />
              <HelpCircle className="w-5 h-5 text-primary/60" />
              <span className="w-12 h-px bg-primary/30" />
            </div>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {t.faq.items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className={`w-full glass-card rounded-none px-6 py-5 text-left flex items-center justify-between gap-4 transition-all cursor-pointer ${
                    openFaq === index
                      ? 'border-l-4 border-primary bg-white shadow-md'
                      : 'border-l-4 border-transparent bg-white hover:bg-primary/[0.02] hover:shadow-md hover:border-primary/20'
                  }`}
                >
                  <span className="font-serif text-[19px] text-black">{item.q}</span>
                  {openFaq === index ? (
                    <Minus className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <Plus className="w-4 h-4 text-primary shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, y: -8 }}
                      animate={{ height: 'auto', opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-4 text-black text-[17px] leading-relaxed bg-primary/5 border-l-4 border-primary">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground text-base">
              {t.faq.stillQuestions}{" "}
              <a
                href="#contact"
                className="text-primary hover:text-primary/80 transition-colors border-b border-primary/30 hover:border-primary/60 pb-0.5"
              >
                {t.faq.getInTouch}
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-28 lg:py-36 relative section-orange overflow-hidden">

        <div className="max-w-7xl mx-auto sm:px-5 lg:px-10">
          <div className="max-w-5xl mx-auto py-8 px-0 sm:p-16 md:p-20 lg:p-24 text-center relative overflow-hidden max-sm:max-w-full"
          >
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-[16px] tracking-[0.35em] text-primary mb-6">{t.contact.getInTouch}</p>
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-serif font-light mb-6 sm:mb-10">
                <span className="text-primary">{t.contact.readyTo}</span>{" "}
                <span 
                  className="font-script text-[1.15em] inline-block bg-no-repeat px-16 py-8 order-bg"
                  style={{
                    backgroundImage: `url(${img("/images/contact-photo.png")})`,
                    backgroundSize: '115%',
                    color: '#1a1613',
                  }}
                >{t.contact.order}</span>
              </h2>
              <p className="text-muted-foreground leading-[1.9] mb-8 sm:mb-14 text-base sm:text-lg">
                {t.contact.contactDesc}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-14">
                <a href="#products">
                  <Button 
                    size="lg" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-7 tracking-[0.2em] text-[15px] rounded-none shadow-xl"
                  >
                    {t.contact.orderNow}
                  </Button>
                </a>
                <a 
                  href="mailto:hello@zhyto.london"
                  className="text-[16px] tracking-[0.2em] text-foreground/60 hover:text-primary transition-colors border-b border-foreground/20 hover:border-primary pb-1"
                >
                  HELLO@ZHYTO.LONDON
                </a>
              </div>
              
            </motion.div>
          </div>
          <div className="flex items-center justify-center gap-10 mt-12">
            <a href="https://www.instagram.com/zhyto.london/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors text-[14px] tracking-[0.2em]">
              {t.contact.instagram}
            </a>
            <span className="text-muted-foreground/30">|</span>
            <a href="https://wa.me/440000000000" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors text-[14px] tracking-[0.2em]">
              {t.contact.whatsapp}
            </a>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-28 lg:py-36 relative bg-black overflow-hidden">
        
        {/* Floating varenyky */}
        <motion.img
          src={img("/images/varenyk-bg.png")}
          alt=""
          className="absolute z-0 pointer-events-none"
          style={{ width: '160px', top: '5%', left: '-80px' }}
          initial={{ x: -200, opacity: 0, rotate: -20 }}
          whileInView={{ x: 0, opacity: 1, rotate: -10 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <motion.img
          src={img("/images/varenyk-bg.png")}
          alt=""
          className="absolute z-0 pointer-events-none"
          style={{ width: '220px', bottom: '10%', right: '-100px' }}
          initial={{ x: 200, opacity: 0, rotate: 25 }}
          whileInView={{ x: 0, opacity: 1, rotate: 15 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
        <motion.img
          src={img("/images/varenyk-bg.png")}
          alt=""
          className="absolute z-0 pointer-events-none"
          style={{ width: '130px', top: '40%', left: '-60px' }}
          initial={{ x: -250, opacity: 0, rotate: 30 }}
          whileInView={{ x: 0, opacity: 1, rotate: 5 }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.6 }}
        />

        <div className="max-w-7xl mx-auto px-5 lg:px-10 relative z-1">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-[13px] tracking-[0.35em] text-cream mb-5">{t.reviews.testimonials}</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light">
              <span className="font-script text-cream text-[1.15em]">{t.reviews.whatOur}</span>{" "}
              <span className="text-cream">{t.reviews.customersSay}</span>
            </h2>
          </motion.div>

          {/* Reviews Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-cream/20'}`}
                    />
                  ))}
                </div>
                <p className="text-cream/70 leading-relaxed mb-6 text-[15px]">{review.comment}</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cream/10 flex items-center justify-center">
                    <span className="text-cream text-sm font-medium">{review.user_name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-cream text-sm font-medium">{review.user_name}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Write Review */}
          <div className="text-center">
            {user ? (
              reviewFormOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-lg mx-auto backdrop-blur-sm bg-white/10 p-8 shadow-lg"
                >
                  <h3 className="font-serif text-xl mb-6 text-cream">{t.reviews.leaveReview}</h3>
                  <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={t.reviews.shareExperience}
                    className="w-full h-32 p-4 border border-cream/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cream/50 text-cream bg-black/50 placeholder:text-cream/30 mb-6"
                  />
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={submitReview}
                      disabled={reviewSubmitting || !reviewComment.trim()}
                      className="bg-black/60 text-cream hover:bg-black/80 px-8"
                    >
                      {reviewSubmitting ? t.reviews.submitting : t.reviews.submitReview}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setReviewFormOpen(false); setReviewComment(''); setReviewRating(5); }}
                      className="px-8 border-cream/30 text-cream hover:bg-cream/10"
                    >
                      {t.reviews.cancel}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <Button
                  onClick={() => setReviewFormOpen(true)}
                  variant="outline"
                  className="px-10 py-6 text-[14px] tracking-[0.15em] border-cream/30 text-cream hover:bg-cream/10"
                >
                  {t.reviews.writeAReview}
                </Button>
              )
            ) : (
              <div className="text-cream/70">
                <p className="mb-4">{t.reviews.signInToShare}</p>
                <button
                  onClick={() => setSignInModalOpen(true)}
                  className="text-cream hover:underline text-[14px] tracking-[0.15em] cursor-pointer"
                >
                  {t.reviews.signIn}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-28 bg-black">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="text-2xl md:text-4xl font-serif tracking-[0.15em] text-cream">
              zhyto.london
            </div>
            
            <div className="flex flex-col items-center md:items-center gap-2">
              <p className="text-sm md:text-base xl:text-lg text-cream tracking-[0.15em]">
                {t.footer.rights}
              </p>
              <p className="text-xs md:text-sm xl:text-base text-cream tracking-[0.1em]">
                {t.footer.designedBy}{' '}
                <a
                  href="https://millionpixels.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream hover:text-white transition-colors"
                >
                  Million Pixels
                </a>
              </p>
            </div>
            
            <div className="flex items-center gap-6 md:gap-10">
              <Link href="/privacy" className="text-sm md:text-base text-cream hover:text-white transition-colors tracking-[0.15em]">
                {t.footer.privacy}
              </Link>
              <Link href="/terms" className="text-sm md:text-base text-cream hover:text-white transition-colors tracking-[0.15em]">
                {t.footer.terms}
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-xl"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ clipPath: 'circle(0% at 50% 50%)' }}
              animate={{ clipPath: 'circle(140% at 50% 50%)' }}
              exit={{ clipPath: 'circle(0% at 50% 50%)' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-50 flex flex-col items-center justify-start pt-40 gap-10 h-full overflow-y-auto pb-10"
            >
               {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => { setMobileMenuOpen(false); document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' }) }}
                  className="text-lg tracking-[0.25em] text-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </motion.a>
              ))}
              {!loading && (
                user ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: 0.15 + navLinks.length * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg tracking-[0.25em] text-primary hover:text-primary/80 transition-colors"
                      >
                        {t.mobileMenu.myAccount}
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: 0.15 + (navLinks.length + 1) * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg tracking-[0.25em] text-primary hover:text-primary/80 transition-colors"
                      >
                        {t.mobileMenu.admin}
                      </Link>
                    </motion.div>
                    <motion.button
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: 0.15 + (navLinks.length + 2) * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => { signOut(); setMobileMenuOpen(false) }}
                      className="text-lg tracking-[0.25em] text-destructive/60 hover:text-destructive transition-colors"
                    >
                      {t.mobileMenu.signOut}
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.15 + navLinks.length * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => { setMobileMenuOpen(false); setSignInModalOpen(true) }}
                    className="text-lg tracking-[0.25em] text-primary hover:text-primary/80 transition-colors"
                  >
                    {t.mobileMenu.signIn}
                  </motion.button>
                )
              )}
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.15 + (navLinks.length + 3) * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onClick={toggleLang}
                className="text-lg tracking-[0.25em] text-foreground/60 hover:text-primary transition-colors"
              >
                {lang === 'en' ? 'UA' : 'EN'}
              </motion.button>
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

              <h3 className="font-serif text-2xl text-gray-900 mb-2">{selectedProduct.name}</h3>
              <p className="text-gray-600 text-[15px] leading-relaxed mb-4">{selectedProduct.description}</p>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-primary font-serif text-3xl">£{selectedProduct.price}</span>
                  <span className="text-sm text-gray-500 ml-1">{selectedProduct.unit}</span>
                </div>
              </div>

              {selectedProduct.ingredients && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 tracking-[0.15em] mb-1">{t.productModal.ingredients}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedProduct.ingredients}</p>
                </div>
              )}

              {selectedProduct.cooking && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 tracking-[0.15em] mb-1">{t.productModal.cookingInstructions}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedProduct.cooking}</p>
                </div>
              )}

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
                    {cart[selectedProduct.id] || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => { addToCart(selectedProduct.id); toast.success(`${selectedProduct.name} ${t.productModal.addedToCart}`, { duration: 2000 }) }}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 hover:border-primary hover:text-primary transition-all text-gray-700 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="text-sm tracking-[0.15em] text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  {t.productModal.viewCart} →
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

      {/* Sign In Modal */}
      <AnimatePresence>
        {signInModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSignInModalOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-card w-full max-w-sm p-10 shadow-2xl"
            >
              <button
                onClick={() => setSignInModalOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-serif text-2xl text-center mb-3 text-foreground">{t.signInModal.welcomeBack}</h3>
              <p className="text-muted-foreground text-center text-sm mb-8">{t.signInModal.signInToAccount}</p>
              <div className="space-y-4">
                <button
                  onClick={signInWithGoogle}
                  className="w-full flex items-center justify-center gap-3 py-3 px-6 border-2 border-border hover:border-primary hover:bg-primary/5 transition-all rounded-lg cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-foreground font-medium">{t.signInModal.continueGoogle}</span>
                </button>
                <button
                  onClick={signInWithApple}
                  className="w-full flex items-center justify-center gap-3 py-3 px-6 border-2 border-border hover:border-foreground hover:bg-foreground/5 transition-all rounded-lg cursor-pointer"
                >
                  <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className="text-foreground font-medium">{t.signInModal.continueApple}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && !mobileMenuOpen && !cartOpen && !checkoutOpen && !selectedProduct && !isOnProducts && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
            className="fixed bottom-[200px] lg:bottom-28 right-6 lg:right-8 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Scroll to Bottom */}
      <AnimatePresence>
        {showScrollBottom && !mobileMenuOpen && !cartOpen && !checkoutOpen && !selectedProduct && !isOnProducts && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
            aria-label="Scroll to bottom"
            className="fixed bottom-20 lg:bottom-8 right-6 lg:right-8 z-50 w-12 h-12 rounded-full bg-black text-cream flex items-center justify-center shadow-lg hover:bg-black/80 transition-colors"
          >
            <ArrowDown className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  )
}
