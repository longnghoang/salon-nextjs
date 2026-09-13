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
  paymentAmount: 50000,
  remainingAmount: 145000,
  status: 2, // OrderStatus.InProgress (Ghi nợ)
  statusName: 'Ghi nợ',
  isBanking: true,
  isPayment: true,
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

    // Check payment pre-population with thousand separator
    const bankCheckbox = screen.getByLabelText(/bank transfer|chuyển khoản/i);
    expect(bankCheckbox).toBeChecked();
    const paymentInput = screen.getByLabelText(
      /payment amount|số tiền thanh toán/i
    );
    expect(paymentInput).toHaveValue('50,000');
    expect(screen.getByTestId('remaining-amount')).toHaveTextContent(
      /145\.000/
    );
  });

  it('recalculates remaining amount dynamically and formats input with thousand separators', async () => {
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

    const paymentInput = screen.getByLabelText(
      /payment amount|số tiền thanh toán/i
    );
    fireEvent.change(paymentInput, { target: { value: '195000' } });

    expect(paymentInput).toHaveValue('195,000');
    expect(screen.getByTestId('remaining-amount')).toHaveTextContent(/0/);
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
    expect(calledPayload.status).toBe(2);
    expect(calledPayload.isBanking).toBe(true);
    expect(calledPayload.paymentAmount).toBe(50000);
    expect(calledPayload.remainingAmount).toBe(145000);
    expect(calledPayload.isPayment).toBe(true);
  });

  it('marks isPayment as false when payment amount is 0', async () => {
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

    const paymentInput = screen.getByLabelText(
      /payment amount|số tiền thanh toán/i
    );
    fireEvent.change(paymentInput, { target: { value: '0' } });

    const updateBtn = screen.getByRole('button', { name: 'Update Order' });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(orderActions.updateOrderAction).toHaveBeenCalledTimes(1);
    });

    const [, calledPayload] = vi.mocked(orderActions.updateOrderAction).mock
      .calls[0];
    expect(calledPayload.paymentAmount).toBe(0);
    expect(calledPayload.isPayment).toBe(false);
  });

  it('toggles bank transfer checkbox and submits updated value', async () => {
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

    const bankCheckbox = screen.getByLabelText(/bank transfer|chuyển khoản/i);
    expect(bankCheckbox).toBeChecked();
    fireEvent.click(bankCheckbox);
    expect(bankCheckbox).not.toBeChecked();

    const updateBtn = screen.getByRole('button', { name: 'Update Order' });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(orderActions.updateOrderAction).toHaveBeenCalledTimes(1);
    });

    const [, calledPayload] = vi.mocked(orderActions.updateOrderAction).mock
      .calls[0];
    expect(calledPayload.isBanking).toBe(false);
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

  it('allows updating Order Discount and VAT in the calculation section and updates grand total', async () => {
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

    const discountInput = screen.getByLabelText(
      /order discount|giảm giá đơn hàng/i
    );
    const vatPercentInput = screen.getByLabelText(
      /vat percentage|vat percent/i
    );
    const vatAmountInput = screen.getByLabelText(/vat amount/i);

    expect(discountInput).toHaveValue('10,000');
    expect(vatAmountInput).toHaveValue('5,000');

    // Update discount to 20,000
    fireEvent.change(discountInput, { target: { value: '20000' } });
    expect(discountInput).toHaveValue('20,000');

    // Update VAT percent to 10%
    fireEvent.change(vatPercentInput, { target: { value: '10' } });
    // taxable is 200,000 - 20,000 = 180,000. 10% VAT is 18,000.
    expect(vatAmountInput).toHaveValue('18,000');

    const updateBtn = screen.getByRole('button', { name: 'Update Order' });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(orderActions.updateOrderAction).toHaveBeenCalledTimes(1);
    });

    const [, calledPayload] = vi.mocked(orderActions.updateOrderAction).mock
      .calls[0];
    expect(calledPayload.discountAmount).toBe(20000);
    expect(calledPayload.vat).toBe(18000);
    expect(calledPayload.amount).toBe(198000);
  });
});
