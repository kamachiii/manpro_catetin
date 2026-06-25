import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUser, getUserProfile } from "@/lib/auth/get-user";
import DownloadButton from "@/components/notes/download-button";
import ReviewForm from "@/components/notes/review-form";
import BookmarkButton from "@/components/notes/bookmark-button";
import {
  ArrowLeft,
  User,
  Tag,
  FileText,
  Lock,
  MessageSquare,
  Clock,
  Star,
} from "lucide-react";

interface Params {
  slug: string;
}

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const user = await getUser();
  let userProfile = null;
  if (user) {
    userProfile = await getUserProfile(user.id);
  }

  const supabase = await createServerSupabaseClient();

  // Fetch approved note details
  const { data: note, error } = await supabase
    .from("notes")
    .select("*, profiles:profiles!notes_user_id_fkey(name), courses(name), semesters(name)")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (error || !note) {
    notFound();
  }

  // Fetch categories via junction table
  const { data: noteCategories } = await supabase
    .from("note_categories_junction")
    .select("categories(id, name)")
    .eq("note_id", note.id);

  const categoriesList = noteCategories
    ? noteCategories
        .map((nc) => {
          const cat = nc.categories as any;
          if (Array.isArray(cat)) {
            return cat[0] as { id: number; name: string } | undefined;
          }
          return cat as { id: number; name: string } | undefined;
        })
        .filter((c): c is { id: number; name: string } => !!c)
    : [];

  // Fetch reviews for this note
  const { data: reviews } = await supabase
    .from("note_reviews")
    .select("*, profiles(name)")
    .eq("note_id", note.id)
    .order("created_at", { ascending: false });

  // Fetch visible comments
  const { data: comments } = await supabase
    .from("comments")
    .select("*, profiles(name)")
    .eq("note_id", note.id)
    .eq("status", "visible")
    .order("created_at", { ascending: true });

  let hasDownloaded = false;
  let hasReviewed = false;
  let isBookmarked = false;
  if (user) {
    const { data: download } = await supabase
      .from("note_downloads")
      .select("id")
      .eq("user_id", user.id)
      .eq("note_id", note.id)
      .maybeSingle();
    hasDownloaded = !!download;

    const { data: review } = await supabase
      .from("note_reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("note_id", note.id)
      .maybeSingle();
    hasReviewed = !!review;

    const { data: bookmark } = await supabase
      .from("note_bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("note_id", note.id)
      .maybeSingle();
    isBookmarked = !!bookmark;
  }
  const isOwner = user ? note.user_id === user.id : false;
  const canAccess = hasDownloaded || isOwner;

  let signedUrl = "";
  if (canAccess) {
    try {
      const { data: signData } = await supabase.storage
        .from("notes-files")
        .createSignedUrl(note.file_path, 3600); // 1 hour expiry
      signedUrl = signData?.signedUrl || "";
    } catch (err) {
      console.error("Error creating signed URL for note preview:", err);
    }
  }

  const reviewsCount = reviews?.length ?? 0;
  const averageRating = (reviews && reviewsCount > 0)
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewsCount).toFixed(1)
    : null;

  const uploader = (note.profiles as { name: string } | null)?.name || "Mahasiswa";
  const course = (note.courses as { name: string } | null)?.name || "Lainnya";
  const semester = (note.semesters as { name: string } | null)?.name || "-";

  return (
    <div className="bg-background text-foreground font-sans min-h-screen py-12">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Catatan
          </Link>
        </div>

        {/* Note Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Info (Left Column) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border shadow-sm rounded-xl p-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {categoriesList.map((cat) => (
                  <span key={cat.id} className="inline-flex items-center gap-1 rounded-full bg-primary/5 border border-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                    <Tag className="h-3 w-3" />
                    {cat.name}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {note.coin_price} Koin
                </span>
                {averageRating && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-600">
                    ★ {averageRating} ({reviewsCount})
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {note.title}
              </h1>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {note.description}
              </p>
            </div>

            {/* Blurred PDF Preview Container */}
            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
              <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-bold">Pratinjau Dokumen (Preview)</h2>
              </div>
              <div className="relative p-4 flex justify-center items-center min-h-[400px] w-full bg-slate-50 dark:bg-zinc-900/50">
                {canAccess && signedUrl ? (
                  <iframe
                    src={`${signedUrl}#toolbar=0`}
                    className="w-full h-[600px] border-0 rounded-lg shadow-sm"
                    title={note.title}
                  />
                ) : (
                  <>
                    {/* Mocked Document Page with Blur */}
                    <div className="w-full max-w-md h-[360px] bg-white dark:bg-zinc-800 border border-border shadow-sm rounded-lg p-6 filter blur-[5px] select-none pointer-events-none flex flex-col gap-4">
                      <div className="h-6 w-3/4 bg-slate-200 dark:bg-zinc-700 rounded" />
                      <div className="h-4 w-full bg-slate-100 dark:bg-zinc-700/50 rounded" />
                      <div className="h-4 w-full bg-slate-100 dark:bg-zinc-700/50 rounded" />
                      <div className="h-4 w-5/6 bg-slate-100 dark:bg-zinc-700/50 rounded" />
                      <div className="h-4 w-full bg-slate-100 dark:bg-zinc-700/50 rounded" />
                      <div className="h-4 w-2/3 bg-slate-100 dark:bg-zinc-700/50 rounded" />
                    </div>

                    {/* Padlock Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-[2px]">
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-sm">
                        <Lock className="h-6 w-6" />
                      </div>
                      <h3 className="text-base font-bold text-foreground">Dokumen Terkunci</h3>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs text-center px-4">
                        Unduh file lengkap catatan kuliah untuk membuka seluruh materi pelajaran ini.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-card border border-border shadow-sm rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  Ulasan & Rating ({reviewsCount})
                </h2>
                {averageRating && (
                  <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-xl text-xs font-extrabold text-amber-600">
                    ★ {averageRating} / 5.0
                  </div>
                )}
              </div>

              {/* Review List */}
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((rev) => {
                    const reviewer = (rev.profiles as { name: string } | null)?.name || "Mahasiswa";
                    return (
                      <div key={rev.id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-bold text-sm text-foreground">{reviewer}</span>
                            <div className="flex items-center gap-0.5 mt-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-3.5 w-3.5 ${
                                    s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(rev.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {rev.content && (
                          <p className="text-xs sm:text-sm text-muted-foreground bg-muted/20 p-3 rounded-xl leading-relaxed">
                            {rev.content}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-muted-foreground text-center py-6">
                  Belum ada ulasan untuk catatan ini.
                </p>
              )}
            </div>

            {/* Review Form Component */}
            {hasDownloaded && !hasReviewed && note.user_id !== user?.id && (
              <ReviewForm noteId={note.id} />
            )}
          </div>

          {/* Sidebar (Right Column) */}
          <div className="space-y-8">
            <div className="bg-card border border-border shadow-sm rounded-xl p-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                Informasi Unduhan
              </h2>
              <dl className="space-y-4 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground font-medium">Mata Kuliah</dt>
                  <dd className="text-foreground font-semibold truncate max-w-[150px]">{course}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <dt className="text-muted-foreground font-medium">Semester</dt>
                  <dd className="text-foreground font-semibold">{semester}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <dt className="text-muted-foreground font-medium">Diunggah Oleh</dt>
                  <dd className="text-foreground font-semibold">{uploader}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <dt className="text-muted-foreground font-medium">Jumlah Unduhan</dt>
                  <dd className="text-foreground font-semibold">{note.download_count} Kali</dd>
                </div>
              </dl>
              <div className="mt-6 border-t border-border pt-6 flex flex-col gap-3">
                <DownloadButton
                  isLoggedIn={!!user}
                  noteId={note.id}
                  coinPrice={note.coin_price}
                  userCoins={userProfile?.coin_balance ?? 0}
                  isOwner={user ? note.user_id === user.id : false}
                  hasDownloaded={hasDownloaded}
                />
                {(!user || note.user_id !== user.id) && (
                  <BookmarkButton
                    noteId={note.id}
                    initialIsBookmarked={isBookmarked}
                    isLoggedIn={!!user}
                  />
                )}
              </div>
            </div>

            {/* Comments List */}
            <div className="bg-card border border-border shadow-sm rounded-xl p-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Diskusi & Komentar ({comments?.length ?? 0})
              </h2>
              {comments && comments.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {comments.map((comment) => {
                    const commenter = (comment.profiles as { name: string } | null)?.name || "Mahasiswa";
                    return (
                      <div key={comment.id} className="text-xs border-b border-border pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-foreground flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {commenter}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(comment.created_at).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1 leading-relaxed bg-muted/30 p-2.5 rounded-lg">
                          {comment.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">
                  Belum ada komentar untuk catatan ini.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
