# Specification: Customer List Screen

## 1. Objective
Provide a server-rendered, responsive customer management table screen (`app/customers/page.tsx`) for salon managers and staff to:
1. **Browse Customers**: View salon customer profiles including Customer Code, Full Name, Phone Number, Date of Birth (DOB), Created Date, and Notes.
2. **Search & Filter**: Search customers by text (name, phone number) via a dedicated search input toolbar (`CustomerFilter`). *(Note: Searching by customer code is not supported).*
3. **Cursor-Based Pagination**: Paginate forward and backward through large customer directories using opaque cursor tokens (`before`, `after`) via `/api/Customers/cursor` while preserving active search filters.
4. **Interactive Actions**:
   - Create new customer profiles via `AddCustomerDialog` from the header action button.
   - Trigger the customer edit dialog (`CustomerFormDialog` in `mode="edit"`) directly by clicking on any Customer Code button in the table.
5. **Resilient UI**: Handle loading, empty search results, and API error states with clear feedback and accessible components.

---

## 2. Tech Stack & Commands

- **Framework**: Next.js 16.1 (App Router, React Server Components)
- **Language**: TypeScript (strict typing, zero `any`)
- **Styling**: Tailwind CSS v4, shadcn/ui (radix-nova style)
- **UI & Icons**: React 19, Radix UI primitives (`Table`, `Button`, `Input`, `Dialog`, `Pagination`), Lucide React (`Search`, `RotateCcw`, `Pencil`, `UserPlus`)
- **Formatting & Helpers**: Custom date and phone formatters (`formatMobileNumber`, `formatDateToDDMMYYYY`), `clsx`, `tailwind-merge` (`cn`)
- **Testing**: Vitest, React Testing Library, `@testing-library/jest-dom`, jsdom
- **Package Manager**: pnpm

### Core Commands
```bash
# Run development server
pnpm dev

# Run type checking
pnpm typecheck

# Run unit and component test suite
pnpm test --run

# Run linter
pnpm lint

# Format code
pnpm format
```

---

## 3. Project Structure

```
app/
├── customers/
│   ├── page.tsx                          # Async Server Component (RSC) fetching & rendering customers
│   └── page.test.tsx                     # Unit/Integration tests for CustomersPage RSC
components/
├── customers/
│   ├── customer-filter.tsx               # Client component with search input for customer queries
│   ├── customer-filter.test.tsx          # Unit tests for CustomerFilter
│   ├── customers-table.tsx               # Client component rendering customer rows & edit modal trigger
│   ├── customers-table.test.tsx          # Unit tests for CustomersTable
│   ├── customers-cursor-pagination.tsx   # Client component managing cursor navigation (Next/Prev)
│   ├── customers-cursor-pagination.test.tsx # Unit tests for cursor pagination
│   └── customer-form-dialog.tsx          # Unified dialog for AddCustomerDialog and CustomerFormDialog (edit mode)
lib/
├── api/
│   ├── customerApi.ts                    # API client methods (getCustomers, getCustomerById, etc.)
│   └── fetchApi.ts                       # Base fetch wrapper handling auth and errors
types/
├── customer.ts                           # Customer TypeScript models and form interfaces
└── pagination.ts                         # Shared cursor pagination interfaces (CursorPaginationInfo, CursorPaginatedResult)
docs/
└── specs/
    └── customer-list.md                  # Permanent specification documentation (this file)
```

---

## 4. Data Models & API Contracts

### Data Interfaces (`types/customer.ts` & `types/pagination.ts`)

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

// types/pagination.ts
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

// lib/api/customerApi.ts
export interface GetCustomersParams {
  searchText?: string;
  pageSize?: number;
  before?: string;
  after?: string;
}
```

### Backend API Endpoint
- **Endpoint**: `GET /api/Customers/cursor`
- **Query Parameters**:
  - `SearchText`: Optional string filter for customer name or phone number (searching by customer code is not supported).
  - `PageSize`: Number of records per page (default: `20`).
  - `Before`: Cursor token for previous page navigation.
  - `After`: Cursor token for next page navigation.
- **Success Response**: `200 OK` returning `CursorPaginatedResult<Customer>`
- **Error Fallback**: If `response` or `response.items` is falsy, return `{ items: [], paging: { before: null, after: null, hasNext: false, hasPrevious: false } }`.

---

## 5. Component Architecture & UI Workflows

```
                               ┌────────────────────────┐
                               │   CustomersPage (RSC)  │
                               │  app/customers/page.tsx│
                               └───────────┬────────────┘
                                           │
         ┌─────────────────────────────────┼────────────────────────────────┐
         ▼                                 ▼                                ▼
┌─────────────────┐             ┌─────────────────────┐        ┌──────────────────────────┐
│ AddCustomer     │             │ CustomerFilter      │        │ CustomersTable           │
│ Dialog          │             │ (Search & Clear)    │        │ (Rows & Inline Edit)     │
└─────────────────┘             └─────────────────────┘        └────────────┬─────────────┘
                                                                            │
                                                                            ▼
                                                               ┌──────────────────────────┐
                                                               │ CustomersCursorPagination│
                                                               │ (Prev / Next links)      │
                                                               └──────────────────────────┘
```

### 5.1 Server Component Architecture (`app/customers/page.tsx`)

`CustomersPage` is an asynchronous React Server Component that:
1. Resolves `props.searchParams` promise to extract:
   - `searchText` (string | undefined)
   - `before` (string | undefined)
   - `after` (string | undefined)
   - Fixed `pageSize = 20`
2. Fetches paginated customer data via `getCustomers({ searchText, pageSize: 20, before, after })`.
3. Handles exceptions gracefully by setting `errorMsg = 'Failed to load customers. Please try again later.'` and empty customer list.
4. Renders layout with:
   - Header with page title (`Customers`), description (`Manage your salon client profiles and history.`), and `<AddCustomerDialog />`.
   - `<CustomerFilter />` toolbar.
   - `<CustomersTable customers={displayCustomers} errorMsg={errorMsg} />`.
   - `<CustomersCursorPagination />` with navigation flags and cursor tokens.

### 5.2 Search & Filter Toolbar (`components/customers/customer-filter.tsx`)

1. **Client State & URL Synchronization**:
   - Reads `searchText` from URL search parameters on initial render.
   - Re-syncs internal state if URL parameters change externally (e.g. browser back/forward navigation).
2. **Search Input**:
   - Controlled `<Input>` with placeholder `"Search customers..."`.
   - Pressing `Enter` key triggers search submission.
3. **Actions**:
   - **Apply Button**: Appends or updates `searchText` query param, resets pagination cursors (`page`, `before`, `after`), and pushes new URL via `router.push()`.
   - **Clear Button**: Resets input state to empty, removes `searchText`, `page`, `before`, and `after` params, and updates URL.

### 5.3 Customers Table (`components/customers/customers-table.tsx`)

Displays customer records in a responsive table layout:

| Column | Data Field | Formatting & Rendering Rules |
| :--- | :--- | :--- |
| **Customer Code** | `customer.code` | Interactive badge button with `<Pencil className="h-3 w-3" />`. Clicking opens `CustomerFormDialog` in edit mode (`mode="edit"`, `customerId={customer.id}`). |
| **Customer Name** | `customer.fullName` | Bold text (`font-medium`). |
| **Phone** | `customer.mobile` | Formatted with `formatMobileNumber` (e.g., `0901 234 567`). |
| **DOB** | `customer.birthDay` | Formatted with `formatDateToDDMMYYYY` (`DD/MM/YYYY`) or `'-'` if null. |
| **Created Date** | `customer.createdDateTime` | Formatted as `DD/MM/YYYY` using `toLocaleDateString('vi-VN')`. |
| **Note** | `customer.note` | Truncated with `max-w-xs truncate` or `'-'` if empty. |

#### Display States:
- **Populated**: Displays table rows with interactive hover effects and clickable Customer Code edit buttons.
- **Empty**: Renders a single cell spanning 6 columns with `"No customers found."` in muted text.
- **Error**: Renders a single cell spanning 6 columns displaying `errorMsg` in destructive text color (`text-destructive`).

### 5.4 Cursor Pagination (`components/customers/customers-cursor-pagination.tsx`)

- **Items Count**: Displays `"Showing <itemsCount> customers"`.
- **Previous Navigation**:
  - Enabled when `hasPrevious === true`, linking to `?before=<beforeCursor>&...activeFilters`.
  - Disabled when `hasPrevious === false` (`pointer-events-none opacity-50`, `aria-disabled="true"`).
- **Next Navigation**:
  - Enabled when `hasNext === true`, linking to `?after=<afterCursor>&...activeFilters`.
  - Disabled when `hasNext === false` (`pointer-events-none opacity-50`, `aria-disabled="true"`).
- **Filter Preservation**: Preserves existing `searchText` while replacing cursor query parameters.
- **Suppression**: Returns `null` when `itemsCount === 0 && !hasPrevious && !hasNext`.

---

## 6. Testing Strategy & Validation

### Test Suites
1. **Server Component (`app/customers/page.test.tsx`)**:
   - Validates rendering with populated customers, verifying codes, formatted phone numbers, and dates.
   - Validates rendering of the empty state when no items are returned.
   - Validates error message rendering when API call fails.
   - Validates that `getCustomers` is invoked with correct search text, pagination parameters, and page size.
2. **Filter Component (`components/customers/customer-filter.test.tsx`)**:
   - Verifies input rendering, Apply button, and Clear button.
   - Verifies clicking Apply updates search params and clears pagination cursors.
   - Verifies clicking Clear resets search text and pagination cursors.
3. **Table Component (`components/customers/customers-table.test.tsx`)**:
   - Verifies rendering of all table headers and row contents.
   - Verifies empty state and error message display.
   - Verifies clicking Customer Code button triggers `getCustomerAction` and opens `CustomerFormDialog` in edit mode.
4. **Pagination Component (`components/customers/customers-cursor-pagination.test.tsx`)**:
   - Verifies component suppresses rendering when item count is 0 without cursors.
   - Verifies enabled/disabled states of Previous and Next buttons according to cursor availability.
   - Verifies URL generation preserves query parameters (`searchText`) while setting correct cursor tokens.
5. **API Client (`tests/customers.test.tsx`)**:
   - Verifies `getCustomers`, `getCustomerById`, `createCustomer`, and `updateCustomer` API client methods with mocked fetch responses.

---

## 7. Boundaries

- **Always Do**:
  - Keep data fetching on the server using React Server Components (`app/customers/page.tsx`).
  - Use `'use client'` only for interactive components (`CustomerFilter`, `CustomersTable`, `CustomersCursorPagination`, `CustomerFormDialog`).
  - Format phone numbers and dates with established utility functions (`formatMobileNumber`, `formatDateToDDMMYYYY`).
  - Preserve search filters across pagination transitions.
  - Reset pagination cursors whenever a new search filter is applied or cleared.
  - Maintain strict TypeScript types without using `any`.
- **Ask First**:
  - Changing the default `pageSize` (currently 20).
  - Altering table column structures or customer display fields.
  - Introducing new search criteria or multi-field filtering.
- **Never Do**:
  - Perform unauthenticated or direct client-side external API calls bypassing the standard fetch wrapper / server actions.
  - Break cursor pagination state by mixing offset-based (`page=...`) and cursor-based (`before`/`after`) query parameters.
  - Remove error boundaries or fallback handling for missing API responses.

---

## 8. Success Criteria

- [x] `app/customers/page.tsx` renders customer list seamlessly with server-side data fetching.
- [x] Search filter allows finding customers by name or phone number and resets cursor positions on query change.
- [x] Table displays Customer Code, Name, Phone, DOB, Created Date, and Note with proper formatting.
- [x] Clicking a Customer Code opens the edit modal with prefilled data.
- [x] Add Customer button in header opens creation dialog.
- [x] Cursor pagination smoothly advances forward and backward while preserving query parameters.
- [x] Unit, component, and integration tests pass cleanly (`pnpm test --run`).
- [x] Type checking passes without errors (`pnpm typecheck`).
- [x] Linter and formatting checks pass (`pnpm lint`, `pnpm format`).
