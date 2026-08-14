import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrdersTable } from '@/components/orders/orders-table';
import { OrderFormDialog } from '@/components/orders/order-form-dialog';
import { getOrderById, updateOrder } from '@/lib/api/orderApi';
import * as orderActions from '@/app/actions/orderActions';
import { fetchApi } from '@/lib/api/fetchApi';
import type { Order, OrderWithDetails } from '@/types/order';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

// Mock fetchApi
vi.mock('@/lib/api/fetchApi', () => ({
  fetchApi: vi.fn(),
}));

// Mock orderActions server actions
vi.mock('@/app/actions/orderActions', () => ({
  saveOrderAction: vi.fn(),
  getOrderAction: vi.fn(),
  updateOrderAction: vi.fn(),
  getProductsAction: vi.fn(),
  getServicesAction: vi.fn(),
  getEmployeesAction: vi.fn(),
  searchCustomersAction: vi.fn(),
}));

const mockOrders: Order[] = [
  {
    id: 101,
    code: 'ORD-101',
    description: '',
    orderDate: '2026-08-01T10:00:00Z',
    customerId: 1,
    customerName: 'Alice Smith',
    customerMobile: '0123456789',
    amount: 150000,
    paymentAmount: 150000,
    remainingAmount: 0,
    status: 1,
    statusName: 'New',
    totalCommissionAmount: 0,
    createdBy: 'admin',
    createdDateTime: '2026-08-01T10:00:00Z',
    updatedBy: null,
    updatedDateTime: null,
  },
];

const mockOrderWithDetails: OrderWithDetails = {
  ...mockOrders[0],
  discountAmount: 10000,
  vat: 5000,
  orderDetails: [
    {
      id: 1,
      orderId: 101,
      price: 100000,
      quantity: 1,
      discountAmount: 0,
      totalAmount: 100000,
      serviceId: 1,
      serviceName: 'Hair Cut',
      servicePrice: 100000,
      productId: null,
      productName: null,
      orderDetailEmployees: [
        {
          id: 1,
          userId: 1,
          employeeName: 'Staff A',
          commissionPercentage: 10,
          commissionAmount: 10000,
        },
      ],
    },
  ],
};

describe('Order API Client Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getOrderById calls GET /api/Orders/{id}', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce(mockOrderWithDetails);

    const result = await getOrderById(101);
    expect(fetchApi).toHaveBeenCalledWith('/api/Orders/101');
    expect(result.id).toBe(101);
  });

  it('updateOrder calls PUT /api/Orders/{id}', async () => {
    const updatedPayload = { amount: 200000 };
    vi.mocked(fetchApi).mockResolvedValueOnce({
      ...mockOrders[0],
      amount: 200000,
    });

    const result = await updateOrder(101, updatedPayload);
    expect(fetchApi).toHaveBeenCalledWith('/api/Orders/101', {
      method: 'PUT',
      body: JSON.stringify(updatedPayload),
    });
    expect(result.amount).toBe(200000);
  });
});

describe('OrdersTable Edit Order Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(orderActions.getProductsAction).mockResolvedValue([]);
    vi.mocked(orderActions.getServicesAction).mockResolvedValue([]);
    vi.mocked(orderActions.getEmployeesAction).mockResolvedValue([]);
    vi.mocked(orderActions.getOrderAction).mockResolvedValue(
      mockOrderWithDetails
    );
  });

  it('renders Order Code clickable button and opens Edit Order dialog on click', async () => {
    render(<OrdersTable orders={mockOrders} />);

    const codeBtn = screen.getByRole('button', { name: 'ORD-101' });
    expect(codeBtn).toBeInTheDocument();

    fireEvent.click(codeBtn);

    await waitFor(() => {
      expect(orderActions.getOrderAction).toHaveBeenCalledWith(101);
    });

    expect(screen.getByText('Edit Order #ORD-101')).toBeInTheDocument();
  });
});

describe('OrderFormDialog in Edit Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(orderActions.getProductsAction).mockResolvedValue([]);
    vi.mocked(orderActions.getServicesAction).mockResolvedValue([]);
    vi.mocked(orderActions.getEmployeesAction).mockResolvedValue([]);
    vi.mocked(orderActions.getOrderAction).mockResolvedValue(
      mockOrderWithDetails
    );
  });

  it('renders Edit Order modal and submit button correctly', async () => {
    render(
      <OrderFormDialog
        mode="edit"
        orderId={101}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(orderActions.getOrderAction).toHaveBeenCalledWith(101);
    });

    expect(
      screen.getByRole('button', { name: 'Update Order' })
    ).toBeInTheDocument();
  });

  it('includes orderDetail id in the payload when submitting updates in edit mode', async () => {
    render(
      <OrderFormDialog
        mode="edit"
        orderId={101}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(orderActions.getOrderAction).toHaveBeenCalledWith(101);
    });

    const updateBtn = screen.getByRole('button', { name: 'Update Order' });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(orderActions.updateOrderAction).toHaveBeenCalled();
    });

    const callPayload = vi.mocked(orderActions.updateOrderAction).mock
      .calls[0][1];
    expect(callPayload.orderDetails?.[0].id).toBe(1);
  });
});
