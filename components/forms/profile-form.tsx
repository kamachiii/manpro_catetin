"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/actions/profile";
import { AlertCircle, CheckCircle2, Loader2, Coins } from "lucide-react";

interface Semester {
  id: number;
  name: string;
}

interface Profile {
  id: string;
  name: string;
  role: string;
  coin_balance: number;
  nim: string | null;
  major: string | null;
  semester_id: number | null;
  avatar_url: string | null;
}

interface ProfileFormProps {
  profile: Profile;
  userEmail: string;
  semesters: Semester[];
}

export default function ProfileForm({ profile, userEmail, semesters }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(profile.name || "");
  const [nim, setNim] = useState(profile.nim || "");
  const [major, setMajor] = useState(profile.major || "");
  const [semesterId, setSemesterId] = useState<string>(
    profile.semester_id ? profile.semester_id.toString() : ""
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Client-side image validation
    if (!file.type.startsWith("image/")) {
      setErrorMsg("File harus berupa gambar (PNG, JPG, JPEG)");
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit for avatar
    if (file.size > maxSizeBytes) {
      setErrorMsg("Ukuran file gambar tidak boleh melebihi 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      // avatars path format: {user_id}/{filename}
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl);
      setSuccessMsg("Foto profil berhasil diunggah! Tekan Simpan Perubahan untuk menyimpan.");
    } catch (error: unknown) {
      console.error("Error uploading avatar:", error);
      const msg = error instanceof Error ? error.message : "Gagal mengunggah foto profil.";
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg("Nama Lengkap wajib diisi");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await updateProfile({
        name,
        nim: nim.trim() || null,
        major: major.trim() || null,
        semesterId: semesterId ? parseInt(semesterId, 10) : null,
        avatarUrl,
      });

      if (res.success) {
        setSuccessMsg("Profil berhasil diperbarui!");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Gagal memperbarui profil.");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan server.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (nameStr: string) => {
    return nameStr
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* Message banners */}
        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-600">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-sm text-rose-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Avatar Upload Grid Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border">
          <div className="relative h-24 w-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-2xl font-bold overflow-hidden">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span>{getInitials(name || "Mahasiswa")}</span>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <h4 className="text-sm font-bold text-foreground">Foto Profil</h4>
            <p className="text-xs text-muted-foreground">
              Format PNG, JPG, JPEG. Maksimum 5MB.
            </p>
            <div className="inline-flex">
              <label
                htmlFor="avatar-input"
                className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer transition-all"
              >
                Pilih Foto
              </label>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploading || isSubmitting}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Read only info */}
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Alamat Email (Akun)
              </label>
              <input
                type="text"
                disabled
                value={userEmail}
                className="block w-full px-3.5 py-2.5 border border-border/80 rounded-xl bg-muted text-muted-foreground text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                Role System & Saldo
              </label>
              <div className="flex items-center gap-2 h-[42px] px-3.5 border border-border/85 bg-muted rounded-xl text-muted-foreground text-sm">
                <span className="capitalize font-semibold">{profile.role}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-border" />
                <span className="flex items-center gap-1 font-bold text-amber-500">
                  <Coins className="h-4 w-4" />
                  {profile.coin_balance} Koin
                </span>
              </div>
            </div>
          </div>

          {/* Edit fields */}
          <div>
            <label htmlFor="profile-name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Nama Lengkap <span className="text-destructive">*</span>
            </label>
            <input
              id="profile-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap..."
              className="block w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label htmlFor="profile-nim" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              NIM (Nomor Induk Mahasiswa)
            </label>
            <input
              id="profile-nim"
              type="text"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              placeholder="Masukkan NIM..."
              className="block w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label htmlFor="profile-major" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Program Studi / Jurusan
            </label>
            <input
              id="profile-major"
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="Contoh: Teknik Informatika..."
              className="block w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label htmlFor="profile-semester" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Semester Berjalan
            </label>
            <select
              id="profile-semester"
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              className="block w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            >
              <option value="">Pilih Semester</option>
              {semesters.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {sem.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
