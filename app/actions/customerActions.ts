'use server';

import {
  createCustomer,
  getCustomerById,
  updateCustomer,
} from '@/lib/api/customerApi';
import type { Customer, CustomerFormData } from '@/types/customer';

export async function saveCustomerAction(
  customer: CustomerFormData | Partial<Customer>
) {
  return await createCustomer(customer);
}

export async function getCustomerAction(id: number) {
  return await getCustomerById(id);
}

export async function updateCustomerAction(
  id: number,
  customer: CustomerFormData | Partial<Customer>
) {
  return await updateCustomer(id, customer);
}
