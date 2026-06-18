"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";

interface ProfileUpdateInput {
  name: string;
  nim: string | null;
  major: string | null;
  semesterId: number | null;
  avatarUrl: string | null;
}

export async function updateProfile(input: ProfileUpdateInput) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!input.name || input.name.trim() === "") {
      return { success: false, error: "Nama wajib diisi" };
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        name: input.name,
        nim: input.nim || null,
        major: input.major || null,
        semester_id: input.semesterId || null,
        avatar_url: input.avatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return { success: false, error: msg };
  }
}
