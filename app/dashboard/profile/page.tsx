import React from "react";
import { requireUser } from "@/lib/auth/require-user";
import { getUserProfile } from "@/lib/auth/get-user";
import ProfileForm from "@/components/forms/profile-form";
import { SEMESTERS } from "@/lib/constants";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getUserProfile(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
          Pengaturan Profil
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Kelola nama, NIM, jurusan, semester terdaftar, dan foto profil Anda.
        </p>
      </div>

      {profile && (
        <ProfileForm
          profile={profile}
          userEmail={user.email || ""}
          semesters={SEMESTERS}
        />
      )}
    </div>
  );
}
