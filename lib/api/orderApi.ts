import { fetchApi } from './fetchApi';
import type { Order } from '@/types/order';

export interface GetOrdersParams {
  startDate?: string;
  endDate?: string;
  includeOrderDetailEmployee?: boolean;
}

/**
 * Fetches orders from the external Web API.
 * Defaults to fetching orders from the last 30 days up to tomorrow.
 */
export async function getOrders(params?: GetOrdersParams): Promise<Order[]> {
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);

  const defaultEndDate = new Date();

  const startDateStr = params?.startDate || defaultStartDate.toISOString();
  // Add 1 day to the end date to ensure the API returns data for the entire selected day
  const targetEndDate = params?.endDate
    ? new Date(params.endDate)
    : defaultEndDate;
  targetEndDate.setDate(targetEndDate.getDate() + 1);
  const endDateStr = targetEndDate.toISOString();

  const includeEmp = params?.includeOrderDetailEmployee ?? true;

  const searchParams = new URLSearchParams({
    startDate: startDateStr,
    endDate: endDateStr,
    includeOrderDetailEmployee: String(includeEmp),
  });

  const orders = await fetchApi<Order[]>(`/api/Orders?${searchParams.toString()}`);

  return (orders || []).map((order) => ({
    ...order,
    orderDate: ensureUtc(order.orderDate),
    createdDateTime: ensureUtc(order.createdDateTime),
    updatedDateTime: order.updatedDateTime
      ? ensureUtc(order.updatedDateTime)
      : null,
  }));
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
