import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getServices, getAllServices } from '@/lib/api/serviceApi';
import { fetchApi } from '@/lib/api/fetchApi';
import type { Service } from '@/types/service';

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
});
