# Specification: Add & Edit Customer Feature

## 1. Objective
Provide a unified, responsive dialog interface (`CustomerFormDialog`) and management flow allowing salon staff and administrators to:
1. **Create New Customer Profiles**: Add a customer with required contact details (`fullName`, `mobile`), optional details (`email`, `address`, `birthDay`, `note`), format and validate inputs (including 10-digit mobile `____ ___ ___` and `dd/MM/yyyy` birthday), and submit via `POST /api/Customers` via Server Action.
2. **Edit Existing Customer Profiles**: Click on a Customer Code button in the customers table (`CustomersTable`) to open the pre-populated dialog with existing customer details and submit updates via `PUT /api/Customers/{id}`.
3. **Seamless List Synchronization**: Automatically refresh customer listing and pagination upon successful creation or modification using Next.js `router.refresh()`.
4. **Customer Order History & Cross-Screen Navigation**: In edit mode, display a dedicated order history grid at the bottom of the dialog for the selected customer (showing Order Code, Order Date, Status, Note, Amount). Clicking an Order Code navigates to the Orders screen (`/orders?orderId={id}`) and automatically opens the Order Detail / Edit dialog.

---

## 2. Tech Stack & Commands

- **Framework**: Next.js 16.1 (App Router, React Server Components + Client Actions)
- **UI Library**: React 19, Radix UI Primitives (`@radix-ui/react-dialog`, `@radix-ui/react-popover`), Tailwind CSS v4, Lucide React icons (`UserPlus`, `Pencil`, `Loader2`, `Calendar`, etc.)
- **Utilities**: `clsx`, `tailwind-merge` (`cn`), `date-fns`, `Intl.NumberFormat` (`vi-VN`, VND)
- **Testing**: Vitest, React Testing Library, `@testing-library/jest-dom`, jsdom
- **Package Manager**: pnpm

### Core Commands
```bash
# Development
pnpm dev

# Type Checking
pnpm typecheck

# Unit & Component Testing
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
├── actions/
│   ├── customerActions.ts             # Server actions (saveCustomerAction, getCustomerAction, updateCustomerAction, getCustomerOrdersAction)
│   └── orderActions.ts                # Order server actions
├── customers/
│   ├── page.tsx                       # Server Component rendering Customers page & table wrapper
│   └── page.test.tsx                  # Server component tests
├── orders/
│   ├── page.tsx                       # Orders page (resolves orderId from searchParams and passes initialEditOrderId)
│   └── page.test.tsx                  # Orders page server component tests
components/
├── customers/
│   ├── customer-form-dialog.tsx       # Unified dialog component for Add & Edit Customer with Order History grid
│   ├── customer-form-dialog.test.tsx  # Component tests for Add & Edit Customer dialog and Order History grid
│   ├── customers-table.tsx            # Client component rendering customer rows with clickable Customer Code edit buttons
│   ├── customers-table.test.tsx       # Unit tests for CustomersTable interactions
│   ├── customer-filter.tsx            # Search filter toolbar
│   └── customers-cursor-pagination.tsx# Cursor pagination controls
├── orders/
│   ├── orders-table.tsx               # Orders table (supports initialEditOrderId and auto-opens OrderFormDialog)
│   ├── status-badge.tsx               # StatusBadge component reused for OrderStatus
│   └── order-form-dialog.tsx          # Order detail / edit dialog
lib/
├── api/
│   ├── customerApi.ts                 # Backend API methods (getCustomers, getCustomerById, createCustomer, updateCustomer, getCustomerOrders)
│   ├── orderApi.ts                    # Backend API methods for orders
│   └── fetchApi.ts                    # Session-authenticated fetch wrapper
types/
├── customer.ts                        # TypeScript interfaces (Customer, CustomerFormData, etc.)
└── order.ts                           # TypeScript interfaces (Order, OrderStatus, etc.)
tests/
├── customers.test.tsx                 # Integration & API client tests for customer management
└── orders.test.tsx                    # Integration tests for orders table interactions and auto-open dialog
docs/
└── specs/
    └── add-edit-customer.md           # Feature specification documentation
```

---

## 4. Data Models & API Contracts

### Data Interfaces (`types/customer.ts` & `types/order.ts`)

```typescript
// types/customer.ts
export interface Customer {
  id: number;
  code: string;
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  birthDay: string | null;
  note: string | null;
  createdBy: string;
  createdDateTime: string;
  updatedBy: string | null;
  updatedDateTime: string | null;
}

export interface CustomerFormData {
  fullName: string;
  mobile: string; // 10 digits clean (e.g., '0901234567')
  email?: string;
  address?: string;
  birthDay?: string | null; // ISO string or YYYY-MM-DD for backend
  note?: string | null;
}

// types/order.ts
export interface Order {
  id: number;
  code: string;
  description: string;
  orderDate: string;
  customerId: number | null;
  customerName: string | null;
  customerMobile: string | null;
  amount: number;
  status: OrderStatus;
  statusName: string;
  // ... other fields
}
```

### API Endpoints (`lib/api/customerApi.ts`)
- `GET /api/Customers/cursor?SearchText=...&PageSize=...`: Fetches cursor-paginated customers.
- `GET /api/Customers/{id}`: Fetches single customer by ID.
- `POST /api/Customers`: Creates a new customer record.
- `PUT /api/Customers/{id}`: Updates an existing customer record.
- `GET /api/Customers/{customerId}/orders`: Fetches order history for a specific customer.

---

## 5. Component Architecture & UI Workflows

### 5.1 Modes of Operation

`CustomerFormDialog` operates in two modes configured via props:

```typescript
export interface CustomerFormDialogProps {
  mode?: 'create' | 'edit';
  customerId?: number | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}
```

- **Create Mode (`mode="create"`)**:
  - Modal title: `"Add New Customer"`
  - Dialog width: Compact (`max-w-md sm:max-w-lg`).
  - Submit button: `"Save Customer"`
  - Starts with blank form fields.
  - Can be triggered directly via an `AddCustomerDialog` button (e.g. `<Button><UserPlus className="mr-2 h-4 w-4" /> Add Customer</Button>`) in the header of `/customers`.
  - On submit, invokes `saveCustomerAction(payload)`.
  - Does **not** render the Order History grid.

- **Edit Mode (`mode="edit"`, with `customerId`)**:
  - Modal title: `"Edit Customer"`
  - Dialog width: Expanded to `sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto` to fit profile fields and the order history table.
  - Submit button: `"Save Changes"`
  - When opened, fetches customer profile data via `getCustomerAction(customerId)` and order history via `getCustomerOrdersAction(customerId)` concurrently using `Promise.allSettled`.
  - Pre-populates all form fields (`fullName`, `mobile`, `email`, `address`, `birthDay`, `note`), displaying birthday formatted as `dd/MM/yyyy` and mobile formatted as `0901 234 567`.
  - Customer `code` is displayed as a read-only badge in the dialog header.
  - Renders the **Order History** grid at the bottom.
  - On submit, invokes `updateCustomerAction(customerId, payload)`.

### 5.2 Form Fields & Validation Rules

1. **Full Name (`fullName`)**:
   - Required.
   - Trims whitespace; minimum 2 characters.
   - Validation error: `"Full name is required (at least 2 characters)."`
2. **Mobile Number (`mobile`)**:
   - Required.
   - **Length is strictly 10 digits**.
   - Input format & mask: `____ ___ ___` (e.g. formatted as `0901 234 567` as user types).
   - Sanitized to 10 raw digits before saving (`0901234567`).
   - Validation error: `"Mobile number must be exactly 10 digits."`
3. **Date of Birth (`birthDay`)**:
   - Optional.
   - Format: `dd/MM/yyyy` (e.g., `25/08/2011`).
   - **Auto-formatting / masking**: Raw digit input auto-formats to `dd/MM/yyyy` as the user types (e.g. entering `25082011` becomes `25/08/2011`).
   - **Date Picker Calendar**: Accessible calendar popover trigger (`<Calendar mode="single" captionLayout="dropdown" />`) allowing users to browse and pick a date, automatically updating the input to `dd/MM/yyyy`. Future dates are disabled.
   - Validates valid calendar date and ensures it is not a future date.
   - Converted to ISO string (`YYYY-MM-DDT00:00:00Z` or `YYYY-MM-DD`) when sending to API.
   - Validation error: `"Please enter a valid date in dd/MM/yyyy format."`
4. **Email Address (`email`)**:
   - Optional.
   - If provided, validates standard email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
   - Validation error: `"Please enter a valid email address."`
5. **Address (`address`)**:
   - Optional string.
6. **Note / Preferences (`note`)**:
   - Optional multiline text for notes and preferences.

### 5.3 Customer Order History Grid (Edit Mode)

The Order History section renders at the bottom of the dialog in edit mode:
- **Header**: Section title `"Order History"` with a count badge displaying the number of orders.
- **States**:
  - **Loading**: Displays `<Loader2 className="h-6 w-6 animate-spin text-primary" />` and `"Loading order history..."`.
  - **Empty**: Displays `"No order history found."` when 0 orders exist.
  - **Error**: Displays `"Failed to load order history."` in a destructive alert box without impeding customer profile edits.
- **Columns**:
  | Column | Content & Rendering Rules |
  | :--- | :--- |
  | **Order Code** | Clickable badge/button with pencil icon. Clicking closes the customer dialog (`setIsOpen(false)`) and navigates to `/orders?orderId=${order.id}`. |
  | **Order Date** | Formatted strictly as `dd/MM/yyyy` (e.g. `25/08/2026`) via `formatDateToDDMMYYYY(order.orderDate)`. |
  | **Status** | Rendered via `<StatusBadge status={order.status} />` from `@/components/orders/status-badge`, showing the exact same localized status label and color badge as the Order List screen. |
  | **Note** | Displays `order.description` (fallback to `'-'`). Truncated on overflow with full title tooltip. |
  | **Amount** | Formatted in Vietnamese Dong (`new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.amount)`), right-aligned. |

### 5.4 Cross-Screen Order Detail Auto-Opening

1. When the user clicks an Order Code in the customer edit dialog:
   - Dialog closes.
   - Navigation pushes to `/orders?orderId=${order.id}`.
2. `app/orders/page.tsx`:
   - Extracts `orderId` from search params:
     ```typescript
     const orderId = typeof searchParams.orderId === 'string' ? parseInt(searchParams.orderId, 10) : undefined;
     ```
   - Passes `initialEditOrderId={orderId}` to `OrdersTable`.
3. `components/orders/orders-table.tsx`:
   - Accepts `initialEditOrderId?: number | null`.
   - Automatically initializes `editingOrderId` and opens `OrderFormDialog(mode="edit")`.

---

## 6. Code Style & Conventions

```typescript
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/orders/status-badge';
import {
  saveCustomerAction,
  updateCustomerAction,
  getCustomerAction,
  getCustomerOrdersAction,
} from '@/app/actions/customerActions';
import type { CustomerFormData } from '@/types/customer';
import type { Order } from '@/types/order';

// Helper for 10-digit phone formatting: '0901234567' -> '0901 234 567'
export function formatMobileNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
}

// Helper for date formatting: '25082011' -> '25/08/2011'
export function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}
```

---

## 7. Testing Strategy

- **Customer Dialog Tests (`components/customers/customer-form-dialog.test.tsx`)**:
  - Renders Create mode with empty fields, and asserts order history grid is **not** displayed.
  - Tests mobile input masking/formatting `____ ___ ___` (10 digits).
  - Tests `dd/MM/yyyy` birthday input auto-formatting (`25082011` -> `25/08/2011`) and date picker interaction.
  - Validates required fields (`fullName`, `mobile`) and displays error messages on invalid input.
  - Renders Edit mode, fetches customer details by ID, pre-populates fields, and submits update action.
  - Renders Order History grid in edit mode with all 5 columns: Order Code, Order Date (`dd/MM/yyyy`), StatusBadge, Note, and VND Amount.
  - Tests clicking Order Code button calls `router.push('/orders?orderId=101')` and closes the dialog.
  - Tests empty state (`"No order history found."`) and error state (`"Failed to load order history."`).
- **Table Component Tests (`components/customers/customers-table.test.tsx`)**:
  - Renders customer items correctly with DOB formatted as `dd/MM/yyyy`.
  - Clicking on a Customer Code button opens the edit dialog with the corresponding customer.
- **Orders Integration Tests (`tests/orders.test.tsx`)**:
  - Verifies `OrdersTable` automatically opens `OrderFormDialog` in edit mode when `initialEditOrderId` is passed.
- **API Tests (`tests/customers.test.tsx`)**:
  - Unit tests for `getCustomerById`, `createCustomer`, `updateCustomer`, and `getCustomerOrders` in `lib/api/customerApi.ts`.

---

## 8. Boundaries

- **Always**:
  - Use strict TypeScript typing without `any`.
  - Use single quotes (`'`) and format with Prettier (`pnpm format`).
  - Provide accessible labels (`aria-label`, `<label htmlFor="...">`) for all form inputs.
  - Reset form errors and states cleanly when dialog is closed or reopened.
  - Maintain responsive dialog styling (`sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto`) to avoid viewport clipping.
- **Ask First**:
  - Modifying the underlying customer schema in backend APIs.
  - Introducing third-party form libraries vs adhering to the project's established native React state pattern.
- **Never**:
  - Direct database or unsanitized API calls from client components (always use `fetchApi` or Server Actions).
  - Hardcode authentication tokens or API URLs.
  - Render the Order History grid in create mode.

---

## 9. Success Criteria

- [x] `lib/api/customerApi.ts` includes `getCustomerById`, `createCustomer`, `updateCustomer`, and `getCustomerOrders`.
- [x] `app/actions/customerActions.ts` provides `saveCustomerAction`, `getCustomerAction`, `updateCustomerAction`, and `getCustomerOrdersAction`.
- [x] `CustomerFormDialog` and `AddCustomerDialog` implemented in `components/customers/customer-form-dialog.tsx`.
- [x] Mobile input is formatted with 10-digit mask `____ ___ ___` and validated strictly for 10 digits.
- [x] Date of Birth input auto-formats `dd/MM/yyyy` (e.g. `25082011` -> `25/08/2011`) and provides DatePicker calendar selection.
- [x] `CustomersTable` client component displays DOB in `dd/MM/yyyy` format and provides Customer Code buttons that trigger editing.
- [x] `CustomerFormDialog` displays Order History grid in edit mode with Order Code, Order Date (`dd/MM/yyyy`), Status, Note, and Amount (VND).
- [x] Clicking Order Code navigates to `/orders?orderId={id}` and automatically opens the Order Detail dialog.
- [x] All unit, component, and integration tests pass (`pnpm test --run`).
- [x] Linting (`pnpm lint`) and type checks (`pnpm typecheck`) pass with zero errors.

---

## 10. Open Questions & Assumptions

### Confirmed Specifications:
1. **API Endpoints**: `GET /api/Customers/{id}`, `POST /api/Customers`, `PUT /api/Customers/{id}`, and `GET /api/Customers/{customerId}/orders`.
2. **Customer Code**: Auto-generated by backend on create; displayed as read-only identifier in edit dialog. Clickable button in table triggers edit dialog.
3. **Mobile Number**: Strictly 10 digits, formatted as `____ ___ ___` (e.g. `0901 234 567`).
4. **Date of Birth**: Formatted as `dd/MM/yyyy` (e.g. `25/08/2011`) across table and form dialog, supporting both auto-formatted text input and DatePicker calendar popover selection.
5. **Order History Grid**:
   - Order Code: Clickable button opening Order Detail dialog via `/orders?orderId=${id}`.
   - Order Date: Formatted as `dd/MM/yyyy`.
   - Status: Displays `StatusBadge` matching Order List screen colors and labels.
   - Note: Displays `order.description || '-'`.
   - Amount: Formatted in VND right-aligned.
