import { getProducts } from '@/lib/api/productApi';
import type { Product } from '@/types/product';
import { ProductFilter } from '@/components/products/product-filter';
import { ProductsCursorPagination } from '@/components/products/products-cursor-pagination';
import { ProductsTable } from '@/components/products/products-table';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ProductsPage(props: {
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

  let displayProducts: Product[] = [];
  let hasNext = false;
  let hasPrevious = false;
  let beforeCursor: string | null = null;
  let afterCursor: string | null = null;
  let errorMsg = '';

  try {
    const paginatedResult = await getProducts({
      searchText,
      pageSize,
      before,
      after,
    });
    displayProducts = paginatedResult.items || [];
    hasNext = paginatedResult.paging?.hasNext || false;
    hasPrevious = paginatedResult.paging?.hasPrevious || false;
    beforeCursor = paginatedResult.paging?.before || null;
    afterCursor = paginatedResult.paging?.after || null;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    errorMsg = 'Failed to load products. Please try again later.';
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-6 duration-700 fade-in">
      <header className="mt-4 border-b border-border pb-6">
        <h1 className="font-heading text-4xl tracking-tight text-foreground">
          Products
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage retail inventory and salon supplies.
        </p>
      </header>
      <ProductFilter />
      <div className="space-y-6">
        <ProductsTable products={displayProducts} errorMsg={errorMsg} />

        <ProductsCursorPagination
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          beforeCursor={beforeCursor}
          afterCursor={afterCursor}
          itemsCount={displayProducts.length}
        />
      </div>
    </div>
  );
}
