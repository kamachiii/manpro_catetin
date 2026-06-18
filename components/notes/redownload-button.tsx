"use client";

import React, { useState } from "react";
import { Download, Loader2, AlertCircle } from "lucide-react";

interface RedownloadButtonProps {
  noteId: number;
}

export default function RedownloadButton({ noteId }: RedownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRedownload = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/notes/download?noteId=${noteId}`);
      const data = await res.json();

      if (res.ok && data.success) {
        // Trigger download
        window.open(data.downloadUrl, "_blank");
      } else {
        setErrorMsg(data.error || "Gagal memproses unduhan");
      }
    } catch (err: unknown) {
      console.error("Redownload fetch error:", err);
      setErrorMsg("Koneksi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5 font-sans">
      {errorMsg && (
        <span className="text-[10px] text-rose-600 font-medium flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {errorMsg}
        </span>
      )}
      <button
        onClick={handleRedownload}
        disabled={loading}
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        Unduh Ulang
      </button>
    </div>
  );
}
