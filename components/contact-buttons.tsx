'use client'

import { Button } from '@/components/ui/button'
import { MessageCircle, Phone } from 'lucide-react'
import { useLocale } from 'next-intl'

interface Props {
  providerId: number
  phone:      string
  whatsapp:   string | null | undefined
}

export function ContactButtons({ providerId, phone, whatsapp }: Props) {
  const locale   = useLocale()
  const waNumber = (whatsapp ?? phone).replace(/\D/g, '')

  const logContact = (type: 'WHATSAPP' | 'CALL') => {
    fetch(`/api/providers/${providerId}/contact`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type }),
    }).catch(() => {})
  }

  return (
    <div className="flex gap-3 mt-5">
      <Button className="flex-1 bg-green-600 hover:bg-green-500 text-white" asChild>
        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => logContact('WHATSAPP')}
        >
          <MessageCircle className="h-4 w-4 mr-2" />WhatsApp
        </a>
      </Button>
      <Button variant="outline" className="flex-1" asChild>
        <a href={`tel:${phone}`} onClick={() => logContact('CALL')}>
          <Phone className="h-4 w-4 mr-2" />
          {locale === 'fr' ? 'Appeler' : locale === 'ar' ? 'اتصل' : 'Call'}
        </a>
      </Button>
    </div>
  )
}
