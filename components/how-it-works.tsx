import { Search, FileText, Send, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Recherchez",
    description: "Parcourez des milliers d'offres d'emploi par ville, domaine ou salaire",
  },
  {
    icon: FileText,
    title: "Créez votre profil",
    description: "Téléchargez votre CV et complétez votre profil professionnel",
  },
  {
    icon: Send,
    title: "Postulez",
    description: "Candidatez directement aux offres qui vous intéressent en un clic",
  },
  {
    icon: CheckCircle,
    title: "Décrochez votre emploi",
    description: "Les entreprises vous contactent et vous commencez votre nouvelle carrière",
  },
]

export function HowItWorks() {
  return (
    <section className="border-t border-border/40 bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl">Comment ça marche ?</h2>
          <p className="text-pretty text-lg text-muted-foreground">Trouvez votre emploi idéal en 4 étapes simples</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative text-center">
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-10 w-10 text-primary" />
                    </div>
                    <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="text-pretty text-sm text-muted-foreground">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
