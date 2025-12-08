import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import ReactQueryProvider from "@/providers/ReactQueryProvider"
import Providers from "@/store/Providers";
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";
import {BackButton} from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Khidma.ma - Trouvez votre emploi au Maroc",
  description: "La plateforme simple et transparente qui connecte les chercheurs d'emploi et les employeurs marocains",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <Providers>
          <ReactQueryProvider>
              <Header />
              <Suspense fallback={null}>{children}</Suspense>
              <Analytics />
              <Footer />

          </ReactQueryProvider>
      </Providers>
      </body>
    </html>
  )
}
