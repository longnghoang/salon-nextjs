import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServicesPage from './page';
import { getServices } from '@/lib/api/serviceApi';
import type { Service } from '@/types/service';

// Mock the API call
vi.mock('@/lib/api/serviceApi', () => ({
  getServices: vi.fn(),
}));

// Mock Next.js navigation hooks used in client components
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: vi.fn(() => new URLSearchParams('')),
}));

const mockServices: Service[] = [
  {
    id: 1,
    code: 'SRV-001',
    name: 'Haircut & Styling',
    description: 'Includes shampoo and blow dry',
    price: 200000,
    discountPrice: 180000,
    commission: 15,
    isActive: true,
  },
  {
    id: 2,
    code: 'SRV-002',
    name: 'Hair Coloring',
    description: 'Full hair color treatment',
    price: 500000,
    discountPrice: null,
    commission: 20,
    isActive: true,
  },
];

describe('ServicesPage Server Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the empty state when no services are returned', async () => {
    vi.mocked(getServices).mockResolvedValueOnce({
      items: [],
      paging: { before: null, after: null, hasNext: false, hasPrevious: false },
    });

    const ui = await ServicesPage({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(
      screen.getByText('Manage salon service catalog, pricing, and promotions.')
    ).toBeInTheDocument();
    expect(screen.getByText('Add Service')).toBeInTheDocument();
    expect(screen.getByText('No services found.')).toBeInTheDocument();
  });

  it('renders services list with headers and data', async () => {
    vi.mocked(getServices).mockResolvedValueOnce({
      items: mockServices,
      paging: {
        before: null,
        after: 'next_cursor',
        hasNext: true,
        hasPrevious: false,
      },
    });

    const ui = await ServicesPage({
      searchParams: Promise.resolve({ searchText: 'Hair' }),
    });
    render(ui);

    expect(screen.getByText('SRV-001')).toBeInTheDocument();
    expect(screen.getByText('Haircut & Styling')).toBeInTheDocument();
    expect(screen.getByText('SRV-002')).toBeInTheDocument();
    expect(screen.getByText('Hair Coloring')).toBeInTheDocument();

    expect(getServices).toHaveBeenCalledWith({
      searchText: 'Hair',
      pageSize: 20,
      before: undefined,
      after: undefined,
    });
  });

  it('renders error state if API fails', async () => {
    vi.mocked(getServices).mockRejectedValueOnce(new Error('API Error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ui = await ServicesPage({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(
      screen.getByText('Failed to load services. Please try again later.')
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('opens Add New Service dialog when clicking Add Service button', async () => {
    vi.mocked(getServices).mockResolvedValueOnce({
      items: mockServices,
      paging: { before: null, after: null, hasNext: false, hasPrevious: false },
    });

    const ui = await ServicesPage({ searchParams: Promise.resolve({}) });
    render(ui);

    const addBtn = screen.getByRole('button', { name: /Add Service/i });
    expect(addBtn).toBeInTheDocument();
  });
});
