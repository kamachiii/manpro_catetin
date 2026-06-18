import React from "react";

export default function PublicNotesLoading() {
  return (
    <div className="bg-background text-foreground font-sans min-h-screen py-12 animate-pulse">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded-md w-1/4" />
          <div className="h-4 bg-muted rounded-md w-1/2" />
        </div>

        {/* Filter bar Skeleton */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4">
          <div className="h-10 bg-muted rounded-xl flex-1" />
          <div className="h-10 bg-muted rounded-xl w-full sm:w-40" />
          <div className="h-10 bg-muted rounded-xl w-full sm:w-40" />
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 h-[240px] flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="h-5 bg-muted rounded-md w-16" />
                <div className="h-5 bg-muted rounded-md w-16" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-muted rounded-md w-5/6" />
                <div className="h-3 bg-muted rounded-md w-1/2" />
              </div>
              <div className="flex justify-between items-center border-t border-border pt-3">
                <div className="h-4 bg-muted rounded-md w-12" />
                <div className="h-6 bg-muted rounded-xl w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
