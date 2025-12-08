"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {useDispatch} from "react-redux";
import {useEmployerDashboard} from "@/hooks/useEmployerDashboard";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Badge} from "@/components/ui/badge";
import {Briefcase, Edit, Eye, Plus, Trash2, TrendingUp, Users,} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";
import {useMutation} from "@tanstack/react-query";
import {API_REQUEST_FAILED} from "@/store/sagas/requestWatcherSaga";

export default function EmployerDashboard() {
    const router = useRouter();
    const dispatch = useDispatch();
    const {data, isLoading, error} = useEmployerDashboard();

    const stats = data?.stats ?? {
        activeOffers: 0, totalApplications: 0, totalViews: 0,
    };
    const myOffers = data?.offers ?? [];
    const recentApplicants = data?.applicants ?? [];

    const [message, setMessage] = useState("");
    const [currentCandidate, setCurrentCandidate] = useState<{
        id: number; name: string; position: string;
    } | null>(null);

    const contactMutation = useMutation({
        mutationFn: async ({
                               candidateId, message,
                           }: {
            candidateId: number; message: string;
        }) => {
            const res = await fetch("/api/employers/contact", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({candidateId, message}),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                const errorObj: any = new Error(err.error || "Failed to send message");
                (errorObj.status = res.status);
                throw errorObj;
            }
            return res.json();
        }, onError: (err: any) => {
            dispatch({
                type: API_REQUEST_FAILED, payload: {
                    status: err.status ?? 500, message: err.message ?? "Unknown error",
                },
            });
        }, onSuccess: () => {
            setMessage("");
            alert("Message envoyé au candidat.");
        },
    });

    if (isLoading) {
        return (<div className="min-h-screen bg-muted/20 py-12">
                <div className="container mx-auto px-4">
                    <p>Chargement du tableau de bord...</p>
                </div>
            </div>);
    }

    if (error) {
        return (<div className="min-h-screen bg-muted/20 py-12">
                <div className="container mx-auto px-4">
                    <p className="text-red-500">
                        Erreur lors du chargement du tableau de bord.
                    </p>
                </div>
            </div>);
    }

    return (<div className="min-h-screen">
            <main className="bg-muted/20 py-12">
                <div className="container mx-auto px-4">
                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold text-foreground">
                                Tableau de bord employeur
                            </h1>
                            <p className="text-muted-foreground">
                                Gérez vos offres et consultez les candidatures
                            </p>
                        </div>
                        <Link href="/employers/post-job">
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4"/>
                                Publier une offre
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mb-8 grid gap-6 md:grid-cols-3">
                        {/* Offres actives */}
                        <Card
                            className="border-border/50 bg-card p-6 shadow-sm cursor-pointer hover:bg-muted/40 transition"
                            onClick={() => router.push("/employers/jobs")}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Offres actives</p>
                                    <p className="mt-2 text-3xl font-bold text-foreground">
                                        {stats.activeOffers}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <Briefcase className="h-6 w-6 text-primary"/>
                                </div>
                            </div>
                        </Card>

                        {/* Candidatures totales */}
                        <Card
                            className="border-border/50 bg-card p-6 shadow-sm cursor-pointer hover:bg-muted/40 transition"
                            onClick={() => router.push("/employers/applications")}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Candidatures totales
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-foreground">
                                        {stats.totalApplications}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                                    <Users className="h-6 w-6 text-accent"/>
                                </div>
                            </div>
                        </Card>

                        {/* Vues totales */}
                        <Card className="border-border/50 bg-card p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Vues totales</p>
                                    <p className="mt-2 text-3xl font-bold text-foreground">
                                        {stats.totalViews}
                                    </p>
                                </div>
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                                    <TrendingUp className="h-6 w-6 text-secondary"/>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Tabs defaultValue="offers" className="space-y-6">
                        <TabsList className="bg-muted">
                            <TabsTrigger value="offers">Mes offres</TabsTrigger>
                            <TabsTrigger value="applicants">Candidatures</TabsTrigger>
                        </TabsList>

                        {/* Mes offres */}
                        <TabsContent value="offers" className="space-y-4">
                            {myOffers.map((offer: any) => (<Card
                                    key={offer.id}
                                    className="border-border/50 bg-card p-6 shadow-sm"
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-3">
                                                <h3 className="text-xl font-semibold text-foreground">
                                                    {offer.title}
                                                </h3>
                                                <Badge
                                                    variant={offer.status === "active" ? "default" : "secondary"}
                                                    className={offer.status === "active" ? "bg-green-500/10 text-green-700" : ""}
                                                >
                                                    {offer.status === "active" ? "Active" : "Fermée"}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4"/>
                                                    <span>
                            {offer.applicants} candidature
                                                        {offer.applicants > 1 ? "s" : ""}
                          </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="h-4 w-4"/>
                                                    <span>{offer.views} vues</span>
                                                </div>
                                                <span>Publié {offer.postedAt}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Link href={`/jobs/${offer.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="mr-2 h-4 w-4"/>
                                                    Voir
                                                </Button>
                                            </Link>
                                            <Button variant="outline" size="sm">
                                                <Edit className="mr-2 h-4 w-4"/>
                                                Modifier
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:bg-destructive/10 bg-transparent"
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>))}
                            {myOffers.length === 0 && (<p className="text-sm text-muted-foreground">
                                    Vous n&apos;avez pas encore publié d&apos;offres.
                                </p>)}
                        </TabsContent>

                        {/* Candidatures */}
                        <TabsContent value="applicants" className="space-y-4">
                            {recentApplicants.map((applicant: any) => (<Card
                                    key={applicant.id}
                                    className="border-border/50 bg-card p-6 shadow-sm"
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-3">
                                                <h3 className="text-lg font-semibold text-foreground">
                                                    {applicant.name}
                                                </h3>
                                                <Badge
                                                    variant={applicant.status === "new" ? "default" : "secondary"}
                                                    className={applicant.status === "new" ? "bg-blue-500/10 text-blue-700" : ""}
                                                >
                                                    {applicant.status === "new" ? "Nouveau" : "Consulté"}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                <span>Poste: {applicant.position}</span>
                                                <span>
                          Candidature envoyée {applicant.appliedAt}
                        </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/employers/candidate/${applicant.id}`)}
                                            >
                                                Voir le profil
                                            </Button>

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                                        onClick={() => setCurrentCandidate({
                                                            id: applicant.id,
                                                            name: applicant.name,
                                                            position: applicant.position,
                                                        })}
                                                    >
                                                        Contacter
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Contacter {currentCandidate?.name ?? "le candidat"}
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Envoyez un message à propos du poste{" "}
                                                            {currentCandidate?.position}.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="mt-4">
                                                        <Textarea
                                                            placeholder="Écrivez votre message..."
                                                            value={message}
                                                            onChange={(e) => setMessage(e.target.value)}
                                                            rows={5}
                                                        />
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            onClick={() => {
                                                                if (!currentCandidate || !message.trim()) {
                                                                    return;
                                                                }
                                                                contactMutation.mutate({
                                                                    candidateId: currentCandidate.id, message,
                                                                });
                                                            }}
                                                            disabled={contactMutation.isPending}
                                                        >
                                                            Envoyer
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </Card>))}
                            {recentApplicants.length === 0 && (<p className="text-sm text-muted-foreground">
                                    Vous n&apos;avez pas encore de candidatures.
                                </p>)}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>);
}
