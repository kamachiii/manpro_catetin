import React from "react";
import { requireUser } from "@/lib/auth/require-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import RedownloadButton from "@/components/notes/redownload-button";
import { Download, Calendar, Tag, BookOpen, Layers } from "lucide-react";
import Link from "next/link";

export default async function DownloadsPage() {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  // Fetch download history
  const { data: downloads, error } = await supabase
    .from("note_downloads")
    .select("*, notes(id, title, coin_price, slug, categories(name), courses(name), semesters(name))")
    .eq("user_id", user.id)
    .order("downloaded_at", { ascending: false });

  if (error) {
    console.error("Error querying download history:", error);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
          Riwayat Unduhan
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Daftar seluruh catatan kuliah yang sudah pernah Anda beli dan unduh. Anda tidak akan dikenakan biaya koin untuk mengunduh ulang catatan yang sama.
        </p>
      </div>

      {/* Downloads List */}
      <div className="space-y-4">
        {downloads && downloads.length > 0 ? (
          downloads.map((item) => {
            const noteObj = item.notes as {
              id: number;
              title: string;
              coin_price: number;
              slug: string;
              categories: { name: string } | null;
              courses: { name: string } | null;
              semesters: { name: string } | null;
            } | null;

            if (!noteObj) return null;

            const category = noteObj.categories?.name || "Umum";
            const course = noteObj.courses?.name || "Umum";
            const semester = noteObj.semesters?.name || "-";

            return (
              <div
                key={item.id}
                className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <Link
                    href={`/notes/${noteObj.slug}`}
                    className="text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                  >
                    {noteObj.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {category}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {semester}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Unduh: {formatDate(item.downloaded_at)}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end gap-2 flex-shrink-0 self-stretch sm:self-auto justify-between sm:justify-start border-t sm:border-t-0 border-border pt-3 sm:pt-0">
                  <span className="text-[10px] bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                    Beli: {item.coin_spent} Koin
                  </span>
                  <RedownloadButton noteId={noteObj.id} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground bg-card">
            <Download className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Riwayat Unduhan Kosong</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              Anda belum pernah mengunduh catatan kuliah apa pun. Temukan materi belajar yang Anda butuhkan sekarang!
            </p>
            <Link
              href="/notes"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all"
            >
              Jelajahi Catatan Kuliah
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
