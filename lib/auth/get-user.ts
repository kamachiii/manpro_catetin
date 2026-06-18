import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createServerSupabaseClient();
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export async function getUserProfile(userId: string) {
  const supabase = await createServerSupabaseClient();
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      return null;
    }
    return profile;
  } catch {
    return null;
  }
}
