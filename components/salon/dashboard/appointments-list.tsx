import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const appointments = [
  {
    id: 1,
    client: 'Emma Thompson',
    service: 'Balayage & Cut',
    time: '10:00 AM',
    duration: '2.5h',
    stylist: 'Sarah',
    status: 'in-progress',
    avatar: 'https://i.pravatar.cc/150?u=emma',
  },
  {
    id: 2,
    client: 'Olivia Chen',
    service: 'Root Touch-up',
    time: '1:00 PM',
    duration: '1h',
    stylist: 'Sarah',
    status: 'upcoming',
    avatar: 'https://i.pravatar.cc/150?u=olivia',
  },
  {
    id: 3,
    client: 'Sophia Patel',
    service: 'Bridal Consultation',
    time: '2:30 PM',
    duration: '45m',
    stylist: 'Sarah',
    status: 'upcoming',
    avatar: 'https://i.pravatar.cc/150?u=sophia',
  },
];

export function AppointmentsList() {
  return (
    <div className="flex w-full flex-col">
      {appointments.map((apt) => (
        <div
          key={apt.id}
          className="group flex flex-col justify-between border-b border-border py-6 transition-colors duration-300 hover:border-accent sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 shrink-0 font-mono text-sm text-muted-foreground">
              {apt.time}
            </div>
            <Avatar className="h-12 w-12 border border-border/50 transition-colors duration-300 group-hover:border-accent">
              <AvatarImage src={apt.avatar} alt={apt.client} />
              <AvatarFallback>{apt.client.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-lg font-medium">{apt.client}</h4>
              <p className="text-muted-foreground">
                {apt.service} &middot; {apt.duration}
              </p>
            </div>
          </div>
          <div className="mt-4 ml-22 flex items-center gap-4 sm:mt-0 sm:ml-0">
            <Badge
              variant={apt.status === 'in-progress' ? 'default' : 'secondary'}
              className="rounded-none px-3 py-1 text-xs font-normal tracking-wider uppercase"
            >
              {apt.status.replace('-', ' ')}
            </Badge>
          </div>
        </div>
      ))}
      <div className="flex justify-center py-8">
        <button className="border-b border-transparent pb-1 text-xs tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:border-foreground hover:text-foreground">
          Load More
        </button>
      </div>
    </div>
  );
}
