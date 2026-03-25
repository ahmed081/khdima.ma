import type React from "react"
import {Suspense} from "react"
import type {Metadata} from "next"
import {GeistSans} from "geist/font/sans"
import {GeistMono} from "geist/font/mono"
import {Analytics} from "@vercel/analytics/next"
import "../globals.css"
import ReactQueryProvider from "@/providers/ReactQueryProvider"
import Providers from "@/store/Providers"
import {Header} from "@/components/header"
import {Footer} from "@/components/footer"
import GlobalToast from "@/components/global-toast"
import {NextIntlClientProvider} from 'next-intl'
import {getMessages} from 'next-intl/server'
import {routing} from '@/i18n/routing'
import {notFound} from 'next/navigation'

export const metadata: Metadata = {
    title: "khdimti.com - Trouvez des professionnels au Maroc",
    description: "La plateforme marocaine qui connecte clients et artisans de confiance",
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const {locale} = await params

    if (!routing.locales.includes(locale as any)) {
        notFound()
    }

    const messages = await getMessages()

    const dir = locale === 'ar' ? 'rtl' : 'ltr'

    return (
        <html lang={locale} dir={dir} suppressHydrationWarning>
            <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`} suppressHydrationWarning>
                <NextIntlClientProvider messages={messages}>
                    <Providers>
                        <ReactQueryProvider>
                            <Header/>
                            <Suspense fallback={null}>
                                <GlobalToast />
                                {children}
                            </Suspense>
                            <Analytics/>
                            <Footer/>
                        </ReactQueryProvider>
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
