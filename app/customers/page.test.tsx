import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CustomersPage from './page';
import { getCustomers } from '@/lib/api/customerApi';
import type { Customer } from '@/types/customer';

// Mock the API call
vi.mock('@/lib/api/customerApi', () => ({
  getCustomers: vi.fn(),
}));

const mockCustomers: Customer[] = [
  {
    id: 1,
    code: 'CUST-001',
    fullName: 'Nguyen Van A',
    mobile: '0901234567',
    email: 'a@example.com',
    address: '123 Le Loi',
    birthDay: '1990-05-15',
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

describe('CustomersPage Server Component', () => {
  it('renders the empty state when no customers are returned', async () => {
    vi.mocked(getCustomers).mockResolvedValueOnce({
      items: [],
      paging: { before: null, after: null, hasNext: false, hasPrevious: false },
    });

    const ui = await CustomersPage({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.getByText('No customers found.')).toBeInTheDocument();
  });

  it('renders a list of customers correctly', async () => {
    vi.mocked(getCustomers).mockResolvedValueOnce({
      items: mockCustomers,
      paging: { before: 'c1', after: 'c2', hasNext: true, hasPrevious: false },
    });

    const ui = await CustomersPage({
      searchParams: Promise.resolve({ searchText: 'Nguyen' }),
    });
    render(ui);

    // Verify API called with searchText
    expect(getCustomers).toHaveBeenCalledWith({
      searchText: 'Nguyen',
      pageSize: 20,
      before: undefined,
      after: undefined,
    });

    // Check if customer codes and names are rendered
    expect(screen.getByText('CUST-001')).toBeInTheDocument();
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('0901 234 567')).toBeInTheDocument();
    expect(screen.getByText('VIP customer')).toBeInTheDocument();

    expect(screen.getByText('CUST-002')).toBeInTheDocument();
    expect(screen.getByText('Tran Thi B')).toBeInTheDocument();
    expect(screen.getByText('0912 345 678')).toBeInTheDocument();

    // Check if Add Customer button is rendered
    expect(
      screen.getByRole('button', { name: /Add Customer/i })
    ).toBeInTheDocument();

    // Check if customer counts and pagination are rendered
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders error state if API fails', async () => {
    vi.mocked(getCustomers).mockRejectedValueOnce(new Error('API Error'));

    const ui = await CustomersPage({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(
      screen.getByText('Failed to load customers. Please try again later.')
    ).toBeInTheDocument();
  });
});
