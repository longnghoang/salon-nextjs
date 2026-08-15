# Specification: Add & Edit Order Feature

## 1. Objective
Provide a unified, responsive dialog interface (`OrderFormDialog`) allowing salon staff and administrators to:
1. **Create New Orders**: Select or search saved customer profiles (or guest checkout), add multiple services and retail products, adjust quantities/discounts, split staff commissions, calculate VAT and grand totals, and submit via `POST /api/Orders`.
2. **Edit Existing Orders**: Click on an Order Code from the orders table to open the pre-populated dialog with existing line items, staff assignments, customer details, and price adjustments, and submit updates via `PUT /api/Orders/{id}`.

---

## 2. Tech Stack & Commands

- **Framework**: Next.js 16.1 (App Router)
- **UI Library**: React 19, Radix UI Primitives, Tailwind CSS v4, Lucide React icons
- **Utilities**: `clsx`, `tailwind-merge`, Vietnamese diacritic text matching (`matchVietnameseText`)
- **Testing**: Vitest, React Testing Library, jsdom
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
│   └── orderActions.ts                # Server actions (saveOrderAction, getOrderAction, updateOrderAction, catalogs)
├── orders/
│   ├── page.tsx                       # Server Component rendering Orders page & pagination
│   └── page.test.tsx                  # Server component tests
components/
├── orders/
│   ├── order-form-dialog.tsx          # Unified dialog for Add/Edit Order operations
│   ├── order-form-dialog.test.tsx     # Comprehensive unit tests for Create and Edit modes
│   ├── orders-table.tsx               # Client component rendering order rows and edit triggers
│   ├── status-badge.tsx               # Colored badge for order status
│   └── order-filter.tsx               # Date & status filter toolbar
lib/
├── api/
│   ├── orderApi.ts                    # Backend API calls (getOrders, getOrderById, createOrder, updateOrder)
│   └── fetchApi.ts                    # Session-authenticated fetch wrapper
types/
└── order.ts                           # TypeScript interfaces (Order, OrderDetail, OrderWithDetails, etc.)
tests/
└── orders.test.tsx                    # Integration and end-to-end component interaction tests
```

---

## 4. Data Models & API Contracts

### Data Interfaces (`types/order.ts`)

```typescript
export enum OrderStatus {
  New = 1,
  InProgress = 2,
  Completed = 3,
  Deleted = 4,
}

export interface OrderDetailEmployee {
  id?: number;
  userId: number;
  employeeName: string;
  orderDetailId?: number;
  commissionPercentage?: number | null;
  commissionAmount?: number | null;
}

export interface OrderDetail {
  id?: number;
  orderId?: number;
  price: number;
  quantity: number;
  discountAmount: number;
  totalAmount: number;
  serviceId?: number | null;
  serviceName?: string | null;
  servicePrice?: number | null;
  serviceDiscountPrice?: number | null;
  productId?: number | null;
  productName?: string | null;
  productPrice?: number | null;
  productDiscountPrice?: number | null;
  orderDetailEmployees?: OrderDetailEmployee[] | null;
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

export interface OrderWithDetails extends Order {
  orderDetails?: OrderDetail[] | null;
  isPayment?: boolean;
  isBanking?: boolean;
  discountAmount?: number | null;
  vat?: number | null;
}
```

### API Endpoints
- `GET /api/Orders/cursor?StartDate=...&EndDate=...`: Returns cursor-paginated list of orders.
- `GET /api/Orders/{id}`: Returns complete `OrderWithDetails` for a single order.
- `POST /api/Orders`: Creates a new order.
- `PUT /api/Orders/{id}`: Updates an existing order.

---

## 5. Component Architecture & UI Workflows

### 5.1 Modes of Operation

`OrderFormDialog` operates in two distinct modes configured via props:

```typescript
export interface OrderFormDialogProps {
  mode?: 'create' | 'edit';
  orderId?: number | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}
```

- **Create Mode (`mode="create"`)**:
  - Default title: `"Create New Order"`
  - Submit button: `"Save"`
  - Starts with an empty line item and zeroed summary fields.
  - Submitting calls `saveOrderAction(payload)`.
  - Accessible via `AddOrderDialog` wrapper component.

- **Edit Mode (`mode="edit"`, with `orderId`)**:
  - Dynamic title: `"Edit Order #<OrderCode>"`
  - Submit button: `"Update Order"`
  - On open, loads existing order via `getOrderAction(orderId)` alongside catalogs.
  - Pre-populates customer selection, line items (preserving existing `id`), assigned employees (preserving existing `id`), discount values, and VAT.
  - Submitting calls `updateOrderAction(orderId, payload)`.

### 5.2 Form Sections & Interactivity

1. **Customer Section**:
   - Toggle between **Saved Profile** and **Guest Checkout**.
   - Search customers by Vietnamese text / phone number with 300ms debounce.
   - Selected customer displayed with remove option.

2. **Order Items Table**:
   - **Item Selector Popover**: Search across Services and Products simultaneously with keyboard navigation (Arrow Up/Down, Enter).
   - **Unit Price**: Automatically populated from catalog price.
   - **Quantity Stepper**: Minimum value of 1.
   - **Item Discount**: Line-level discount in VND subtracted before subtotal calculation.
   - **Staff Commission Assignment**: Multi-select popover to assign staff members per service line; automatically splits total commission percentage evenly across assigned staff (customizable per staff).
   - **Row Actions**: Add row or remove row (preserves at least one row).

3. **Financial Summary & Calculations**:
   - **Subtotal (Tạm tính)**: $\sum (\text{Price} \times \text{Quantity} - \text{Line Discount})$
   - **Order Discount (-) & VAT (+)**: Synchronized percentage vs absolute amount inputs.
   - **Grand Total (Tổng cộng)**: $\max(0, \text{Subtotal} - \text{Order Discount} + \text{VAT})$

4. **Submission Lifecycle**:
   - Validates non-empty item selection and positive quantities.
   - Displays spinner state on the submit button.
   - On success: closes dialog, resets internal state, and calls `router.refresh()` to refresh the server component list.

---

## 6. Testing Strategy & Validation

### Test Suites
- **`components/orders/order-form-dialog.test.tsx`**:
  - Create mode rendering, catalog loading, and submission.
  - Edit mode pre-population, title/button states, payload ID preservation, and error handling.
- **`tests/orders.test.tsx`**:
  - API client methods (`getOrderById`, `updateOrder`).
  - Orders table row interaction (clicking order code badge triggers edit modal).
- **`app/orders/page.test.tsx`**:
  - Server Component rendering, empty state, and API error states.

### Quality Boundaries
- **Always**: Use TypeScript strict types (no `any`); ensure proper accessibility (`aria-label`, keyboard focus); format code with Prettier before committing.
- **Never**: Mutate incoming props directly; lose line item IDs during PUT payload construction.
