import { fetchApi } from './fetchApi';
import type { CursorPaginatedResult } from '@/types/pagination';
import type {
  GetProductsParams,
  Product,
  ProductFormData,
} from '@/types/product';

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

/**
 * Fetches a single product by ID.
 */
export async function getProductById(id: number): Promise<Product> {
  return await fetchApi<Product>(`/api/Products/${id}`);
}

/**
 * Creates a new product on the backend API.
 */
export async function createProduct(
  product: ProductFormData | Partial<Product>
): Promise<Product> {
  return await fetchApi<Product>('/api/Products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

/**
 * Updates an existing product on the backend API.
 */
export async function updateProduct(
  id: number,
  product: ProductFormData | Partial<Product>
): Promise<Product> {
  return await fetchApi<Product>(`/api/Products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}
