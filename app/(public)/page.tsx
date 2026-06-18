import React from "react";
import { ArrowRight, Database, Upload, Coins } from "lucide-react";
import { getUser } from "@/lib/auth/get-user";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Home() {
  const user = await getUser();

  // Fetch counts from database
  const supabase = await createServerSupabaseClient();
  const { count: notesCount } = await supabase
    .from("notes")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved");

  const { count: usersCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  return (
    <div className="flex flex-col bg-background text-foreground font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            Platform Berbagi Catatan Akademik
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl max-w-3xl mx-auto leading-none">
            Solusi Berbagi Catatan Akademik Terbaik Anda
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Unduh catatan kuliah berkualitas menggunakan koin atau dapatkan koin tambahan dengan
            mengunggah catatan buatan Anda sendiri yang telah disetujui admin.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex w-full sm:w-auto h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow hover:bg-primary/90 transition-all group"
              >
                Buka Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex w-full sm:w-auto h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow hover:bg-primary/90 transition-all group"
              >
                Mulai Daftar Sekarang
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            <Link
              href="/notes"
              className="inline-flex w-full sm:w-auto h-12 items-center justify-center rounded-xl border border-border bg-card px-6 font-medium text-foreground hover:bg-muted transition-all"
            >
              Jelajahi Catatan
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-extrabold text-primary">{notesCount ?? 0}</p>
              <p className="text-sm font-semibold text-muted-foreground uppercase mt-2">Catatan Terverifikasi</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-primary">{usersCount ?? 0}</p>
              <p className="text-sm font-semibold text-muted-foreground uppercase mt-2">Pengguna Aktif</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-primary">8</p>
              <p className="text-sm font-semibold text-muted-foreground uppercase mt-2">Kategori Utama</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-primary">100%</p>
              <p className="text-sm font-semibold text-muted-foreground uppercase mt-2">Bahan Terverifikasi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-24">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center tracking-tight text-foreground mb-16">
            Cara Kerja Platform
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col p-6 bg-card rounded-xl border border-border shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Pencarian & Filter Pintar</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Temukan catatan kuliah berdasarkan kategori, semester, dan program studi secara
                akurat dan instan.
              </p>
            </div>

            <div className="flex flex-col p-6 bg-card rounded-xl border border-border shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Unggah & Dapatkan Koin</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Unggah catatan akademik Anda dalam format PDF, dapatkan +5 koin reward setiap kali
                catatan disetujui admin.
              </p>
            </div>

            <div className="flex flex-col p-6 bg-card rounded-xl border border-border shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Coins className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sistem Koin yang Aman</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Sistem koin terenkripsi untuk mengunduh catatan kuliah, didukung oleh fitur top up
                manual yang cepat.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
