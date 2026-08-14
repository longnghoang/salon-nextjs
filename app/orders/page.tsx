import { getOrders } from '@/lib/api/orderApi';
import type { Order } from '@/types/order';
import { OrderFilter } from '@/components/orders/order-filter';
import { OrdersCursorPagination } from '@/components/orders/orders-cursor-pagination';
import { AddOrderDialog } from '@/components/orders/order-form-dialog';
import { OrdersTable } from '@/components/orders/orders-table';

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
        <OrdersTable orders={displayOrders} errorMsg={errorMsg} />

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
