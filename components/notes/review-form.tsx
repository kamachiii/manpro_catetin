"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { submitReviewAction } from "@/lib/actions/reviews";

interface ReviewFormProps {
  noteId: number;
}

export default function ReviewForm({ noteId }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (rating === 0) {
      setErrorMsg("Silakan pilih rating bintang terlebih dahulu");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitReviewAction({
        noteId,
        rating,
        content,
      });

      if (res.success) {
        setSuccessMsg("Ulasan Anda berhasil dikirim!");
        setRating(0);
        setContent("");
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setErrorMsg(res.error || "Gagal mengirimkan ulasan.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan saat mengirimkan ulasan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border shadow-sm rounded-xl p-6 space-y-4">
      <h3 className="text-sm font-bold text-foreground">
        Tulis Ulasan Anda
      </h3>
      <p className="text-xs text-muted-foreground">
        Berikan penilaian Anda mengenai materi, penjelasan, dan kegunaan catatan ini.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-600">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Star Rating Picker */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground font-medium mr-1">Rating Anda:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={isSubmitting}
              className="p-1 hover:scale-110 focus:outline-none transition-transform cursor-pointer"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30 hover:text-amber-300"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Review Text */}
        <div className="space-y-1">
          <label htmlFor="review-text" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Ulasan (Opsional)
          </label>
          <textarea
            id="review-text"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            placeholder="Catatan sangat rapi, penjelasannya mudah dimengerti..."
            className="block w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
          />
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Mengirim...
              </>
            ) : (
              "Kirim Ulasan"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
