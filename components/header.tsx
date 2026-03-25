"use client"

import { Link } from "@/i18n/navigation"
import { useSelector, useDispatch } from "react-redux"
import { logout, selectUser } from "@/store/slices/authSlice"
import { Button } from "@/components/ui/button"
import { Wrench, Menu, User, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from "@/components/language-switcher"

export function Header() {
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const t = useTranslations('header')

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' })
    dispatch(logout())
  }

  const getDashboardLink = () => {
    if (user?.role === 'PROVIDER') return '/provider/dashboard'
    if (user?.role === 'ADMIN') return '/admin'
    return '/profile'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-700">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">khdimti.com</span>
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/services" className="nav-link">{t('services')}</Link>
          <Link href="/provider/register" className="nav-link">{t('forProviders')}</Link>
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          {!user ? (
            <>
              <Button variant="ghost" asChild><Link href="/login">{t('login')}</Link></Button>
              <Button className="bg-red-700 hover:bg-red-600" asChild>
                <Link href="/register">{t('register')}</Link>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href={getDashboardLink()} className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {user.name ?? t('profile')}
              </Link>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="text-sm text-red-700 font-medium">{t('adminPanel')}</Link>
              )}
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* MOBILE DRAWER */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent className="p-6 flex flex-col gap-6" side="right">
            <nav className="flex flex-col gap-4 text-lg">
              <SheetClose asChild><Link href="/services">{t('services')}</Link></SheetClose>
              <SheetClose asChild><Link href="/provider/register">{t('forProviders')}</Link></SheetClose>
            </nav>

            <div className="mt-4 border-t pt-4 flex flex-col gap-4">
              <LanguageSwitcher />
              {!user ? (
                <>
                  <SheetClose asChild>
                    <Button variant="outline" asChild>
                      <Link href="/login">{t('login')}</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button className="bg-red-700 hover:bg-red-600" asChild>
                      <Link href="/register">{t('register')}</Link>
                    </Button>
                  </SheetClose>
                </>
              ) : (
                <>
                  <SheetClose asChild>
                    <Link href={getDashboardLink()} className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5" />
                      {user.name ?? t('profile')}
                    </Link>
                  </SheetClose>
                  <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="h-5 w-5 mr-2" /> {t('logout')}
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
