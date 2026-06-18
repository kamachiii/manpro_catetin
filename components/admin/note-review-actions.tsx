"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { approveNoteAction, rejectNoteAction } from "@/lib/actions/admin";
import { Check, X, AlertCircle, Loader2 } from "lucide-react";

interface NoteReviewActionsProps {
  noteId: number;
  currentStatus: string;
  initialRejectionReason?: string | null;
}

export default function NoteReviewActions({
  noteId,
  currentStatus,
  initialRejectionReason,
}: NoteReviewActionsProps) {
  const router = useRouter();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState(initialRejectionReason || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleApprove = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await approveNoteAction(noteId);
      if (res.success) {
        setSuccessMsg(res.message || "Catatan berhasil disetujui!");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Gagal menyetujui catatan.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan server saat menyetujui catatan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!reason.trim()) {
      setErrorMsg("Alasan penolakan wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await rejectNoteAction(noteId, reason);
      if (res.success) {
        setSuccessMsg("Catatan berhasil ditolak.");
        setShowRejectForm(false);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Gagal menolak catatan.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan server saat menolak catatan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStatus !== "pending") {
    return (
      <div className="bg-muted/40 border border-border rounded-xl p-4 text-xs sm:text-sm text-center">
        <p className="font-semibold text-muted-foreground">
          Catatan ini telah diproses dengan status:{" "}
          <span className={`font-extrabold uppercase ${
            currentStatus === "approved" ? "text-emerald-600" : "text-rose-600"
          }`}>
            {currentStatus === "approved" ? "Disetujui" : "Ditolak"}
          </span>
        </p>
        {currentStatus === "rejected" && initialRejectionReason && (
          <p className="mt-2 text-rose-600 text-left bg-rose-50/50 p-3 border border-rose-100 rounded-lg font-mono">
            <strong>Alasan Penolakan:</strong> {initialRejectionReason}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-600">
          <Check className="h-5 w-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-sm text-rose-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!showRejectForm ? (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="mr-1.5 h-4 w-4" />
                Setujui Catatan
              </>
            )}
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 font-semibold text-sm shadow hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <X className="mr-1.5 h-4 w-4" />
            Tolak Catatan
          </button>
        </div>
      ) : (
        <form onSubmit={handleRejectSubmit} className="space-y-4 bg-rose-500/5 border border-rose-500/15 rounded-xl p-4">
          <div>
            <label htmlFor="reject-reason" className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-1">
              Alasan Penolakan <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="reject-reason"
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Dokumen tidak terbaca, materi tidak lengkap, atau file rusak..."
              className="block w-full px-3 py-2 border border-rose-200 rounded-lg bg-card text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all resize-y"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowRejectForm(false)}
              disabled={isSubmitting}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-8 items-center justify-center rounded-lg bg-rose-600 px-3 text-xs font-bold text-white shadow hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Kirim & Tolak"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
