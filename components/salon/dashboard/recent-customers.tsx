import Link from 'next/link';
import { Customer } from '@/types/customer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDateTime } from '@/lib/utils';
import { ArrowRight, Users } from 'lucide-react';

interface RecentCustomersProps {
  customers: Customer[];
}

function getInitials(name: string): string {
  if (!name) return 'CU';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function RecentCustomers({ customers }: RecentCustomersProps) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-6 shadow-xs">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-accent" />
          <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Recent Customers
          </h2>
        </div>
        <Link
          href="/customers"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>View all</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <p className="text-sm">No recent customers found</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border/60">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between py-3.5 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-border/60">
                  <AvatarFallback className="text-xs font-medium">
                    {getInitials(customer.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    {customer.fullName}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {customer.mobile || customer.email || 'No contact info'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-muted-foreground">
                  {customer.code}
                </span>
                {customer.createdDateTime && (
                  <div className="text-[11px] text-muted-foreground">
                    {formatDateTime(customer.createdDateTime)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
