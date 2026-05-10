import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OrdersPage from './page';
import { getOrders } from '@/lib/api/orderApi';
import { OrderStatus } from '@/types/order';

// Mock the API call
vi.mock('@/lib/api/orderApi', () => ({
  getOrders: vi.fn(),
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
    vi.mocked(getOrders).mockResolvedValueOnce([]);

    // Server components are just async functions, so we await them
    const ui = await OrdersPage({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.getByText('No orders found.')).toBeInTheDocument();
  });

  it('renders a list of orders correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getOrders).mockResolvedValueOnce(mockOrders as any);

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
