import React from "react";
import { requireUser } from "@/lib/auth/require-user";
import TopupForm from "@/components/forms/topup-form";

export default async function TopupPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
          Top Up Koin Baru
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Ajukan permohonan isi ulang saldo koin Anda dengan mentransfer pembayaran secara manual dan mengunggah struk transfer.
        </p>
      </div>

      <TopupForm userId={user.id} />
    </div>
  );
}
