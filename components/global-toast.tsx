"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { CheckCircle, XCircle } from "lucide-react";

export default function GlobalToast() {
  const toast = useSelector((s: RootState) => s.toast);

  if (!toast.message) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-medium max-w-sm ${
        isSuccess ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {isSuccess
        ? <CheckCircle className="h-5 w-5 flex-shrink-0" />
        : <XCircle     className="h-5 w-5 flex-shrink-0" />
      }
      <span>{toast.message}</span>
    </div>
  );
}
