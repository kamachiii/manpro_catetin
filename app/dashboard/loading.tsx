import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse font-sans">
      {/* Banner Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 h-32 flex flex-col justify-center gap-3">
        <div className="h-4 bg-muted rounded-md w-1/6" />
        <div className="h-6 bg-muted rounded-md w-1/3" />
        <div className="h-4 bg-muted rounded-md w-2/3" />
      </div>

      {/* Grid Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 h-20 flex justify-between items-center">
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-muted rounded-md w-1/2" />
              <div className="h-5 bg-muted rounded-md w-1/3" />
            </div>
            <div className="h-10 w-10 bg-muted rounded-xl" />
          </div>
        ))}
      </div>

      {/* Grid Data Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 h-[320px] flex flex-col">
            <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
              <div className="h-5 bg-muted rounded-md w-1/3" />
              <div className="h-4 bg-muted rounded-md w-12" />
            </div>
            <div className="space-y-4 flex-1">
              {[...Array(4)].map((_, row) => (
                <div key={row} className="flex justify-between items-center">
                  <div className="space-y-1.5 flex-1 mr-4">
                    <div className="h-4 bg-muted rounded-md w-3/4" />
                    <div className="h-3 bg-muted rounded-md w-1/3" />
                  </div>
                  <div className="h-6 bg-muted rounded-xl w-12" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
