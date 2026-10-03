import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, UserPlus } from 'lucide-react';

interface DashboardHeaderProps {
  userName?: string | null;
  className?: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="mt-4 flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
      <div>
        <p className="mb-3 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          {todayFormatted}
        </p>
        <h1 className="font-heading text-3xl tracking-tight text-foreground md:text-4xl lg:text-5xl">
          {userName ? (
            <>
              {getGreeting()},{' '}
              <span className="text-accent italic">{userName}</span>.
            </>
          ) : (
            'Welcome back.'
          )}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/customers" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>+ New Customer</span>
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>+ New Order</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
