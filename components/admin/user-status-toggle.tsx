"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleUserStatusAction } from "@/lib/actions/admin";
import { Check, X, Loader2 } from "lucide-react";

interface UserStatusToggleProps {
  userId: string;
  isActive: boolean;
}

export default function UserStatusToggle({
  userId,
  isActive,
}: UserStatusToggleProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggle = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await toggleUserStatusAction(userId, !isActive);
      if (res.success) {
        router.refresh();
      } else {
        setErrorMsg(res.error || "Gagal mengubah status.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {errorMsg && <span className="text-[10px] text-rose-600 font-semibold">{errorMsg}</span>}
      <button
        onClick={handleToggle}
        disabled={isSubmitting}
        className={`inline-flex h-8 items-center justify-center gap-1 rounded-xl px-3.5 text-xs font-bold border transition-all cursor-pointer ${
          isActive
            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
            : "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20"
        }`}
      >
        {isSubmitting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isActive ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Aktif
          </>
        ) : (
          <>
            <X className="h-3.5 w-3.5" />
            Nonaktif
          </>
        )}
      </button>
    </div>
  );
}
