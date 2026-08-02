import { fetchApi } from './fetchApi';
import type { Product } from '@/types/product';

export async function getProducts(): Promise<Product[]> {
  const products = await fetchApi<Product[]>('/api/Products');
  return products || [];
}
