# Specification: Order List Screen

## 1. Objective
Provide a server-rendered, responsive order management dashboard (`app/orders/page.tsx`) for salon staff and administrators to:
1. **View Orders**: Browse salon orders with customer details, status badges, formatted currency totals, and localized dates.
2. **Filter & Search**: Query orders within custom date ranges (defaulting to the last 30 days) and filter by lifecycle status (`New`, `In Progress`, `Completed`, `Deleted`, `All`).
3. **Cursor-Based Pagination**: Navigate forward and backward across large volumes of orders using opaque cursor tokens (`before`, `after`) while preserving active filters.
4. **Seamless Actions**: Create new orders via `AddOrderDialog` from the header and trigger inline order editing via `OrderFormDialog` directly by clicking on any Order Code.

---

## 2. Tech Stack & Commands

- **Framework**: Next.js 16.1 (App Router, React Server Components)
- **UI Library**: React 19, Radix UI Primitives, Tailwind CSS v4, Lucide React icons
- **Formatting & Localization**: `Intl.NumberFormat` (`vi-VN` currency VND), date-fns / custom date utilities (`formatDateTime`, `toLocalDateString`, `parseLocalDate`)
- **Testing**: Vitest, React Testing Library, jsdom
- **Package Manager**: pnpm

### Core Commands
```bash
# Development server
pnpm dev

# Type Checking
pnpm typecheck

# Unit & Integration Tests
pnpm test --run

# Linting
pnpm lint

# Code Formatting
pnpm format
```

---

## 3. Project Structure

```
app/
├── orders/
│   ├── page.tsx                       # Async Server Component (RSC) fetching & rendering orders
│   └── page.test.tsx                  # Server component tests for empty, populated, & error states
components/
├── orders/
│   ├── orders-table.tsx               # Client component rendering order rows & edit modal trigger
│   ├── order-filter.tsx               # Client component for date range picker & status dropdown
│   ├── orders-cursor-pagination.tsx   # Client component handling cursor URL transitions & counters
│   ├── status-badge.tsx               # Color-coded badge component for OrderStatus enum
│   └── order-form-dialog.tsx          # Dialog for Create (AddOrderDialog) and Edit modes
lib/
├── api/
│   ├── orderApi.ts                    # Backend API client (getOrders with cursor pagination)
│   └── fetchApi.ts                    # Authenticated HTTP fetch wrapper
├── utils.ts                           # Formatting helpers (formatDateTime, toLocalDateString, getStatusName)
types/
└── order.ts                           # TypeScript interfaces (Order, OrderStatus, CursorPaginatedResult, etc.)
tests/
└── orders.test.tsx                    # Integration tests for table interactions and edit triggers
```

---

## 4. Data Models & API Contracts

### Data Interfaces (`types/order.ts` & `lib/api/orderApi.ts`)

```typescript
export enum OrderStatus {
  New = 1,
  InProgress = 2,
  Completed = 3,
  Deleted = 4,
}

export interface Order {
  id: number;
  code: string;
  description: string;
  orderDate: string;
  customerId: number | null;
  customerName: string | null;
  customerMobile: string | null;
  customerEmail?: string | null;
  amount: number;
  paymentAmount: number;
  remainingAmount: number;
  status: OrderStatus;
  statusName: string;
  totalCommissionAmount: number;
  createdBy: string;
  createdDateTime: string;
  updatedBy: string | null;
  updatedDateTime: string | null;
}

export interface CursorPaginationInfo {
  before: string | null;
  after: string | null;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CursorPaginatedResult<T> {
  items: T[];
  paging: CursorPaginationInfo;
}

export interface GetOrdersParams {
  startDate?: string;
  endDate?: string;
  status?: OrderStatus | number;
  pageSize?: number;
  before?: string;
  after?: string;
  includeOrderDetailEmployee?: boolean;
}
```

### Backend API Endpoint
- **Endpoint**: `GET /api/Orders/cursor`
- **Query Parameters**:
  - `StartDate`: `YYYY-MM-DD` string (defaults to 30 days prior).
  - `EndDate`: `YYYY-MM-DD` string (defaults to current date).
  - `Status`: Optional numeric status ID (`1` = New, `2` = InProgress, `3` = Completed, `4` = Deleted).
  - `PageSize`: Number of records per page (default: `20`).
  - `Before`: Cursor token for previous page navigation.
  - `After`: Cursor token for next page navigation.
  - `IncludeOrderDetailEmployee`: Boolean flag (default: `true`).

---

## 5. Component Architecture & UI Workflows

### 5.1 Server Component Architecture (`app/orders/page.tsx`)

`OrdersPage` is an asynchronous React Server Component that:
1. Resolves `searchParams` (`startDate`, `endDate`, `status`, `before`, `after`).
2. Calls `getOrders({ startDate, endDate, status, pageSize: 20, before, after })`.
3. Normalizes timestamps with `ensureUtc` to prevent client-server hydration mismatch.
4. Renders:
   - Header with page title, description, and `<AddOrderDialog />`.
   - `<OrderFilter />` toolbar.
   - `<OrdersTable orders={displayOrders} errorMsg={errorMsg} />`.
   - `<OrdersCursorPagination />` controls.

### 5.2 Filter Toolbar (`components/orders/order-filter.tsx`)

1. **Initial Mount / URL Synchronization**:
   - If `startDate` or `endDate` query parameters are missing in the URL, the component replaces the URL with default date parameters (`defaultStart = today - 30 days`, `defaultEnd = today`) via `router.replace`.
   - Syncs internal component state whenever query parameters change (e.g., browser back/forward navigation).
2. **Controls**:
   - **Start Date**: Calendar popover via `<DatePicker />`.
   - **End Date**: Calendar popover via `<DatePicker />`.
   - **Status Dropdown**: `<Select>` containing `All Statuses`, `New`, `In Progress`, `Completed`, and `Deleted`.
3. **Actions**:
   - **Apply**: Updates URL search parameters with selected date bounds and status; clears existing cursor parameters (`page`, `before`, `after`) to reset pagination.
   - **Clear**: Resets filters to the default 30-day window and "All Statuses", clearing all URL parameters.

### 5.3 Orders Table (`components/orders/orders-table.tsx`)

Displays orders in a structured table layout:

| Column | Content & Rendering Rules |
| :--- | :--- |
| **Order Code** | Interactive button with order code and pencil icon (`Pencil`). Clicking opens `OrderFormDialog` in edit mode (`mode="edit"`, `orderId={order.id}`). |
| **Order Date** | Formatted as `DD/MM/YYYY - HH:mm:ss` using `formatDateTime`. |
| **Customer** | Displays `customerName`, fallback to `customerMobile`, or `'Guest'` if neither is present. |
| **Status** | Rendered via `<StatusBadge status={order.status} />`. |
| **Amount** | Currency formatted in Vietnamese Dong (`vi-VN`, VND) right-aligned. |

#### States:
- **Populated**: Lists each order row with interactive hover states and edit trigger.
- **Empty**: Renders a full-width cell displaying `"No orders found."`.
- **Error**: Renders a full-width cell displaying the `errorMsg` in destructive text color.

### 5.4 Status Badging (`components/orders/status-badge.tsx`)

Renders a styled `<Badge variant="outline">` mapped to order statuses:
- **New (1)**: Purple styling (`bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400`).
- **In Progress (2)**: Yellow/Amber styling (`bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400`).
- **Completed (3)**: Green styling (`bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`).
- **Deleted (4)**: Red styling (`bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`).

### 5.5 Cursor Pagination (`components/orders/orders-cursor-pagination.tsx`)

- **Items Count**: Displays `"Showing <count> orders"`.
- **Previous Button**: 
  - Active when `hasPrevious === true`, linking to `?before=<beforeCursor>&...filters`.
  - Disabled (`pointer-events-none opacity-50`, `aria-disabled="true"`) when `hasPrevious === false`.
- **Next Button**:
  - Active when `hasNext === true`, linking to `?after=<afterCursor>&...filters`.
  - Disabled (`pointer-events-none opacity-50`, `aria-disabled="true"`) when `hasNext === false`.
- **Hidden Condition**: Component returns `null` when there are 0 items and no previous/next pages.

---

## 6. Testing Strategy & Validation

### Test Suites
- **`app/orders/page.test.tsx`**:
  - Validates Server Component rendering with empty order list (`"No orders found."`).
  - Verifies order list rendering with customer fallback, date formatting, and VND amount formatting.
  - Verifies graceful error handling and error banner when API fails.
- **`components/orders/order-filter.test.tsx`**:
  - Tests filter UI elements rendering (Start, End, Status, Apply, Clear).
  - Tests auto-population of default date params when URL query parameters are absent.
  - Tests router push actions on "Apply" and "Clear" clicks.
- **`components/orders/orders-cursor-pagination.test.tsx`**:
  - Tests suppression when no items and no navigation cursors exist.
  - Tests enabling/disabling of Previous and Next buttons based on cursor flags.
  - Verifies generated URL parameters preserve existing filter params while swapping cursor tokens.
- **`tests/orders.test.tsx`**:
  - Integration tests verifying clicking Order Code button opens `OrderFormDialog` in edit mode.

### Quality Boundaries
- **Strict Typing**: Use strict TypeScript definitions; zero `any` types.
- **SSR Compatibility**: Keep server data fetching in RSC (`page.tsx`) and isolate client state / event handlers to `'use client'` components.
- **Formatting Standards**: Single quotes (`'`), Prettier compliance (`pnpm format`), ESLint cleanliness (`pnpm lint`).
