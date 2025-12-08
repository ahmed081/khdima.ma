"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function GlobalToast() {
    const toast = useSelector((s: RootState) => s.toast);

    if (!toast.message) return null;

    return (
        <div
            className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white z-50 ${
                toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
        >
            {toast.message}
        </div>
    );
}
