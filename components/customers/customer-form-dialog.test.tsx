import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CustomerFormDialog,
  AddCustomerDialog,
  formatMobileNumber,
  formatDateInput,
  parseDateFromDDMMYYYY,
  formatDateToDDMMYYYY,
} from './customer-form-dialog';
import * as customerActions from '@/app/actions/customerActions';
import type { Customer } from '@/types/customer';

// Mock Next.js router
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock customerActions
vi.mock('@/app/actions/customerActions', () => ({
  saveCustomerAction: vi.fn(),
  getCustomerAction: vi.fn(),
  updateCustomerAction: vi.fn(),
}));

const mockCustomer: Customer = {
  id: 10,
  code: 'CUST-010',
  fullName: 'Nguyen Van C',
  mobile: '0901234567',
  email: 'c@example.com',
  address: '789 Tran Hung Dao',
  birthDay: '1995-10-20T00:00:00.000Z',
  note: 'Allergic to hair dye product X',
  createdBy: 'admin',
  createdDateTime: '2026-08-01T10:00:00Z',
  updatedBy: null,
  updatedDateTime: null,
};

describe('Phone and Date Helper Utilities', () => {
  it('formatMobileNumber formats 10 digits as ____ ___ ___', () => {
    expect(formatMobileNumber('0901234567')).toBe('0901 234 567');
    expect(formatMobileNumber('0901')).toBe('0901');
    expect(formatMobileNumber('0901234')).toBe('0901 234');
    expect(formatMobileNumber('090123456789')).toBe('0901 234 567'); // Truncates beyond 10 digits
    expect(formatMobileNumber('abc0901def234567')).toBe('0901 234 567'); // Strips non-digits
  });

  it('formatDateInput formats raw digits to dd-MM-yyyy', () => {
    expect(formatDateInput('25082011')).toBe('25-08-2011');
    expect(formatDateInput('25')).toBe('25');
    expect(formatDateInput('2508')).toBe('25-08');
    expect(formatDateInput('25-08-2011')).toBe('25-08-2011');
    expect(formatDateInput('25082011999')).toBe('25-08-2011'); // Truncates beyond 8 digits
    expect(formatDateInput('abc25def08xyz2011')).toBe('25-08-2011'); // Strips non-digits
  });

  it('parseDateFromDDMMYYYY parses valid dd-MM-yyyy strings and rejects invalid ones', () => {
    const valid = parseDateFromDDMMYYYY('20-10-1995');
    expect(valid).not.toBeNull();
    expect(valid?.getFullYear()).toBe(1995);
    expect(valid?.getMonth()).toBe(9); // 0-indexed October
    expect(valid?.getDate()).toBe(20);

    expect(parseDateFromDDMMYYYY('31-02-2020')).toBeNull(); // Invalid date
    expect(parseDateFromDDMMYYYY('invalid')).toBeNull();
    expect(parseDateFromDDMMYYYY('')).toBeNull();
  });

  it('formatDateToDDMMYYYY converts date string to dd-MM-yyyy', () => {
    expect(formatDateToDDMMYYYY('1995-10-20T00:00:00Z')).toBe('20-10-1995');
    expect(formatDateToDDMMYYYY(null)).toBe('');
  });
});

describe('CustomerFormDialog - Create Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Add New Customer form with empty fields', () => {
    render(
      <CustomerFormDialog mode="create" open={true} onOpenChange={vi.fn()} />
    );

    expect(screen.getByText('Add New Customer')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Phone Number/i)).toHaveValue('');
    expect(screen.getByLabelText(/Date of Birth/i)).toHaveValue('');
    expect(
      screen.getByRole('button', { name: 'Open calendar' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Save Customer' })
    ).toBeInTheDocument();
  });

  it('formats mobile input as ____ ___ ___ and date input as dd-MM-yyyy while typing', () => {
    render(
      <CustomerFormDialog mode="create" open={true} onOpenChange={vi.fn()} />
    );

    const phoneInput = screen.getByLabelText(/Phone Number/i);
    fireEvent.change(phoneInput, { target: { value: '0901234567' } });
    expect(phoneInput).toHaveValue('0901 234 567');

    const dobInput = screen.getByLabelText(/Date of Birth/i);
    fireEvent.change(dobInput, { target: { value: '25082011' } });
    expect(dobInput).toHaveValue('25-08-2011');
  });

  it('allows opening calendar popover via calendar icon button', () => {
    render(
      <CustomerFormDialog mode="create" open={true} onOpenChange={vi.fn()} />
    );

    const calendarBtn = screen.getByRole('button', { name: 'Open calendar' });
    fireEvent.click(calendarBtn);

    expect(
      screen.getByRole('dialog', { name: 'Add New Customer' })
    ).toBeInTheDocument();
  });

  it('displays validation errors on empty required fields', async () => {
    render(
      <CustomerFormDialog mode="create" open={true} onOpenChange={vi.fn()} />
    );

    const saveButton = screen.getByRole('button', { name: 'Save Customer' });
    fireEvent.click(saveButton);

    expect(
      await screen.findByText('Full name is required (at least 2 characters).')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Mobile number must be exactly 10 digits.')
    ).toBeInTheDocument();
    expect(customerActions.saveCustomerAction).not.toHaveBeenCalled();
  });

  it('displays validation error for invalid email and invalid birthday format', async () => {
    render(
      <CustomerFormDialog mode="create" open={true} onOpenChange={vi.fn()} />
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'Valid Name' },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: '0901234567' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: '99-99-9999' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Customer' }));

    expect(
      await screen.findByText('Please enter a valid email address.')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Please enter a valid date in dd-MM-yyyy format.')
    ).toBeInTheDocument();
    expect(customerActions.saveCustomerAction).not.toHaveBeenCalled();
  });

  it('submits valid data via saveCustomerAction and triggers router.refresh', async () => {
    const handleOpenChange = vi.fn();
    vi.mocked(customerActions.saveCustomerAction).mockResolvedValueOnce(
      mockCustomer
    );

    render(
      <CustomerFormDialog
        mode="create"
        open={true}
        onOpenChange={handleOpenChange}
      />
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'Nguyen Van C' },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: '0901234567' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'c@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: '20-10-1995' },
    });
    fireEvent.change(screen.getByLabelText(/Address/i), {
      target: { value: '789 Tran Hung Dao' },
    });
    fireEvent.change(screen.getByLabelText(/Note/i), {
      target: { value: 'Allergic to product X' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Customer' }));

    await waitFor(() => {
      expect(customerActions.saveCustomerAction).toHaveBeenCalledWith({
        fullName: 'Nguyen Van C',
        mobile: '0901234567',
        email: 'c@example.com',
        address: '789 Tran Hung Dao',
        birthDay: expect.stringMatching(/1995-10-20/),
        note: 'Allergic to product X',
      });
    });

    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(mockRefresh).toHaveBeenCalled();
  });
});

describe('CustomerFormDialog - Edit Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customerActions.getCustomerAction).mockResolvedValue(
      mockCustomer
    );
  });

  it('fetches customer by ID, displays code badge, and pre-populates fields', async () => {
    render(
      <CustomerFormDialog
        mode="edit"
        customerId={10}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(customerActions.getCustomerAction).toHaveBeenCalledWith(10);
    });

    expect(screen.getByText('Edit Customer')).toBeInTheDocument();
    expect(screen.getByText('CUST-010')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toHaveValue('Nguyen Van C');
    expect(screen.getByLabelText(/Phone Number/i)).toHaveValue('0901 234 567');
    expect(screen.getByLabelText(/Date of Birth/i)).toHaveValue('20-10-1995');
    expect(screen.getByLabelText(/Email/i)).toHaveValue('c@example.com');
    expect(screen.getByLabelText(/Address/i)).toHaveValue('789 Tran Hung Dao');
    expect(
      screen.getByRole('button', { name: 'Save Changes' })
    ).toBeInTheDocument();
  });

  it('submits updated customer data via updateCustomerAction', async () => {
    const handleOpenChange = vi.fn();
    vi.mocked(customerActions.updateCustomerAction).mockResolvedValueOnce({
      ...mockCustomer,
      fullName: 'Nguyen Van C Updated',
    });

    render(
      <CustomerFormDialog
        mode="edit"
        customerId={10}
        open={true}
        onOpenChange={handleOpenChange}
      />
    );

    await waitFor(() => {
      expect(customerActions.getCustomerAction).toHaveBeenCalledWith(10);
    });

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'Nguyen Van C Updated' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(customerActions.updateCustomerAction).toHaveBeenCalledWith(
        10,
        expect.objectContaining({
          fullName: 'Nguyen Van C Updated',
          mobile: '0901234567',
        })
      );
    });

    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('displays error message when getCustomerAction fails', async () => {
    vi.mocked(customerActions.getCustomerAction).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(
      <CustomerFormDialog
        mode="edit"
        customerId={10}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(
      await screen.findByText(
        'Failed to load customer details. Please try again.'
      )
    ).toBeInTheDocument();
  });
});

describe('AddCustomerDialog', () => {
  it('renders trigger button and opens modal when clicked', async () => {
    render(<AddCustomerDialog />);

    const triggerBtn = screen.getByRole('button', { name: /Add Customer/i });
    expect(triggerBtn).toBeInTheDocument();

    fireEvent.click(triggerBtn);

    expect(await screen.findByText('Add New Customer')).toBeInTheDocument();
  });
});
