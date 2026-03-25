import { HeroSection } from "@/components/hero-section"
import { CategoriesGrid } from "@/components/categories-grid"
import { FeaturedProviders } from "@/components/featured-providers"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <CategoriesGrid />
      <FeaturedProviders />
      <HowItWorks />
      <Testimonials />
    </main>
  )
}
