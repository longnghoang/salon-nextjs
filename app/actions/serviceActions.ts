'use server';

import {
  createService,
  getServiceById,
  updateService,
} from '@/lib/api/serviceApi';
import type { Service, ServiceFormData } from '@/types/service';

export async function saveServiceAction(
  service: ServiceFormData | Partial<Service>
) {
  return await createService(service);
}

export async function getServiceAction(id: number) {
  return await getServiceById(id);
}

export async function updateServiceAction(
  id: number,
  service: ServiceFormData | Partial<Service>
) {
  return await updateService(id, service);
}
