# Specification: Product List Screen

## 1. Objective
Provide a server-rendered, responsive Product Table screen (`app/products/page.tsx`) for salon managers and staff to:
1. **Browse Products**: View salon retail and supply inventory with product codes, names, selling prices, buying prices, stock quantities, and active statuses.
2. **Search & Filter**: Search and filter products by name or code via a dedicated search input textbox in the filter toolbar.
3. **Cursor-Based Pagination**: Paginate forward and backward through large inventories using cursor tokens (`before`, `after`) via `/api/Products/cursor`, maintaining active search filters.
4. **Resilient UI**: Gracefully handle empty search results, loading states, and API error states with descriptive feedback.

---

## 2. Tech Stack & Commands

- **Framework**: Next.js 16.1 (App Router, React Server Components)
- **Language**: TypeScript (strict typing, no `any`)
- **Styling**: Tailwind CSS v4, shadcn/ui (radix-nova style)
- **Formatting & Localization**: `Intl.NumberFormat` (`vi-VN` currency VND)
- **Testing**: Vitest, React Testing Library, `@testing-library/jest-dom`, jsdom
- **Package Manager**: pnpm

### Core Commands
```bash
# Run development server
pnpm dev

# Run type checks
pnpm typecheck

# Run test suite
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
├── products/
│   ├── page.tsx                          # Async Server Component (RSC) fetching & rendering products
│   └── page.test.tsx                     # Unit/Integration tests for ProductsPage RSC
components/
├── products/
│   ├── products-table.tsx                # Client component displaying product list rows & empty/error states
│   ├── products-table.test.tsx           # Unit tests for ProductsTable
│   ├── product-filter.tsx                # Client component with search input for product name/code
│   ├── product-filter.test.tsx           # Unit tests for ProductFilter
│   ├── products-cursor-pagination.tsx    # Client component managing cursor navigation (Next/Prev)
│   └── products-cursor-pagination.test.tsx # Unit tests for cursor pagination
lib/
├── api/
│   ├── productApi.ts                     # API client methods (getProducts with cursor pagination)
│   └── fetchApi.ts                       # Base fetch wrapper with auth header handling
types/
└── product.ts                            # Product TypeScript interfaces & pagination models
docs/
└── specs/
    └── product-list.md                   # Permanent specification documentation (this file)
```

---

## 4. Data Models & API Contracts

### Data Interfaces (`types/product.ts` & `lib/api/productApi.ts`)

```typescript
export interface Product {
  id: number;
  code: string;
  name: string;
  buyingPrice: number | null;
  price: number;
  discountPrice: number | null;
  quantity: number;
  description: string | null;
  isActive: boolean | null;
  createdBy?: string | null;
  createdDateTime?: string | null;
  updatedBy?: string | null;
  updatedDateTime?: string | null;
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

export interface GetProductsParams {
  searchText?: string;
  pageSize?: number;
  before?: string;
  after?: string;
}
```

### Backend API Endpoint
- **Endpoint**: `GET /api/Products/cursor`
- **Query Parameters**:
  - `SearchText`: Optional string to filter products matching code or name.
  - `PageSize`: Integer (default: `20`).
  - `Before`: Cursor token string for backward pagination.
  - `After`: Cursor token string for forward pagination.
- **Response Format**:
  ```json
  {
    "items": [
      {
        "id": 1,
        "code": "PROD-001",
        "name": "Argan Oil Shampoo 500ml",
        "buyingPrice": 120000,
        "price": 250000,
        "discountPrice": 220000,
        "quantity": 45,
        "description": "Nourishing Moroccan argan oil shampoo",
        "isActive": true
      }
    ],
    "paging": {
      "before": "cursor_token_before",
      "after": "cursor_token_after",
      "hasNext": true,
      "hasPrevious": false
    }
  }
  ```

---

## 5. Component Architecture & UI Specifications

### 5.1 Server Component (`app/products/page.tsx`)
- Reads `searchParams` (`searchText`, `before`, `after`) asynchronously.
- Calls `getProducts({ searchText, pageSize: 20, before, after })`.
- Handles exceptions gracefully and produces an `errorMsg` fallback.
- Renders:
  - Page header: Title "Products" and subtitle "Manage retail inventory and salon supplies."
  - `<ProductFilter />` toolbar.
  - `<ProductsTable products={displayProducts} errorMsg={errorMsg} />`.
  - `<ProductsCursorPagination />` with navigation cursors and record count.

### 5.2 Search & Filter Bar (`components/products/product-filter.tsx`)
- Client component (`'use client'`).
- Input textbox with placeholder: `"Search by name or code..."`.
- Synchronizes with current URL `searchText` param on mount/navigation.
- **Apply Action**: Pressing Enter in the input or clicking "Apply" updates URL search params `?searchText=<value>`, and clears `before`, `after`, and `page` parameters.
- **Clear Action**: Clicking "Clear" resets input value and strips `searchText`, `before`, `after`, and `page` from the URL.

### 5.3 Products Table (`components/products/products-table.tsx`)
- Table columns:
  1. **Product Code**: Displayed in styled code badge / font-medium.
  2. **Product Name**: Primary product title font-medium text.
  3. **Selling Price**: Formatted as VND (`vi-VN` currency format).
  4. **Buying Price**: Formatted as VND currency, or `'-'` if null.
  5. **Stock / Quantity**: Formatted integer quantity (with visual warning if stock <= 0).
  6. **Status**: Badge indicating Active (`bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`) vs Inactive (`bg-muted text-muted-foreground`).
  7. **Description**: Truncated description or `'-'`.
- States:
  - **Populated**: Table rows showing products with hover highlights.
  - **Empty**: Centered message `"No products found."` spanning full column width.
  - **Error**: Centered destructive alert message with `errorMsg`.

### 5.4 Cursor Pagination (`components/products/products-cursor-pagination.tsx`)
- Displays `"Showing <count> products"`.
- **Previous Button**: Enabled when `hasPrevious === true`, routes to `?before=<beforeCursor>&...filters`. Disabled with `opacity-50 pointer-events-none` when `hasPrevious === false`.
- **Next Button**: Enabled when `hasNext === true`, routes to `?after=<afterCursor>&...filters`. Disabled with `opacity-50 pointer-events-none` when `hasNext === false`.
- Automatically preserves active `searchText` when navigating cursors.
- Returns `null` if total displayed items is 0 and no pagination cursors exist.

---

## 6. Code Style & Conventions

```typescript
// Example: lib/api/productApi.ts implementation pattern
import { fetchApi } from './fetchApi';
import type { CursorPaginatedResult, GetProductsParams, Product } from '@/types/product';

export async function getProducts(
  params?: GetProductsParams
): Promise<CursorPaginatedResult<Product>> {
  const searchParams = new URLSearchParams();

  if (params?.searchText) {
    searchParams.set('SearchText', params.searchText);
  }
  if (params?.pageSize !== undefined) {
    searchParams.set('PageSize', String(params.pageSize));
  }
  if (params?.before !== undefined) {
    searchParams.set('Before', params.before);
  }
  if (params?.after !== undefined) {
    searchParams.set('After', params.after);
  }

  const queryString = searchParams.toString();
  const endpoint = queryString
    ? `/api/Products/cursor?${queryString}`
    : '/api/Products/cursor';

  const response = await fetchApi<CursorPaginatedResult<Product>>(endpoint);

  if (!response || !response.items) {
    return {
      items: [],
      paging: { before: null, after: null, hasNext: false, hasPrevious: false },
    };
  }

  return response;
}
```

---

## 7. Testing Strategy

- **Test Framework**: Vitest with `@testing-library/react` and `jsdom`.
- **Test Files**:
  1. `app/products/page.test.tsx`:
     - Empty list rendering ("No products found.").
     - Populated product rendering (code, name, currency format, stock quantity).
     - Error state handling when API rejects.
     - Verifies correct parameter forwarding (`searchText`, `pageSize: 20`, `before`, `after`) to `getProducts`.
  2. `components/products/product-filter.test.tsx`:
     - Input rendering and value typing.
     - Clicking "Apply" updates URL search params and purges cursor tokens.
     - Pressing Enter key triggers filter apply.
     - Clicking "Clear" resets input and purges `searchText` from URL.
  3. `components/products/products-table.test.tsx`:
     - Header and row rendering.
     - Correct formatting of currency values (VND) and fallback for null prices.
     - Active vs Inactive status badges.
     - Empty and error state display.
  4. `components/products/products-cursor-pagination.test.tsx`:
     - Hiding when 0 items and no cursors.
     - Correct Next/Previous enabled/disabled states.
     - URL generation preserving `searchText`.

---

## 8. Boundaries

- **Always**:
  - Use React Server Components for data fetching where possible.
  - Use strict TypeScript types (no `any`).
  - Use `cn()` from `@/lib/utils` for conditional class combinations.
  - Format currency using `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
  - Format code using `pnpm format` and check with `pnpm lint` and `pnpm typecheck`.
- **Ask First**:
  - Adding new third-party dependencies to `package.json`.
  - Adding create/edit/delete product dialogs (out of immediate scope of table & search).
- **Never**:
  - Call internal database or mock endpoints directly from client components when RSC is available.
  - Remove failing tests or reduce test assertions without user confirmation.

---

## 9. Success Criteria

- [x] `lib/api/productApi.ts` implements `getProducts` with cursor pagination calling `/api/Products/cursor`.
- [x] `app/products/page.tsx` renders product list, filter toolbar, and cursor pagination.
- [x] `components/products/product-filter.tsx` allows entering search text and filtering by name or code.
- [x] `components/products/products-table.tsx` renders product rows with code, name, formatted VND prices, quantity, and status.
- [x] `components/products/products-cursor-pagination.tsx` navigates forward and backward preserving search parameters.
- [x] All unit and integration tests pass (`pnpm test --run`).
- [x] TypeScript checks and ESLint checks pass with 0 errors (`pnpm typecheck && pnpm lint`).

---

## 10. Assumptions & Decisions (Aligned with Stakeholder)

1. **Backend Endpoint**: Verified and confirmed as `/api/Products/cursor`, taking `SearchText`, `PageSize`, `Before`, and `After` query params.
2. **Search Scope**: The single textbox passes `SearchText` to filter products by name or code simultaneously on the server.
3. **Table Columns**: Columns to display include Code, Name, Selling Price, Buying Price, Stock Quantity, Status (Active/Inactive), and Description.
4. **Scope Boundary**: Strictly scoped to the product table view, search textbox filter, and cursor pagination. Creation, edit, and deletion modals/dialogs are out of scope for this task.
