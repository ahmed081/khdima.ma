import { getLocale } from "next-intl/server"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react"

export default async function ContactPage() {
  const locale = await getLocale()

  const content = {
    fr: {
      title:    "Contactez-nous",
      subtitle: "Notre équipe est à votre écoute",
      email:    { label: "Email", value: "contact@khdimti.com" },
      phone:    { label: "Téléphone", value: "+212 6 00 00 00 00" },
      whatsapp: { label: "WhatsApp", value: "+212 6 00 00 00 00" },
      address:  { label: "Adresse", value: "Casablanca, Maroc" },
      forProviders: {
        title: "Vous êtes un professionnel ?",
        text:  "Inscrivez-vous gratuitement sur khdimti.com et commencez à recevoir des contacts de clients dans votre ville.",
        cta:   "S'inscrire comme prestataire",
        href:  "/provider/register",
      },
      hours: {
        title: "Horaires",
        text:  "Du lundi au vendredi, 9h–18h (heure du Maroc)",
      },
    },
    en: {
      title:    "Contact Us",
      subtitle: "Our team is here to help",
      email:    { label: "Email", value: "contact@khdimti.com" },
      phone:    { label: "Phone", value: "+212 6 00 00 00 00" },
      whatsapp: { label: "WhatsApp", value: "+212 6 00 00 00 00" },
      address:  { label: "Address", value: "Casablanca, Morocco" },
      forProviders: {
        title: "Are you a professional?",
        text:  "Register for free on khdimti.com and start receiving customer contacts in your city.",
        cta:   "Register as a provider",
        href:  "/provider/register",
      },
      hours: {
        title: "Opening hours",
        text:  "Monday to Friday, 9am–6pm (Morocco time)",
      },
    },
    ar: {
      title:    "تواصل معنا",
      subtitle: "فريقنا في خدمتك",
      email:    { label: "البريد الإلكتروني", value: "contact@khdimti.com" },
      phone:    { label: "الهاتف", value: "+212 6 00 00 00 00" },
      whatsapp: { label: "واتساب", value: "+212 6 00 00 00 00" },
      address:  { label: "العنوان", value: "الدار البيضاء، المغرب" },
      forProviders: {
        title: "هل أنت محترف؟",
        text:  "سجّل مجاناً في khdimti.com وابدأ في استقبال طلبات العملاء في مدينتك.",
        cta:   "التسجيل كمزود خدمة",
        href:  "/provider/register",
      },
      hours: {
        title: "أوقات العمل",
        text:  "من الاثنين إلى الجمعة، 9 صباحاً – 6 مساءً (توقيت المغرب)",
      },
    },
  }

  const c = content[locale as keyof typeof content] ?? content.fr
  const isRTL = locale === 'ar'

  return (
    <main className="min-h-screen bg-gray-50 py-16" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{c.title}</h1>
          <p className="text-gray-500 text-lg">{c.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 space-y-5">
              {[
                { icon: Mail,         info: c.email    },
                { icon: Phone,        info: c.phone    },
                { icon: MessageCircle, info: c.whatsapp },
                { icon: MapPin,       info: c.address  },
              ].map(({ icon: Icon, info }) => (
                <div key={info.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{info.label}</p>
                    <p className="font-medium text-gray-800">{info.value}</p>
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-4 pt-2 border-t">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold text-sm">⏰</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{c.hours.title}</p>
                  <p className="font-medium text-gray-800">{c.hours.text}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-700 to-green-800 text-white">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <h2 className="text-xl font-bold mb-3">{c.forProviders.title}</h2>
              <p className="text-green-100 mb-6 leading-relaxed">{c.forProviders.text}</p>
              <a
                href={`/${locale}${c.forProviders.href}`}
                className="inline-block bg-white text-green-700 font-semibold px-5 py-2.5 rounded hover:bg-green-50 transition-colors text-sm text-center"
              >
                {c.forProviders.cta}
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
