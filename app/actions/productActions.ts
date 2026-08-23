'use server';

import {
  createProduct,
  getProductById,
  updateProduct,
} from '@/lib/api/productApi';
import type { Product, ProductFormData } from '@/types/product';

export async function saveProductAction(
  product: ProductFormData | Partial<Product>
) {
  return await createProduct(product);
}

export async function getProductAction(id: number) {
  return await getProductById(id);
}

export async function updateProductAction(
  id: number,
  product: ProductFormData | Partial<Product>
) {
  return await updateProduct(id, product);
}
