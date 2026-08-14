import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddOrderDialog, OrderFormDialog } from './order-form-dialog';
import * as orderActions from '@/app/actions/orderActions';
import type { OrderWithDetails } from '@/types/order';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

// Mock the server actions
vi.mock('@/app/actions/orderActions', () => ({
  saveOrderAction: vi.fn(),
  getOrderAction: vi.fn(),
  updateOrderAction: vi.fn(),
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

const mockExistingOrder: OrderWithDetails = {
  id: 101,
  code: 'ORD-101',
  description: '',
  orderDate: '2026-08-01T10:00:00Z',
  customerId: 10,
  customerName: 'Alice Smith',
  customerMobile: '0123456789',
  customerEmail: 'alice@example.com',
  amount: 195000,
  paymentAmount: 0,
  remainingAmount: 195000,
  status: 1,
  statusName: 'New',
  totalCommissionAmount: 20000,
  createdBy: 'admin',
  createdDateTime: '2026-08-01T10:00:00Z',
  updatedBy: null,
  updatedDateTime: null,
  discountAmount: 10000,
  vat: 5000,
  orderDetails: [
    {
      id: 50,
      orderId: 101,
      price: 200000,
      quantity: 1,
      discountAmount: 0,
      totalAmount: 200000,
      serviceId: 1,
      serviceName: 'Hair Cut',
      servicePrice: 200000,
      productId: null,
      productName: null,
      orderDetailEmployees: [
        {
          id: 5,
          userId: 1,
          employeeName: 'Staff A',
          commissionPercentage: 10,
          commissionAmount: 20000,
        },
      ],
    },
  ],
};

describe('OrderFormDialog - Create Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(orderActions.getProductsAction).mockResolvedValue(mockProducts);
    vi.mocked(orderActions.getServicesAction).mockResolvedValue(mockServices);
    vi.mocked(orderActions.getEmployeesAction).mockResolvedValue(mockEmployees);
  });

  it('renders the trigger button correctly when using AddOrderDialog wrapper', () => {
    render(<AddOrderDialog />);
    expect(screen.getByText('Add New')).toBeInTheDocument();
  });

  it('opens the dialog on trigger click and loads catalog data', async () => {
    render(<OrderFormDialog mode="create" />);

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
    render(<OrderFormDialog mode="create" />);
    fireEvent.click(screen.getByText('Add New'));

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});

describe('OrderFormDialog - Edit Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(orderActions.getProductsAction).mockResolvedValue(mockProducts);
    vi.mocked(orderActions.getServicesAction).mockResolvedValue(mockServices);
    vi.mocked(orderActions.getEmployeesAction).mockResolvedValue(mockEmployees);
    vi.mocked(orderActions.getOrderAction).mockResolvedValue(mockExistingOrder);
  });

  it('fetches existing order and pre-populates customer and order line details', async () => {
    render(
      <OrderFormDialog
        mode="edit"
        orderId={101}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    // Wait for order details to load
    await waitFor(() => {
      expect(orderActions.getOrderAction).toHaveBeenCalledWith(101);
    });

    // Check title and submit button text
    expect(screen.getByText('Edit Order #ORD-101')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Update Order' })
    ).toBeInTheDocument();

    // Check customer info pre-populated
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('0123456789')).toBeInTheDocument();

    // Check pre-populated service item
    expect(screen.getByText('Hair Cut')).toBeInTheDocument();
  });

  it('submits updated order payload via updateOrderAction when Update Order is clicked', async () => {
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
      expect(orderActions.updateOrderAction).toHaveBeenCalledTimes(1);
    });

    const [calledId, calledPayload] = vi.mocked(orderActions.updateOrderAction)
      .mock.calls[0];
    expect(calledId).toBe(101);
    expect(calledPayload.orderDetails?.[0].id).toBe(50);
    expect(calledPayload.orderDetails?.[0].serviceId).toBe(1);
    expect(calledPayload.orderDetails?.[0].orderDetailEmployees?.[0].id).toBe(
      5
    );
  });

  it('displays error message when getOrderAction fails in edit mode', async () => {
    vi.mocked(orderActions.getOrderAction).mockRejectedValueOnce(
      new Error('Failed to fetch order')
    );

    render(
      <OrderFormDialog
        mode="edit"
        orderId={101}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load data. Please try again.')
      ).toBeInTheDocument();
    });
  });
});
