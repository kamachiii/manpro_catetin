"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";

interface ReviewInput {
  noteId: number;
  rating: number;
  content?: string;
}

export async function submitReviewAction(input: ReviewInput) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Anda harus login terlebih dahulu" };
    }

    if (!input.noteId) {
      return { success: false, error: "ID Catatan tidak valid" };
    }

    if (typeof input.rating !== "number" || input.rating < 1 || input.rating > 5) {
      return { success: false, error: "Rating harus bernilai antara 1 dan 5" };
    }

    const supabase = await createServerSupabaseClient();

    // 1. Check if user is the uploader of the note
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("user_id")
      .eq("id", input.noteId)
      .single();

    if (noteError || !note) {
      return { success: false, error: "Catatan tidak ditemukan" };
    }

    if (note.user_id === user.id) {
      return { success: false, error: "Anda tidak dapat memberikan ulasan pada catatan Anda sendiri" };
    }

    // 2. Check if user has downloaded the note
    const { data: download, error: downloadError } = await supabase
      .from("note_downloads")
      .select("id")
      .eq("user_id", user.id)
      .eq("note_id", input.noteId)
      .maybeSingle();

    if (downloadError) {
      return { success: false, error: "Gagal memverifikasi riwayat unduhan" };
    }

    if (!download) {
      return { success: false, error: "Anda harus mengunduh catatan ini terlebih dahulu sebelum memberikan ulasan" };
    }

    // 3. Insert review
    const { error: reviewError } = await supabase
      .from("note_reviews")
      .insert({
        user_id: user.id,
        note_id: input.noteId,
        rating: input.rating,
        content: input.content?.trim() || null,
      });

    if (reviewError) {
      if (reviewError.code === "23505") { // unique constraint violation
        return { success: false, error: "Anda sudah memberikan ulasan untuk catatan ini" };
      }
      return { success: false, error: reviewError.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return { success: false, error: msg };
  }
}
