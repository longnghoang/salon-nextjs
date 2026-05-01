import { getOrders } from '@/lib/api/orderApi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Order } from '@/types/order';

export default async function OrdersPage() {
  let displayOrders: Order[] = [];
  let errorMsg = '';

  try {
    const orders = await getOrders();
    // Display only 10 orders first
    displayOrders = orders?.slice(0, 10) || [];
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    errorMsg = 'Failed to load orders. Please try again later.';
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      <header className="border-b border-border pb-6 mt-4">
        <h1 className="font-heading text-4xl tracking-tight text-foreground">Orders</h1>
        <p className="text-muted-foreground mt-2">View and manage salon transactions and bookings.</p>
      </header>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Code</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {errorMsg ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-destructive">
                  {errorMsg}
                </TableCell>
              </TableRow>
            ) : displayOrders.length > 0 ? (
              displayOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.code}</TableCell>
                  <TableCell>
                    {new Date(order.orderDate).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    {order.customerName || order.customerMobile || 'Guest'}
                  </TableCell>
                  <TableCell>{order.statusName}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(order.amount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
