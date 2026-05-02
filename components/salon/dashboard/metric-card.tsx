import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean | null;
}

export function MetricCard({ title, value, trend, trendUp }: MetricCardProps) {
  return (
    <div className="group flex cursor-default flex-col gap-2">
      <h3 className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="font-heading text-5xl font-light tracking-tighter transition-colors duration-500 group-hover:text-accent md:text-6xl">
        {value}
      </div>
      <div
        className={cn(
          'mt-3 flex items-center gap-2 text-sm',
          trendUp === true
            ? 'text-emerald-600 dark:text-emerald-400'
            : trendUp === false
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-muted-foreground'
        )}
      >
        {trendUp === true && <span>&uarr;</span>}
        {trendUp === false && <span>&darr;</span>}
        {trendUp === null && <span>&rarr;</span>}
        <span className="font-medium">{trend}</span>
      </div>
    </div>
  );
}
