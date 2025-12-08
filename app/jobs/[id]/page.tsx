import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  Building2,
  ArrowLeft,
  Send,
} from "lucide-react";

export default async function JobDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const jobId = Number(id)
  if (isNaN(jobId)) {
    notFound();
  }

  // Fetch job directly on server (fastest)
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      employer: true,
      city: true,
      country: true,
      contractType: true,
      skills: { include: { skill: true } },
    },
  });

  if (!job) {
    notFound();
  }

  return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">

          {/* Back button */}
          <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux offres
          </Link>

          <Card className="overflow-hidden">

            {/* Employer Header */}
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-semibold text-foreground">
                      {job.employer?.companyName ?? "Entreprise"}
                    </p>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                      Publié le {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Job Information */}
            <CardContent className="px-4 pb-3 pt-0">
              <h1 className="mb-2 text-xl font-bold text-foreground">
                {job.title}
              </h1>

              {/* Job tags */}
              <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">

                {/* Location */}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>
                  {job.city?.name}
                    {job.country?.name ? `, ${job.country.name}` : ""}
                </span>
                </div>

                {/* Contract type */}
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <Badge variant="secondary" className="text-xs">
                    {job.contractType?.name ?? "N/A"}
                  </Badge>
                </div>

                {/* Salary */}
                {job.salary && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">
                    {job.salary}
                  </span>
                    </div>
                )}
              </div>

              {/* Skills */}
              <div className="mb-4 flex flex-wrap gap-2">
                {job.skills.map((js) => (
                    <Badge key={js.skill.id} variant="outline" className="text-xs">
                      {js.skill.name}
                    </Badge>
                ))}
              </div>

              {/* Description & Details */}
              <div className="space-y-6 text-sm leading-relaxed">

                {/* Description */}
                <div>
                  <h3 className="mb-2 font-semibold">Description du poste :</h3>
                  <p className="text-pretty whitespace-pre-line">
                    {job.description}
                  </p>
                </div>

                {/* Competencies */}
                {job.competencies.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-semibold">Compétences principales :</h3>
                      <ul className="space-y-1.5">
                        {job.competencies.map((item, i) => (
                            <li key={i} className="flex gap-2 text-muted-foreground">
                              <span className="mt-1.5 h-1 w-1 rounded-full bg-primary" />
                              {item}
                            </li>
                        ))}
                      </ul>
                    </div>
                )}

                {/* Requirements */}
                {job.requirements.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-semibold">Profil recherché :</h3>
                      <ul className="space-y-1.5">
                        {job.requirements.map((item, i) => (
                            <li key={i} className="flex gap-2 text-muted-foreground">
                              <span className="mt-1.5 h-1 w-1 rounded-full bg-primary" />
                              {item}
                            </li>
                        ))}
                      </ul>
                    </div>
                )}

                {/* Benefits */}
                {job.benefits.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-semibold">Avantages :</h3>
                      <ul className="space-y-1.5">
                        {job.benefits.map((item, i) => (
                            <li key={i} className="flex gap-2 text-muted-foreground">
                              <span className="mt-1.5 h-1 w-1 rounded-full bg-primary" />
                              {item}
                            </li>
                        ))}
                      </ul>
                    </div>
                )}

              </div>
            </CardContent>

            {/* Apply button */}
            <CardContent className="border-t bg-accent/30 p-4">
                <Link href={`/jobs/${jobId}/apply`}>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                        <Send className="mr-2 h-4 w-4" />
                        Postuler maintenant
                    </Button>
                </Link>
            </CardContent>

          </Card>
        </div>
      </div>
  );
}
