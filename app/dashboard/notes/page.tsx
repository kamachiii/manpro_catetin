import React from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Upload,
  Coins
} from "lucide-react";

export default async function MyNotesPage() {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  // Query notes uploaded by the user
  const { data: notes, error } = await supabase
    .from("notes")
    .select("*, note_categories_junction(categories(id, name)), courses(name), semesters(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error querying personal notes:", error);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Disetujui
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <AlertCircle className="h-3.5 w-3.5" />
            Ditolak
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <HelpCircle className="h-3.5 w-3.5" />
            Menunggu Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Catatan Saya
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Daftar seluruh materi dan catatan yang Anda bagikan di platform.
          </p>
        </div>
        <Link
          href="/dashboard/upload"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all flex-shrink-0"
        >
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          Bagikan Catatan Baru
        </Link>
      </div>

      {/* Notes Listing Container */}
      <div className="space-y-4">
        {notes && notes.length > 0 ? (
          notes.map((note) => {
            const noteJunctions = note.note_categories_junction as any;
            const categoriesList = noteJunctions
              ? (Array.isArray(noteJunctions) ? noteJunctions : [noteJunctions])
                  .map((nc: any) => nc.categories as { id: number; name: string } | null)
                  .filter((c: any): c is { id: number; name: string } => !!c)
              : [];
            const category = categoriesList.map(c => c.name).join(", ") || "Umum";
            const course = (note.courses as { name: string } | null)?.name || "Umum";
            const semester = (note.semesters as { name: string } | null)?.name || "-";

            return (
              <div
                key={note.id}
                className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="text-base font-bold text-foreground line-clamp-2">
                      {note.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {note.description || "Tidak ada deskripsi."}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-[11px] text-muted-foreground font-semibold">
                      <span className="bg-muted px-2 py-0.5 rounded-md border border-border/50">
                        {category}
                      </span>
                      <span>{course}</span>
                      <span>•</span>
                      <span>{semester}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(note.created_at)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Coins className="h-3 w-3" />
                        {note.coin_price} Koin
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 self-start sm:self-auto">
                    {getStatusBadge(note.status)}
                  </div>
                </div>

                {/* Rejection Alert Box */}
                {note.status === "rejected" && note.rejection_reason && (
                  <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-xs text-rose-700 dark:text-rose-400">
                    <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">Alasan Penolakan:</p>
                      <p className="leading-relaxed font-medium">{note.rejection_reason}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground bg-card">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Catatan Anda Kosong</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              Anda belum pernah mengunggah berkas catatan kuliah. Mulai bagikan catatan pertama Anda sekarang!
            </p>
            <Link
              href="/dashboard/upload"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all"
            >
              Unggah Catatan Pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
