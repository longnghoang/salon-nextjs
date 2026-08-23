# Specification: Add & Edit Product Feature

## 1. Objective
Provide a unified, responsive dialog interface (`ProductFormDialog`) and management flow allowing salon managers and staff to:
1. **Create New Products**: Add retail inventory or salon supplies with required details (`name`, `price`), optional details (`buyingPrice`, `discountPrice`, `quantity`, `description`, `isActive`), validate inputs (prices >= 0, quantity >= 0, discount price <= selling price), and submit via `POST /api/Products` using a Server Action.
2. **Edit Existing Products**: Click on a Product Code button in the products table (`ProductsTable`) to open the pre-populated dialog with existing product details and submit updates via `PUT /api/Products/{id}`.
3. **Seamless List Synchronization**: Automatically refresh the product list and pagination upon successful creation or modification using Next.js `router.refresh()`.

---

## 2. Tech Stack & Commands

- **Framework**: Next.js 16.1 (App Router, React Server Components + Client Actions)
- **UI Library**: React 19, Radix UI Primitives (`@radix-ui/react-dialog`, `@radix-ui/react-select`), Tailwind CSS v4, Lucide React icons (`Plus`, `Pencil`, `Package`, `Tag`, `DollarSign`, `Loader2`, `Boxes`, `FileText`, `CheckCircle`)
- **Utilities**: `clsx`, `tailwind-merge` (`cn`), `Intl.NumberFormat` (`vi-VN` currency)
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
│   └── productActions.ts              # Server actions (saveProductAction, getProductAction, updateProductAction)
├── products/
│   ├── page.tsx                       # Server Component rendering Products page header with AddProductDialog
│   └── page.test.tsx                  # Server component tests
components/
├── products/
│   ├── product-form-dialog.tsx        # Unified dialog component for Add & Edit Product
│   ├── product-form-dialog.test.tsx   # Component tests for Add & Edit Product dialog
│   ├── products-table.tsx             # Client component rendering product rows with clickable Product Code edit buttons
│   ├── products-table.test.tsx        # Unit tests for ProductsTable edit interactions
│   ├── product-filter.tsx             # Search filter toolbar
│   └── products-cursor-pagination.tsx # Cursor pagination controls
lib/
├── api/
│   ├── productApi.ts                  # Backend API methods (getProducts, getProductById, createProduct, updateProduct)
│   └── fetchApi.ts                    # Session-authenticated fetch wrapper
types/
└── product.ts                         # TypeScript interfaces (Product, ProductFormData, GetProductsParams, etc.)
tests/
└── products.test.tsx                  # Integration & API client tests for product API endpoints
docs/
└── specs/
    └── add-edit-product.md            # Archived specification document (this file)
```

---

## 4. Data Models & API Contracts

### Data Interfaces (`types/product.ts`)

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

export interface ProductFormData {
  name: string;
  price: number;
  buyingPrice?: number | null;
  discountPrice?: number | null;
  quantity?: number;
  description?: string | null;
  isActive?: boolean;
}
```

### API Endpoints (`lib/api/productApi.ts`)
- `GET /api/Products/cursor?SearchText=...&PageSize=...`: Fetches cursor-paginated products.
- `GET /api/Products/{id}`: Fetches single product details by ID.
- `POST /api/Products`: Creates a new product record.
- `PUT /api/Products/{id}`: Updates an existing product record.

### Server Actions (`app/actions/productActions.ts`)
- `saveProductAction(product: ProductFormData | Partial<Product>)`: Calls `createProduct(product)`.
- `getProductAction(id: number)`: Calls `getProductById(id)`.
- `updateProductAction(id: number, product: ProductFormData | Partial<Product>)`: Calls `updateProduct(id, product)`.

---

## 5. Component Architecture & UI Workflows

### 5.1 Modes of Operation

`ProductFormDialog` operates in two modes configured via props:

```typescript
export interface ProductFormDialogProps {
  mode?: 'create' | 'edit';
  productId?: number | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}
```

- **Create Mode (`mode="create"`)**:
  - Modal title: `"Add New Product"`
  - Description: `"Enter product inventory details to create a new product item."`
  - Submit button: `"Save Product"`
  - Initial field states: Blank name, empty prices, quantity `0`, status `Active` (`isActive: true`), empty description.
  - Can be triggered directly via an `AddProductDialog` button (e.g. `<Button className="flex items-center gap-2"><Plus className="h-4 w-4" /><span>Add Product</span></Button>`) in the header of `/products`.
  - On submit, calls `saveProductAction(payload)`.

- **Edit Mode (`mode="edit"`, with `productId`)**:
  - Modal title: `"Edit Product"`
  - Description: `"Update the product details and inventory levels below."`
  - Submit button: `"Save Changes"`
  - Displays product `code` in a read-only badge in the dialog header.
  - When opened, fetches product data via `getProductAction(productId)`.
  - Pre-populates all form fields (`name`, `price`, `buyingPrice`, `discountPrice`, `quantity`, `isActive`, `description`).
  - On submit, calls `updateProductAction(productId, payload)`.

### 5.2 Form Fields & Validation Rules

1. **Product Name (`name`)**:
   - Required.
   - Minimum 2 characters.
   - Validation error: `"Product name is required (at least 2 characters)."`
2. **Selling Price (`price`)**:
   - Required.
   - Formatted with thousand separators in UI (e.g. `250,000` VND) as user types or views for visual readability.
   - Raw numeric value (e.g. `250000`) is parsed and sent to API / Database.
   - Positive numeric value (>= 0).
   - Validation error: `"Selling price must be a valid non-negative number."`
3. **Buying Price / Cost (`buyingPrice`)**:
   - Optional.
   - Formatted with thousand separators in UI (e.g. `150,000` VND) as user types or views.
   - Raw numeric value (or `null`) is sent to API / Database.
   - If provided, must be a numeric value >= 0.
   - Validation error: `"Buying price must be a valid non-negative number."`
4. **Discount Price (`discountPrice`)**:
   - Optional.
   - Formatted with thousand separators in UI (e.g. `220,000` VND) as user types or views.
   - Raw numeric value (or `null`) is sent to API / Database.
   - If provided, must be a numeric value >= 0 and must not exceed the selling price (`discountPrice <= price`).
   - Validation error: `"Discount price cannot exceed selling price."`
5. **Stock Quantity (`quantity`)**:
   - Optional (defaults to `0`).
   - Must be an integer >= 0.
   - Validation error: `"Quantity must be a non-negative whole number."`
6. **Status (`isActive`)**:
   - Optional / Boolean (defaults to `true`).
   - Selection between **Active** (available for sales/orders) and **Inactive**.
7. **Description (`description`)**:
   - Optional multiline text for product specifications, usage, or ingredients.

### 5.3 User Interaction & Synchronization

- In `ProductsTable`, the **Product Code** column is a clickable button/badge (styled with subtle border, hover background highlight, and `Pencil` icon) that triggers `ProductFormDialog` in `mode="edit"` with the selected product's ID.
- In `app/products/page.tsx`, the header displays an `AddProductDialog` button on the right side.
- Submitting the dialog shows a loading spinner (`Loader2`) and disables form inputs.
- On success: closes the dialog, resets internal state, and triggers `router.refresh()` to refresh the RSC product listing.
- On error: displays an inline alert error banner within the modal.

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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  saveProductAction,
  getProductAction,
  updateProductAction,
} from '@/app/actions/productActions';
import type { ProductFormData } from '@/types/product';

// Follow standard Next.js Server Actions + Client Component modal pattern matching CustomerFormDialog
```

---

## 7. Testing Strategy

- **Component Tests (`components/products/product-form-dialog.test.tsx`)**:
  - Renders Create mode with empty fields and default button label.
  - Validates required fields (`name`, `price`) and displays inline error messages on empty/invalid inputs.
  - Validates price rules (non-negative numbers, discount price <= selling price).
  - Validates quantity rules (integer >= 0).
  - Renders Edit mode, fetches product details by ID via `getProductAction`, and pre-populates form fields.
  - Displays product code badge in header during edit mode.
  - Disables submit button and shows loading spinner during submission.
  - Calls `saveProductAction` on create submission and `updateProductAction` on edit submission.
- **Table Interaction Tests (`components/products/products-table.test.tsx`)**:
  - Verifies Product Code badge/button is interactive and triggers edit dialog with product ID.
- **Server Page Tests (`app/products/page.test.tsx`)**:
  - Verifies presence of `Add Product` trigger button in the page header.
- **API Tests (`tests/products.test.tsx`)**:
  - Unit tests for `getProductById`, `createProduct`, and `updateProduct` in `lib/api/productApi.ts`.

---

## 8. Boundaries

- **Always**:
  - Use strict TypeScript typing without `any`.
  - Use single quotes (`'`) and format with Prettier (`pnpm format`).
  - Provide accessible labels (`aria-label`, `<label htmlFor="...">`) for all form inputs.
  - Cleanly reset form errors and state when dialog is closed or reopened.
- **Ask First**:
  - Modifying the underlying backend product schema or database tables.
  - Adding new third-party dependencies to `package.json`.
- **Never**:
  - Direct database or unsanitized API calls from client components (always use `fetchApi` or Server Actions).
  - Hardcode credentials or tokens.

---

## 9. Success Criteria

- [x] `types/product.ts` defines `ProductFormData` interface.
- [x] `lib/api/productApi.ts` includes `getProductById`, `createProduct`, and `updateProduct`.
- [x] `app/actions/productActions.ts` provides `saveProductAction`, `getProductAction`, and `updateProductAction`.
- [x] `ProductFormDialog` and `AddProductDialog` implemented in `components/products/product-form-dialog.tsx`.
- [x] Numeric validation for `price`, `buyingPrice`, `discountPrice`, and `quantity` with appropriate error messaging.
- [x] `ProductsTable` in `components/products/products-table.tsx` provides clickable Product Code buttons that open edit dialog.
- [x] `app/products/page.tsx` integrates `AddProductDialog` button in header.
- [x] All unit, component, and integration tests pass (`pnpm test --run`).
- [x] TypeScript checks (`pnpm typecheck`) and ESLint checks (`pnpm lint`) pass with 0 errors.

---

## 10. Open Questions & Assumptions

### Surfaced Assumptions:
1. **Backend Endpoints**: Follow standard REST conventions matching Customers: `GET /api/Products/{id}`, `POST /api/Products`, and `PUT /api/Products/{id}`.
2. **Product Code**: Auto-generated by the backend upon creation (just like Customer code `CUST-xxx`); shown as a read-only badge in the dialog header in Edit mode.
3. **Currency & Numeric Inputs**: Form inputs accept standard numeric values; formatted in table as VND (`vi-VN`).
4. **Active Status**: Defaults to `true` on creation; editable via select or toggle in form.
