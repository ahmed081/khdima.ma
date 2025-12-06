import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Youssef Bennani",
      role: "Développeur Full Stack",
      company: "TechCasa",
      content:
        "Grâce à Khidma.ma, j'ai trouvé mon emploi de rêve en moins de deux semaines. La plateforme est simple et les offres sont de qualité.",
      rating: 5,
    },
    {
      name: "Fatima Zahra El Amrani",
      role: "Responsable RH",
      company: "Maroc Telecom",
      content:
        "Nous avons recruté plusieurs talents via Khidma.ma. Le processus est fluide et les candidats sont qualifiés.",
      rating: 5,
    },
    {
      name: "Ahmed Tazi",
      role: "Chef de Projet",
      company: "Attijariwafa Bank",
      content: "Une plateforme marocaine qui comprend vraiment les besoins du marché local. Je la recommande vivement.",
      rating: 5,
    },
  ]

  return (
    <section className="border-t border-border/40 bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Ce que disent nos utilisateurs</h2>
          <p className="text-lg text-muted-foreground">Des milliers de Marocains nous font confiance</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border/50 bg-card p-6 shadow-sm">
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="mb-6 text-pretty text-muted-foreground">"{testimonial.content}"</p>
              <div>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role} • {testimonial.company}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
