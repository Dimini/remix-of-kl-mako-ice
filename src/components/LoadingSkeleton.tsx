import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 1 }: LoadingSkeletonProps) {
  return (
    <div className={cn("animate-pulse space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-muted rounded-md" />
      ))}
    </div>
  );
}

export function KPITileSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="space-y-3 relative">
        <div className="h-6 sm:h-8 w-16 sm:w-20 bg-muted/50 rounded animate-pulse" />
        <div className="h-3 sm:h-4 w-24 sm:w-32 bg-muted/50 rounded animate-pulse" />
        <div className="h-2 sm:h-3 w-20 sm:w-24 bg-muted/50 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="space-y-4 relative">
        <div className="h-5 sm:h-6 w-32 sm:w-48 bg-muted/50 rounded animate-pulse" />
        <div className="h-48 sm:h-64 bg-muted/50 rounded animate-pulse" />
        <div className="flex gap-3 sm:gap-4 justify-center">
          <div className="h-2 sm:h-3 w-12 sm:w-16 bg-muted/50 rounded animate-pulse" />
          <div className="h-2 sm:h-3 w-12 sm:w-16 bg-muted/50 rounded animate-pulse" />
          <div className="h-2 sm:h-3 w-12 sm:w-16 bg-muted/50 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}