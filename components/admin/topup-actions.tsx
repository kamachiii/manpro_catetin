"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { approveTopupAction, rejectTopupAction } from "@/lib/actions/admin";
import { Check, X, FileImage, AlertCircle, Loader2 } from "lucide-react";

interface TopupActionsProps {
  topupId: number;
  signedProofUrl: string;
  status: string;
  adminNote?: string | null;
}

export default function TopupActions({
  topupId,
  signedProofUrl,
  status,
  adminNote,
}: TopupActionsProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState(adminNote || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleApprove = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await approveTopupAction(topupId);
      if (res.success) {
        setSuccessMsg("Top up berhasil disetujui!");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Gagal menyetujui top up.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan server saat memproses persetujuan.");
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
      const res = await rejectTopupAction(topupId, reason);
      if (res.success) {
        setSuccessMsg("Top up berhasil ditolak.");
        setShowRejectForm(false);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Gagal menolak top up.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan server saat memproses penolakan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      {successMsg && (
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 text-xs text-emerald-600">
          <Check className="h-4 w-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2 text-xs text-rose-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {signedProofUrl ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            <FileImage className="h-3.5 w-3.5" />
            Lihat Struk
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">Tidak ada bukti</span>
        )}

        {status === "pending" && !showRejectForm && (
          <>
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Setujui
                </>
              )}
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={isSubmitting}
              className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-600 shadow hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              Tolak
            </button>
          </>
        )}
      </div>

      {showRejectForm && (
        <form onSubmit={handleRejectSubmit} className="mt-2 space-y-2 bg-rose-500/5 border border-rose-500/15 rounded-lg p-3">
          <div>
            <label htmlFor={`reject-reason-${topupId}`} className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
              Alasan Penolakan Top Up <span className="text-rose-600">*</span>
            </label>
            <input
              id={`reject-reason-${topupId}`}
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Bukti palsu, dana tidak masuk, dll..."
              className="block w-full px-2.5 py-1.5 border border-rose-200 rounded-lg bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-all"
            />
          </div>
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setShowRejectForm(false)}
              disabled={isSubmitting}
              className="inline-flex h-7 items-center justify-center rounded-lg border border-border bg-card px-2.5 text-[10px] font-medium text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-7 items-center justify-center rounded-lg bg-rose-600 px-2.5 text-[10px] font-bold text-white shadow hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Tolak
            </button>
          </div>
        </form>
      )}

      {status === "rejected" && reason && (
        <p className="text-[11px] text-rose-600 bg-rose-50/50 p-2 border border-rose-100 rounded-lg font-medium mt-1">
          <strong>Alasan ditolak:</strong> {reason}
        </p>
      )}

      {/* Proof Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-card border border-border rounded-xl max-w-lg w-full p-4 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground">Struk Bukti Transfer Pembayaran</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-center bg-muted/20 border rounded-lg p-2 max-h-[450px] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={signedProofUrl}
                alt="Bukti Transfer"
                className="max-w-full max-h-[400px] object-contain rounded-md"
              />
            </div>
            <div className="flex justify-end border-t border-border pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
