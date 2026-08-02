import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddOrderDialog } from './add-order-dialog';
import * as orderActions from '@/app/actions/orderActions';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

// Mock the server actions
vi.mock('@/app/actions/orderActions', () => ({
  saveOrderAction: vi.fn(),
  getProductsAction: vi.fn(),
  getServicesAction: vi.fn(),
  getEmployeesAction: vi.fn(),
  searchCustomersAction: vi.fn(),
}));

const mockProducts = [
  {
    id: 1,
    code: 'P01',
    name: 'Shampoo',
    price: 100000,
    buyingPrice: 50000,
    discountPrice: null,
    quantity: 10,
    description: 'Shampoo description',
    isActive: true,
  },
];

const mockServices = [
  {
    id: 1,
    code: 'S01',
    name: 'Hair Cut',
    price: 200000,
    commission: 10,
    description: 'Haircut description',
    discountPrice: null,
    isActive: true,
  },
];

const mockEmployees = [
  { id: 1, name: 'Staff A', userName: 'staffa', email: 'staffa@salon.com' },
];

describe('AddOrderDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(orderActions.getProductsAction).mockResolvedValue(mockProducts);
    vi.mocked(orderActions.getServicesAction).mockResolvedValue(mockServices);
    vi.mocked(orderActions.getEmployeesAction).mockResolvedValue(mockEmployees);
  });

  it('renders the trigger button correctly', () => {
    render(<AddOrderDialog />);
    expect(screen.getByText('Add New')).toBeInTheDocument();
  });

  it('opens the dialog on trigger click and loads catalog data', async () => {
    render(<AddOrderDialog />);

    // Open Dialog
    fireEvent.click(screen.getByText('Add New'));

    expect(screen.getByText('Create New Order')).toBeInTheDocument();

    await waitFor(() => {
      expect(orderActions.getProductsAction).toHaveBeenCalled();
      expect(orderActions.getServicesAction).toHaveBeenCalled();
      expect(orderActions.getEmployeesAction).toHaveBeenCalled();
    });
  });

  it('contains close and submit buttons', async () => {
    render(<AddOrderDialog />);
    fireEvent.click(screen.getByText('Add New'));

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
