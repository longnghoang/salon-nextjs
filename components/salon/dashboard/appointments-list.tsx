import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const appointments = [
  {
    id: 1,
    client: "Emma Thompson",
    service: "Balayage & Cut",
    time: "10:00 AM",
    duration: "2.5h",
    stylist: "Sarah",
    status: "in-progress",
    avatar: "https://i.pravatar.cc/150?u=emma",
  },
  {
    id: 2,
    client: "Olivia Chen",
    service: "Root Touch-up",
    time: "1:00 PM",
    duration: "1h",
    stylist: "Sarah",
    status: "upcoming",
    avatar: "https://i.pravatar.cc/150?u=olivia",
  },
  {
    id: 3,
    client: "Sophia Patel",
    service: "Bridal Consultation",
    time: "2:30 PM",
    duration: "45m",
    stylist: "Sarah",
    status: "upcoming",
    avatar: "https://i.pravatar.cc/150?u=sophia",
  },
];

export function AppointmentsList() {
  return (
    <div className="flex flex-col w-full">
      {appointments.map((apt) => (
        <div 
          key={apt.id} 
          className="group flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-border hover:border-accent transition-colors duration-300"
        >
          <div className="flex items-center gap-6">
            <div className="text-sm font-mono text-muted-foreground w-16 shrink-0">
              {apt.time}
            </div>
            <Avatar className="h-12 w-12 border border-border/50 group-hover:border-accent transition-colors duration-300">
              <AvatarImage src={apt.avatar} alt={apt.client} />
              <AvatarFallback>{apt.client.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-lg">{apt.client}</h4>
              <p className="text-muted-foreground">{apt.service} &middot; {apt.duration}</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 ml-22 sm:ml-0 flex items-center gap-4">
            <Badge variant={apt.status === "in-progress" ? "default" : "secondary"} className="font-normal rounded-none px-3 py-1 uppercase tracking-wider text-xs">
              {apt.status.replace('-', ' ')}
            </Badge>
          </div>
        </div>
      ))}
      <div className="py-8 flex justify-center">
        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.2em] border-b border-transparent hover:border-foreground pb-1">
            Load More
        </button>
      </div>
    </div>
  );
}
