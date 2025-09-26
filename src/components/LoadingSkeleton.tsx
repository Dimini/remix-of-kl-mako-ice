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
    <div className="bg-card rounded-lg border p-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 w-20 bg-muted rounded-md" />
        <div className="h-4 w-32 bg-muted rounded-md" />
        <div className="h-3 w-24 bg-muted rounded-md" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-6 w-48 bg-muted rounded-md" />
        <div className="h-64 bg-muted rounded-md" />
        <div className="flex gap-4 justify-center">
          <div className="h-3 w-16 bg-muted rounded-md" />
          <div className="h-3 w-16 bg-muted rounded-md" />
          <div className="h-3 w-16 bg-muted rounded-md" />
        </div>
      </div>
    </div>
  );
}