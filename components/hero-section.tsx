import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative h-[600px] overflow-hidden border-b border-border/40 md:h-[700px]">
      {/* Full-width background image */}
      <div className="absolute inset-0 -z-10">
        <img src="/casablanca-skyline-at-sunset-with-modern-office-bu.jpg" alt="Casablanca skyline" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>

      <div className="container relative mx-auto flex h-full items-center px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-balance text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            Trouvez votre prochaine opportunité avec Khidma.ma
          </h1>
          <p className="mb-12 text-pretty text-lg text-white/90 md:text-xl">
            La plateforme simple et transparente qui connecte les chercheurs d'emploi et les employeurs marocains
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/search">
              <Button
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto sm:px-12"
              >
                Trouver un emploi
              </Button>
            </Link>
            <Link href="/employers/post-job">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-white bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 sm:w-auto sm:px-12"
              >
                Recruter quelqu'un
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
