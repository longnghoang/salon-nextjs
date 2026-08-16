'use server';

import { createOrder, getOrderById, updateOrder } from '@/lib/api/orderApi';
import { getProducts } from '@/lib/api/productApi';
import { getServices } from '@/lib/api/serviceApi';
import { getEmployees } from '@/lib/api/employeeApi';
import { getCustomers } from '@/lib/api/customerApi';
import type { OrderWithDetails } from '@/types/order';

export async function saveOrderAction(order: Partial<OrderWithDetails>) {
  return await createOrder(order);
}

export async function getOrderAction(id: number) {
  return await getOrderById(id);
}

export async function updateOrderAction(
  id: number,
  order: Partial<OrderWithDetails>
) {
  return await updateOrder(id, order);
}

export async function getProductsAction() {
  return await getProducts();
}

export async function getServicesAction() {
  return await getServices();
}

export async function getEmployeesAction() {
  return await getEmployees();
}

export async function searchCustomersAction(query: string) {
  const result = await getCustomers({
    pageSize: 20,
    searchText: query,
  });
  return result.items || [];
}
