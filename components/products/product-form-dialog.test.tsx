import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ProductFormDialog,
  AddProductDialog,
  formatCurrencyInput,
  parseCurrencyInput,
} from './product-form-dialog';
import * as productActions from '@/app/actions/productActions';
import type { Product } from '@/types/product';

// Mock Next.js router
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock productActions
vi.mock('@/app/actions/productActions', () => ({
  saveProductAction: vi.fn(),
  getProductAction: vi.fn(),
  updateProductAction: vi.fn(),
}));

const mockProduct: Product = {
  id: 10,
  code: 'PROD-010',
  name: 'Organic Shampoo',
  price: 250000,
  buyingPrice: 150000,
  discountPrice: 220000,
  quantity: 30,
  description: 'Organic gentle shampoo for colored hair',
  isActive: true,
  createdBy: 'admin',
  createdDateTime: '2026-08-01T10:00:00Z',
  updatedBy: null,
  updatedDateTime: null,
};

describe('Currency Input Helpers', () => {
  it('formatCurrencyInput formats numbers and digit strings with thousand commas', () => {
    expect(formatCurrencyInput(250000)).toBe('250,000');
    expect(formatCurrencyInput('250000')).toBe('250,000');
    expect(formatCurrencyInput('1500000')).toBe('1,500,000');
    expect(formatCurrencyInput('0')).toBe('0');
    expect(formatCurrencyInput(null)).toBe('');
    expect(formatCurrencyInput(undefined)).toBe('');
    expect(formatCurrencyInput('')).toBe('');
    expect(formatCurrencyInput('abc250def000')).toBe('250,000');
  });

  it('parseCurrencyInput extracts raw integer value or null', () => {
    expect(parseCurrencyInput('250,000')).toBe(250000);
    expect(parseCurrencyInput('1,500,000')).toBe(1500000);
    expect(parseCurrencyInput('0')).toBe(0);
    expect(parseCurrencyInput('')).toBeNull();
    expect(parseCurrencyInput(null)).toBeNull();
    expect(parseCurrencyInput('invalid')).toBeNull();
  });
});

describe('ProductFormDialog - Create Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Add New Product form with empty fields', () => {
    render(
      <ProductFormDialog mode="create" open={true} onOpenChange={vi.fn()} />
    );

    expect(screen.getByText('Add New Product')).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Selling Price/i)).toHaveValue('');
    expect(screen.getByLabelText(/Buying Price/i)).toHaveValue('');
    expect(screen.getByLabelText(/Discount Price/i)).toHaveValue('');
    expect(screen.getByLabelText(/Stock Quantity/i)).toHaveValue(0);
    expect(screen.getByLabelText(/Description/i)).toHaveValue('');
    expect(
      screen.getByRole('button', { name: 'Save Product' })
    ).toBeInTheDocument();
  });

  it('formats currency inputs with thousand separators as user types', () => {
    render(
      <ProductFormDialog mode="create" open={true} onOpenChange={vi.fn()} />
    );

    const priceInput = screen.getByLabelText(/Selling Price/i);
    fireEvent.change(priceInput, { target: { value: '250000' } });
    expect(priceInput).toHaveValue('250,000');

    const buyingPriceInput = screen.getByLabelText(/Buying Price/i);
    fireEvent.change(buyingPriceInput, { target: { value: '150000' } });
    expect(buyingPriceInput).toHaveValue('150,000');

    const discountPriceInput = screen.getByLabelText(/Discount Price/i);
    fireEvent.change(discountPriceInput, { target: { value: '220000' } });
    expect(discountPriceInput).toHaveValue('220,000');
  });

  it('validates required fields (name and price) and displays errors', async () => {
    render(
      <ProductFormDialog mode="create" open={true} onOpenChange={vi.fn()} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save Product' }));

    expect(
      await screen.findByText(
        'Product name is required (at least 2 characters).'
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        'Selling price must be a valid non-negative number.'
      )
    ).toBeInTheDocument();
    expect(productActions.saveProductAction).not.toHaveBeenCalled();
  });

  it('validates discount price cannot exceed selling price', async () => {
    render(
      <ProductFormDialog mode="create" open={true} onOpenChange={vi.fn()} />
    );

    fireEvent.change(screen.getByLabelText(/Product Name/i), {
      target: { value: 'Hair Conditioner' },
    });
    fireEvent.change(screen.getByLabelText(/Selling Price/i), {
      target: { value: '150000' },
    });
    fireEvent.change(screen.getByLabelText(/Discount Price/i), {
      target: { value: '200000' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Product' }));

    expect(
      await screen.findByText('Discount price cannot exceed selling price.')
    ).toBeInTheDocument();
    expect(productActions.saveProductAction).not.toHaveBeenCalled();
  });

  it('validates quantity must be a non-negative integer', async () => {
    render(
      <ProductFormDialog mode="create" open={true} onOpenChange={vi.fn()} />
    );

    fireEvent.change(screen.getByLabelText(/Product Name/i), {
      target: { value: 'Hair Styling Gel' },
    });
    fireEvent.change(screen.getByLabelText(/Selling Price/i), {
      target: { value: '100000' },
    });
    fireEvent.change(screen.getByLabelText(/Stock Quantity/i), {
      target: { value: '-5' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Product' }));

    expect(
      await screen.findByText('Quantity must be a non-negative whole number.')
    ).toBeInTheDocument();
    expect(productActions.saveProductAction).not.toHaveBeenCalled();
  });

  it('submits valid form data with parsed raw numbers and calls saveProductAction', async () => {
    vi.mocked(productActions.saveProductAction).mockResolvedValueOnce(
      mockProduct
    );
    const onOpenChange = vi.fn();

    render(
      <ProductFormDialog
        mode="create"
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    fireEvent.change(screen.getByLabelText(/Product Name/i), {
      target: { value: 'Moroccan Argan Oil' },
    });
    fireEvent.change(screen.getByLabelText(/Selling Price/i), {
      target: { value: '300000' },
    });
    fireEvent.change(screen.getByLabelText(/Buying Price/i), {
      target: { value: '180000' },
    });
    fireEvent.change(screen.getByLabelText(/Discount Price/i), {
      target: { value: '270000' },
    });
    fireEvent.change(screen.getByLabelText(/Stock Quantity/i), {
      target: { value: '25' },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Pure cold-pressed oil' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Product' }));

    await waitFor(() => {
      expect(productActions.saveProductAction).toHaveBeenCalledWith({
        name: 'Moroccan Argan Oil',
        price: 300000,
        buyingPrice: 180000,
        discountPrice: 270000,
        quantity: 25,
        description: 'Pure cold-pressed oil',
        isActive: true,
      });
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('renders AddProductDialog wrapper trigger correctly', () => {
    render(<AddProductDialog />);
    expect(
      screen.getByRole('button', { name: /Add Product/i })
    ).toBeInTheDocument();
  });
});

describe('ProductFormDialog - Edit Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and pre-populates formatted currency in edit mode', async () => {
    vi.mocked(productActions.getProductAction).mockResolvedValueOnce(
      mockProduct
    );

    render(
      <ProductFormDialog
        mode="edit"
        productId={10}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(await screen.findByText('PROD-010')).toBeInTheDocument();
    expect(screen.getByText('Edit Product')).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Name/i)).toHaveValue(
      'Organic Shampoo'
    );
    expect(screen.getByLabelText(/Selling Price/i)).toHaveValue('250,000');
    expect(screen.getByLabelText(/Buying Price/i)).toHaveValue('150,000');
    expect(screen.getByLabelText(/Discount Price/i)).toHaveValue('220,000');
    expect(screen.getByLabelText(/Stock Quantity/i)).toHaveValue(30);
    expect(screen.getByLabelText(/Description/i)).toHaveValue(
      'Organic gentle shampoo for colored hair'
    );
    expect(
      screen.getByRole('button', { name: 'Save Changes' })
    ).toBeInTheDocument();
  });

  it('submits updated product data with raw parsed numbers', async () => {
    vi.mocked(productActions.getProductAction).mockResolvedValueOnce(
      mockProduct
    );
    vi.mocked(productActions.updateProductAction).mockResolvedValueOnce({
      ...mockProduct,
      name: 'Organic Shampoo Extra Gentle',
    });
    const onOpenChange = vi.fn();

    render(
      <ProductFormDialog
        mode="edit"
        productId={10}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    expect(await screen.findByLabelText(/Product Name/i)).toHaveValue(
      'Organic Shampoo'
    );

    fireEvent.change(screen.getByLabelText(/Product Name/i), {
      target: { value: 'Organic Shampoo Extra Gentle' },
    });
    fireEvent.change(screen.getByLabelText(/Selling Price/i), {
      target: { value: '280000' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(productActions.updateProductAction).toHaveBeenCalledWith(10, {
        name: 'Organic Shampoo Extra Gentle',
        price: 280000,
        buyingPrice: 150000,
        discountPrice: 220000,
        quantity: 30,
        description: 'Organic gentle shampoo for colored hair',
        isActive: true,
      });
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('shows error banner when fetching product data fails', async () => {
    vi.mocked(productActions.getProductAction).mockRejectedValueOnce(
      new Error('Failed to load')
    );

    render(
      <ProductFormDialog
        mode="edit"
        productId={10}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(
      await screen.findByText(
        'Failed to load product details. Please try again.'
      )
    ).toBeInTheDocument();
  });

  it('shows error banner when update action fails', async () => {
    vi.mocked(productActions.getProductAction).mockResolvedValueOnce(
      mockProduct
    );
    vi.mocked(productActions.updateProductAction).mockRejectedValueOnce(
      new Error('API save error')
    );

    render(
      <ProductFormDialog
        mode="edit"
        productId={10}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(await screen.findByLabelText(/Product Name/i)).toHaveValue(
      'Organic Shampoo'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(
      await screen.findByText(
        'Failed to save product. Please check your information and try again.'
      )
    ).toBeInTheDocument();
  });
});
