"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useRouter, Link } from "@/i18n/navigation"
import { selectUser, selectAuthInitialized } from "@/store/slices/authSlice"
import { useLocale, useTranslations } from "next-intl"
import { useQuery } from "@tanstack/react-query"
import {
  Search, Heart, MessageCircle, User, Star,
  Wrench, ChevronRight, Clock, MapPin, ArrowRight,
  Sparkles, ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BecomeProviderModal } from "@/components/become-provider-modal"

function QuickAction({
  href, onClick, icon: Icon, label, desc, color,
}: {
  href?: string; onClick?: () => void; icon: any; label: string; desc: string; color: string
}) {
  const inner = (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:-translate-y-0.5 hover:border-green-200 transition-all">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900">{label}</p>
        <p className="text-xs text-gray-400 truncate">{desc}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-green-600 transition-colors" />
    </div>
  )
  if (onClick) {
    return <button type="button" onClick={onClick} className="group w-full text-start">{inner}</button>
  }
  return <Link href={href as any} className="group">{inner}</Link>
}

export default function ClientDashboardPage() {
  const user        = useSelector(selectUser)
  const initialized = useSelector(selectAuthInitialized)
  const router      = useRouter()
  const locale      = useLocale()
  const tc          = useTranslations("clientDashboard")
  const [showProviderModal, setShowProviderModal] = useState(false)

  useEffect(() => {
    if (!initialized) return
    if (!user) { router.replace("/login"); return }
  }, [user, initialized, router])

  const { data: featuredData } = useQuery({
    queryKey: ["featured-providers-dashboard", locale],
    queryFn: () => fetch(`/api/providers?limit=3&locale=${locale}`).then(r => r.json()),
    enabled: !!user,
  })

  const providers: any[] = Array.isArray(featuredData?.providers) ? featuredData.providers : []

  if (!initialized || !user) return null

  const firstName = user.name?.split(" ")[0] ?? ""

  const quickActions = [
    {
      href: "/services",
      icon: Search,
      label: tc("findPro"),
      desc:  tc("browseServices"),
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
    },
    {
      href: "/profile",
      icon: User,
      label: tc("myProfile"),
      desc:  tc("editMyInfo"),
      color: "bg-gradient-to-br from-blue-500 to-indigo-600",
    },
    {
      href: "/contact",
      icon: MessageCircle,
      label: tc("contactUs"),
      desc:  tc("supportQuestions"),
      color: "bg-gradient-to-br from-purple-500 to-violet-600",
    },
    {
      onClick: () => setShowProviderModal(true),
      icon: Sparkles,
      label: tc("becomeProvider"),
      desc:  tc("listBusiness"),
      color: "bg-gradient-to-br from-amber-500 to-orange-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-slate-900 via-green-950 to-emerald-900 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-emerald-400/10 pointer-events-none" />

        <div className="relative container mx-auto px-4 max-w-4xl py-10">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-xl border-2 border-white/20 flex-shrink-0">
              {firstName[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white/60 text-sm">
                {tc("welcomeTo")} khdimti.com
              </p>
              <h1 className="text-2xl font-extrabold text-white">
                {tc("hello")} {firstName} 👋
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
                <span className="text-green-300 text-xs font-medium">
                  {tc("verifiedAccount")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-6 bg-gray-50" style={{ clipPath: "ellipse(100% 100% at 50% 100%)" }} />
      </div>

      <div className="container mx-auto px-4 max-w-4xl -mt-2 pb-16">

        {/* Quick actions */}
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-green-600 inline-block" />
          {tc("quickActions")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {quickActions.map((action, i) => (
            <QuickAction key={i} {...action} />
          ))}
        </div>

        {/* Featured providers */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <h2 className="font-bold text-gray-900 text-sm">
                {tc("featuredProviders")}
              </h2>
            </div>
            <Link href="/services" className="text-xs text-green-700 hover:text-green-600 font-semibold flex items-center gap-1">
              {tc("seeAll")}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {providers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Wrench className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm">
                {tc("noProviders")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {providers.map((p: any) => {
                const cityName = locale === "ar" ? p.city?.nameAr : locale === "fr" ? p.city?.nameFr : p.city?.name
                return (
                  <Link key={p.id} href={`/services/${p.category?.slug}/${p.id}` as any} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-lg font-bold text-green-700 flex-shrink-0 overflow-hidden">
                      {p.avatarUrl
                        ? <img src={p.avatarUrl} alt={p.businessName} className="w-full h-full object-cover" />
                        : p.businessName?.[0]
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{p.businessName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.city && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="h-3 w-3" />
                            {cityName}
                          </span>
                        )}
                        {p.rating > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-600">
                            <Star className="h-3 w-3 fill-amber-500" />
                            {p.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-green-600 transition-colors flex-shrink-0" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Provider CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-green-700 to-emerald-600 p-6 text-white text-center">
          <Wrench className="h-8 w-8 mx-auto mb-3 opacity-80" />
          <h3 className="font-bold text-lg mb-1">
            {tc("areYouPro")}
          </h3>
          <p className="text-green-100 text-sm mb-4 max-w-xs mx-auto">
            {tc("joinProviders")}
          </p>
          <Button
            className="bg-white text-green-700 hover:bg-green-50 font-semibold"
            onClick={() => setShowProviderModal(true)}
          >
            {tc("listYourBusiness")}
            <ArrowRight className="h-4 w-4 ms-2" />
          </Button>
        </div>
      </div>

      {showProviderModal && (
        <BecomeProviderModal
          onClose={() => setShowProviderModal(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  )
}
