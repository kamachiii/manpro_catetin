import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse font-sans">
      {/* Welcome Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-6 h-28 flex flex-col justify-center gap-3">
        <div className="h-6 bg-muted rounded-md w-1/4" />
        <div className="h-4 bg-muted rounded-md w-3/4" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 h-20 flex justify-between items-center">
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-muted rounded-md w-1/2" />
              <div className="h-5 bg-muted rounded-md w-1/3" />
            </div>
            <div className="h-10 w-10 bg-muted rounded-xl" />
          </div>
        ))}
      </div>

      {/* Grid Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 h-36 flex flex-col gap-3">
          <div className="h-4 bg-muted rounded-md w-1/3" />
          <div className="h-3 bg-muted rounded-md w-5/6" />
          <div className="h-8 bg-muted rounded-xl w-1/4 mt-auto" />
        </div>
        <div className="bg-card border border-border rounded-xl p-6 h-36 flex flex-col gap-3">
          <div className="h-4 bg-muted rounded-md w-1/3" />
          <div className="h-3 bg-muted rounded-md w-5/6" />
          <div className="h-8 bg-muted rounded-xl w-1/4 mt-auto" />
        </div>
      </div>
    </div>
  );
}
