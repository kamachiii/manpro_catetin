import React from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebarLayout from "@/components/layout/admin-sidebar-layout";
import Link from "next/link";
import { Eye, FileText } from "lucide-react";

interface SearchParams {
  status?: string;
}

export default async function AdminNotesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { user, profile } = await requireAdmin();
  const { status } = await searchParams;

  const currentStatus = status || "all";

  const supabase = await createServerSupabaseClient();

  // Query notes with relations
  let query = supabase
    .from("notes")
    .select("id, title, slug, status, coin_price, created_at, profiles:profiles!notes_user_id_fkey(name), note_categories_junction(categories(id, name)), courses(name), semesters(name)");

  if (currentStatus !== "all") {
    query = query.eq("status", currentStatus);
  }

  const { data: notes, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin notes:", error);
  }

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
    { label: "Disetujui", value: "approved" },
    { label: "Ditolak", value: "rejected" },
  ];

  return (
    <AdminSidebarLayout
      profile={profile}
      userEmail={user.email || ""}
      logoutAction={logout}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Verifikasi Catatan Kuliah
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tinjau dokumen catatan yang diunggah mahasiswa dan berikan persetujuan penerbitan.
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-border gap-2">
          {tabs.map((tab) => {
            const isActive = currentStatus === tab.value;
            return (
              <Link
                key={tab.value}
                href={tab.value === "all" ? "/admin/notes" : `/admin/notes?status=${tab.value}`}
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

        {/* Notes Table */}
        <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
          {notes && notes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Judul & Mata Kuliah</th>
                    <th className="p-4">Kategori & Semester</th>
                    <th className="p-4">Diunggah Oleh</th>
                    <th className="p-4 text-center">Harga</th>
                    <th className="p-4">Tanggal Unggah</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {notes.map((note) => {
                    const uploaderName = (note.profiles as unknown as { name: string } | null)?.name || "Mahasiswa";
                    const noteJunctions = note.note_categories_junction as any;
                    const categoriesList = noteJunctions
                      ? (Array.isArray(noteJunctions) ? noteJunctions : [noteJunctions])
                          .map((nc: any) => nc.categories as { id: number; name: string } | null)
                          .filter((c: any): c is { id: number; name: string } => !!c)
                      : [];
                    const categoryName = categoriesList.map(c => c.name).join(", ") || "Umum";
                    const courseName = (note.courses as unknown as { name: string } | null)?.name || "Umum";
                    const semesterName = (note.semesters as unknown as { name: string } | null)?.name || "-";

                    return (
                      <tr key={note.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-foreground line-clamp-1 max-w-[200px] sm:max-w-xs">
                            {note.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{courseName}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-foreground">{categoryName}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{semesterName}</div>
                        </td>
                        <td className="p-4 text-muted-foreground">{uploaderName}</td>
                        <td className="p-4 text-center font-bold text-foreground">
                          {note.coin_price} Koin
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(note.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            note.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : note.status === "rejected"
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          }`}>
                            {note.status === "approved"
                              ? "Disetujui"
                              : note.status === "rejected"
                              ? "Ditolak"
                              : "Pending"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <Link
                            href={`/admin/notes/${note.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
                            title="Tinjau Catatan"
                          >
                            <Eye className="h-4 w-4" />
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
              <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="font-bold text-sm text-foreground">Tidak ada catatan ditemukan</p>
              <p className="text-xs">Catatan dengan kriteria status ini kosong atau belum diunggah.</p>
            </div>
          )}
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
