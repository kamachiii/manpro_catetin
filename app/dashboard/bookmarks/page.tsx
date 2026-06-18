import React from "react";
import { requireUser } from "@/lib/auth/require-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardSidebarLayout from "@/components/layout/dashboard-sidebar-layout";
import Link from "next/link";
import { Book, Calendar, User, Tag, ArrowRight, Bookmark } from "lucide-react";

export default async function BookmarksPage() {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  // Fetch student profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch bookmarked notes
  const { data: bookmarks, error } = await supabase
    .from("note_bookmarks")
    .select(`
      id,
      notes (
        id,
        title,
        slug,
        description,
        coin_price,
        download_count,
        user_id,
        created_at,
        profiles:profiles!notes_user_id_fkey (name),
        courses (name),
        semesters (name),
        note_categories_junction (
          categories (id, name)
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookmarks:", error);
  }

  // Extract notes safely and filter out duplicates by ID
  const bookmarkedNotes = bookmarks
    ? Array.from(
        new Map(
          bookmarks
            .map((b) => b.notes as any)
            .filter((n): n is Exclude<typeof n, null> => !!n)
            .map((n) => [n.id, n])
        ).values()
      )
    : [];

  // Logout server action
  async function logout() {
    "use server";
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <DashboardSidebarLayout
      profile={profile}
      userEmail={user.email || ""}
      logoutAction={logout}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Catatan Kuliah Favorit Saya
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Daftar seluruh catatan kuliah yang telah Anda simpan ke favorit.
          </p>
        </div>

        {bookmarkedNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookmarkedNotes.map((note: any) => {
              const uploader = note.profiles?.name || "Mahasiswa";
              const course = note.courses?.name || "Lainnya";
              const semester = note.semesters?.name || "-";

              // Get categories from junction
              const noteJunctions = note.note_categories_junction;
              const categoriesList = noteJunctions
                ? (Array.isArray(noteJunctions) ? noteJunctions : [noteJunctions])
                    .map((nc: any) => nc.categories)
                    .filter(Boolean)
                : [];

              return (
                <div
                  key={note.id}
                  className="group flex flex-col bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex flex-wrap gap-1.5 max-w-[70%]">
                        {categoriesList.map((cat: any) => (
                          <span
                            key={cat.id}
                            className="inline-flex items-center gap-1 rounded-full bg-primary/5 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary"
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {cat.name}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                        {note.coin_price} Koin
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground line-clamp-1 mb-1.5">
                      {note.title}
                    </h3>
                    <p className="text-muted-foreground text-xs line-clamp-2 flex-1 leading-relaxed mb-4">
                      {note.description}
                    </p>

                    <dl className="grid grid-cols-2 gap-3 border-t border-border pt-3.5 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Book className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{course}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{semester}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0 col-span-2">
                        <User className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">Oleh: {uploader}</span>
                      </div>
                    </dl>
                  </div>

                  <div className="bg-muted/30 border-t border-border px-5 py-3.5 flex items-center justify-between gap-4">
                    <span className="text-[11px] text-muted-foreground font-semibold">
                      {note.download_count} Diunduh
                    </span>
                    <Link
                      href={`/notes/${note.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline"
                    >
                      Buka Catatan
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground bg-card">
            <Bookmark className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-semibold text-foreground mb-1">Belum Ada Catatan Favorit</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Simpan catatan kuliah yang Anda inginkan ke favorit agar mudah ditemukan di sini.
            </p>
          </div>
        )}
      </div>
    </DashboardSidebarLayout>
  );
}
