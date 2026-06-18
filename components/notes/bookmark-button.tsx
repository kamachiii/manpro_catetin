"use client";

import React, { useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { toggleBookmarkAction } from "@/lib/actions/bookmarks";
import { useRouter } from "next/navigation";

interface BookmarkButtonProps {
  noteId: number;
  initialIsBookmarked: boolean;
  isLoggedIn: boolean;
}

export default function BookmarkButton({
  noteId,
  initialIsBookmarked,
  isLoggedIn,
}: BookmarkButtonProps) {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isPending, setIsPending] = useState(false);

  const handleToggleBookmark = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setIsPending(true);
    try {
      const res = await toggleBookmarkAction(noteId);
      if (res.success && res.isBookmarked !== undefined) {
        setIsBookmarked(res.isBookmarked);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={isPending}
      className={`flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl border text-xs font-bold transition-all shadow-sm hover:scale-102 cursor-pointer select-none ${
        isBookmarked
          ? "bg-primary/10 border-primary text-primary hover:bg-primary/20"
          : "border-border bg-card text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      }`}
      title={isBookmarked ? "Hapus dari Favorit" : "Simpan ke Favorit"}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <Bookmark
          className={`h-4 w-4 ${
            isBookmarked ? "fill-primary text-primary" : "text-muted-foreground/80"
          }`}
        />
      )}
      <span>{isBookmarked ? "Tersimpan" : "Simpan"}</span>
    </button>
  );
}
