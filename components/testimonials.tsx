'use client'
import { Star, Quote } from "lucide-react"
import { useTranslations, useLocale } from 'next-intl'
import { useScrollAnimation, animations } from '@/hooks/useScrollAnimation'

const testimonialsData = [
  {
    name: "Youssef Bennani",
    role: { fr: "Client satisfait", en: "Happy client", ar: "عميل راضٍ" },
    avatar: "YB",
    color: "from-blue-500 to-indigo-600",
    content: {
      fr: "J'ai trouvé un excellent plombier en moins de 10 minutes. Profil vérifié, travail propre, je recommande vivement khdimti.com !",
      en: "Found an excellent plumber in under 10 minutes. Verified profile, clean work, highly recommend khdimti.com!",
      ar: "وجدت سباكًا ممتازًا في أقل من 10 دقائق. ملف موثوق، عمل نظيف، أنصح بشدة بـ khdimti.com!",
    },
    rating: 5,
  },
  {
    name: "Fatima Zahra El Amrani",
    role: { fr: "Propriétaire", en: "Homeowner", ar: "مالكة منزل" },
    avatar: "FZ",
    color: "from-pink-500 to-rose-600",
    content: {
      fr: "La plateforme est simple et efficace. J'ai comparé plusieurs électriciens, j'ai choisi le meilleur et le résultat est parfait.",
      en: "The platform is simple and efficient. I compared several electricians, chose the best one, and the result is perfect.",
      ar: "المنصة سهلة وفعّالة. قارنت بين عدة كهربائيين، اخترت الأفضل، والنتيجة مثالية.",
    },
    rating: 5,
  },
  {
    name: "Ahmed Tazi",
    role: { fr: "Chef d'entreprise", en: "Business owner", ar: "رجل أعمال" },
    avatar: "AT",
    color: "from-green-500 to-emerald-600",
    content: {
      fr: "En tant que prestataire, j'ai multiplié mes contacts par 3 depuis mon inscription. C'est la meilleure décision que j'ai prise.",
      en: "As a provider, I've tripled my contacts since joining. Best decision I've made.",
      ar: "كمزود خدمة، تضاعفت اتصالاتي 3 مرات منذ تسجيلي. أفضل قرار اتخذته.",
    },
    rating: 5,
  },
]

export function Testimonials() {
  const t      = useTranslations('testimonials')
  const locale = useLocale()
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref as any} className="py-20 bg-gradient-to-b from-amber-50/50 to-white">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 ${animations.fadeUp(isVisible)}`}>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{t('title')}</h2>
          <p className="text-gray-500 text-lg">{t('subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonialsData.map((item, i) => {
            const content = item.content[locale as 'fr' | 'en' | 'ar'] ?? item.content.fr
            const role    = item.role[locale as 'fr' | 'en' | 'ar'] ?? item.role.fr

            return (
              <div
                key={i}
                className={`relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow ${animations.fadeUp(isVisible, i * 100)}`}
              >
                {/* Quote icon */}
                <div className="absolute top-5 end-5 opacity-10">
                  <Quote className="h-8 w-8 text-gray-400" />
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: item.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6">"{content}"</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {item.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
