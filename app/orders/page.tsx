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
import { DatePickerFilter } from '@/components/orders/date-picker-filter';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function OrdersPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;

  const startDate =
    typeof searchParams.startDate === 'string'
      ? searchParams.startDate
      : undefined;
  const endDate =
    typeof searchParams.endDate === 'string' ? searchParams.endDate : undefined;

  let displayOrders: Order[] = [];
  let errorMsg = '';

  try {
    const orders = await getOrders({ startDate, endDate });
    // Display only 10 orders first
    displayOrders = orders?.slice(0, 100) || [];
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    errorMsg = 'Failed to load orders. Please try again later.';
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-6 duration-700 fade-in">
      <header className="mt-4 border-b border-border pb-6">
        <h1 className="font-heading text-4xl tracking-tight text-foreground">
          Orders
        </h1>
        <p className="mt-2 text-muted-foreground">
          View and manage salon transactions and bookings.
        </p>
      </header>
      <DatePickerFilter />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Code</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {errorMsg ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-destructive"
                >
                  {errorMsg}
                </TableCell>
              </TableRow>
            ) : displayOrders.length > 0 ? (
              displayOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.code}</TableCell>
                  <TableCell>
                    {new Date(order.orderDate).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
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
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-muted-foreground"
                >
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
