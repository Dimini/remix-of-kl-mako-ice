import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface KPITileProps {
  title: string;
  value: string;
  unit?: string;
  description: string;
  tooltip: string;
  trend?: "up" | "down" | "neutral";
  color?: "primary" | "success" | "warning" | "co2";
}

export function KPITile({ title, value, unit, description, tooltip, trend, color = "primary" }: KPITileProps) {
  const colorClasses = {
    primary: "text-primary border-primary/20 bg-primary/5",
    success: "text-success border-success/20 bg-success/5",
    warning: "text-warning border-warning/20 bg-warning/5",
    co2: "text-co2-primary border-co2-primary/20 bg-co2-primary/5"
  };

  const trendIndicator = {
    up: "↗",
    down: "↘",
    neutral: "→"
  };

  return (
    <div className={`bg-card rounded-lg border p-2 sm:p-4 md:p-6 transition-all hover:shadow-md ${colorClasses[color]}`}>
      <div className="flex items-start justify-between gap-1 sm:gap-2">
        <div className="space-y-0.5 sm:space-y-1 md:space-y-2 flex-1 min-w-0">
          <h3 className="font-semibold text-card-foreground text-[10px] sm:text-sm md:text-base leading-tight">{title}</h3>
          <div className="flex items-baseline gap-0.5 sm:gap-1 md:gap-2 flex-wrap">
            <span className="text-lg sm:text-2xl md:text-3xl font-bold leading-none">{value}</span>
            {unit && <span className="text-[9px] sm:text-xs md:text-sm text-muted-foreground">{unit}</span>}
            {trend && (
              <span className="text-sm sm:text-base md:text-lg" aria-label={`Trend: ${trend}`}>
                {trendIndicator[trend]}
              </span>
            )}
          </div>
          <p className="text-[8px] sm:text-xs md:text-sm text-muted-foreground leading-tight hidden sm:block">{description}</p>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-0.5 sm:p-1 rounded-full hover:bg-muted transition-colors flex-shrink-0">
                <Info size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-muted-foreground" />
                <span className="sr-only">About this metric</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}