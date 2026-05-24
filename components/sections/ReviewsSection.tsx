"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-context'
import { useLanguage } from '@/components/language-context'
import { img } from '@/lib/constants'
import { toast } from 'sonner'

interface ReviewsSectionProps {
  setSignInModalOpen: (open: boolean) => void
  progressRef: React.RefObject<number | null>
}

export default function ReviewsSection({ setSignInModalOpen, progressRef }: ReviewsSectionProps) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const reviewsRef = useRef<HTMLElement>(null)
  const [reviews, setReviews] = useState<{ id: number; user_id: string; user_name: string; rating: number; comment: string; created_at: string }[]>([])
  const [reviewFormOpen, setReviewFormOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const userHasReview = user ? reviews.some(r => r.user_id === user.id) : false

  useEffect(() => {
    fetch('/api/reviews?limit=50')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReviews(data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
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
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token || ''
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        rating: reviewRating,
        comment: reviewComment.trim(),
        user_name: user.user_metadata?.full_name || user.email || 'Anonymous',
      }),
    })
    setReviewSubmitting(false)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }))
      if (err.error?.includes('order')) {
        toast.error(t.reviews.mustOrderFirst)
      } else {
        toast.error(t.reviews.failedSubmit)
      }
      return
    }
    toast.success(t.reviews.reviewSubmitted)
    setReviewComment('')
    setReviewRating(5)
    setReviewFormOpen(false)
    fetch('/api/reviews?limit=50')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setReviews(data) })
      .catch(() => {})
  }

  return (
    <section id="reviews" ref={reviewsRef} className="py-28 lg:py-36 relative bg-black overflow-hidden">
      <FloatingVarenyky progressRef={progressRef} isMobile={isMobile} />

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
            >
              <div className="bg-black/90 backdrop-blur-sm p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-cream/20'}`}
                    />
                  ))}
                </div>
                <p className="text-cream leading-relaxed mb-6 text-[15px]">{review.comment}</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cream/10 flex items-center justify-center">
                    <span className="text-cream text-sm font-medium">{review.user_name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-cream text-sm font-medium">{review.user_name}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Write Review */}
        <div className="text-center">
          {user ? (
            userHasReview ? (
              <p className="text-cream text-sm tracking-[0.15em]">{t.reviews.alreadyReviewed}</p>
            ) : reviewFormOpen ? (
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
            <div className="text-cream">
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
  )
}

const FloatingVarenyky = React.memo(function FloatingVarenyky({ progressRef, isMobile }: { progressRef: React.RefObject<number | null>; isMobile: boolean }) {
  const [progress, setProgress] = React.useState(0)
  const lastRef = React.useRef(0)
  React.useEffect(() => {
    let raf: number
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const p = progressRef.current ?? 0
      if (Math.abs(p - lastRef.current) > 0.001) {
        lastRef.current = p
        setProgress(p)
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [progressRef])
  const data = [
    { side: 'left' as const, top: '3%', width: 170, rotate: -10, delay: 0, final: -5, finalMob: -45 },
    { side: 'left' as const, top: '22%', width: 140, rotate: 6, delay: 0.25, final: 40, finalMob: 0, hideMob: true },
    { side: 'left' as const, top: '45%', width: 190, rotate: -8, delay: 0.5, final: 60, finalMob: -20 },
    { side: 'right' as const, top: '5%', width: 160, rotate: 12, delay: 0.15, final: -5, finalMob: -45 },
    { side: 'right' as const, top: '27%', width: 200, rotate: -5, delay: 0.4, final: 40, finalMob: -35 },
    { side: 'right' as const, top: '50%', width: 150, rotate: 10, delay: 0.65, final: 60, finalMob: -20 },
  ]
  return data.map((v) => {
    if (isMobile && v.hideMob) return null
    const target = isMobile ? v.finalMob : v.final
    const entryStart = 0.15 + v.delay * 0.015
    const entryEnd = Math.min(1, entryStart + 0.85)
    const raw = Math.max(0, Math.min(1, (progress - entryStart) / (entryEnd - entryStart)))
    const t = 1 - (1 - raw) ** 3
    const x = -280 + (target + 280) * t
    return (
      <img
        key={`${v.side}-${v.top}`}
        src={img("/images/varenyk-bg.png")}
        alt=""
        className="absolute z-0 pointer-events-none"
        style={{
          width: `${v.width}px`,
          top: v.top,
          [v.side === 'left' ? 'left' : 'right']: `${x}px`,
          opacity: t,
          transform: `rotate(${v.rotate}deg)`,
        }}
      />
    )
  })
})
