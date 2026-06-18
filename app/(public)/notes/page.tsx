import React from "react";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Search, Book, User, Calendar, Tag, Layers, ArrowRight } from "lucide-react";
import { SEMESTERS } from "@/lib/constants";

interface SearchParams {
  q?: string;
  category?: string;
  semester?: string;
  course?: string;
}

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = params.q || "";
  const categoryId = params.category || "";
  const semesterId = params.semester || "";
  const courseId = params.course || "";

  const supabase = await createServerSupabaseClient();

  // Query filter options
  const { data: categories } = await supabase.from("categories").select("*").order("name");
  const { data: courses } = await supabase.from("courses").select("*").order("name");
  const semesters = SEMESTERS;

  // Fetch note IDs for category filter if applied
  let noteIdsFiltered: number[] | null = null;
  if (categoryId) {
    const { data: junctions } = await supabase
      .from("note_categories_junction")
      .select("note_id")
      .eq("category_id", categoryId);
    
    noteIdsFiltered = junctions ? junctions.map((j) => Number(j.note_id)) : [];
  }

  // Build notes query
  let query = supabase
    .from("notes")
    .select("*, profiles:profiles!notes_user_id_fkey(name), note_categories_junction(categories(id, name)), courses(name), semesters(name)")
    .eq("status", "approved");

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }
  if (noteIdsFiltered !== null) {
    query = query.in("id", noteIdsFiltered);
  }
  if (semesterId) {
    query = query.eq("semester_id", semesterId);
  }
  if (courseId) {
    query = query.eq("course_id", courseId);
  }

  const { data: notes, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("Error fetching notes:", error);
  }

  return (
    <div className="bg-background text-foreground font-sans min-h-screen py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Jelajahi Catatan Kuliah
          </h1>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base">
            Temukan ringkasan, latihan soal, dan materi kuliah berkualitas yang diunggah oleh sesama mahasiswa.
          </p>
        </div>

        {/* Filter Form (Pure Server-Side GET request) */}
        <form
          method="GET"
          action="/notes"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 bg-card border border-border p-6 rounded-xl shadow-sm mb-10"
        >
          {/* Query input */}
          <div className="md:col-span-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Cari Judul
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Ketik kata kunci..."
                className="block w-full pl-9 pr-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground/50 transition-all"
              />
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Kategori
            </label>
            <select
              name="category"
              defaultValue={categoryId}
              className="block w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            >
              <option value="">Semua Kategori</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester selection */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Semester
            </label>
            <select
              name="semester"
              defaultValue={semesterId}
              className="block w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            >
              <option value="">Semua Semester</option>
              {semesters?.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {sem.name}
                </option>
              ))}
            </select>
          </div>

          {/* Course selection */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Mata Kuliah
            </label>
            <select
              name="course"
              defaultValue={courseId}
              className="block w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            >
              <option value="">Semua Mata Kuliah</option>
              {courses?.map((crs) => (
                <option key={crs.id} value={crs.id}>
                  {crs.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full h-9 inline-flex justify-center items-center rounded-xl bg-primary text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 focus:outline-none transition-all"
            >
              Terapkan Filter
            </button>
          </div>
        </form>

        {/* Notes catalog grid */}
        {notes && notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {notes.map((note) => {
              // Safely access relations
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

              return (
                <div
                  key={note.id}
                  className="group flex flex-col bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[70%]">
                        {categoriesList.map((cat) => (
                          <span key={cat.id} className="inline-flex items-center gap-1 rounded-full bg-primary/5 border border-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                            <Tag className="h-3 w-3" />
                            {cat.name}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                        {note.coin_price} Koin
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground line-clamp-1 mb-2">
                      {note.title}
                    </h3>
                    <p className="text-muted-foreground text-xs line-clamp-2 flex-1 leading-relaxed mb-4">
                      {note.description}
                    </p>

                    <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
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

                  <div className="bg-muted/30 border-t border-border px-6 py-4 flex items-center justify-between gap-4">
                    <span className="text-xs text-muted-foreground font-semibold">
                      {note.download_count} Diunduh
                    </span>
                    <Link
                      href={`/notes/${note.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline"
                    >
                      Lihat Catatan
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground bg-card">
            <Layers className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Catatan Tidak Ditemukan</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Tidak ada catatan terverifikasi yang cocok dengan kriteria pencarian atau filter Anda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
