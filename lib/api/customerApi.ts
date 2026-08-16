import { fetchApi } from './fetchApi';
import type { Customer } from '@/types/customer';

export interface CursorPaginationInfo {
  before: string | null;
  after: string | null;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CursorPaginatedResult<T> {
  items: T[];
  paging: CursorPaginationInfo;
}

export interface GetCustomersParams {
  searchText?: string;
  pageSize?: number;
  before?: string;
  after?: string;
}

/**
 * Fetches cursor-paginated customers from the external Web API.
 * @param params Search and cursor pagination parameters
 * @returns A promise that resolves to a cursor-paginated result of customers
 */
export async function getCustomers(
  params?: GetCustomersParams
): Promise<CursorPaginatedResult<Customer>> {
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
    ? `/api/Customers/cursor?${queryString}`
    : '/api/Customers/cursor';

  const response = await fetchApi<CursorPaginatedResult<Customer>>(endpoint);

  if (!response || !response.items) {
    return {
      items: [],
      paging: { before: null, after: null, hasNext: false, hasPrevious: false },
    };
  }

  return response;
}
