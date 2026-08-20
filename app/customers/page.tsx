import { getCustomers } from '@/lib/api/customerApi';
import type { Customer } from '@/types/customer';
import { CustomerFilter } from '@/components/customers/customer-filter';
import { CustomersCursorPagination } from '@/components/customers/customers-cursor-pagination';
import { CustomersTable } from '@/components/customers/customers-table';
import { AddCustomerDialog } from '@/components/customers/customer-form-dialog';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function CustomersPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const searchText =
    typeof searchParams.searchText === 'string'
      ? searchParams.searchText
      : undefined;
  const before =
    typeof searchParams.before === 'string' ? searchParams.before : undefined;
  const after =
    typeof searchParams.after === 'string' ? searchParams.after : undefined;
  const pageSize = 20;

  let displayCustomers: Customer[] = [];
  let hasNext = false;
  let hasPrevious = false;
  let beforeCursor: string | null = null;
  let afterCursor: string | null = null;
  let errorMsg = '';

  try {
    const paginatedResult = await getCustomers({
      searchText,
      pageSize,
      before,
      after,
    });
    displayCustomers = paginatedResult.items || [];
    hasNext = paginatedResult.paging?.hasNext || false;
    hasPrevious = paginatedResult.paging?.hasPrevious || false;
    beforeCursor = paginatedResult.paging?.before || null;
    afterCursor = paginatedResult.paging?.after || null;
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    errorMsg = 'Failed to load customers. Please try again later.';
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-6 duration-700 fade-in">
      <header className="mt-4 flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="font-heading text-4xl tracking-tight text-foreground">
            Customers
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your salon client profiles and history.
          </p>
        </div>
        <AddCustomerDialog />
      </header>
      <CustomerFilter />
      <div className="space-y-6">
        <CustomersTable customers={displayCustomers} errorMsg={errorMsg} />

        <CustomersCursorPagination
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          beforeCursor={beforeCursor}
          afterCursor={afterCursor}
          itemsCount={displayCustomers.length}
        />
      </div>
    </div>
  );
}
