import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductsPage from './page';
import { getProducts } from '@/lib/api/productApi';
import type { Product } from '@/types/product';

// Mock the API call
vi.mock('@/lib/api/productApi', () => ({
  getProducts: vi.fn(),
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

const mockProducts: Product[] = [
  {
    id: 1,
    code: 'PROD-001',
    name: 'Moroccan Argan Oil Shampoo',
    buyingPrice: 120000,
    price: 250000,
    discountPrice: 220000,
    quantity: 45,
    description: 'Nourishing daily shampoo',
    isActive: true,
  },
  {
    id: 2,
    code: 'PROD-002',
    name: 'Keratin Hair Mask',
    buyingPrice: null,
    price: 350000,
    discountPrice: null,
    quantity: 12,
    description: 'Deep repair treatment',
    isActive: true,
  },
];

describe('ProductsPage Server Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the empty state when no products are returned', async () => {
    vi.mocked(getProducts).mockResolvedValueOnce({
      items: [],
      paging: { before: null, after: null, hasNext: false, hasPrevious: false },
    });

    const ui = await ProductsPage({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.getByText('No products found.')).toBeInTheDocument();
  });

  it('renders a list of products correctly and passes searchParams to getProducts', async () => {
    vi.mocked(getProducts).mockResolvedValueOnce({
      items: mockProducts,
      paging: {
        before: 'cur_before',
        after: 'cur_after',
        hasNext: true,
        hasPrevious: false,
      },
    });

    const ui = await ProductsPage({
      searchParams: Promise.resolve({ searchText: 'Shampoo' }),
    });
    render(ui);

    // Verify API called with searchText
    expect(getProducts).toHaveBeenCalledWith({
      searchText: 'Shampoo',
      pageSize: 20,
      before: undefined,
      after: undefined,
    });

    // Check header
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(
      screen.getByText('Manage retail inventory and salon supplies.')
    ).toBeInTheDocument();

    // Check products rendered
    expect(screen.getByText('PROD-001')).toBeInTheDocument();
    expect(screen.getByText('Moroccan Argan Oil Shampoo')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();

    expect(screen.getByText('PROD-002')).toBeInTheDocument();
    expect(screen.getByText('Keratin Hair Mask')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();

    // Check count
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders error state if API fails', async () => {
    vi.mocked(getProducts).mockRejectedValueOnce(new Error('API Error'));

    const ui = await ProductsPage({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(
      screen.getByText('Failed to load products. Please try again later.')
    ).toBeInTheDocument();
  });
});
