import { fetchApi } from './fetchApi';
import type { CursorPaginatedResult } from '@/types/pagination';
import type {
  GetServicesParams,
  Service,
  ServiceFormData,
} from '@/types/service';

/**
 * Fetches cursor-paginated services from the backend Web API.
 * @param params Search and cursor pagination parameters
 * @returns A promise resolving to a cursor-paginated result of services
 */
export async function getServices(
  params?: GetServicesParams
): Promise<CursorPaginatedResult<Service>> {
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
    ? `/api/Services/cursor?${queryString}`
    : '/api/Services/cursor';

  const response = await fetchApi<CursorPaginatedResult<Service>>(endpoint);

  if (!response || !response.items) {
    return {
      items: [],
      paging: { before: null, after: null, hasNext: false, hasPrevious: false },
    };
  }

  return response;
}

/**
 * Fetches all services (flat list).
 */
export async function getAllServices(): Promise<Service[]> {
  const services = await fetchApi<Service[]>('/api/Services');
  return services || [];
}

/**
 * Fetches a single service by ID.
 */
export async function getServiceById(id: number): Promise<Service> {
  return await fetchApi<Service>(`/api/Services/${id}`);
}

/**
 * Creates a new service on the backend API.
 */
export async function createService(
  service: ServiceFormData | Partial<Service>
): Promise<Service> {
  return await fetchApi<Service>('/api/Services', {
    method: 'POST',
    body: JSON.stringify(service),
  });
}

/**
 * Updates an existing service on the backend API.
 */
export async function updateService(
  id: number,
  service: ServiceFormData | Partial<Service>
): Promise<Service> {
  return await fetchApi<Service>(`/api/Services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(service),
  });
}
