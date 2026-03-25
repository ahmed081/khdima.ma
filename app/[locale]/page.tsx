import {HeroSection} from "@/components/hero-section"
import {StatsSection} from "@/components/stats-section"
import {FeaturedJobs} from "@/components/featured-jobs"
import {Testimonials} from "@/components/testimonials"

export default function HomePage() {
    return (<div className="min-h-screen">

            <main>
                <HeroSection/>
                <StatsSection/>
                <FeaturedJobs/>
                <Testimonials/>
            </main>
        </div>)
}
