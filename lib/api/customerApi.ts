import { fetchApi } from './fetchApi';
import type { Customer } from '@/types/customer';

export interface GetCustomersParams {
  currentPage: number;
  pageSize: number;
  searchText?: string;
}

/**
 * Fetches a paginated list of customers from the external Web API.
 * @param params Pagination and search parameters
 * @returns A promise that resolves to an array of customers
 */
export async function getCustomers(
  params: GetCustomersParams
): Promise<Customer[]> {
  const customers = await fetchApi<Customer[]>('/api/Customers/paging', {
    method: 'POST',
    body: JSON.stringify(params),
  });

  return customers || [];
}

export async function countCustomers(): Promise<number> {
  const customers = await fetchApi<Customer[]>('/api/Customers');
  return customers?.length || 0;
}
