import { MetricCard } from "@/components/salon/dashboard/metric-card";
import { AppointmentsList } from "@/components/salon/dashboard/appointments-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SalonDashboard() {
  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full animate-in fade-in duration-1000 slide-in-from-bottom-4">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8 mt-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] mb-4">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground">
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
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 py-4">
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
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8 border-t border-border/40">
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-3xl">Upcoming Appointments</h2>
            <button className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors">
              View Schedule &rarr;
            </button>
          </div>
          <AppointmentsList />
        </div>
        
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-muted/30 p-8 border border-border/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <h3 className="font-heading text-2xl mb-3 relative z-10">Daily Goal</h3>
                <p className="text-muted-foreground mb-8 relative z-10 leading-relaxed">
                  You are <span className="text-foreground font-medium">$260</span> away from your daily revenue target.
                </p>
                <div className="h-px w-full bg-border overflow-hidden">
                    <div className="h-full bg-accent w-[82%]" />
                </div>
                <p className="text-right text-xs mt-3 text-muted-foreground font-mono">82%</p>
            </div>
            
            <div className="p-8 border border-border/50">
               <h3 className="font-heading text-2xl mb-4">Quick Actions</h3>
               <div className="flex flex-col gap-3">
                 <button className="text-left text-sm py-3 border-b border-border/30 hover:border-accent hover:text-accent transition-all">
                   + New Walk-in
                 </button>
                 <button className="text-left text-sm py-3 border-b border-border/30 hover:border-accent hover:text-accent transition-all">
                   Block Time
                 </button>
                 <button className="text-left text-sm py-3 border-b border-border/30 hover:border-accent hover:text-accent transition-all">
                   View Inventory
                 </button>
               </div>
            </div>
        </div>
      </section>
    </div>
  );
}
