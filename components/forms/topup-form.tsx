"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { submitTopupRequest } from "@/lib/actions/topup";
import { CreditCard, QrCode, Smartphone, FileImage, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

interface TopupFormProps {
  userId: string;
}

export default function TopupForm({ userId }: TopupFormProps) {
  const router = useRouter();

  // Package Options
  const packages = [
    { coins: 10, price: 10000, label: "Paket Pemula" },
    { coins: 25, price: 25000, label: "Paket Pelajar" },
    { coins: 50, price: 50000, label: "Paket Rajin" },
    { coins: 100, price: 100000, label: "Paket Kebut Semalam" },
  ];

  // Payment Methods
  const paymentMethods = [
    { id: "transfer_bank", name: "Transfer Bank", icon: CreditCard, detail: "Mandiri VA: 123-456-789-0" },
    { id: "qris", name: "QRIS / QR Code", icon: QrCode, detail: "Scan QR Code BCM-Store" },
    { id: "ewallet", name: "E-Wallet (Dana/OVO/GoPay)", icon: Smartphone, detail: "Kirim ke: 0812-3456-7890" },
  ];

  // States
  const [selectedPackage, setSelectedPackage] = useState(packages[1]); // Default 25 coins
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]); // Default Transfer Bank
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const files = e.target.files;
    if (!files || files.length === 0) {
      setSelectedFile(null);
      return;
    }

    const file = files[0];

    // Image only validation
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Bukti transfer harus berupa file gambar (PNG, JPG, JPEG)");
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    // Size limit 5MB
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMsg("Ukuran gambar tidak boleh melebihi 5MB");
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedFile) {
      setErrorMsg("Silakan unggah bukti transfer pembayaran Anda");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(15);

    try {
      // 1. Upload proof image to Supabase private storage 'topup-proofs'
      // Path format: proofs/{user_id}/{timestamp}-{filename}
      const cleanFileName = selectedFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const storagePath = `proofs/${userId}/${Date.now()}-${cleanFileName}`;

      setUploadProgress(45);

      const { error: uploadError } = await supabase.storage
        .from("topup-proofs")
        .upload(storagePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(75);

      // 2. Call Server Action to store top-up metadata in topups table
      const res = await submitTopupRequest({
        amount: selectedPackage.price,
        coinAmount: selectedPackage.coins,
        paymentMethod: selectedMethod.id,
        proofImage: storagePath,
      });

      setUploadProgress(100);

      if (res.success) {
        setSuccessMsg("Pengajuan top up berhasil dikirim! Saldo koin akan bertambah setelah diverifikasi admin.");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 2000);
      } else {
        // Rollback: try to clean up uploaded receipt if DB insertion failed
        await supabase.storage.from("topup-proofs").remove([storagePath]);
        setErrorMsg(res.error || "Gagal mengirim pengajuan top up.");
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      console.error("Top-up request error:", err);
      setErrorMsg("Terjadi kesalahan saat memproses top up.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden font-sans">
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* Messages */}
        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-600">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-sm text-rose-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Choose Coin Package */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Langkah 1: Pilih Paket Koin
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <button
                key={pkg.coins}
                type="button"
                onClick={() => setSelectedPackage(pkg)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left cursor-pointer ${
                  selectedPackage.coins === pkg.coins
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted/10 text-foreground"
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    {pkg.label}
                  </p>
                  <p className="text-lg font-extrabold mt-0.5">{pkg.coins} Koin</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Harga</p>
                  <p className="text-sm font-bold">Rp {pkg.price.toLocaleString("id-ID")}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Payment Method */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Langkah 2: Pilih Metode Pembayaran
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {paymentMethods.map((method) => {
              const IconComp = method.icon;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method)}
                  className={`flex flex-col items-center p-4 rounded-xl border gap-2 text-center transition-all cursor-pointer ${
                    selectedMethod.id === method.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-muted/10 text-foreground"
                  }`}
                >
                  <IconComp className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-bold">{method.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Detail Instruction */}
        <div className="bg-muted/30 border border-border/80 rounded-xl p-4 space-y-2 text-xs">
          <p className="font-bold text-foreground">Instruksi Pembayaran:</p>
          <p className="text-muted-foreground">
            Silakan kirim pembayaran sebesar{" "}
            <span className="font-extrabold text-foreground">
              Rp {selectedPackage.price.toLocaleString("id-ID")}
            </span>{" "}
            melalui <span className="font-bold text-foreground">{selectedMethod.name}</span>:
          </p>
          <div className="bg-card border border-border/50 rounded-lg p-3 text-center font-mono text-sm font-bold text-primary select-all">
            {selectedMethod.detail}
          </div>
        </div>

        {/* Step 3: Upload Proof */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Langkah 3: Unggah Bukti Transfer
          </label>
          <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center bg-muted/20 transition-all">
            <FileImage className="h-10 w-10 text-muted-foreground/50 mb-3" />
            {selectedFile ? (
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-foreground truncate max-w-[250px] sm:max-w-md">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <label
                  htmlFor="topup-proof-input"
                  className="inline-block text-xs font-bold text-primary hover:underline mt-2 cursor-pointer"
                >
                  Ganti Gambar Bukti
                </label>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Pilih atau seret gambar struk pembayaran Anda
                </p>
                <p className="text-xs text-muted-foreground">
                  Hanya menerima gambar (PNG, JPG, JPEG). Maksimum 5MB.
                </p>
                <label
                  htmlFor="topup-proof-input"
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer transition-all mt-2"
                >
                  Pilih File Bukti
                </label>
              </div>
            )}
            <input
              id="topup-proof-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isSubmitting}
              className="hidden"
            />
          </div>
        </div>

        {/* Progress bar */}
        {isSubmitting && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground font-bold">
              <span>Mengunggah berkas pengajuan...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengirim Pengajuan...
              </>
            ) : (
              <>
                Kirim Pengajuan Top Up
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
