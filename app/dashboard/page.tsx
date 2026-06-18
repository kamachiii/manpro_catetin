import React from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import { getUserProfile } from "@/lib/auth/get-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  Coins,
  Upload,
  Download,
  BookOpen,
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
  AlertCircle
} from "lucide-react";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getUserProfile(user.id);
  const supabase = await createServerSupabaseClient();

  // Fetch count of uploaded notes
  const { count: totalUploads, error: uploadsError } = await supabase
    .from("notes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (uploadsError) {
    console.error("Error counting uploaded notes:", uploadsError);
  }

  // Fetch count of downloaded notes
  const { count: totalDownloads, error: downloadsError } = await supabase
    .from("note_downloads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (downloadsError) {
    console.error("Error counting downloaded notes:", downloadsError);
  }

  // Fetch top 5 recent notes uploaded by the user
  const { data: recentNotes, error: recentNotesError } = await supabase
    .from("notes")
    .select("*, courses(name), semesters(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (recentNotesError) {
    console.error("Error fetching recent notes:", recentNotesError);
  }

  // Fetch top 5 recent coin transactions
  const { data: recentTransactions, error: transactionsError } = await supabase
    .from("coin_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (transactionsError) {
    console.error("Error fetching recent transactions:", transactionsError);
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Welcome */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <BookOpen className="h-40 w-40 text-primary" />
        </div>
        <div className="relative z-10 space-y-2 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <TrendingUp className="h-3 w-3" />
            Dashboard Mahasiswa
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Selamat Datang Kembali, {profile?.name}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Akses ringkasan kuliah, pantau status verifikasi berkas catatan Anda, dan perbarui profil akademis Anda dengan mudah di satu tempat.
          </p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Saldo Koin */}
        <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Saldo Koin
            </span>
            <p className="text-2xl font-extrabold text-foreground">{profile?.coin_balance ?? 0}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
            <Coins className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Total Upload */}
        <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Catatan Diunggah
            </span>
            <p className="text-2xl font-extrabold text-foreground">{totalUploads ?? 0}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Upload className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Total Download */}
        <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Catatan Diunduh
            </span>
            <p className="text-2xl font-extrabold text-foreground">{totalDownloads ?? 0}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
            <Download className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Grid Data Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Uploads Card */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Unggahan Terbaru
            </h3>
            <Link
              href="/dashboard/notes"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              Semua
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex-1">
            {recentNotes && recentNotes.length > 0 ? (
              <div className="divide-y divide-border/60">
                {recentNotes.map((note) => {
                  const course = (note.courses as { name: string } | null)?.name || "-";
                  const statusColors =
                    note.status === "approved"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : note.status === "rejected"
                      ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20";

                  return (
                    <div key={note.id} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-sm font-bold text-foreground truncate">{note.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{course}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors}`}>
                          {note.status === "approved"
                            ? "Disetujui"
                            : note.status === "rejected"
                            ? "Ditolak"
                            : "Menunggu"}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(note.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 bg-muted/20 border border-dashed border-border rounded-xl">
                <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-bold text-foreground">Belum ada unggahan</p>
                <p className="text-xs text-muted-foreground max-w-[200px] mt-1">
                  Mulai bagikan catatan kuliah Anda untuk mendapatkan koin.
                </p>
                <Link
                  href="/dashboard/upload"
                  className="mt-4 inline-flex h-8 items-center justify-center rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  Unggah Sekarang
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Coin Transactions Card */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              Aktivitas Koin Terbaru
            </h3>
            {/* Displaying static placeholder message since economy log page is Milestone 5 */}
            <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full border border-border/50">
              M4 Read-Only
            </span>
          </div>

          <div className="flex-1">
            {recentTransactions && recentTransactions.length > 0 ? (
              <div className="divide-y divide-border/60">
                {recentTransactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  const amtColor = isPositive ? "text-emerald-600" : "text-rose-600";
                  const amtPrefix = isPositive ? "+" : "";

                  return (
                    <div key={tx.id} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-sm font-bold text-foreground truncate">{tx.description}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                          {tx.type}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-sm font-extrabold ${amtColor}`}>
                          {amtPrefix}{tx.amount}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(tx.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 bg-muted/20 border border-dashed border-border rounded-xl">
                <AlertCircle className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-bold text-foreground">Belum ada aktivitas</p>
                <p className="text-xs text-muted-foreground max-w-[200px] mt-1">
                  Riwayat perubahan saldo koin Anda akan tampil di sini.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
