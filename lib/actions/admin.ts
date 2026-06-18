"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidatePath } from "next/cache";

/**
 * Approve a note by calling the transactional RPC `handle_note_approval`.
 * This rewards the uploader with 5 coins and logs the coin transaction.
 */
export async function approveNoteAction(noteId: number) {
  try {
    const { user } = await requireAdmin();

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.rpc("handle_note_approval", {
      p_note_id: noteId,
      p_admin_id: user.id,
    });

    if (error) {
      console.error("Error in handle_note_approval RPC:", error);
      return { success: false, error: error.message };
    }

    const resObj = data as { success: boolean; message: string };
    if (!resObj.success) {
      return { success: false, error: resObj.message || "Gagal menyetujui catatan" };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/notes");
    revalidatePath("/notes");
    return { success: true, message: resObj.message };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return { success: false, error: msg };
  }
}

/**
 * Reject a note by updating its status to 'rejected' and storing the mandatory reason.
 */
export async function rejectNoteAction(noteId: number, reason: string) {
  try {
    await requireAdmin();

    if (!reason || reason.trim() === "") {
      return { success: false, error: "Alasan penolakan wajib diisi" };
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("notes")
      .update({
        status: "rejected",
        rejection_reason: reason,
        approved_by: null,
        approved_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId);

    if (error) {
      console.error("Error rejecting note:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/notes");
    revalidatePath("/notes");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return { success: false, error: msg };
  }
}

/**
 * Approve a topup by calling the transactional RPC `handle_topup_approval`.
 * This credits user balance and audits the coin transaction.
 */
export async function approveTopupAction(topupId: number) {
  try {
    const { user } = await requireAdmin();

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.rpc("handle_topup_approval", {
      p_topup_id: topupId,
      p_admin_id: user.id,
    });

    if (error) {
      console.error("Error in handle_topup_approval RPC:", error);
      return { success: false, error: error.message };
    }

    const resObj = data as { success: boolean; message: string };
    if (!resObj.success) {
      return { success: false, error: resObj.message || "Gagal menyetujui top up" };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/topups");
    revalidatePath("/dashboard");
    return { success: true, message: resObj.message };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return { success: false, error: msg };
  }
}

/**
 * Reject a topup by updating its status to 'rejected' and storing the reason.
 */
export async function rejectTopupAction(topupId: number, reason: string) {
  try {
    const { user } = await requireAdmin();

    if (!reason || reason.trim() === "") {
      return { success: false, error: "Alasan penolakan wajib diisi" };
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("topups")
      .update({
        status: "rejected",
        admin_note: reason,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", topupId);

    if (error) {
      console.error("Error rejecting top up:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/topups");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return { success: false, error: msg };
  }
}

/**
 * Activate or deactivate user profile.
 */
export async function toggleUserStatusAction(userId: string, isActive: boolean) {
  try {
    await requireAdmin();

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error toggling user status:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return { success: false, error: msg };
  }
}
