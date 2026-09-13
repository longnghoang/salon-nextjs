import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ServiceFormDialog,
  AddServiceDialog,
  formatCurrencyInput,
  parseCurrencyInput,
} from './service-form-dialog';
import * as serviceActions from '@/app/actions/serviceActions';
import type { Service } from '@/types/service';

// Mock Next.js router
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock serviceActions
vi.mock('@/app/actions/serviceActions', () => ({
  saveServiceAction: vi.fn(),
  getServiceAction: vi.fn(),
  updateServiceAction: vi.fn(),
}));

const mockService: Service = {
  id: 5,
  code: 'SRV-005',
  name: 'Deluxe Hair Spa',
  price: 450000,
  discountPrice: 400000,
  commission: 15,
  description: 'Deep hair conditioning and aromatherapy scalp massage',
  isActive: true,
  createdBy: 'admin',
  createdDateTime: '2026-08-10T10:00:00Z',
  updatedBy: null,
  updatedDateTime: null,
};

describe('Currency Input Helpers', () => {
  it('formatCurrencyInput formats numbers and digit strings with thousand commas', () => {
    expect(formatCurrencyInput(450000)).toBe('450,000');
    expect(formatCurrencyInput('450000')).toBe('450,000');
    expect(formatCurrencyInput('2000000')).toBe('2,000,000');
    expect(formatCurrencyInput('0')).toBe('0');
    expect(formatCurrencyInput(null)).toBe('');
    expect(formatCurrencyInput(undefined)).toBe('');
    expect(formatCurrencyInput('')).toBe('');
    expect(formatCurrencyInput('abc450def000')).toBe('450,000');
  });

  it('parseCurrencyInput extracts raw integer value or null', () => {
    expect(parseCurrencyInput('450,000')).toBe(450000);
    expect(parseCurrencyInput('2,000,000')).toBe(2000000);
    expect(parseCurrencyInput('0')).toBe(0);
    expect(parseCurrencyInput('')).toBeNull();
    expect(parseCurrencyInput(null)).toBeNull();
    expect(parseCurrencyInput('invalid')).toBeNull();
  });
});

describe('ServiceFormDialog - Create Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Add New Service form with empty fields', () => {
    render(
      <ServiceFormDialog mode="create" open={true} onOpenChange={vi.fn()} />
    );

    expect(screen.getByText('Add New Service')).toBeInTheDocument();
    expect(screen.getByLabelText(/Service Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Regular Price/i)).toHaveValue('');
    expect(screen.getByLabelText(/Promotion Price/i)).toHaveValue('');
    expect(screen.getByLabelText(/Staff Commission/i)).toHaveValue(null);
    expect(screen.getByLabelText(/Description/i)).toHaveValue('');
    expect(
      screen.getByRole('button', { name: 'Save Service' })
    ).toBeInTheDocument();
  });

  it('formats currency inputs with thousand separators as user types', () => {
    render(
      <ServiceFormDialog mode="create" open={true} onOpenChange={vi.fn()} />
    );

    const priceInput = screen.getByLabelText(/Regular Price/i);
    fireEvent.change(priceInput, { target: { value: '300000' } });
    expect(priceInput).toHaveValue('300,000');

    const discountPriceInput = screen.getByLabelText(/Promotion Price/i);
    fireEvent.change(discountPriceInput, { target: { value: '250000' } });
    expect(discountPriceInput).toHaveValue('250,000');
  });

  it('validates required fields (name and price) and displays errors', async () => {
    render(
      <ServiceFormDialog mode="create" open={true} onOpenChange={vi.fn()} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save Service' }));

    expect(
      await screen.findByText(
        'Service name is required (at least 2 characters).'
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Price must be a valid non-negative number.')
    ).toBeInTheDocument();
    expect(serviceActions.saveServiceAction).not.toHaveBeenCalled();
  });

  it('validates promotion price cannot exceed regular price', async () => {
    render(
      <ServiceFormDialog mode="create" open={true} onOpenChange={vi.fn()} />
    );

    fireEvent.change(screen.getByLabelText(/Service Name/i), {
      target: { value: 'Hair Perm' },
    });
    fireEvent.change(screen.getByLabelText(/Regular Price/i), {
      target: { value: '500000' },
    });
    fireEvent.change(screen.getByLabelText(/Promotion Price/i), {
      target: { value: '600000' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Service' }));

    expect(
      await screen.findByText('Promotion price cannot exceed regular price.')
    ).toBeInTheDocument();
    expect(serviceActions.saveServiceAction).not.toHaveBeenCalled();
  });

  it('validates commission must be between 0 and 100', async () => {
    render(
      <ServiceFormDialog mode="create" open={true} onOpenChange={vi.fn()} />
    );

    fireEvent.change(screen.getByLabelText(/Service Name/i), {
      target: { value: 'Nail Art' },
    });
    fireEvent.change(screen.getByLabelText(/Regular Price/i), {
      target: { value: '200000' },
    });
    fireEvent.change(screen.getByLabelText(/Staff Commission/i), {
      target: { value: '150' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Service' }));

    expect(
      await screen.findByText(
        'Commission must be a valid percentage between 0 and 100.'
      )
    ).toBeInTheDocument();
    expect(serviceActions.saveServiceAction).not.toHaveBeenCalled();
  });

  it('submits valid form data with parsed raw numbers and calls saveServiceAction', async () => {
    vi.mocked(serviceActions.saveServiceAction).mockResolvedValueOnce(
      mockService
    );
    const onOpenChange = vi.fn();

    render(
      <ServiceFormDialog
        mode="create"
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    fireEvent.change(screen.getByLabelText(/Service Name/i), {
      target: { value: 'Deluxe Hair Spa' },
    });
    fireEvent.change(screen.getByLabelText(/Regular Price/i), {
      target: { value: '450000' },
    });
    fireEvent.change(screen.getByLabelText(/Promotion Price/i), {
      target: { value: '400000' },
    });
    fireEvent.change(screen.getByLabelText(/Staff Commission/i), {
      target: { value: '15' },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: {
        value: 'Deep hair conditioning and aromatherapy scalp massage',
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Service' }));

    await waitFor(() => {
      expect(serviceActions.saveServiceAction).toHaveBeenCalledWith({
        name: 'Deluxe Hair Spa',
        price: 450000,
        discountPrice: 400000,
        commission: 15,
        description: 'Deep hair conditioning and aromatherapy scalp massage',
        isActive: true,
      });
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('renders AddServiceDialog wrapper trigger correctly', () => {
    render(<AddServiceDialog />);
    expect(
      screen.getByRole('button', { name: /Add Service/i })
    ).toBeInTheDocument();
  });
});

describe('ServiceFormDialog - Edit Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and pre-populates formatted currency in edit mode', async () => {
    vi.mocked(serviceActions.getServiceAction).mockResolvedValueOnce(
      mockService
    );

    render(
      <ServiceFormDialog
        mode="edit"
        serviceId={5}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(await screen.findByText('SRV-005')).toBeInTheDocument();
    expect(screen.getByText('Edit Service')).toBeInTheDocument();
    expect(screen.getByLabelText(/Service Name/i)).toHaveValue(
      'Deluxe Hair Spa'
    );
    expect(screen.getByLabelText(/Regular Price/i)).toHaveValue('450,000');
    expect(screen.getByLabelText(/Promotion Price/i)).toHaveValue('400,000');
    expect(screen.getByLabelText(/Staff Commission/i)).toHaveValue(15);
    expect(screen.getByLabelText(/Description/i)).toHaveValue(
      'Deep hair conditioning and aromatherapy scalp massage'
    );
    expect(
      screen.getByRole('button', { name: 'Save Changes' })
    ).toBeInTheDocument();
  });

  it('submits updated service data with raw parsed numbers', async () => {
    vi.mocked(serviceActions.getServiceAction).mockResolvedValueOnce(
      mockService
    );
    vi.mocked(serviceActions.updateServiceAction).mockResolvedValueOnce({
      ...mockService,
      name: 'Deluxe Hair Spa VIP',
    });
    const onOpenChange = vi.fn();

    render(
      <ServiceFormDialog
        mode="edit"
        serviceId={5}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    expect(await screen.findByLabelText(/Service Name/i)).toHaveValue(
      'Deluxe Hair Spa'
    );

    fireEvent.change(screen.getByLabelText(/Service Name/i), {
      target: { value: 'Deluxe Hair Spa VIP' },
    });
    fireEvent.change(screen.getByLabelText(/Regular Price/i), {
      target: { value: '500000' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(serviceActions.updateServiceAction).toHaveBeenCalledWith(5, {
        name: 'Deluxe Hair Spa VIP',
        price: 500000,
        discountPrice: 400000,
        commission: 15,
        description: 'Deep hair conditioning and aromatherapy scalp massage',
        isActive: true,
      });
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('shows error banner when fetching service data fails', async () => {
    vi.mocked(serviceActions.getServiceAction).mockRejectedValueOnce(
      new Error('Failed to load')
    );

    render(
      <ServiceFormDialog
        mode="edit"
        serviceId={5}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(
      await screen.findByText(
        'Failed to load service details. Please try again.'
      )
    ).toBeInTheDocument();
  });

  it('shows error banner when update action fails', async () => {
    vi.mocked(serviceActions.getServiceAction).mockResolvedValueOnce(
      mockService
    );
    vi.mocked(serviceActions.updateServiceAction).mockRejectedValueOnce(
      new Error('API save error')
    );

    render(
      <ServiceFormDialog
        mode="edit"
        serviceId={5}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(await screen.findByLabelText(/Service Name/i)).toHaveValue(
      'Deluxe Hair Spa'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(
      await screen.findByText(
        'Failed to save service. Please check your information and try again.'
      )
    ).toBeInTheDocument();
  });
});
