import React from "react";
import { requireUser } from "@/lib/auth/require-user";
import { getUserProfile } from "@/lib/auth/get-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardSidebarLayout from "@/components/layout/dashboard-sidebar-layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const profile = await getUserProfile(user.id);

  // Logout Server Action passed to sidebar
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
      {children}
    </DashboardSidebarLayout>
  );
}
