import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getProductById,
  createProduct,
  updateProduct,
} from '@/lib/api/productApi';
import { fetchApi } from '@/lib/api/fetchApi';
import type { Product, ProductFormData } from '@/types/product';

vi.mock('@/lib/api/fetchApi', () => ({
  fetchApi: vi.fn(),
}));

const mockProduct: Product = {
  id: 1,
  code: 'PROD-001',
  name: 'Moroccan Argan Oil Shampoo',
  buyingPrice: 120000,
  price: 250000,
  discountPrice: 220000,
  quantity: 45,
  description: 'Nourishing daily shampoo',
  isActive: true,
  createdBy: 'admin',
  createdDateTime: '2026-08-01T10:00:00Z',
  updatedBy: null,
  updatedDateTime: null,
};

describe('Product API Client Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProductById calls GET /api/Products/{id}', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce(mockProduct);

    const result = await getProductById(1);
    expect(fetchApi).toHaveBeenCalledWith('/api/Products/1');
    expect(result.id).toBe(1);
    expect(result.name).toBe('Moroccan Argan Oil Shampoo');
  });

  it('createProduct calls POST /api/Products with JSON payload', async () => {
    const payload: ProductFormData = {
      name: 'Keratin Hair Mask',
      price: 350000,
      buyingPrice: 180000,
      discountPrice: 320000,
      quantity: 20,
      description: 'Deep conditioning hair mask',
      isActive: true,
    };
    vi.mocked(fetchApi).mockResolvedValueOnce({
      ...mockProduct,
      id: 2,
      code: 'PROD-002',
      ...payload,
    });

    const result = await createProduct(payload);
    expect(fetchApi).toHaveBeenCalledWith('/api/Products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    expect(result.id).toBe(2);
    expect(result.name).toBe('Keratin Hair Mask');
  });

  it('updateProduct calls PUT /api/Products/{id} with JSON payload', async () => {
    const updatePayload: ProductFormData = {
      name: 'Moroccan Argan Oil Shampoo 500ml',
      price: 260000,
      buyingPrice: 130000,
      discountPrice: null,
      quantity: 50,
      description: 'Updated packaging',
      isActive: true,
    };
    vi.mocked(fetchApi).mockResolvedValueOnce({
      ...mockProduct,
      ...updatePayload,
    });

    const result = await updateProduct(1, updatePayload);
    expect(fetchApi).toHaveBeenCalledWith('/api/Products/1', {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
    });
    expect(result.name).toBe('Moroccan Argan Oil Shampoo 500ml');
  });
});
