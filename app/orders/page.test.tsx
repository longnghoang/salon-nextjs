import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OrdersPage from './page';
import { getOrders } from '@/lib/api/orderApi';
import { Order, OrderStatus } from '@/types/order';

// Mock the API call
vi.mock('@/lib/api/orderApi', () => ({
  getOrders: vi.fn(),
}));

vi.mock('@/components/orders/add-order-dialog', () => ({
  AddOrderDialog: () => (
    <div data-testid="add-order-dialog">Add Order Dialog Mock</div>
  ),
}));

const mockOrders = [
  {
    id: '1',
    code: 'ORD-001',
    orderDate: '2023-10-01T10:00:00Z',
    customerName: 'John Doe',
    customerMobile: '1234567890',
    status: OrderStatus.Completed,
    amount: 150000,
  },
  {
    id: '2',
    code: 'ORD-002',
    orderDate: '2023-10-02T11:00:00Z',
    customerName: '',
    customerMobile: '0987654321',
    status: OrderStatus.New,
    amount: 200000,
  },
];

describe('OrdersPage Server Component', () => {
  it('renders the empty state when no orders are returned', async () => {
    vi.mocked(getOrders).mockResolvedValueOnce({
      items: [],
      paging: { before: null, after: null, hasNext: false, hasPrevious: false },
    });

    // Server components are just async functions, so we await them
    const ui = await OrdersPage({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.getByText('No orders found.')).toBeInTheDocument();
  });

  it('renders a list of orders correctly', async () => {
    vi.mocked(getOrders).mockResolvedValueOnce({
      items: mockOrders as unknown as Order[],
      paging: { before: 'c1', after: 'c2', hasNext: true, hasPrevious: false },
    });

    const ui = await OrdersPage({ searchParams: Promise.resolve({}) });
    render(ui);

    // Check if the order codes are rendered
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    expect(screen.getByText('ORD-002')).toBeInTheDocument();

    // Check if customer names/fallbacks are rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('0987654321')).toBeInTheDocument();

    // Check if currency is formatted (basic check for the amount)
    expect(screen.getByText(/150\.000/)).toBeInTheDocument();

    // Check if the order dates are formatted as DD/MM/YYYY - HH:mm:ss (date before time separated by dash)
    expect(
      screen.getAllByText(/\d{2}\/\d{2}\/\d{4} - \d{2}:\d{2}:\d{2}/)
    ).toHaveLength(2);
  });

  it('renders error state if API fails', async () => {
    vi.mocked(getOrders).mockRejectedValueOnce(new Error('API Error'));

    const ui = await OrdersPage({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(
      screen.getByText('Failed to load orders. Please try again later.')
    ).toBeInTheDocument();
  });
});
