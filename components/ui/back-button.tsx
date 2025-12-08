"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function BackButton({
                               fallback = "/jobs",
                               className = "",
                           }: {
    fallback?: string;
    className?: string;
}) {
    const router = useRouter();

    function handleBack() {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else {
            router.push(fallback);
        }
    }

    return (
        <button
            onClick={handleBack}
            className={`inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary ${className}`}
        >
            <ArrowLeft className="h-4 w-4" />
            Retour
        </button>
    );
}
