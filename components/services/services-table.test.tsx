import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ServicesTable } from './services-table';
import type { Service } from '@/types/service';

const mockServices: Service[] = [
  {
    id: 1,
    code: 'SRV-001',
    name: 'Haircut & Styling',
    description: 'Includes shampoo and blow dry',
    price: 200000,
    discountPrice: 180000,
    commission: 15,
    isActive: true,
  },
  {
    id: 2,
    code: 'SRV-002',
    name: 'Basic Shave',
    description: null,
    price: 80000,
    discountPrice: null,
    commission: null,
    isActive: false,
  },
];

describe('ServicesTable Component', () => {
  beforeEach(() => {});

  it('renders table headers and service rows correctly', () => {
    render(<ServicesTable services={mockServices} />);

    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('Service Name')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Promotion Price')).toBeInTheDocument();
    expect(screen.getByText('Commission')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();

    // Row 1
    expect(screen.getByText('SRV-001')).toBeInTheDocument();
    expect(screen.getByText('Haircut & Styling')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(
      screen.getByText('Includes shampoo and blow dry')
    ).toBeInTheDocument();

    // Row 2
    expect(screen.getByText('SRV-002')).toBeInTheDocument();
    expect(screen.getByText('Basic Shave')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('renders empty state message when services list is empty', () => {
    render(<ServicesTable services={[]} />);
    expect(screen.getByText(/No services found/i)).toBeInTheDocument();
  });

  it('renders error message when errorMsg is provided', () => {
    render(<ServicesTable services={[]} errorMsg="Failed to load services" />);
    expect(screen.getByText('Failed to load services')).toBeInTheDocument();
  });
});
