import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SalonDashboard from './page';
import { auth } from '@/auth';
import { getOrders } from '@/lib/api/orderApi';
import { getCustomers } from '@/lib/api/customerApi';
import { Order, OrderStatus } from '@/types/order';
import { Customer } from '@/types/customer';

import { Session } from 'next-auth';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/api/orderApi', () => ({
  getOrders: vi.fn(),
}));

vi.mock('@/lib/api/customerApi', () => ({
  getCustomers: vi.fn(),
}));

const mockOrders: Order[] = [
  {
    id: 1,
    code: 'ORD-2026-001',
    description: '',
    orderDate: new Date().toISOString(),
    customerId: 10,
    customerName: 'Hoang Long',
    customerMobile: '0909090909',
    amount: 500000,
    paymentAmount: 500000,
    remainingAmount: 0,
    status: OrderStatus.Completed,
    statusName: 'Đã thanh toán',
    totalCommissionAmount: 0,
    createdBy: 'admin',
    createdDateTime: new Date().toISOString(),
    updatedBy: null,
    updatedDateTime: null,
  },
  {
    id: 2,
    code: 'ORD-2026-002',
    description: '',
    orderDate: new Date().toISOString(),
    customerId: 20,
    customerName: 'Nguyen Thi Mai',
    customerMobile: '0918181818',
    amount: 300000,
    paymentAmount: 200000,
    remainingAmount: 100000,
    status: OrderStatus.InProgress,
    statusName: 'Ghi nợ',
    totalCommissionAmount: 0,
    createdBy: 'admin',
    createdDateTime: new Date().toISOString(),
    updatedBy: null,
    updatedDateTime: null,
  },
];

const mockCustomers: Customer[] = [
  {
    id: 1,
    code: 'CUS-001',
    fullName: 'Hoang Long',
    mobile: '0909090909',
    email: 'long@example.com',
    address: 'District 1, HCMC',
    birthDay: null,
    note: null,
    createdBy: 'admin',
    createdDateTime: new Date().toISOString(),
    updatedBy: null,
    updatedDateTime: null,
  },
];

describe('SalonDashboard Server Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders greeting with authenticated user and live metrics', async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { name: 'Alex Johnson', email: 'alex@example.com' },
      expires: '2099-01-01',
    } as unknown as Session);

    // Mock today's orders
    vi.mocked(getOrders).mockResolvedValueOnce({
      items: mockOrders,
      paging: { before: null, after: null, hasNext: false, hasPrevious: false },
    });

    // Mock recent orders
    vi.mocked(getOrders).mockResolvedValueOnce({
      items: mockOrders,
      paging: { before: null, after: null, hasNext: false, hasPrevious: false },
    });

    // Mock recent customers
    vi.mocked(getCustomers).mockResolvedValueOnce({
      items: mockCustomers,
      paging: { before: null, after: null, hasNext: false, hasPrevious: false },
    });

    const ui = await SalonDashboard();
    render(ui);

    // Greeting
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument();

    // Metric cards
    expect(screen.getByText("Today's Revenue")).toBeInTheDocument();
    // 500,000 + 200,000 = 700,000 paid
    expect(screen.getByText(/700.000\s*₫/)).toBeInTheDocument();

    expect(screen.getByText("Today's Orders")).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    expect(screen.getByText('New Customers')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    // Recent orders feed
    expect(screen.getByText('ORD-2026-001')).toBeInTheDocument();
    expect(screen.getByText('ORD-2026-002')).toBeInTheDocument();
    expect(screen.getByText('Đã thanh toán')).toBeInTheDocument();
    expect(screen.getByText('Ghi nợ')).toBeInTheDocument();

    // Recent customers feed
    expect(screen.getAllByText('Hoang Long').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0909090909').length).toBeGreaterThan(0);

    // Action buttons
    expect(screen.getByRole('link', { name: /\+ New Order/i })).toHaveAttribute(
      'href',
      '/orders'
    );
    expect(
      screen.getByRole('link', { name: /\+ New Customer/i })
    ).toHaveAttribute('href', '/customers');
  });

  it('renders fallback greeting and zero metrics when no data is returned', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);
    vi.mocked(getOrders).mockResolvedValue({
      items: [],
      paging: { before: null, after: null, hasNext: false, hasPrevious: false },
    });
    vi.mocked(getCustomers).mockResolvedValue({
      items: [],
      paging: { before: null, after: null, hasNext: false, hasPrevious: false },
    });

    const ui = await SalonDashboard();
    render(ui);

    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByText(/0\s*₫/)).toBeInTheDocument();
    expect(screen.getByText('No recent orders found')).toBeInTheDocument();
    expect(screen.getByText('No recent customers found')).toBeInTheDocument();
  });
});
