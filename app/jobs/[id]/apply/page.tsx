import {prisma} from "@/lib/prisma";
import ApplyForm from "./ApplyForm";
import {notFound} from "next/navigation";

export default async function ApplyPage(props: { params: Promise<{ id: string }> }) {

    const {id} = await props.params
    const jobId = Number(id)
    if (isNaN(jobId)) {
        notFound();
    }

    const job = await prisma.job.findUnique({
        where: {id: jobId}, select: {title: true, employer: {select: {companyName: true}}},
    });

    if (!job) notFound();

    return (<div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">

            <h1 className="text-2xl font-bold">{job?.title}</h1>
            <p className="text-sm text-muted-foreground mb-6">
                Postuler chez {job?.employer?.companyName}
            </p>

            <ApplyForm jobId={jobId}/>
        </div>
    </div>);
}
