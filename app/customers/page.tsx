import { getCustomers } from '@/lib/api/customerApi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Customer } from '@/types/customer';
import { CustomerFilter } from '@/components/customers/customer-filter';
import { CustomersCursorPagination } from '@/components/customers/customers-cursor-pagination';

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
      <header className="mt-4 border-b border-border pb-6">
        <h1 className="font-heading text-4xl tracking-tight text-foreground">
          Customers
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your salon client profiles and history.
        </p>
      </header>
      <CustomerFilter />
      <div className="space-y-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Code</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errorMsg ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-6 text-center text-destructive"
                  >
                    {errorMsg}
                  </TableCell>
                </TableRow>
              ) : displayCustomers.length > 0 ? (
                displayCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.code}
                    </TableCell>
                    <TableCell>{customer.fullName}</TableCell>
                    <TableCell>{customer.mobile}</TableCell>
                    <TableCell>
                      {customer.birthDay
                        ? new Date(customer.birthDay).toLocaleString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(customer.createdDateTime).toLocaleString(
                        'vi-VN',
                        {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        }
                      )}
                    </TableCell>
                    <TableCell>{customer.note || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

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
