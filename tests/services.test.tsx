import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getServices,
  getAllServices,
  getServiceById,
  createService,
  updateService,
} from '@/lib/api/serviceApi';
import { fetchApi } from '@/lib/api/fetchApi';
import type { Service, ServiceFormData } from '@/types/service';

vi.mock('@/lib/api/fetchApi', () => ({
  fetchApi: vi.fn(),
}));

const mockServices: Service[] = [
  {
    id: 1,
    code: 'SRV-001',
    name: 'Haircut & Wash',
    description: 'Basic styling and wash',
    price: 150000,
    discountPrice: 130000,
    commission: 10,
    isActive: true,
  },
  {
    id: 2,
    code: 'SRV-002',
    name: 'Hair Coloring',
    description: null,
    price: 500000,
    discountPrice: null,
    commission: 15,
    isActive: true,
  },
];

describe('Service API Client Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getServices calls /api/Services/cursor without params when none provided', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce({
      items: mockServices,
      paging: {
        before: null,
        after: 'after_token',
        hasNext: true,
        hasPrevious: false,
      },
    });

    const result = await getServices();
    expect(fetchApi).toHaveBeenCalledWith('/api/Services/cursor');
    expect(result.items).toHaveLength(2);
    expect(result.paging.hasNext).toBe(true);
  });

  it('getServices constructs correct query parameters', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce({
      items: [mockServices[0]],
      paging: {
        before: 'before_token',
        after: 'after_token',
        hasNext: true,
        hasPrevious: true,
      },
    });

    await getServices({
      searchText: 'hair',
      pageSize: 20,
      before: 'cursor_b',
      after: 'cursor_a',
    });

    expect(fetchApi).toHaveBeenCalledWith(
      '/api/Services/cursor?SearchText=hair&PageSize=20&Before=cursor_b&After=cursor_a'
    );
  });

  it('getServices returns fallback structure when API returns falsy or empty response', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce(null);

    const result = await getServices();
    expect(result).toEqual({
      items: [],
      paging: { before: null, after: null, hasNext: false, hasPrevious: false },
    });
  });

  it('getAllServices calls GET /api/Services and returns flat list', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce(mockServices);

    const result = await getAllServices();
    expect(fetchApi).toHaveBeenCalledWith('/api/Services');
    expect(result).toHaveLength(2);
  });

  it('getServiceById calls GET /api/Services/{id}', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce(mockServices[0]);

    const result = await getServiceById(1);
    expect(fetchApi).toHaveBeenCalledWith('/api/Services/1');
    expect(result).toEqual(mockServices[0]);
  });

  it('createService calls POST /api/Services with JSON payload', async () => {
    const payload: ServiceFormData = {
      name: 'Scalp Treatment',
      price: 350000,
      discountPrice: 300000,
      commission: 12,
      description: 'Relaxing scalp massage and treatment',
      isActive: true,
    };

    vi.mocked(fetchApi).mockResolvedValueOnce({
      id: 3,
      code: 'SRV-003',
      ...payload,
    });

    const result = await createService(payload);
    expect(fetchApi).toHaveBeenCalledWith('/api/Services', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    expect(result.id).toBe(3);
    expect(result.name).toBe('Scalp Treatment');
  });

  it('updateService calls PUT /api/Services/{id} with JSON payload', async () => {
    const payload: Partial<Service> = {
      id: 1,
      name: 'Haircut & Styling Deluxe',
      price: 220000,
    };

    vi.mocked(fetchApi).mockResolvedValueOnce({
      ...mockServices[0],
      ...payload,
    });

    const result = await updateService(1, payload);
    expect(fetchApi).toHaveBeenCalledWith('/api/Services/1', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    expect(result.name).toBe('Haircut & Styling Deluxe');
  });
});
