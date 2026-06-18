import React from "react";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import AdminSidebarLayout from "@/components/layout/admin-sidebar-layout";
import Link from "next/link";
import { ArrowLeft, FileText, User, Tag, Calendar, Download } from "lucide-react";
import NoteReviewActions from "@/components/admin/note-review-actions";

interface Params {
  id: string;
}

export default async function AdminNoteReviewPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const noteId = parseInt(id, 10);

  if (isNaN(noteId)) {
    notFound();
  }

  const { user, profile } = await requireAdmin();
  const supabase = await createServerSupabaseClient();

  // Fetch note details
  const { data: note, error } = await supabase
    .from("notes")
    .select("*, profiles:profiles!notes_user_id_fkey(name), note_categories_junction(categories(id, name)), courses(name), semesters(name)")
    .eq("id", noteId)
    .single();

  if (error || !note) {
    notFound();
  }

  // Create signed URL for PDF preview
  let signedUrl = "";
  try {
    const { data: signData } = await supabase.storage
      .from("notes-files")
      .createSignedUrl(note.file_path, 3600); // 1 hour expiry
    signedUrl = signData?.signedUrl || "";
  } catch (err) {
    console.error("Error creating signed URL for note preview:", err);
  }

  // Logout server action
  async function logout() {
    "use server";
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  const uploader = (note.profiles as { name: string } | null)?.name || "Mahasiswa";
  const course = (note.courses as { name: string } | null)?.name || "Lainnya";
  const semester = (note.semesters as { name: string } | null)?.name || "-";

  // Get categories from junction
  const noteJunctions = note.note_categories_junction as any;
  const categoriesList = noteJunctions
    ? (Array.isArray(noteJunctions) ? noteJunctions : [noteJunctions])
        .map((nc: any) => nc.categories as { id: number; name: string } | null)
        .filter((c: any): c is { id: number; name: string } => !!c)
    : [];

  // Format file size
  const formatSize = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <AdminSidebarLayout
      profile={profile}
      userEmail={user.email || ""}
      logoutAction={logout}
    >
      <div className="space-y-6">
        {/* Back link */}
        <div>
          <Link
            href="/admin/notes"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-all font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Catatan
          </Link>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Document Preview (Left 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex flex-wrap gap-1.5">
                  {categoriesList.map((cat) => (
                    <span key={cat.id} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                      <Tag className="h-3.5 w-3.5" />
                      {cat.name}
                    </span>
                  ))}
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${
                  note.status === "approved"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : note.status === "rejected"
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                }`}>
                  {note.status === "approved" ? "Disetujui" : note.status === "rejected" ? "Ditolak" : "Pending"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">{note.title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {note.description || "Tidak ada deskripsi."}
              </p>
            </div>

            {/* Document Preview Card */}
            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
              <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-sm font-bold">Pratinjau File PDF</h2>
                </div>
                {signedUrl && (
                  <a
                    href={signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-xs font-bold text-foreground hover:bg-muted transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Unduh File
                  </a>
                )}
              </div>
              <div className="bg-muted/10 p-4 min-h-[600px] flex items-center justify-center relative">
                {signedUrl ? (
                  <iframe
                    src={`${signedUrl}#toolbar=0`}
                    className="w-full h-[650px] border-0 rounded-lg shadow-sm"
                    title={note.title}
                  />
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="font-bold text-sm">Gagal memuat pratinjau</p>
                    <p className="text-xs">Link pratinjau dokumen tidak dapat dibuat.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details & Actions (Right 1 Col) */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="bg-card border border-border shadow-sm rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Informasi Catatan
              </h3>
              <dl className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex justify-between items-start gap-2 border-b border-border/50 pb-2.5">
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Uploader
                  </dt>
                  <dd className="font-bold text-foreground truncate max-w-[150px]">{uploader}</dd>
                </div>
                <div className="flex justify-between items-start gap-2 border-b border-border/50 pb-2.5">
                  <dt className="text-muted-foreground">Mata Kuliah</dt>
                  <dd className="font-bold text-foreground text-right">{course}</dd>
                </div>
                <div className="flex justify-between items-start gap-2 border-b border-border/50 pb-2.5">
                  <dt className="text-muted-foreground">Semester</dt>
                  <dd className="font-bold text-foreground">{semester}</dd>
                </div>
                <div className="flex justify-between items-start gap-2 border-b border-border/50 pb-2.5">
                  <dt className="text-muted-foreground">Ukuran File</dt>
                  <dd className="font-bold text-foreground">{formatSize(note.file_size)}</dd>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Tanggal Upload
                  </dt>
                  <dd className="font-bold text-foreground">
                    {new Date(note.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Verification action panel */}
            <div className="bg-card border border-border shadow-sm rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Verifikasi Dokumen
              </h3>
              <NoteReviewActions
                noteId={note.id}
                currentStatus={note.status}
                initialRejectionReason={note.rejection_reason}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
