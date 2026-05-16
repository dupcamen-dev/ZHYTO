"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('zhyto-cookie-consent')
    if (!accepted) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('zhyto-cookie-consent', 'true')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6"
        >
          <div className="max-w-7xl mx-auto glass-strong rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xl">
            <div className="flex-1 text-[14px] text-foreground/80 leading-relaxed">
              We use cookies to improve your experience. By continuing, you agree to our{' '}
              <a href="/privacy" className="text-primary hover:text-primary/80 underline underline-offset-2">Privacy Policy</a>.
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={accept}
                className="px-6 py-2.5 bg-primary text-primary-foreground text-[12px] tracking-[0.2em] hover:bg-primary/90 transition-colors rounded-lg gold-glow cursor-pointer"
              >
                ACCEPT
              </button>
              <button
                onClick={accept}
                className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center hover:border-primary hover:text-primary transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
