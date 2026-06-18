"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";

interface NoteUploadInput {
  title: string;
  description: string;
  categoryIds: number[];
  newCategories: string[];
  courseId: number | null;
  newCourse: string | null;
  semesterId: number;
  filePath: string;
  fileOriginalName: string;
  fileType: string;
  fileSize: number;
  coinPrice: number;
}

function toTitleCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function slugify(text: string): string {
  const safeText = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text

  const randomHash = Math.random().toString(36).substring(2, 7);
  return `${safeText || "note"}-${randomHash}`;
}

export async function uploadNoteAction(input: NoteUploadInput) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!input.title || input.title.trim() === "") {
      return { success: false, error: "Judul wajib diisi" };
    }
    if (!input.filePath || input.filePath.trim() === "") {
      return { success: false, error: "File PDF wajib diunggah" };
    }
    if (typeof input.coinPrice !== "number" || input.coinPrice < 1 || input.coinPrice > 10) {
      return { success: false, error: "Harga koin harus berada di antara 1 dan 10 koin" };
    }

    const supabase = await createServerSupabaseClient();

    // 1. Handle dynamic course creation
    let finalCourseId = input.courseId;
    if (input.newCourse && input.newCourse.trim() !== "") {
      const courseName = toTitleCase(input.newCourse);
      const courseSlug = courseName.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");

      // Check if course already exists by slug
      const { data: existingCourse } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", courseSlug)
        .maybeSingle();

      if (existingCourse) {
        finalCourseId = Number(existingCourse.id);
      } else {
        const { data: newCrs, error: crsError } = await supabase
          .from("courses")
          .insert({
            name: courseName,
            slug: courseSlug,
            semester_id: input.semesterId,
          })
          .select("id")
          .single();

        if (crsError) {
          console.error("Error creating course:", crsError);
          return { success: false, error: "Gagal membuat mata kuliah baru: " + crsError.message };
        }
        finalCourseId = Number(newCrs.id);
      }
    }

    if (!finalCourseId) {
      return { success: false, error: "Mata kuliah wajib dipilih atau diisi" };
    }

    // 2. Insert Note metadata into public.notes table
    const slug = slugify(input.title);
    const { data: insertedNote, error: noteError } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        course_id: finalCourseId,
        semester_id: input.semesterId,
        title: input.title,
        slug,
        description: input.description || null,
        file_path: input.filePath,
        file_original_name: input.fileOriginalName,
        file_type: input.fileType,
        file_size: input.fileSize,
        coin_price: input.coinPrice,
        status: "pending",
        download_count: 0,
        view_count: 0,
      })
      .select("id")
      .single();

    if (noteError || !insertedNote) {
      console.error("Error inserting note:", noteError);
      return { success: false, error: "Gagal menyimpan catatan: " + (noteError?.message || "Unknown error") };
    }

    const noteId = Number(insertedNote.id);

    // 3. Handle dynamic category creation & mappings
    const finalCategoryIds: number[] = [...input.categoryIds];

    if (input.newCategories && input.newCategories.length > 0) {
      for (const newCatName of input.newCategories) {
        if (!newCatName.trim()) continue;
        const categoryName = toTitleCase(newCatName);
        const categorySlug = categoryName.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");

        // Check if category already exists
        const { data: existingCategory } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", categorySlug)
          .maybeSingle();

        if (existingCategory) {
          finalCategoryIds.push(Number(existingCategory.id));
        } else {
          const { data: newCat, error: catError } = await supabase
            .from("categories")
            .insert({
              name: categoryName,
              slug: categorySlug,
            })
            .select("id")
            .single();

          if (catError) {
            console.error("Error creating category:", catError);
            continue;
          }
          finalCategoryIds.push(Number(newCat.id));
        }
      }
    }

    // Insert category mappings to note_categories_junction
    const uniqueCategoryIds = Array.from(new Set(finalCategoryIds));
    if (uniqueCategoryIds.length > 0) {
      const junctionInserts = uniqueCategoryIds.map((catId) => ({
        note_id: noteId,
        category_id: catId,
      }));

      const { error: junctionError } = await supabase
        .from("note_categories_junction")
        .insert(junctionInserts);

      if (junctionError) {
        console.error("Error linking categories to note:", junctionError);
        return { success: false, error: "Gagal menghubungkan kategori ke catatan: " + junctionError.message };
      }
    } else {
      return { success: false, error: "Catatan wajib memiliki minimal satu kategori" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/notes");
    revalidatePath("/notes");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return { success: false, error: msg };
  }
}
