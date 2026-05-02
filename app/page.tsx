import { MetricCard } from '@/components/salon/dashboard/metric-card';
import { AppointmentsList } from '@/components/salon/dashboard/appointments-list';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SalonDashboard() {
  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-10 duration-1000 fade-in slide-in-from-bottom-4">
      {/* Header Section */}
      <header className="mt-4 flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
        <div>
          <p className="mb-4 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <h1 className="font-heading text-4xl tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Good morning, <span className="text-accent italic">Sarah</span>.
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-border/50">
            <AvatarImage src="https://i.pravatar.cc/150?u=sarah" alt="Sarah" />
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Metrics Section */}
      <section className="grid grid-cols-1 gap-12 py-4 md:grid-cols-3 md:gap-16">
        <MetricCard
          title="Today's Revenue"
          value="$1,240"
          trend="+12% vs last week"
          trendUp={true}
        />
        <MetricCard
          title="New Bookings"
          value="8"
          trend="Steady"
          trendUp={null}
        />
        <MetricCard
          title="Client Retention"
          value="84%"
          trend="-2% vs last month"
          trendUp={false}
        />
      </section>

      {/* Main Content Area */}
      <section className="grid grid-cols-1 gap-12 border-t border-border/40 pt-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-heading text-3xl">Upcoming Appointments</h2>
            <button className="text-xs font-medium tracking-widest text-muted-foreground uppercase transition-colors hover:text-accent">
              View Schedule &rarr;
            </button>
          </div>
          <AppointmentsList />
        </div>

        <div className="space-y-8 lg:col-span-4">
          <div className="group relative overflow-hidden border border-border/50 bg-muted/30 p-8">
            <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity duration-500 group-hover:opacity-10">
              <svg
                width="120"
                height="120"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className="relative z-10 mb-3 font-heading text-2xl">
              Daily Goal
            </h3>
            <p className="relative z-10 mb-8 leading-relaxed text-muted-foreground">
              You are <span className="font-medium text-foreground">$260</span>{' '}
              away from your daily revenue target.
            </p>
            <div className="h-px w-full overflow-hidden bg-border">
              <div className="h-full w-[82%] bg-accent" />
            </div>
            <p className="mt-3 text-right font-mono text-xs text-muted-foreground">
              82%
            </p>
          </div>

          <div className="border border-border/50 p-8">
            <h3 className="mb-4 font-heading text-2xl">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <button className="border-b border-border/30 py-3 text-left text-sm transition-all hover:border-accent hover:text-accent">
                + New Walk-in
              </button>
              <button className="border-b border-border/30 py-3 text-left text-sm transition-all hover:border-accent hover:text-accent">
                Block Time
              </button>
              <button className="border-b border-border/30 py-3 text-left text-sm transition-all hover:border-accent hover:text-accent">
                View Inventory
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
