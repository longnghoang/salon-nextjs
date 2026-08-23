import { fetchApi } from './fetchApi';
import type { CursorPaginatedResult } from '@/types/pagination';
import type { GetProductsParams, Product } from '@/types/product';

/**
 * Fetches cursor-paginated products from the backend Web API.
 * @param params Search and cursor pagination parameters
 * @returns A promise resolving to a cursor-paginated result of products
 */
export async function getProducts(
  params?: GetProductsParams
): Promise<CursorPaginatedResult<Product>> {
  const searchParams = new URLSearchParams();

  if (params?.searchText) {
    searchParams.set('SearchText', params.searchText);
  }

  if (params?.pageSize !== undefined) {
    searchParams.set('PageSize', String(params.pageSize));
  }

  if (params?.before !== undefined) {
    searchParams.set('Before', params.before);
  }

  if (params?.after !== undefined) {
    searchParams.set('After', params.after);
  }

  const queryString = searchParams.toString();
  const endpoint = queryString
    ? `/api/Products/cursor?${queryString}`
    : '/api/Products/cursor';

  const response = await fetchApi<CursorPaginatedResult<Product>>(endpoint);

  if (!response || !response.items) {
    return {
      items: [],
      paging: { before: null, after: null, hasNext: false, hasPrevious: false },
    };
  }

  return response;
}

/**
 * Fetches all products (flat list).
 */
export async function getAllProducts(): Promise<Product[]> {
  const products = await fetchApi<Product[]>('/api/Products');
  return products || [];
}
