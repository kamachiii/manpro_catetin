import React from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebarLayout from "@/components/layout/admin-sidebar-layout";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import TopupActions from "@/components/admin/topup-actions";

interface SearchParams {
  status?: string;
}

export default async function AdminTopupsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { user, profile } = await requireAdmin();
  const { status } = await searchParams;

  const currentStatus = status || "all";
  const supabase = await createServerSupabaseClient();

  // Query topups
  let query = supabase
    .from("topups")
    .select("id, amount, coin_amount, payment_method, proof_image, status, admin_note, created_at, profiles:profiles!topups_user_id_fkey(name)");

  if (currentStatus !== "all") {
    // map tab value to database value
    const dbStatus = currentStatus === "success" ? "success" : currentStatus === "rejected" ? "rejected" : "pending";
    query = query.eq("status", dbStatus);
  }

  const { data: topups, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching topups:", error);
  }

  // Generate signed URLs for private receipt images in parallel
  const topupsWithSignedUrls = await Promise.all(
    (topups || []).map(async (topup) => {
      let signedUrl = "";
      if (topup.proof_image) {
        try {
          const { data: signData } = await supabase.storage
            .from("topup-proofs")
            .createSignedUrl(topup.proof_image, 3600); // 1 hour expiry
          signedUrl = signData?.signedUrl || "";
        } catch (err) {
          console.error("Error creating signed URL for proof:", err);
        }
      }
      return {
        ...topup,
        signedUrl,
      };
    })
  );

  // Logout server action
  async function logout() {
    "use server";
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  const tabs = [
    { label: "Semua", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Sukses", value: "success" },
    { label: "Ditolak", value: "rejected" },
  ];

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "transfer_bank":
        return "Transfer Bank";
      case "qris":
        return "QRIS";
      case "ewallet":
        return "E-Wallet";
      default:
        return method;
    }
  };

  return (
    <AdminSidebarLayout
      profile={profile}
      userEmail={user.email || ""}
      logoutAction={logout}
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Verifikasi Top Up Koin
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Periksa bukti pembayaran transfer manual dari pengguna dan setujui penambahan saldo koin mereka.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-border gap-2">
          {tabs.map((tab) => {
            const isActive = currentStatus === tab.value;
            return (
              <Link
                key={tab.value}
                href={tab.value === "all" ? "/admin/topups" : `/admin/topups?status=${tab.value}`}
                className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all -mb-px ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Topups Table */}
        <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
          {topupsWithSignedUrls.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Pengguna</th>
                    <th className="p-4">Nominal</th>
                    <th className="p-4">Jumlah Koin</th>
                    <th className="p-4">Metode</th>
                    <th className="p-4">Tanggal Diajukan</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4">Verifikasi & Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topupsWithSignedUrls.map((topup) => {
                    const uploaderName = (topup.profiles as unknown as { name: string } | null)?.name || "Mahasiswa";

                    return (
                      <tr key={topup.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 font-bold text-foreground">{uploaderName}</td>
                        <td className="p-4 text-foreground font-semibold">
                          Rp {topup.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="p-4 font-extrabold text-foreground">
                          {topup.coin_amount} Koin
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {getPaymentMethodLabel(topup.payment_method)}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(topup.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            topup.status === "success"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : topup.status === "rejected"
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          }`}>
                            {topup.status === "success"
                              ? "Sukses"
                              : topup.status === "rejected"
                              ? "Ditolak"
                              : "Pending"}
                          </span>
                        </td>
                        <td className="p-4">
                          <TopupActions
                            topupId={topup.id}
                            signedProofUrl={topup.signedUrl}
                            status={topup.status}
                            adminNote={topup.admin_note}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground space-y-2">
              <CreditCard className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="font-bold text-sm text-foreground">Tidak ada permintaan top up</p>
              <p className="text-xs">Antrean pengajuan top up koin untuk status ini kosong.</p>
            </div>
          )}
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
