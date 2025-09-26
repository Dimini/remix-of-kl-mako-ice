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
    <div className={`bg-card rounded-lg border p-6 transition-all hover:shadow-md ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="font-semibold text-card-foreground">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            {trend && (
              <span className="text-lg" aria-label={`Trend: ${trend}`}>
                {trendIndicator[trend]}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1 rounded-full hover:bg-muted transition-colors">
                <Info size={16} className="text-muted-foreground" />
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