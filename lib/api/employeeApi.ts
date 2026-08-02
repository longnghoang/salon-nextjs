import { fetchApi } from './fetchApi';
import type { Employee } from '@/types/employee';

export async function getEmployees(): Promise<Employee[]> {
  const employees = await fetchApi<Employee[]>('/api/Users/employees');
  return employees || [];
}
