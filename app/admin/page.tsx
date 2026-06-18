import React from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, FileText, Coins, Download, ArrowRight, Clock } from "lucide-react";
import AdminSidebarLayout from "@/components/layout/admin-sidebar-layout";
import Link from "next/link";

export default async function AdminPage() {
  const { user, profile } = await requireAdmin();
  const supabase = await createServerSupabaseClient();

  // 1. Fetch Stats Count
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: totalNotes } = await supabase
    .from("notes")
    .select("*", { count: "exact", head: true });

  const { count: pendingNotes } = await supabase
    .from("notes")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: pendingTopups } = await supabase
    .from("topups")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: totalDownloads } = await supabase
    .from("note_downloads")
    .select("*", { count: "exact", head: true });

  // 2. Fetch Recent Activities
  const { data: recentNotes } = await supabase
    .from("notes")
    .select("id, title, status, created_at, profiles:profiles!notes_user_id_fkey(name)")
    .order("created_at", { ascending: false })
    .limit(4);

  const { data: recentTopups } = await supabase
    .from("topups")
    .select("id, amount, coin_amount, status, created_at, profiles:profiles!topups_user_id_fkey(name)")
    .order("created_at", { ascending: false })
    .limit(4);

  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, name, nim, major, created_at")
    .order("created_at", { ascending: false })
    .limit(4);

  // Logout server action
  async function logout() {
    "use server";
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  // Format date helper
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminSidebarLayout
      profile={profile}
      userEmail={user.email || ""}
      logoutAction={logout}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-card border border-border shadow-sm rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Users className="h-40 w-40 text-primary" />
          </div>
          <div className="relative z-10 space-y-2 max-w-xl">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Dashboard Overview
            </h1>
            <p className="text-sm text-muted-foreground">
              Selamat datang, {profile.name}. Di sini Anda dapat memantau status platform, meninjau unggahan catatan mahasiswa, menyetujui pengajuan top up koin, dan mengelola status akun pengguna.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card: Total Users */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Total Pengguna
              </span>
              <p className="text-xl font-extrabold text-foreground">{totalUsers ?? 0}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Users className="h-5 w-5" />
            </div>
          </div>

          {/* Card: Total Notes */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Total Catatan
              </span>
              <p className="text-xl font-extrabold text-foreground">{totalNotes ?? 0}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>

          {/* Card: Pending Notes */}
          <Link href="/admin/notes" className="bg-card border border-border hover:border-amber-500/50 rounded-xl p-5 flex items-center justify-between transition-all group">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block group-hover:text-amber-600 transition-colors">
                Catatan Pending
              </span>
              <p className="text-xl font-extrabold text-foreground">{pendingNotes ?? 0}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <FileText className="h-5 w-5 animate-pulse" />
            </div>
          </Link>

          {/* Card: Pending Topups */}
          <Link href="/admin/topups" className="bg-card border border-border hover:border-emerald-500/50 rounded-xl p-5 flex items-center justify-between transition-all group">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block group-hover:text-emerald-600 transition-colors">
                Top Up Pending
              </span>
              <p className="text-xl font-extrabold text-foreground">{pendingTopups ?? 0}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <Coins className="h-5 w-5 animate-bounce" />
            </div>
          </Link>

          {/* Card: Total Downloads */}
          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Total Unduhan
              </span>
              <p className="text-xl font-extrabold text-foreground">{totalDownloads ?? 0}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
              <Download className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Queues Redirect Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-md font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Antrean Verifikasi Catatan
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Terdapat <span className="font-bold text-foreground">{pendingNotes ?? 0} catatan baru</span> yang memerlukan review dokumen sebelum dipublikasikan secara umum.
            </p>
            <Link
              href="/admin/notes"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
            >
              Lihat Antrean Catatan
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-md font-bold text-foreground flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              Antrean Verifikasi Top Up
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Terdapat <span className="font-bold text-foreground">{pendingTopups ?? 0} bukti transfer</span> pembayaran manual dari pengguna yang menunggu persetujuan kredit koin.
            </p>
            <Link
              href="/admin/topups"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
            >
              Lihat Antrean Top Up
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Activity Stream Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Uploads */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Catatan Masuk Terbaru
            </h3>
            {recentNotes && recentNotes.length > 0 ? (
              <div className="space-y-3">
                {recentNotes.map((note) => {
                  const uploader = (note.profiles as unknown as { name: string } | null)?.name || "Mahasiswa";
                  return (
                    <div key={note.id} className="flex justify-between items-start gap-3 text-xs border-b border-border/50 pb-2.5 last:border-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-foreground truncate">{note.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Oleh {uploader}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          note.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : note.status === "rejected"
                            ? "bg-rose-500/10 text-rose-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}>
                          {note.status === "approved" ? "Disetujui" : note.status === "rejected" ? "Ditolak" : "Pending"}
                        </span>
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {formatRelativeTime(note.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">Belum ada unggahan terbaru.</p>
            )}
          </div>

          {/* Recent Topup Requests */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              Permintaan Top Up Terbaru
            </h3>
            {recentTopups && recentTopups.length > 0 ? (
              <div className="space-y-3">
                {recentTopups.map((topup) => {
                  const userName = (topup.profiles as unknown as { name: string } | null)?.name || "Mahasiswa";
                  return (
                    <div key={topup.id} className="flex justify-between items-center gap-3 text-xs border-b border-border/50 pb-2.5 last:border-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-foreground">{userName}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Rp {topup.amount.toLocaleString("id-ID")} &rarr; {topup.coin_amount} Koin
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          topup.status === "success"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : topup.status === "rejected"
                            ? "bg-rose-500/10 text-rose-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}>
                          {topup.status === "success" ? "Sukses" : topup.status === "rejected" ? "Ditolak" : "Pending"}
                        </span>
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {formatRelativeTime(topup.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">Belum ada top up terbaru.</p>
            )}
          </div>

          {/* Recent Registrations */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              Registrasi Pengguna Baru
            </h3>
            {recentUsers && recentUsers.length > 0 ? (
              <div className="space-y-3">
                {recentUsers.map((u) => (
                  <div key={u.id} className="flex justify-between items-center gap-3 text-xs border-b border-border/50 pb-2.5 last:border-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground truncate">{u.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {u.major || "Jurusan belum diatur"} {u.nim ? `(${u.nim})` : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {formatRelativeTime(u.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">Belum ada registrasi baru.</p>
            )}
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
