import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecentOrders } from './recent-orders';
import { Order, OrderStatus } from '@/types/order';

const mockOrders: Order[] = [
  {
    id: 101,
    code: 'ORD-00101',
    description: '',
    orderDate: '2026-10-03T10:30:00Z',
    customerId: 1,
    customerName: 'Nguyen Van A',
    customerMobile: '0901234567',
    amount: 350000,
    paymentAmount: 350000,
    remainingAmount: 0,
    status: OrderStatus.Completed,
    statusName: 'Đã thanh toán',
    totalCommissionAmount: 0,
    createdBy: 'admin',
    createdDateTime: '2026-10-03T10:30:00Z',
    updatedBy: null,
    updatedDateTime: null,
  },
  {
    id: 102,
    code: 'ORD-00102',
    description: '',
    orderDate: '2026-10-03T11:15:00Z',
    customerId: 2,
    customerName: 'Tran Thi B',
    customerMobile: '0912345678',
    amount: 150000,
    paymentAmount: 0,
    remainingAmount: 150000,
    status: OrderStatus.InProgress,
    statusName: 'Ghi nợ',
    totalCommissionAmount: 0,
    createdBy: 'admin',
    createdDateTime: '2026-10-03T11:15:00Z',
    updatedBy: null,
    updatedDateTime: null,
  },
];

describe('RecentOrders', () => {
  it('renders order list with codes, customer names, formatted amounts, and status badges', () => {
    render(<RecentOrders orders={mockOrders} />);

    expect(screen.getByText('ORD-00101')).toBeInTheDocument();
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('ORD-00102')).toBeInTheDocument();
    expect(screen.getByText('Tran Thi B')).toBeInTheDocument();

    // Check status badges
    expect(screen.getByText('Đã thanh toán')).toBeInTheDocument();
    expect(screen.getByText('Ghi nợ')).toBeInTheDocument();

    // Check link to orders page
    const viewAllLink = screen.getByRole('link', { name: /View all/i });
    expect(viewAllLink).toHaveAttribute('href', '/orders');
  });

  it('renders empty state message when orders list is empty', () => {
    render(<RecentOrders orders={[]} />);
    expect(screen.getByText(/No recent orders found/i)).toBeInTheDocument();
  });
});
