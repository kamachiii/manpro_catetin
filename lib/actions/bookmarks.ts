"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";

export async function toggleBookmarkAction(noteId: number) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Anda harus login terlebih dahulu" };
    }

    if (!noteId) {
      return { success: false, error: "ID Catatan tidak valid" };
    }

    const supabase = await createServerSupabaseClient();

    // 1. Check if the note is approved and exists
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("id, status")
      .eq("id", noteId)
      .eq("status", "approved")
      .maybeSingle();

    if (noteError || !note) {
      return { success: false, error: "Catatan tidak ditemukan atau belum disetujui" };
    }

    // 2. Check if already bookmarked
    const { data: existingBookmark, error: checkError } = await supabase
      .from("note_bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("note_id", noteId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking bookmark:", checkError);
      return { success: false, error: "Gagal memproses bookmark" };
    }

    if (existingBookmark) {
      // Unbookmark: Delete existing record
      const { error: deleteError } = await supabase
        .from("note_bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("note_id", noteId);

      if (deleteError) {
        console.error("Error deleting bookmark:", deleteError);
        return { success: false, error: "Gagal menghapus catatan dari favorit" };
      }

      revalidatePath("/dashboard/bookmarks");
      revalidatePath(`/notes`);
      return { success: true, isBookmarked: false };
    } else {
      // Bookmark: Create new record
      const { error: insertError } = await supabase
        .from("note_bookmarks")
        .insert({
          user_id: user.id,
          note_id: noteId,
        });

      if (insertError) {
        console.error("Error inserting bookmark:", insertError);
        return { success: false, error: "Gagal menyimpan catatan ke favorit" };
      }

      revalidatePath("/dashboard/bookmarks");
      revalidatePath(`/notes`);
      return { success: true, isBookmarked: true };
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return { success: false, error: msg };
  }
}
