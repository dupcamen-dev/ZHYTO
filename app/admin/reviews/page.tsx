"use client"

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Star, ThumbsUp, ThumbsDown, Trash2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface Review {
  id: number
  user_id: string
  user_name: string
  rating: number
  comment: string
  approved: boolean
  created_at: string
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const fetchReviews = useCallback(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) { setLoading(false); return }
      const url = `/api/admin/reviews${filter !== 'all' ? `?status=${filter}` : ''}`
      fetch(url, { headers: { Authorization: `Bearer ${session.access_token}` } })
        .then(res => res.json())
        .then(data => {
          if (data?.reviews) setReviews(data.reviews as Review[])
          setLoading(false)
        })
        .catch(() => { setLoading(false); toast.error('Failed to load reviews') })
    })
  }, [filter])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const moderateReview = async (id: number, approved: boolean) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return
    const res = await fetch(`/api/reviews/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ approved }),
    })
    if (res.ok) {
      toast.success(approved ? 'Review approved' : 'Review rejected')
      fetchReviews()
    } else {
      toast.error('Failed to update review')
    }
  }

  const deleteReview = async (id: number) => {
    if (!confirm('Delete this review?')) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return
    const res = await fetch(`/api/reviews/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (res.ok) {
      toast.success('Review deleted')
      fetchReviews()
    } else {
      toast.error('Failed to delete review')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Reviews</h1>
          <p className="text-muted-foreground text-base mt-1">Moderate customer reviews</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'approved', 'pending'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm tracking-[0.15em] transition-colors cursor-pointer ${
                filter === s
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground border border-border/30'
              }`}
            >
              {s === 'all' ? 'ALL' : s === 'approved' ? 'APPROVED' : 'PENDING'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-xl">
          <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="glass-card rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm font-medium">{review.user_name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-base text-foreground font-medium">{review.user_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <span className={`text-xs tracking-[0.15em] px-3 py-1 rounded-full ${
                  review.approved
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {review.approved ? 'APPROVED' : 'PENDING'}
                </span>
              </div>

              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/20'}`}
                  />
                ))}
              </div>

              <p className="text-base text-foreground/80 leading-relaxed mb-4">{review.comment}</p>

              <div className="border-t border-border/20 pt-4 flex items-center gap-2">
                {!review.approved ? (
                  <button
                    onClick={() => moderateReview(review.id, true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm tracking-[0.1em] text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    APPROVE
                  </button>
                ) : (
                  <button
                    onClick={() => moderateReview(review.id, false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm tracking-[0.1em] text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    REJECT
                  </button>
                )}
                <button
                  onClick={() => deleteReview(review.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm tracking-[0.1em] text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
