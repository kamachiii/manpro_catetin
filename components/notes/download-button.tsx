"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Download, ShieldAlert, LogIn, UserPlus, X, Loader2, AlertCircle, CheckCircle2, Coins } from "lucide-react";

interface DownloadButtonProps {
  isLoggedIn: boolean;
  noteId: number;
  coinPrice: number;
  userCoins: number;
  isOwner: boolean;
}

export default function DownloadButton({
  isLoggedIn,
  noteId,
  coinPrice,
  userCoins,
  isOwner,
}: DownloadButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [remainingCoins, setRemainingCoins] = useState<number | null>(null);

  const handleDownloadClick = async () => {
    setErrorMsg(null);

    if (!isLoggedIn) {
      setShowModal(true);
      return;
    }

    // If signed URL has already been generated in this session, trigger download immediately
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
      return;
    }

    // Check coins if not the owner
    const currentCoins = remainingCoins !== null ? remainingCoins : userCoins;
    if (currentCoins < coinPrice && !isOwner) {
      setErrorMsg(
        `Saldo koin tidak cukup. Saldo Anda: ${currentCoins} Koin, Harga: ${coinPrice} Koin. Silakan ajukan top up di dashboard.`
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/notes/download?noteId=${noteId}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setDownloadUrl(data.downloadUrl);
        setRemainingCoins(data.remainingCoins);
        // Open signed url in a new tab
        window.open(data.downloadUrl, "_blank");
      } else {
        setErrorMsg(data.error || "Gagal memproses transaksi unduhan.");
      }
    } catch (err: unknown) {
      console.error("Error fetching secure download:", err);
      setErrorMsg("Gagal menghubungi server untuk memproses unduhan.");
    } finally {
      setLoading(false);
    }
  };

  const displayedCoins = remainingCoins !== null ? remainingCoins : userCoins;

  return (
    <div className="space-y-4 font-sans">
      {/* Alert Banners */}
      {errorMsg && (
        <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-600 leading-relaxed">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {downloadUrl && (
        <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-600">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>Unduhan berhasil diproses! Jika file tidak terbuka otomatis, klik tombol unduh kembali.</span>
        </div>
      )}

      {/* Main Download Button */}
      <button
        onClick={handleDownloadClick}
        disabled={loading}
        className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-bold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Memproses Unduhan...
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            {isOwner ? "Unduh Gratis (Milik Anda)" : `Unduh Catatan (${coinPrice} Koin)`}
          </>
        )}
      </button>

      {/* Coin info indicator for logged-in users */}
      {isLoggedIn && (
        <div className="flex justify-between items-center bg-muted/30 border border-border/60 rounded-xl px-4 py-2.5 text-xs text-muted-foreground">
          <span className="font-semibold">Saldo Koin Anda:</span>
          <span className="flex items-center gap-1 font-bold text-foreground">
            <Coins className="h-3.5 w-3.5 text-amber-500" />
            {displayedCoins} Koin
          </span>
        </div>
      )}

      {/* Guest Login/Register Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-lg">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Akses Terbatas</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Hanya pengguna terdaftar yang dapat mengunduh file catatan kuliah. Silakan masuk ke akun
                Anda atau daftar terlebih dahulu.
              </p>

              <div className="flex flex-col w-full gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all"
                >
                  <LogIn className="h-4 w-4" />
                  Masuk Sekarang
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  Daftar Akun Baru
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
