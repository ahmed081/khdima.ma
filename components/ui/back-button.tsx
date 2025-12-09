"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ label = "Retour" }: { label?: string }) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
            <ArrowLeft className="h-4 w-4" />
            {label}
        </button>
    );
}
