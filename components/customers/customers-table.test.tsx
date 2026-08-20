import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomersTable } from './customers-table';
import * as customerActions from '@/app/actions/customerActions';
import type { Customer } from '@/types/customer';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

// Mock customerActions
vi.mock('@/app/actions/customerActions', () => ({
  saveCustomerAction: vi.fn(),
  getCustomerAction: vi.fn(),
  updateCustomerAction: vi.fn(),
}));

const mockCustomers: Customer[] = [
  {
    id: 1,
    code: 'CUST-001',
    fullName: 'Nguyen Van A',
    mobile: '0901234567',
    email: 'a@example.com',
    address: '123 Le Loi',
    birthDay: '1990-05-15T00:00:00Z',
    note: 'VIP customer',
    createdBy: 'admin',
    createdDateTime: '2023-10-01T10:00:00Z',
    updatedBy: null,
    updatedDateTime: null,
  },
  {
    id: 2,
    code: 'CUST-002',
    fullName: 'Tran Thi B',
    mobile: '0912345678',
    email: 'b@example.com',
    address: '456 Nguyen Hue',
    birthDay: null,
    note: null,
    createdBy: 'admin',
    createdDateTime: '2023-10-02T11:00:00Z',
    updatedBy: null,
    updatedDateTime: null,
  },
];

describe('CustomersTable Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customerActions.getCustomerAction).mockResolvedValue(
      mockCustomers[0]
    );
  });

  it('renders table headers and customer rows correctly', () => {
    render(<CustomersTable customers={mockCustomers} />);

    expect(screen.getByText('Customer Code')).toBeInTheDocument();
    expect(screen.getByText('Customer Name')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('DOB')).toBeInTheDocument();
    expect(screen.getByText('Created Date')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /CUST-001/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('0901 234 567')).toBeInTheDocument();
    expect(screen.getByText('15/05/1990')).toBeInTheDocument();
    expect(screen.getByText('VIP customer')).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /CUST-002/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Tran Thi B')).toBeInTheDocument();
  });

  it('renders empty state when customer list is empty', () => {
    render(<CustomersTable customers={[]} />);
    expect(screen.getByText('No customers found.')).toBeInTheDocument();
  });

  it('renders error message when errorMsg prop is provided', () => {
    render(
      <CustomersTable
        customers={[]}
        errorMsg="Failed to load customers. Please try again later."
      />
    );
    expect(
      screen.getByText('Failed to load customers. Please try again later.')
    ).toBeInTheDocument();
  });

  it('clicking on Customer Code button opens Edit Customer dialog', async () => {
    render(<CustomersTable customers={mockCustomers} />);

    const codeBtn = screen.getByRole('button', { name: /CUST-001/i });
    fireEvent.click(codeBtn);

    await waitFor(() => {
      expect(customerActions.getCustomerAction).toHaveBeenCalledWith(1);
    });

    expect(screen.getByText('Edit Customer')).toBeInTheDocument();
    expect(screen.getAllByText('CUST-001').length).toBeGreaterThanOrEqual(2);
  });
});
