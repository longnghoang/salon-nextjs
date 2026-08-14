import { fetchApi } from './fetchApi';
import type { Order, OrderStatus, OrderWithDetails } from '@/types/order';
import { toLocalDateString } from '@/lib/utils';

export interface GetOrdersParams {
  startDate?: string;
  endDate?: string;
  status?: OrderStatus | number;
  pageSize?: number;
  before?: string;
  after?: string;
  includeOrderDetailEmployee?: boolean;
}

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

/**
 * Fetches cursor-paginated orders from the external Web API.
 * Defaults to fetching orders from the last 30 days.
 */
export async function getOrders(
  params?: GetOrdersParams
): Promise<CursorPaginatedResult<Order>> {
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);

  const defaultEndDate = new Date();

  const startDateStr = params?.startDate || toLocalDateString(defaultStartDate);
  const endDateStr = params?.endDate || toLocalDateString(defaultEndDate);

  const includeEmp = params?.includeOrderDetailEmployee ?? true;

  const searchParams = new URLSearchParams({
    StartDate: startDateStr,
    EndDate: endDateStr,
    IncludeOrderDetailEmployee: String(includeEmp),
  });

  if (params?.status !== undefined) {
    searchParams.set('Status', String(params.status));
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

  const response = await fetchApi<CursorPaginatedResult<Order>>(
    `/api/Orders/cursor?${searchParams.toString()}`
  );

  if (!response || !response.items) {
    return {
      items: [],
      paging: { before: null, after: null, hasNext: false, hasPrevious: false },
    };
  }

  const items = response.items.map((order) => ({
    ...order,
    orderDate: ensureUtc(order.orderDate),
    createdDateTime: ensureUtc(order.createdDateTime),
    updatedDateTime: order.updatedDateTime
      ? ensureUtc(order.updatedDateTime)
      : null,
  }));

  return {
    items,
    paging: response.paging,
  };
}

/**
 * Creates a new order on the backend API.
 */
export async function createOrder(
  order: Partial<OrderWithDetails>
): Promise<Order> {
  return await fetchApi<Order>('/api/Orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
}

/**
 * Fetches single order with details by ID.
 */
export async function getOrderById(id: number): Promise<OrderWithDetails> {
  return await fetchApi<OrderWithDetails>(`/api/Orders/${id}`);
}

/**
 * Updates an existing order on the backend API.
 */
export async function updateOrder(
  id: number,
  order: Partial<OrderWithDetails>
): Promise<Order> {
  return await fetchApi<Order>(`/api/Orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(order),
  });
}

/**
 * Ensures a date string is treated as UTC by appending 'Z' if no timezone info is present.
 */
function ensureUtc(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  // If it already has Z or an offset (+/-), return as is
  if (dateStr.endsWith('Z') || dateStr.includes('+') || dateStr.includes('-')) {
    // Basic check for - as offset vs - in date YYYY-MM-DD
    // Usually offsets are like +HH:mm or -HH:mm at the end
    const lastPart = dateStr.slice(-6);
    if (lastPart.includes('+') || lastPart.includes('-')) return dateStr;
    if (dateStr.endsWith('Z')) return dateStr;
  }
  return `${dateStr}Z`;
}
