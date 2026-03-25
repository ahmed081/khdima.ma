'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useLocale } from 'next-intl'
import { useSelector } from 'react-redux'
import { selectUser } from '@/store/slices/authSlice'
import { Link } from '@/i18n/navigation'

interface Props {
  providerId: number
}

export function ReviewForm({ providerId }: Props) {
  const locale = useLocale()
  const user   = useSelector(selectUser)
  const qc     = useQueryClient()

  const [rating,  setRating]  = useState(0)
  const [hover,   setHover]   = useState(0)
  const [comment, setComment] = useState('')
  const [done,    setDone]    = useState(false)

  const labels = {
    title:       locale === 'ar' ? 'اترك تقييمك'             : locale === 'fr' ? 'Laisser un avis'      : 'Leave a review',
    submit:      locale === 'ar' ? 'إرسال التقييم'            : locale === 'fr' ? 'Publier'              : 'Submit',
    placeholder: locale === 'ar' ? 'شاركنا تجربتك...'        : locale === 'fr' ? 'Votre expérience...'  : 'Share your experience...',
    loginMsg:    locale === 'ar' ? 'سجّل الدخول لترك تقييم'  : locale === 'fr' ? 'Connectez-vous pour laisser un avis' : 'Sign in to leave a review',
    login:       locale === 'ar' ? 'تسجيل الدخول'             : locale === 'fr' ? 'Se connecter'         : 'Sign in',
    thanks:      locale === 'ar' ? 'شكراً على تقييمك!'        : locale === 'fr' ? 'Merci pour votre avis !' : 'Thanks for your review!',
    ratingReq:   locale === 'ar' ? 'الرجاء اختيار تقييم'      : locale === 'fr' ? 'Veuillez choisir une note' : 'Please select a rating',
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, rating, comment: comment.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      return data
    },
    onSuccess: () => {
      setDone(true)
      qc.invalidateQueries({ queryKey: ['provider', String(providerId)] })
    },
  })

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500 flex items-center gap-3">
        <span>{labels.loginMsg}</span>
        <Button size="sm" variant="outline" asChild>
          <Link href="/login">{labels.login}</Link>
        </Button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
        {labels.thanks}
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) { alert(labels.ratingReq); return }
    mutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="font-medium text-gray-800">{labels.title}</p>

      {/* Star picker */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const val = i + 1
          return (
            <button
              key={val}
              type="button"
              onClick={() => setRating(val)}
              onMouseEnter={() => setHover(val)}
              onMouseLeave={() => setHover(0)}
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  val <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                }`}
              />
            </button>
          )
        })}
      </div>

      <Textarea
        placeholder={labels.placeholder}
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
      />

      {mutation.isError && (
        <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>
      )}

      <Button
        type="submit"
        className="bg-green-700 hover:bg-green-600"
        disabled={mutation.isPending || !rating}
      >
        {mutation.isPending ? '...' : labels.submit}
      </Button>
    </form>
  )
}
