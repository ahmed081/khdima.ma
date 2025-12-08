import { getUserFromAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {CreateJobClient} from "@/app/employers/post-job/CreateJobClient";

export default async function CreateJobPage() {
    const user = await getUserFromAuth();

    if (!user) redirect("/login");
    if (user.role !== "EMPLOYER") redirect("/");

    return <CreateJobClient />;
}
