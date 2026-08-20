import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCustomerById,
  createCustomer,
  updateCustomer,
} from '@/lib/api/customerApi';
import { fetchApi } from '@/lib/api/fetchApi';
import type { Customer } from '@/types/customer';

vi.mock('@/lib/api/fetchApi', () => ({
  fetchApi: vi.fn(),
}));

const mockCustomer: Customer = {
  id: 1,
  code: 'CUST-001',
  fullName: 'Nguyen Van A',
  mobile: '0901234567',
  email: 'a@example.com',
  address: '123 Le Loi',
  birthDay: '1990-05-15T00:00:00Z',
  note: 'VIP customer',
  createdBy: 'admin',
  createdDateTime: '2026-08-01T10:00:00Z',
  updatedBy: null,
  updatedDateTime: null,
};

describe('Customer API Client Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCustomerById calls GET /api/Customers/{id}', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce(mockCustomer);

    const result = await getCustomerById(1);
    expect(fetchApi).toHaveBeenCalledWith('/api/Customers/1');
    expect(result.id).toBe(1);
    expect(result.fullName).toBe('Nguyen Van A');
  });

  it('createCustomer calls POST /api/Customers with JSON payload', async () => {
    const payload = {
      fullName: 'Tran Thi B',
      mobile: '0912345678',
      email: 'b@example.com',
    };
    vi.mocked(fetchApi).mockResolvedValueOnce({
      ...mockCustomer,
      id: 2,
      ...payload,
    });

    const result = await createCustomer(payload);
    expect(fetchApi).toHaveBeenCalledWith('/api/Customers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    expect(result.id).toBe(2);
    expect(result.fullName).toBe('Tran Thi B');
  });

  it('updateCustomer calls PUT /api/Customers/{id} with JSON payload', async () => {
    const updatePayload = {
      fullName: 'Nguyen Van A Updated',
      mobile: '0901234567',
    };
    vi.mocked(fetchApi).mockResolvedValueOnce({
      ...mockCustomer,
      fullName: 'Nguyen Van A Updated',
    });

    const result = await updateCustomer(1, updatePayload);
    expect(fetchApi).toHaveBeenCalledWith('/api/Customers/1', {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
    });
    expect(result.fullName).toBe('Nguyen Van A Updated');
  });
});
