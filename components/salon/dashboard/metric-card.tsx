import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean | null;
  className?: string;
}

export function MetricCard({
  title,
  value,
  trend,
  trendUp,
  className,
}: MetricCardProps) {
  return (
    <div className={cn('group flex cursor-default flex-col gap-2', className)}>
      <h3 className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="font-heading text-4xl font-light tracking-tight transition-colors duration-500 group-hover:text-accent md:text-5xl lg:text-6xl">
        {value}
      </div>
      {trend && (
        <div
          className={cn(
            'mt-2 flex items-center gap-2 text-sm',
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
      )}
    </div>
  );
}
