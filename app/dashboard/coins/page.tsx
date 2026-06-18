import React from "react";
import { requireUser } from "@/lib/auth/require-user";
import { getUserProfile } from "@/lib/auth/get-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Coins, Calendar, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";

export default async function CoinTransactionsPage() {
  const user = await requireUser();
  const profile = await getUserProfile(user.id);
  const supabase = await createServerSupabaseClient();

  // Fetch complete coin transaction log for the user
  const { data: transactions, error } = await supabase
    .from("coin_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching coin transactions:", error);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTxTypeBadge = (type: string) => {
    switch (type) {
      case "topup":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            Top Up
          </span>
        );
      case "upload_reward":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
            Reward Upload
          </span>
        );
      case "download":
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            Unduhan
          </span>
        );
      case "admin_adjustment":
      default:
        return (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
            Penyesuaian
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Riwayat Transaksi Koin
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Catatan detail mengenai perubahan saldo koin Anda dari aktivitas top up, unduhan, dan reward.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-2 text-amber-600 font-extrabold text-sm flex-shrink-0 self-start sm:self-auto">
          <Coins className="h-5 w-5" />
          <span>Saldo: {profile?.coin_balance ?? 0} Koin</span>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
        {transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-bold">
                  <th className="p-4">Deskripsi Transaksi</th>
                  <th className="p-4">Tipe</th>
                  <th className="p-4 text-right">Jumlah</th>
                  <th className="p-4 text-right">Sebelumnya</th>
                  <th className="p-4 text-right">Setelahnya</th>
                  <th className="p-4">Tanggal & Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {transactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  const amountColor = isPositive ? "text-emerald-600 font-extrabold" : "text-rose-600 font-extrabold";
                  const amountPrefix = isPositive ? "+" : "";

                  return (
                    <tr key={tx.id} className="hover:bg-muted/10 transition-all">
                      <td className="p-4 font-semibold text-foreground flex items-center gap-2">
                        {isPositive ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-rose-500 flex-shrink-0" />
                        )}
                        <span className="truncate max-w-[200px] sm:max-w-xs">{tx.description}</span>
                      </td>
                      <td className="p-4">{getTxTypeBadge(tx.type)}</td>
                      <td className={`p-4 text-right ${amountColor}`}>
                        {amountPrefix}
                        {tx.amount}
                      </td>
                      <td className="p-4 text-right text-muted-foreground">{tx.balance_before}</td>
                      <td className="p-4 text-right font-bold text-foreground">{tx.balance_after}</td>
                      <td className="p-4 text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(tx.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-muted-foreground">
            <Info className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-bold text-foreground">Belum ada riwayat transaksi</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
              Aktivitas kredit atau debit saldo koin Anda akan tercatat di tabel ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
