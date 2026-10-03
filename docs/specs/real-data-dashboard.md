# Spec: Real Data Dashboard Redesign

## Objective
Redesign the salon dashboard (`app/page.tsx`) to replace static mockups and fictional data with live operational metrics and feeds powered by the salon's backend APIs (`orderApi`, `customerApi`, and session `auth()`).

The revamped dashboard will serve as the daily command center for salon staff and managers, answering:
1. How is business performing today? (Today's Revenue, Today's Orders count, Today's New Customers).
2. What are the latest transactions? (Recent Orders with code, customer name, status badge, amount, and timestamp).
3. Who are the latest registered clients? (Recent Customers with name, mobile, and creation date).
4. How to quickly initiate daily workflows? (Direct links/shortcuts to create orders and add customers).

Fictional components (mock appointment calendar, "Sarah" hardcoded greeting, and dummy daily goal gauges) are completely decommissioned.

---

## Tech Stack & Commands
- **Framework:** Next.js 16.1 (App Router), React 19
- **Architecture:** React Server Component (RSC) for initial data fetching, modular client components only where user interactivity is required
- **Language:** TypeScript 5.9 (Strict mode enabled)
- **Styling:** Tailwind CSS v4, shadcn/ui components (`Card`, `Badge`, `Button`, `Table`, `Avatar`)
- **Package Manager:** pnpm

### Executable Commands
- **Dev:** `pnpm dev`
- **Build:** `pnpm build`
- **Lint:** `pnpm lint`
- **Format:** `pnpm format`
- **Typecheck:** `pnpm typecheck`
- **Test:** `pnpm test` (or `pnpm vitest run app/page.test.tsx`)

---

## Project Structure
```
app/
├── page.tsx                               # Primary Dashboard page (RSC: fetches today's metrics, recent orders, recent customers)
└── page.test.tsx                          # Integration tests for Dashboard data rendering and empty states
components/
└── salon/
    └── dashboard/
        ├── metric-card.tsx                # Metric KPI card component (reusable for Revenue, Orders, Customers)
        ├── recent-orders.tsx              # Recent orders table/list with status badges & navigation link
        ├── recent-customers.tsx           # Recent customers table/list with contact info & navigation link
        └── dashboard-header.tsx           # Personalized greeting with session user name, live date, and quick action shortcuts
lib/
└── api/
    ├── orderApi.ts                        # getOrders({ startDate, endDate, pageSize })
    └── customerApi.ts                     # getCustomers({ pageSize })
```

---

## Code Style & Conventions
- Single quotes (`'`) for string literals.
- Tailwind CSS utilities formatted with `cn()` from `@/lib/utils`.
- Strictly typed props and API responses without `any`.
- Standard currency formatting (Vietnamese Đồng / integer formatting with thousand commas `formatCurrency` or `Intl.NumberFormat('vi-VN')`).
- Status display powered by `@/components/orders/status-badge`.

```typescript
// Pattern for Dashboard RSC Data Aggregation
import { auth } from '@/auth';
import { getOrders } from '@/lib/api/orderApi';
import { getCustomers } from '@/lib/api/customerApi';
import { toLocalDateString } from '@/lib/utils';

export default async function SalonDashboard() {
  const session = await auth();
  const todayStr = toLocalDateString(new Date());

  const [todayOrdersRes, recentOrdersRes, recentCustomersRes] = await Promise.all([
    getOrders({ startDate: todayStr, endDate: todayStr, pageSize: 100 }),
    getOrders({ pageSize: 5 }),
    getCustomers({ pageSize: 5 }),
  ]);

  // Aggregate metrics safely with fallback defaults
  const todayOrders = todayOrdersRes.items || [];
  const todayRevenue = todayOrders
    .filter((order) => order.status !== OrderStatus.Deleted)
    .reduce((sum, order) => sum + (order.paymentAmount || order.amount || 0), 0);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      {/* Header with authenticated user greeting */}
      {/* Metric Cards Grid */}
      {/* 2-Column Operational Grid: Recent Orders & Recent Customers */}
    </div>
  );
}
```

---

## Testing Strategy
- **Framework:** Vitest + React Testing Library + JSDOM.
- **Test File:** `app/page.test.tsx` and unit tests for any new UI dashboard subcomponents.
- **Key Test Scenarios:**
  1. Renders personalized greeting with logged-in user name (or fallback if unauthenticated).
  2. Correctly calculates and displays today's revenue and order counts from mock API responses.
  3. Displays list of recent orders with status badges and formatted currency.
  4. Displays list of recent customers with name and mobile number.
  5. Renders clean, informative empty states when no orders or customers exist for the day.
  6. Renders quick action buttons linking to `/orders` and `/customers`.

---

## Boundaries
- **Always:**
  - Leverage existing `orderApi.ts` and `customerApi.ts` methods without modifying API signatures unnecessarily.
  - Handle missing, null, or empty API responses gracefully with zero runtime crashes.
  - Follow the existing design theme (Tailwind tokens, fonts, and dark mode support).
  - Run `pnpm typecheck` and `pnpm test` to verify zero regression.
- **Ask first:**
  - Adding external charting libraries (e.g. recharts, chart.js).
  - Introducing new backend API routes or database models.
- **Never:**
  - Retain hardcoded mock records ("Sarah", 84% client retention, fake upcoming appointments).
  - Bypass TypeScript strict checks with `any` or `@ts-ignore`.

---

## Success Criteria & Acceptance Criteria
- [x] Mock appointment list (`appointments-list.tsx`) and hardcoded revenue target gauge are removed from the dashboard.
- [x] Dashboard displays dynamic greeting matching the logged-in user's name via `auth()`, or "Welcome back" if session is unavailable.
- [x] Top KPI metrics display:
  - **Today's Revenue**: Sum of non-deleted order payment amounts for today (formatted with thousand separators).
  - **Today's Orders**: Total count of orders created today.
  - **Total/New Customers**: Count of registered customers.
- [x] Recent Orders card displays the 5 most recent orders with Order Code, Customer Name, Status Badge, Total Amount, and a "View All" link directing to `/orders`.
- [x] Recent Customers card displays the 5 most recent customers with Full Name, Mobile, Created Date, and a "View All" link directing to `/customers`.
- [x] Quick action buttons allow one-click navigation to create a new order (`/orders`) or register a customer (`/customers`).
- [x] Dashboard is fully responsive across mobile, tablet, and desktop viewports.
- [x] `pnpm typecheck`, `pnpm lint`, and `pnpm test` pass with 0 errors.

---

## Open Questions & Assumptions
- **Assumption 1 (Revenue Metric Calculation):** Today's revenue is calculated from `order.paymentAmount` (or `order.amount` if `paymentAmount` is 0) for orders where `order.status !== OrderStatus.Deleted`.
- **Assumption 2 (Currency Display):** Currency values will be formatted using the salon's standard integer thousand separator (e.g., `1,250,000 ₫` or standard formatted number).
- **Assumption 3 (Obsolete Components):** `components/salon/dashboard/appointments-list.tsx` can be deprecated or deleted since appointments are out of scope.
