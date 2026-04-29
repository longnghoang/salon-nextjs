import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean | null;
}

export function MetricCard({ title, value, trend, trendUp }: MetricCardProps) {
  return (
    <div className="flex flex-col gap-2 group cursor-default">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">{title}</h3>
      <div className="font-heading text-5xl md:text-6xl font-light tracking-tighter group-hover:text-accent transition-colors duration-500">
        {value}
      </div>
      <div className={cn(
        "text-sm mt-3 flex items-center gap-2",
        trendUp === true ? "text-emerald-600 dark:text-emerald-400" : 
        trendUp === false ? "text-rose-600 dark:text-rose-400" : 
        "text-muted-foreground"
      )}>
        {trendUp === true && <span>&uarr;</span>}
        {trendUp === false && <span>&darr;</span>}
        {trendUp === null && <span>&rarr;</span>}
        <span className="font-medium">{trend}</span>
      </div>
    </div>
  );
}
