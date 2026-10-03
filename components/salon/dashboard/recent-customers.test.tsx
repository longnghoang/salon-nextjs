import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecentCustomers } from './recent-customers';
import { Customer } from '@/types/customer';

const mockCustomers: Customer[] = [
  {
    id: 1,
    code: 'CUS-001',
    fullName: 'Le Thi Hoa',
    mobile: '0988776655',
    email: 'hoa@example.com',
    address: '123 Nguyen Hue',
    birthDay: null,
    note: 'VIP customer',
    createdBy: 'admin',
    createdDateTime: '2026-10-03T09:00:00Z',
    updatedBy: null,
    updatedDateTime: null,
  },
  {
    id: 2,
    code: 'CUS-002',
    fullName: 'Pham Van Binh',
    mobile: '0977665544',
    email: '',
    address: '456 Le Loi',
    birthDay: null,
    note: null,
    createdBy: 'admin',
    createdDateTime: '2026-10-02T14:30:00Z',
    updatedBy: null,
    updatedDateTime: null,
  },
];

describe('RecentCustomers', () => {
  it('renders customer list with names, mobile, and details', () => {
    render(<RecentCustomers customers={mockCustomers} />);

    expect(screen.getByText('Le Thi Hoa')).toBeInTheDocument();
    expect(screen.getByText('0988776655')).toBeInTheDocument();
    expect(screen.getByText('Pham Van Binh')).toBeInTheDocument();
    expect(screen.getByText('0977665544')).toBeInTheDocument();

    const viewAllLink = screen.getByRole('link', { name: /View all/i });
    expect(viewAllLink).toHaveAttribute('href', '/customers');
  });

  it('renders empty state message when customers list is empty', () => {
    render(<RecentCustomers customers={[]} />);
    expect(screen.getByText(/No recent customers found/i)).toBeInTheDocument();
  });
});
