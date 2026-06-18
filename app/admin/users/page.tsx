import React from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebarLayout from "@/components/layout/admin-sidebar-layout";
import Link from "next/link";
import { User, Coins, Calendar, GraduationCap, X } from "lucide-react";
import UserStatusToggle from "@/components/admin/user-status-toggle";

interface SearchParams {
  q?: string;
  userId?: string;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { user, profile } = await requireAdmin();
  const { q, userId } = await searchParams;

  const supabase = await createServerSupabaseClient();

  // Query users
  let query = supabase
    .from("profiles")
    .select("*, semesters(name)");

  if (q && q.trim() !== "") {
    query = query.or(`name.ilike.%${q}%,nim.ilike.%${q}%,major.ilike.%${q}%`);
  }

  const { data: users, error } = await query.order("name", { ascending: true });

  if (error) {
    console.error("Error fetching profiles:", error);
  }

  // If a specific userId is selected, fetch their full profile details
  let selectedProfile = null;
  if (userId) {
    const { data: pData } = await supabase
      .from("profiles")
      .select("*, semesters(name)")
      .eq("id", userId)
      .single();
    selectedProfile = pData;
  }

  // Logout server action
  async function logout() {
    "use server";
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
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
            Kelola Pengguna
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Cari pengguna, lihat detail profil akademik, serta aktifkan atau nonaktifkan akun mahasiswa.
          </p>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-card border border-border p-4 rounded-xl">
          <form method="GET" action="/admin/users" className="flex flex-1 max-w-md gap-2">
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="Cari nama, NIM, atau jurusan..."
              className="block w-full px-3.5 py-2 border border-border rounded-xl bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            {userId && <input type="hidden" name="userId" value={userId} />}
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
            >
              Cari
            </button>
            {q && (
              <Link
                href={userId ? `/admin/users?userId=${userId}` : "/admin/users"}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-muted transition-all"
              >
                Reset
              </Link>
            )}
          </form>
        </div>

        {/* Master Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Users List (Left Column) */}
          <div className="lg:col-span-2 bg-card border border-border shadow-sm rounded-xl overflow-hidden">
            {users && users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">Nama</th>
                      <th className="p-4">NIM & Jurusan</th>
                      <th className="p-4 text-center">Koin</th>
                      <th className="p-4 text-center">Status Akun</th>
                      <th className="p-4 text-center">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((u) => {
                      const isSelected = selectedProfile?.id === u.id;
                      return (
                        <tr
                          key={u.id}
                          className={`hover:bg-muted/10 transition-colors ${
                            isSelected ? "bg-primary/5 hover:bg-primary/5" : ""
                          }`}
                        >
                          <td className="p-4 font-bold text-foreground">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold overflow-hidden">
                                {u.avatar_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={u.avatar_url}
                                    alt={u.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span>{getInitials(u.name)}</span>
                                )}
                              </div>
                              <span className="truncate max-w-[150px]">{u.name}</span>
                              {u.role === "admin" && (
                                <span className="inline-flex px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase bg-red-500/10 text-red-600 border border-red-500/20">
                                  Admin
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-foreground">{u.nim || "-"}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {u.major || "-"}
                            </div>
                          </td>
                          <td className="p-4 text-center font-extrabold text-foreground">
                            {u.coin_balance}
                          </td>
                          <td className="p-4 text-center">
                            <UserStatusToggle userId={u.id} isActive={u.is_active} />
                          </td>
                          <td className="p-4 text-center">
                            <Link
                              href={`/admin/users?userId=${u.id}${q ? `&q=${q}` : ""}`}
                              className="inline-flex h-8 px-3 items-center justify-center rounded-xl border border-border bg-card text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
                            >
                              Lihat
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <User className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <p className="font-bold text-sm text-foreground">Pengguna tidak ditemukan</p>
                <p className="text-xs">Coba cari dengan kata kunci lain.</p>
              </div>
            )}
          </div>

          {/* User Details Panel (Right Column) */}
          <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
            {selectedProfile ? (
              <div className="p-5 space-y-6">
                <div className="flex justify-between items-start border-b border-border pb-4">
                  <h3 className="font-bold text-sm text-foreground">Profil Pengguna</h3>
                  <Link
                    href={q ? `/admin/users?q=${q}` : "/admin/users"}
                    className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="Tutup detail"
                  >
                    <X className="h-4 w-4" />
                  </Link>
                </div>

                {/* Avatar & Basic Info */}
                <div className="flex flex-col items-center text-center space-y-2 border-b border-border/50 pb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-xl font-bold overflow-hidden shadow-sm">
                    {selectedProfile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedProfile.avatar_url}
                        alt={selectedProfile.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(selectedProfile.name)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{selectedProfile.name}</h4>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                      {selectedProfile.role === "admin" ? "Administrator" : "Mahasiswa"}
                    </p>
                  </div>
                </div>

                {/* Detail List */}
                <dl className="space-y-3.5 text-xs sm:text-sm">
                  <div className="flex justify-between items-start gap-2 border-b border-border/50 pb-2">
                    <dt className="text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      NIM
                    </dt>
                    <dd className="font-bold text-foreground">{selectedProfile.nim || "-"}</dd>
                  </div>
                  <div className="flex justify-between items-start gap-2 border-b border-border/50 pb-2">
                    <dt className="text-muted-foreground">Jurusan</dt>
                    <dd className="font-bold text-foreground text-right">{selectedProfile.major || "-"}</dd>
                  </div>
                  <div className="flex justify-between items-start gap-2 border-b border-border/50 pb-2">
                    <dt className="text-muted-foreground">Semester</dt>
                    <dd className="font-bold text-foreground">
                      {(selectedProfile.semesters as { name: string } | null)?.name || "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between items-start gap-2 border-b border-border/50 pb-2">
                    <dt className="text-muted-foreground flex items-center gap-1">
                      <Coins className="h-4 w-4 text-amber-500" />
                      Saldo Koin
                    </dt>
                    <dd className="font-extrabold text-foreground">{selectedProfile.coin_balance} Koin</dd>
                  </div>
                  <div className="flex justify-between items-start gap-2 border-b border-border/50 pb-2">
                    <dt className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Terdaftar
                    </dt>
                    <dd className="font-bold text-foreground">
                      {new Date(selectedProfile.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <dt className="text-muted-foreground">Status Akun</dt>
                    <dd>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        selectedProfile.is_active
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      }`}>
                        {selectedProfile.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </dd>
                  </div>
                </dl>

                {/* Account Status Toggle in Detail Panel too */}
                <div className="bg-muted/30 border border-border/80 rounded-xl p-4 space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Ubah Status Keaktifan
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Menonaktifkan akun akan memblokir akses pengguna ke dashboard dan portal catatan.
                  </p>
                  <div className="flex justify-start">
                    <UserStatusToggle
                      userId={selectedProfile.id}
                      isActive={selectedProfile.is_active}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <User className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                <p className="font-bold text-sm text-foreground">Detail Profil</p>
                <p className="text-xs">Klik tombol &quot;Lihat&quot; pada tabel pengguna untuk memuat profil akademis lengkap di sini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
