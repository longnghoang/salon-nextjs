import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductsTable } from './products-table';
import type { Product } from '@/types/product';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock('@/app/actions/productActions', () => ({
  getProductAction: vi.fn().mockResolvedValue({
    id: 1,
    code: 'PROD-001',
    name: 'Moroccan Argan Oil Shampoo',
    price: 250000,
    buyingPrice: 120000,
    discountPrice: 220000,
    quantity: 45,
    description: 'Nourishing daily shampoo',
    isActive: true,
  }),
  saveProductAction: vi.fn(),
  updateProductAction: vi.fn(),
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
    quantity: 0,
    description: null,
    isActive: false,
  },
];

describe('ProductsTable Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table headers and product rows correctly', () => {
    render(<ProductsTable products={mockProducts} />);

    expect(screen.getByText('Product Code')).toBeInTheDocument();
    expect(screen.getByText('Product Name')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Buying Price')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();

    // Row 1
    expect(screen.getByText('PROD-001')).toBeInTheDocument();
    expect(screen.getByText('Moroccan Argan Oil Shampoo')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Nourishing daily shampoo')).toBeInTheDocument();

    // Row 2
    expect(screen.getByText('PROD-002')).toBeInTheDocument();
    expect(screen.getByText('Keratin Hair Mask')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('opens edit product dialog when clicking on product code button', async () => {
    render(<ProductsTable products={mockProducts} />);

    const editBtn = screen.getByRole('button', { name: /PROD-001/i });
    fireEvent.click(editBtn);

    expect(await screen.findByText('Edit Product')).toBeInTheDocument();
  });

  it('renders empty state when products array is empty', () => {
    render(<ProductsTable products={[]} />);
    expect(screen.getByText('No products found.')).toBeInTheDocument();
  });

  it('renders error message when errorMsg is supplied', () => {
    render(
      <ProductsTable
        products={[]}
        errorMsg="Failed to load products. Please try again later."
      />
    );
    expect(
      screen.getByText('Failed to load products. Please try again later.')
    ).toBeInTheDocument();
  });
});
