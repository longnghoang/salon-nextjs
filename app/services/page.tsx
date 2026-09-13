import { getServices } from '@/lib/api/serviceApi';
import type { Service } from '@/types/service';
import { ServiceFilter } from '@/components/services/service-filter';
import { ServicesCursorPagination } from '@/components/services/services-cursor-pagination';
import { ServicesTable } from '@/components/services/services-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ServicesPage(props: {
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

  let displayServices: Service[] = [];
  let hasNext = false;
  let hasPrevious = false;
  let beforeCursor: string | null = null;
  let afterCursor: string | null = null;
  let errorMsg = '';

  try {
    const paginatedResult = await getServices({
      searchText,
      pageSize,
      before,
      after,
    });
    displayServices = paginatedResult.items || [];
    hasNext = paginatedResult.paging?.hasNext || false;
    hasPrevious = paginatedResult.paging?.hasPrevious || false;
    beforeCursor = paginatedResult.paging?.before || null;
    afterCursor = paginatedResult.paging?.after || null;
  } catch (error) {
    console.error('Failed to fetch services:', error);
    errorMsg = 'Failed to load services. Please try again later.';
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-6 duration-700 fade-in">
      <header className="mt-4 flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="font-heading text-4xl tracking-tight text-foreground">
            Services
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage salon service catalog, pricing, and promotions.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Service</span>
        </Button>
      </header>

      <ServiceFilter />
      <div className="space-y-6">
        <ServicesTable services={displayServices} errorMsg={errorMsg} />

        <ServicesCursorPagination
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          beforeCursor={beforeCursor}
          afterCursor={afterCursor}
          itemsCount={displayServices.length}
        />
      </div>
    </div>
  );
}
