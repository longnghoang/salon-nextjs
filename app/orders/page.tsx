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
import { OrderFilter } from '@/components/orders/order-filter';
import { StatusBadge } from '@/components/orders/status-badge';
import { OrdersCursorPagination } from '@/components/orders/orders-cursor-pagination';
import { formatDateTime } from '@/lib/utils';
import { AddOrderDialog } from '@/components/orders/add-order-dialog';

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
  const status =
    typeof searchParams.status === 'string'
      ? parseInt(searchParams.status, 10)
      : undefined;
  const before =
    typeof searchParams.before === 'string' ? searchParams.before : undefined;
  const after =
    typeof searchParams.after === 'string' ? searchParams.after : undefined;
  const pageSize = 20;

  let displayOrders: Order[] = [];
  let hasNext = false;
  let hasPrevious = false;
  let beforeCursor: string | null = null;
  let afterCursor: string | null = null;
  let errorMsg = '';

  try {
    const paginatedResult = await getOrders({
      startDate,
      endDate,
      status,
      pageSize,
      before,
      after,
    });
    displayOrders = paginatedResult.items || [];
    hasNext = paginatedResult.paging?.hasNext || false;
    hasPrevious = paginatedResult.paging?.hasPrevious || false;
    beforeCursor = paginatedResult.paging?.before || null;
    afterCursor = paginatedResult.paging?.after || null;
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    errorMsg = 'Failed to load orders. Please try again later.';
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-6 duration-700 fade-in">
      <header className="mt-4 flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="font-heading text-4xl tracking-tight text-foreground">
            Orders
          </h1>
          <p className="mt-2 text-muted-foreground">
            View and manage salon transactions and bookings.
          </p>
        </div>
        <AddOrderDialog />
      </header>
      <OrderFilter />

      <div className="space-y-6">
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
                    <TableCell>{formatDateTime(order.orderDate)}</TableCell>
                    <TableCell>
                      {order.customerName || order.customerMobile || 'Guest'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
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

        <OrdersCursorPagination
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          beforeCursor={beforeCursor}
          afterCursor={afterCursor}
          itemsCount={displayOrders.length}
        />
      </div>
    </div>
  );
}
