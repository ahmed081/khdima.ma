"use client"

import { Link, useRouter } from "@/i18n/navigation"
import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { logoutRequest, selectUser } from "@/store/slices/authSlice"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet"
import { useTranslations, useLocale } from "next-intl"
import { LanguageSwitcher } from "@/components/language-switcher"
import {
  Wrench, Menu, User, LogOut, LayoutDashboard,
  Settings, ChevronDown, Shield, Home, Sparkles,
} from "lucide-react"
import { BecomeProviderModal } from "@/components/become-provider-modal"

function UserDropdown({ user, t }: { user: any; t: any }) {
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const firstName = user?.name?.split(" ")[0] ?? t("profile")

  const getDashboardLink = () => {
    if (user?.role === "PROVIDER") return "/provider/dashboard"
    if (user?.role === "ADMIN") return "/admin"
    return "/client/dashboard"
  }

  const getProfileLink = () => {
    if (user?.role === "PROVIDER") return "/provider/dashboard"
    if (user?.role === "ADMIN") return "/admin"
    return "/profile"
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-medium text-gray-800 dark:text-white transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {firstName[0]?.toUpperCase()}
        </div>
        <span className="max-w-[100px] truncate">{firstName}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User info header */}
          <div className="px-4 py-3 bg-gradient-to-br from-green-50 to-emerald-50 border-b border-gray-100">
            <p className="text-xs font-semibold text-green-700 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            {user?.role && (
              <span className="mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                {user.role}
              </span>
            )}
          </div>

          <div className="py-1">
            <Link
              href={getProfileLink() as any}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="h-4 w-4 text-gray-400" />
              {t("profile")}
            </Link>

            <Link
              href={getDashboardLink() as any}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-gray-400" />
              {t("dashboard")}
            </Link>

            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Shield className="h-4 w-4 text-gray-400" />
                {t("adminPanel")}
              </Link>
            )}

            <Link
              href={getProfileLink() as any}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-400" />
              {t("settings")}
            </Link>

            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => { setOpen(false); dispatch(logoutRequest()) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function Header() {
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const t = useTranslations("header")
  const locale = useLocale()
  const [scrolled, setScrolled] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [showProviderModal, setShowProviderModal] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  const getDashboardLink = () => {
    if (user?.role === "PROVIDER") return "/provider/dashboard"
    if (user?.role === "ADMIN") return "/admin"
    return "/client/dashboard"
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-sm"
          : "bg-white/70 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 shadow-md group-hover:shadow-green-500/30 transition-shadow">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-gray-900">
            khdimti<span className="text-green-600">.com</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-colors">
            <Home className="h-4 w-4" />
            {t("home")}
          </Link>
          <Link href="/services" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-colors">
            {t("services")}
          </Link>
          <Link href="/provider/register" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-colors">
            {t("forProviders")}
          </Link>
          <Link href="/contact" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-colors">
            {t("contact")}
          </Link>
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          {!user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-sm" asChild>
                <Link href="/register">{t("register")}</Link>
              </Button>
            </>
          ) : (
            <UserDropdown user={user} t={t} />
          )}
        </div>

        {/* MOBILE HAMBURGER */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden rounded-xl">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent className="w-80 p-0 flex flex-col" side={locale === "ar" ? "left" : "right"} dir={locale === "ar" ? "rtl" : "ltr"}>
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            {/* Header */}
            <div className="p-5 border-b bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-emerald-700">
                  <Wrench className="h-4 w-4 text-white" />
                </div>
                <span className="font-extrabold text-gray-900">khdimti<span className="text-green-600">.com</span></span>
              </div>

              {user ? (
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{user.name?.split(" ")[0]}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t("welcomeBack")}</p>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <SheetClose asChild>
                <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Home className="h-4 w-4 text-gray-400" />
                  {t("home")}
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/services" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Wrench className="h-4 w-4 text-gray-400" />
                  {t("services")}
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/provider/register" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <User className="h-4 w-4 text-gray-400" />
                  {t("forProviders")}
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/contact" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Settings className="h-4 w-4 text-gray-400" />
                  {t("contact")}
                </Link>
              </SheetClose>

              {user && (
                <>
                  <div className="my-2 border-t border-gray-100" />
                  <SheetClose asChild>
                    <Link href={getDashboardLink() as any} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <LayoutDashboard className="h-4 w-4 text-gray-400" />
                      {t("dashboard")}
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="h-4 w-4 text-gray-400" />
                      {t("profile")}
                    </Link>
                  </SheetClose>
                  {user?.role === "ADMIN" && (
                    <SheetClose asChild>
                      <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Shield className="h-4 w-4 text-gray-400" />
                        {t("adminPanel")}
                      </Link>
                    </SheetClose>
                  )}
                  {user?.role === "CUSTOMER" && (
                    <button
                      type="button"
                      onClick={() => { setSheetOpen(false); setShowProviderModal(true) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                    >
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      {t("becomeProvider")}
                    </button>
                  )}
                </>
              )}
            </nav>

            {/* Footer actions */}
            <div className="p-4 border-t space-y-3">
              {/* Language switcher with labels */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50">
                <span className="text-xs font-medium text-gray-500">{t("language")}</span>
                <LanguageSwitcher showLabel />
              </div>

              {!user ? (
                <div className="flex gap-2">
                  <SheetClose asChild>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href="/login">{t("login")}</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button size="sm" className="flex-1 bg-green-700 hover:bg-green-600" asChild>
                      <Link href="/register">{t("register")}</Link>
                    </Button>
                  </SheetClose>
                </div>
              ) : (
                <Button
                  variant="destructive"
                  className="w-full"
                  size="sm"
                  onClick={() => dispatch(logoutRequest())}
                >
                  <LogOut className="h-4 w-4 me-2" />
                  {t("logout")}
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {showProviderModal && (
        <BecomeProviderModal
          onClose={() => setShowProviderModal(false)}
          onSuccess={() => {}}
        />
      )}
    </header>
  )
}
