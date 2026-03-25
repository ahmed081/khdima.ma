'use client'
import { Link } from "@/i18n/navigation"
import { Wrench, Facebook, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="border-t border-border/40 bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-700">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">khdimti.com</span>
            </Link>
            <p className="mb-4 text-sm text-muted-foreground">{t('tagline')}</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">{t('forCustomers')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services" className="text-muted-foreground hover:text-foreground">{t('browseServices')}</Link></li>
              <li><Link href="/services" className="text-muted-foreground hover:text-foreground">{t('findPro')}</Link></li>
              <li><Link href="/" className="text-muted-foreground hover:text-foreground">{t('howItWorks')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">{t('forProviders')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/provider/register" className="text-muted-foreground hover:text-foreground">{t('registerBusiness')}</Link></li>
              <li><Link href="/provider/dashboard" className="text-muted-foreground hover:text-foreground">{t('providerDashboard')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">{t('about')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">{t('contact')}</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">{t('privacy')}</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">{t('terms')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <p>{t('rights')}</p>
        </div>
      </div>
    </footer>
  )
}
