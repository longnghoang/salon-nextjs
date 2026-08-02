import { fetchApi } from './fetchApi';
import type { Service } from '@/types/service';

export async function getServices(): Promise<Service[]> {
  const services = await fetchApi<Service[]>('/api/Services');
  return services || [];
}
