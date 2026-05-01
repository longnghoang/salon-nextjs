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
  defaultEndDate.setDate(defaultEndDate.getDate() + 1);

  const startDateStr = params?.startDate || defaultStartDate.toISOString();
  const endDateStr = params?.endDate || defaultEndDate.toISOString();
  const includeEmp = params?.includeOrderDetailEmployee ?? true;

  const searchParams = new URLSearchParams({
    startDate: startDateStr,
    endDate: endDateStr,
    includeOrderDetailEmployee: String(includeEmp),
  });

  return fetchApi<Order[]>(`/api/Orders?${searchParams.toString()}`);
}
