import Link from 'next/link';
import { Order } from '@/types/order';
import { StatusBadge } from '@/components/orders/status-badge';
import { formatDateTime } from '@/lib/utils';
import { ArrowRight, ShoppingBag } from 'lucide-react';

interface RecentOrdersProps {
  orders: Order[];
}

function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '0 ₫';
  return `${amount.toLocaleString('vi-VN')} ₫`;
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-6 shadow-xs">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-accent" />
          <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Recent Orders
          </h2>
        </div>
        <Link
          href="/orders"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>View all</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <p className="text-sm">No recent orders found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs text-muted-foreground uppercase">
              <tr>
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="group transition-colors hover:bg-muted/40"
                >
                  <td className="py-3.5">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {order.code}
                    </span>
                    <div className="text-[11px] text-muted-foreground">
                      {order.createdDateTime
                        ? formatDateTime(order.createdDateTime)
                        : formatDateTime(order.orderDate)}
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="font-medium text-foreground">
                      {order.customerName || 'Walk-in Customer'}
                    </span>
                    {order.customerMobile && (
                      <div className="text-[11px] text-muted-foreground">
                        {order.customerMobile}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3.5 text-right font-mono text-xs font-medium text-foreground">
                    {formatCurrency(order.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
