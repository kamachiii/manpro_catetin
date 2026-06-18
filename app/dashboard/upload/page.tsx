import React from "react";
import { requireUser } from "@/lib/auth/require-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import UploadNoteForm from "@/components/forms/upload-note-form";
import { SEMESTERS } from "@/lib/constants";

export default async function UploadPage() {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  // Fetch Categories, Courses, Semesters to populate dropdown options
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError);
  }

  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id, name")
    .order("name", { ascending: true });

  if (coursesError) {
    console.error("Error fetching courses:", coursesError);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
          Unggah Catatan Kuliah
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Bagikan ringkasan materi, latihan soal, atau tugas kuliah Anda. Catatan yang disetujui akan dipublikasikan dan memberi Anda reward koin.
        </p>
      </div>

      <UploadNoteForm
        userId={user.id}
        categories={categories || []}
        courses={courses || []}
        semesters={SEMESTERS}
      />
    </div>
  );
}
