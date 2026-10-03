import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from './metric-card';
import { DashboardHeader } from './dashboard-header';

describe('Dashboard Components', () => {
  describe('MetricCard', () => {
    it('renders title and value', () => {
      render(<MetricCard title="Today's Revenue" value="1,250,000 ₫" />);
      expect(screen.getByText("Today's Revenue")).toBeInTheDocument();
      expect(screen.getByText('1,250,000 ₫')).toBeInTheDocument();
    });

    it('renders trend when provided', () => {
      render(
        <MetricCard
          title="Orders"
          value="12"
          trend="+15% vs yesterday"
          trendUp={true}
        />
      );
      expect(screen.getByText('+15% vs yesterday')).toBeInTheDocument();
      expect(screen.getByText('↑')).toBeInTheDocument();
    });

    it('does not render trend container when trend is omitted', () => {
      render(<MetricCard title="Total Customers" value="45" />);
      expect(screen.queryByText('↑')).not.toBeInTheDocument();
      expect(screen.queryByText('↓')).not.toBeInTheDocument();
    });
  });

  describe('DashboardHeader', () => {
    it('renders personalized greeting when userName is provided', () => {
      render(<DashboardHeader userName="Sarah Connor" />);
      expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /\+ New Order/i })
      ).toHaveAttribute('href', '/orders');
      expect(
        screen.getByRole('link', { name: /\+ New Customer/i })
      ).toHaveAttribute('href', '/customers');
    });

    it('renders fallback greeting when userName is not provided', () => {
      render(<DashboardHeader />);
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });
  });
});
