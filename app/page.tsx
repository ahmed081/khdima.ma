import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { FeaturedJobs } from "@/components/featured-jobs"
import { HowItWorks } from "@/components/how-it-works"
import { Footer } from "@/components/footer"
import { Testimonials } from "@/components/testimonials"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturedJobs />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}
