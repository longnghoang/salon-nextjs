# Specification: Add & Edit Customer Feature

## 1. Objective
Provide a unified, responsive dialog interface (`CustomerFormDialog`) and management flow allowing salon staff and administrators to:
1. **Create New Customer Profiles**: Add a customer with required contact details (`fullName`, `mobile`), optional details (`email`, `address`, `birthDay`, `note`), format and validate inputs (including 10-digit mobile `____ ___ ___` and `dd-MM-yyyy` birthday), and submit via `POST /api/Customers` via Server Action.
2. **Edit Existing Customer Profiles**: Click on a Customer Code button in the customers table (`CustomersTable`) to open the pre-populated dialog with existing customer details and submit updates via `PUT /api/Customers/{id}`.
3. **Seamless List Synchronization**: Automatically refresh customer listing and pagination upon successful creation or modification using Next.js `router.refresh()`.

---

## 2. Tech Stack & Commands

- **Framework**: Next.js 16.1 (App Router, React Server Components + Client Actions)
- **UI Library**: React 19, Radix UI Primitives (`@radix-ui/react-dialog`, `@radix-ui/react-popover`), Tailwind CSS v4, Lucide React icons (`UserPlus`, `Pencil`, `Loader2`, `Calendar`, etc.)
- **Utilities**: `clsx`, `tailwind-merge` (`cn`), `date-fns` (formatting `dd-MM-yyyy`)
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
│   └── customerActions.ts             # Server actions (saveCustomerAction, getCustomerAction, updateCustomerAction)
├── customers/
│   ├── page.tsx                       # Server Component rendering Customers page & table wrapper
│   └── page.test.tsx                  # Server component tests
components/
├── customers/
│   ├── customer-form-dialog.tsx       # Unified dialog component for Add & Edit Customer
│   ├── customer-form-dialog.test.tsx  # Component tests for Add & Edit Customer dialog
│   ├── customers-table.tsx            # Client component rendering customer rows with clickable Customer Code edit buttons
│   ├── customers-table.test.tsx       # Unit tests for CustomersTable interactions
│   ├── customer-filter.tsx            # Search filter toolbar
│   └── customers-cursor-pagination.tsx# Cursor pagination controls
lib/
├── api/
│   ├── customerApi.ts                 # Backend API methods (getCustomers, getCustomerById, createCustomer, updateCustomer)
│   └── fetchApi.ts                    # Session-authenticated fetch wrapper
types/
└── customer.ts                        # TypeScript interfaces (Customer, CustomerFormData, etc.)
tests/
└── customers.test.tsx                 # Integration & API client tests for customer management
docs/
└── specs/
    └── add-edit-customer.md           # Feature specification documentation
```

---

## 4. Data Models & API Contracts

### Data Interfaces (`types/customer.ts`)

```typescript
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
```

### API Endpoints (`lib/api/customerApi.ts`)
- `GET /api/Customers/cursor?SearchText=...&PageSize=...`: Fetches cursor-paginated customers.
- `GET /api/Customers/{id}`: Fetches single customer by ID.
- `POST /api/Customers`: Creates a new customer record.
- `PUT /api/Customers/{id}`: Updates an existing customer record.

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
  - Submit button: `"Save Customer"`
  - Starts with blank form fields.
  - Can be triggered directly via an `AddCustomerDialog` button (e.g. `<Button><UserPlus className="mr-2 h-4 w-4" /> Add Customer</Button>`) in the header of `/customers`.
  - On submit, invokes `saveCustomerAction(payload)`.

- **Edit Mode (`mode="edit"`, with `customerId`)**:
  - Modal title: `"Edit Customer - <CustomerCode>"`
  - Submit button: `"Save Changes"`
  - When opened, fetches customer data via `getCustomerAction(customerId)`.
  - Pre-populates all form fields (`fullName`, `mobile`, `email`, `address`, `birthDay`, `note`), displaying birthday formatted as `dd-MM-yyyy` and mobile formatted as `0901 234 567`.
  - Customer `code` is displayed as a read-only badge in the dialog header.
  - On submit, invokes `updateCustomerAction(customerId, payload)`.

### 5.2 Form Fields & Validation Rules

1. **Full Name (`fullName`)**:
   - Required.
   - Trims whitespace; minimum 2 characters.
   - Validation error: `"Full name is required."`
2. **Mobile Number (`mobile`)**:
   - Required.
   - **Length is strictly 10 digits**.
   - Input format & mask: `____ ___ ___` (e.g. formatted as `0901 234 567` as user types).
   - Sanitized to 10 raw digits before saving (`0901234567`).
   - Validation error: `"Mobile number must be exactly 10 digits."`
3. **Date of Birth (`birthDay`)**:
   - Optional.
   - Format: `dd-MM-yyyy` (e.g., `25-08-2011`).
   - **Auto-formatting / masking**: Raw digit input auto-formats to `dd-MM-yyyy` as the user types (e.g. entering `25082011` becomes `25-08-2011`).
   - **Date Picker Calendar**: Accessible calendar popover trigger (`<Calendar mode="single" captionLayout="dropdown" />`) allowing users to browse and pick a date, automatically updating the input to `dd-MM-yyyy`. Future dates are disabled.
   - Validates valid calendar date and ensures it is not a future date.
   - Converted to ISO string (`YYYY-MM-DDT00:00:00Z` or `YYYY-MM-DD`) when sending to API.
   - Validation error: `"Please enter a valid date in dd-MM-yyyy format."`

4. **Email Address (`email`)**:
   - Optional.
   - If provided, validates standard email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
   - Validation error: `"Please enter a valid email address."`
5. **Address (`address`)**:
   - Optional string.
6. **Note / Preferences (`note`)**:
   - Optional multiline text for notes and preferences.

### 5.3 User Interaction & Table Integration

- Refactor `app/customers/page.tsx` to use client component `CustomersTable` (matching `OrdersTable` pattern).
- In `CustomersTable`, the **Customer Code** column is a clickable button/badge (styled with subtle border, hover state, and `Pencil` icon) that triggers `CustomerFormDialog` in `mode="edit"` with the selected customer's ID.
- Header on `app/customers/page.tsx` includes `AddCustomerDialog` trigger button.
- Submitting the dialog shows loading indicator (`Loader2` spinner) and disables inputs.
- On success, the dialog closes, form state resets, and `router.refresh()` executes to re-fetch the server component customer list.
- On failure, shows inline alert error message.

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
import { saveCustomerAction, updateCustomerAction, getCustomerAction } from '@/app/actions/customerActions';
import type { CustomerFormData } from '@/types/customer';

// Helper for 10-digit phone formatting: '0901234567' -> '0901 234 567'
export function formatMobileNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
}

// Helper for date formatting: '25082011' -> '25-08-2011'
export function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
}

// Follow standard Next.js Server Actions + Client Component modal pattern
```

---

## 7. Testing Strategy

- **Unit Tests**:
  - `components/customers/customer-form-dialog.test.tsx`:
    - Renders Create mode with empty fields and default button.
    - Tests mobile input masking/formatting `____ ___ ___` (10 digits).
    - Tests `dd-MM-yyyy` birthday input auto-formatting (`25082011` -> `25-08-2011`) and date picker interaction.
    - Validates required fields (`fullName`, `mobile`) and displays error messages on invalid input.
    - Renders Edit mode, fetches customer details by ID, pre-populates fields, and submits update action.
    - Disables submit button and displays spinner while saving.
- **Table Component Tests**:
  - `components/customers/customers-table.test.tsx`:
    - Renders customer items correctly.
    - Clicking on a Customer Code button opens the edit dialog with the corresponding customer.
- **Server Page Tests**:
  - `app/customers/page.test.tsx`:
    - Verifies page layout, `Add Customer` header trigger, `CustomersTable`, filter, and pagination.
- **API Tests**:
  - `tests/customers.test.tsx`:
    - Unit tests for `getCustomerById`, `createCustomer`, and `updateCustomer` in `lib/api/customerApi.ts`.

---

## 8. Boundaries

- **Always**:
  - Use strict TypeScript typing without `any`.
  - Use single quotes (`'`) and format with Prettier (`pnpm format`).
  - Provide accessible labels (`aria-label`, `<label htmlFor="...">`) for all form inputs.
  - Reset form errors and states cleanly when dialog is closed or reopened.
- **Ask First**:
  - Modifying the underlying customer schema in backend APIs.
  - Introducing third-party form libraries vs adhering to the project's established native React state pattern.
- **Never**:
  - Direct database or unsanitized API calls from client components (always use `fetchApi` or Server Actions).
  - Hardcode authentication tokens or API URLs.

---

## 9. Success Criteria

- [ ] `lib/api/customerApi.ts` includes `getCustomerById`, `createCustomer`, and `updateCustomer`.
- [ ] `app/actions/customerActions.ts` provides `saveCustomerAction`, `getCustomerAction`, and `updateCustomerAction`.
- [ ] `CustomerFormDialog` and `AddCustomerDialog` implemented in `components/customers/customer-form-dialog.tsx`.
- [ ] Mobile input is formatted with 10-digit mask `____ ___ ___` and validated strictly for 10 digits.
- [ ] Date of Birth input auto-formats `dd-MM-yyyy` (e.g. `25082011` -> `25-08-2011`) and provides DatePicker calendar selection.
- [ ] `CustomersTable` client component implemented in `components/customers/customers-table.tsx` with Customer Code buttons that trigger editing.
- [ ] `app/customers/page.tsx` integrates `AddCustomerDialog` in header and `CustomersTable` in content body.
- [ ] All unit, component, and integration tests pass (`pnpm test --run`).
- [ ] Linting (`pnpm lint`) and type checks (`pnpm typecheck`) pass with zero errors.

---

## 10. Open Questions & Assumptions

### Confirmed Specifications:
1. **API Endpoints**: `GET /api/Customers/{id}`, `POST /api/Customers`, `PUT /api/Customers/{id}`.
2. **Customer Code**: Auto-generated by backend on create; displayed as read-only identifier in edit dialog. Clickable button in table triggers edit dialog.
3. **Mobile Number**: Strictly 10 digits, formatted as `____ ___ ___` (e.g. `0901 234 567`).
4. **Date of Birth**: Formatted as `dd-MM-yyyy` (e.g. `25-08-2011`), supporting both auto-formatted text input and DatePicker calendar popover selection.
