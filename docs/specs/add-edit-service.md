# Specification: Add & Edit Service Feature

## 1. Objective

Provide a unified, responsive dialog interface (`ServiceFormDialog`) and management workflow allowing salon staff and managers to:
1. **Create New Services**: Add a salon service with required details (`name`, `price`), optional details (`discountPrice`, `commission`, `description`, `isActive`), validate inputs (prices >= 0, discount price <= regular price, commission >= 0), and submit via `POST /api/Services` using Next.js Server Action (`saveServiceAction`).
   - Triggered by clicking the **"Add Service"** button in the `/services` header.
2. **Edit Existing Services**: Click on a Service Code in the services list (`ServicesTable`) to open the pre-populated dialog with existing service details and submit modifications via `PUT /api/Services/{id}` using Server Action (`updateServiceAction`).
   - Triggered by clicking the **"Code"** badge/button in the service table.
3. **Seamless List Synchronization**: Automatically refresh the service list and pagination upon successful creation or modification using `router.refresh()`.

---

## 2. Tech Stack & Commands

- **Framework**: Next.js 16.1 (App Router, React Server Components + Client Actions)
- **UI Library**: React 19, Radix UI Primitives (`@radix-ui/react-dialog`, `@radix-ui/react-select`), Tailwind CSS v4, Lucide React icons (`Plus`, `Pencil`, `Scissors`, `Tag`, `DollarSign`, `Percent`, `Loader2`, `FileText`, `CheckCircle`)
- **Utilities**: `clsx`, `tailwind-merge` (`cn`), `Intl.NumberFormat` (`vi-VN` currency VND)
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
│   └── serviceActions.ts              # Server actions (saveServiceAction, getServiceAction, updateServiceAction)
├── services/
│   ├── page.tsx                       # Server Component rendering Services page header with AddServiceDialog
│   └── page.test.tsx                  # Server component tests
components/
├── services/
│   ├── service-form-dialog.tsx        # Unified dialog component for Add & Edit Service (ServiceFormDialog, AddServiceDialog)
│   ├── service-form-dialog.test.tsx   # Component tests for Add & Edit Service dialog
│   ├── services-table.tsx             # Client component rendering service rows with clickable Service Code edit buttons
│   ├── services-table.test.tsx        # Unit tests for ServicesTable edit interactions
│   ├── service-filter.tsx             # Search filter toolbar
│   └── services-cursor-pagination.tsx # Cursor pagination controls
lib/
├── api/
│   ├── serviceApi.ts                  # Backend API methods (getServices, getAllServices, getServiceById, createService, updateService)
│   └── fetchApi.ts                    # Authenticated fetch wrapper
types/
└── service.ts                         # TypeScript interfaces (Service, ServiceFormData, GetServicesParams, etc.)
tests/
└── services.test.tsx                  # Integration & API client tests for service API endpoints
docs/
└── specs/
    └── add-edit-service.md            # Archived specification document (this file)
```

---

## 4. Data Models & API Contracts

### 4.1 Data Interfaces (`types/service.ts`)

```typescript
export interface Service {
  id: number;
  code: string;
  name: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  commission: number | null;
  isActive: boolean | null;
  createdBy?: string | null;
  createdDateTime?: string | null;
  updatedBy?: string | null;
  updatedDateTime?: string | null;
}

export interface ServiceFormData {
  name: string;
  price: number;
  discountPrice?: number | null;
  commission?: number | null;
  description?: string | null;
  isActive?: boolean;
}
```

### 4.2 Backend API Endpoints (`lib/api/serviceApi.ts`)

- `GET /api/Services/cursor?SearchText=...&PageSize=...`: Cursor-paginated services list.
- `GET /api/Services/{id}`: Fetches single service details by ID.
- `POST /api/Services`: Creates a new service.
  - Body: `ServiceModel` (`{ name, price, discountPrice, commission, description, isActive }`)
- `PUT /api/Services/{id}`: Updates an existing service by ID.
  - Body: `ServiceModel` (`{ id, name, price, discountPrice, commission, description, isActive }`)

### 4.3 Server Actions (`app/actions/serviceActions.ts`)

- `saveServiceAction(service: ServiceFormData | Partial<Service>)`: Calls `createService(service)`.
- `getServiceAction(id: number)`: Calls `getServiceById(id)`.
- `updateServiceAction(id: number, service: ServiceFormData | Partial<Service>)`: Calls `updateService(id, service)`.

---

## 5. Component Architecture & UI Specifications

### 5.1 Modes of Operation (`ServiceFormDialog`)

```typescript
export interface ServiceFormDialogProps {
  mode?: 'create' | 'edit';
  serviceId?: number | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}
```

- **Create Mode (`mode="create"`)**:
  - Modal title: `"Add New Service"`
  - Description: `"Enter service details and pricing to create a new salon service item."`
  - Submit button: `"Save Service"`
  - Initial field states: Blank name, empty price, empty discount price, empty commission, status `Active` (`isActive: true`), empty description.
  - Can be triggered directly via `<AddServiceDialog />` in `/services` header.
  - On submit: calls `saveServiceAction(payload)`.

- **Edit Mode (`mode="edit"`, with `serviceId`)**:
  - Modal title: `"Edit Service"`
  - Description: `"Update the service details, pricing, and commission below."`
  - Submit button: `"Save Changes"`
  - Displays service `code` in a read-only badge in the dialog header.
  - When opened: fetches service details via `getServiceAction(serviceId)` with a loading spinner (`Loader2`).
  - Pre-populates all form fields (`name`, `price`, `discountPrice`, `commission`, `isActive`, `description`).
  - On submit: calls `updateServiceAction(serviceId, payload)`.

### 5.2 Form Fields & Validation Rules

1. **Service Name (`name`)**:
   - Required.
   - Minimum 2 characters.
   - Validation error: `"Service name is required (at least 2 characters)."`
2. **Selling Price (`price`)**:
   - Required.
   - Formatted with thousand separators in UI (e.g. `200,000` VND) as user types.
   - Positive numeric value (>= 0).
   - Validation error: `"Price must be a valid non-negative number."`
3. **Promotion / Discount Price (`discountPrice`)**:
   - Optional.
   - Formatted with thousand separators in UI (e.g. `180,000` VND).
   - If provided, must be a numeric value >= 0 and must not exceed regular price (`discountPrice <= price`).
   - Validation error: `"Promotion price cannot exceed regular price."` or `"Promotion price must be a valid non-negative number."`
4. **Staff Commission (`commission`)**:
   - Optional.
   - Numeric percentage rate (between 0 and 100).
   - Displayed with `%` suffix or icon.
   - Validation error: `"Commission must be a valid percentage between 0 and 100."`
5. **Status (`isActive`)**:
   - Optional / Boolean (defaults to `true`).
   - Selection between **Active** (available for booking/orders) and **Inactive**.
6. **Description / Note (`description`)**:
   - Optional multiline textarea for service description, instructions, or notes.

### 5.3 User Interaction & Synchronization

- In `ServicesTable`:
  - The **Code** column renders a clickable badge button with hover styling and a `Pencil` icon (`title="Click to edit service"`).
  - Clicking a code badge sets `editingServiceId` and opens `ServiceFormDialog` in `mode="edit"`.
- In `app/services/page.tsx`:
  - The header renders `<AddServiceDialog />` with a `Plus` icon and "Add Service" text.
- Submitting the dialog shows a loading spinner (`Loader2`) and disables buttons.
- On success: closes dialog, resets internal state, triggers `router.refresh()`.
- On error: displays an inline error alert within the dialog.

---

## 6. Code Style & Conventions

Follow existing codebase standards (`AGENTS.md` and `ProductFormDialog` pattern):
- Use strict TypeScript typing without `any`.
- Use `'use client'` for interactive components and `'use server'` for server actions.
- Use single quotes (`'`) and Prettier formatting (`pnpm format`).
- Currency formatted via `formatCurrencyInput` and parsed via `parseCurrencyInput`.
- Accessible labels (`<label htmlFor="...">`) for all form fields.

```typescript
// Pattern example: Currency input helper and form state handling
export function formatCurrencyInput(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  return isNaN(num) ? '' : num.toLocaleString('en-US');
}

export function parseCurrencyInput(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return null;
  const num = parseInt(digits, 10);
  return isNaN(num) ? null : num;
}
```

---

## 7. Testing Strategy

- **Component Tests (`components/services/service-form-dialog.test.tsx`)**:
  - Renders Create mode with empty fields and "Save Service" button.
  - Validates required fields (`name`, `price`) and shows inline error messages.
  - Validates promotion price (>= 0, <= regular price).
  - Validates commission (0 to 100).
  - Renders Edit mode: fetches service by ID, pre-populates fields, displays code badge.
  - Submits create form invoking `saveServiceAction`.
  - Submits edit form invoking `updateServiceAction`.
  - Handles API failure displaying inline error alert.
- **Table Interaction Tests (`components/services/services-table.test.tsx`)**:
  - Verifies Service Code cell is interactive and clicking it triggers the edit dialog.
- **Server Page Tests (`app/services/page.test.tsx`)**:
  - Verifies presence of interactive "Add Service" dialog trigger in header.
- **API Client Tests (`tests/services.test.tsx`)**:
  - Tests `getServiceById`, `createService`, and `updateService` with mock fetch.

---

## 8. Boundaries

- **Always**:
  - Maintain strict TypeScript typing without `any`.
  - Follow shadcn/ui design conventions and Tailwind CSS v4.
  - Validate all inputs on client before submission.
  - Format with Prettier (`pnpm format`) and pass lint (`pnpm lint`).
  - Keep test coverage comprehensive for new and modified components.
- **Ask First**:
  - Adding new dependencies to `package.json`.
  - Modifying backend API routes or database schema.
- **Never**:
  - Call backend API endpoints directly from client components without Server Actions or `fetchApi`.
  - Delete or bypass existing test suites.
  - Hardcode authentication credentials.

---

## 9. Success Criteria & Acceptance Criteria

- [x] `types/service.ts` defines `ServiceFormData` interface.
- [x] `lib/api/serviceApi.ts` implements `getServiceById`, `createService`, and `updateService`.
- [x] `app/actions/serviceActions.ts` implements `saveServiceAction`, `getServiceAction`, and `updateServiceAction`.
- [x] `components/services/service-form-dialog.tsx` provides `ServiceFormDialog` and `AddServiceDialog`.
- [x] Clicking "Add Service" in `/services` header opens the dialog in Create mode.
- [x] Clicking a Service Code in `ServicesTable` opens the dialog in Edit mode pre-populated with service details.
- [x] Validation enforces required `name` (min 2 chars), valid non-negative `price`, `discountPrice` <= `price`, and `commission` (0-100%).
- [x] Successful submission updates/creates the service and refreshes the service table via `router.refresh()`.
- [x] All tests pass cleanly (`pnpm test --run`).
- [x] `pnpm typecheck` and `pnpm lint` pass with 0 errors.

---

## 10. Open Questions & Assumptions

### Assumptions Surfaced
1. **Backend Endpoints**: The backend provides standard RESTful endpoints matching the OpenAPI specification (`scratch/swagger.json`):
   - `GET /api/Services/{id}`
   - `POST /api/Services`
   - `PUT /api/Services/{id}`
2. **Service Code**: Auto-generated by backend upon creation; displayed as a read-only badge in Edit mode.
3. **Commission Format**: Represented as a percentage (e.g. `10` for 10%), bounded between 0 and 100, matching the table display (`${service.commission}%`).
4. **Currency**: All service prices are in Vietnamese Dong (`VND`), formatted with thousand separators during input and display.
5. **Active Status**: Defaults to `true` on creation; editable via a select dropdown (Active / Inactive).
