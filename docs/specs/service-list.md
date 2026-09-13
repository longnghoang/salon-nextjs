# Specification: Salon Services Management Dashboard

## Objective

Provide a server-rendered, responsive Service Management Dashboard screen (`app/services/page.tsx`) for salon staff and administrators to:
1. **Browse Salon Services**: View all salon service items with Code, Name, Price (VND), Promotion Price (VND), Note / Description, Commission, and Active Status.
2. **Search & Filter**: Search and filter service items by Code or Name via a dedicated search input in the filter toolbar.
3. **Cursor-Based Forward & Backward Pagination**: Navigate seamlessly forward (`after`) and backward (`before`) through services using the backend cursor pagination API (`/api/Services/cursor`), preserving any active search query filters.
4. **Resilient UI States**: Gracefully render empty search states, loading skeletons/states, and backend API error alerts.
5. **App Navigation**: Integrate the Services dashboard into the primary application navigation (sidebar and mobile header menu) using the `Scissors` icon.

---

## Tech Stack & Commands

- **Framework**: Next.js 16.1 (App Router, React Server Components)
- **Language**: TypeScript (strict typing, no `any`)
- **Styling**: Tailwind CSS v4, shadcn/ui (radix-nova style)
- **Icons**: Lucide React (`Scissors`, `Search`, `RotateCcw`, `Plus`, etc.)
- **Localization & Formatting**: `Intl.NumberFormat` (`vi-VN` currency VND)
- **Testing**: Vitest, React Testing Library, `@testing-library/jest-dom`, jsdom
- **Package Manager**: pnpm

### Core Commands
```bash
# Run development server
pnpm dev

# Run type check
pnpm typecheck

# Run test suite
pnpm test --run

# Run linter
pnpm lint

# Format code
pnpm format
```

---

## Project Structure

```
app/
├── services/
│   ├── page.tsx                           # Async Server Component (RSC) fetching & rendering services
│   └── page.test.tsx                      # Unit/Integration tests for ServicesPage RSC
components/
├── salon/
│   ├── salon-sidebar.tsx                  # Primary sidebar navigation (Services link)
│   └── salon-header.tsx                   # Top bar & mobile sheet navigation (Services link)
├── services/
│   ├── services-table.tsx                 # Client component displaying service rows, badges, notes, empty & error states
│   ├── services-table.test.tsx            # Unit tests for ServicesTable
│   ├── service-filter.tsx                 # Client component with search input for service code or name
│   ├── service-filter.test.tsx            # Unit tests for ServiceFilter
│   ├── services-cursor-pagination.tsx     # Client component managing cursor navigation (Next/Prev)
│   └── services-cursor-pagination.test.tsx# Unit tests for ServicesCursorPagination
lib/
├── api/
│   ├── serviceApi.ts                      # Updated API client with getServices(params) calling /api/Services/cursor
│   └── fetchApi.ts                        # Shared authenticated fetch utility
types/
├── service.ts                             # Service data interfaces and cursor query parameter types
└── pagination.ts                          # Shared CursorPaginationInfo & CursorPaginatedResult<T>
docs/
└── specs/
    └── service-list.md                    # Permanent specification documentation (this file)
```

---

## Data Models & API Contracts

### Data Interfaces (`types/service.ts`)

```typescript
import type { CursorPaginatedResult, CursorPaginationInfo } from './pagination';

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

export interface GetServicesParams {
  searchText?: string;
  pageSize?: number;
  before?: string;
  after?: string;
}

export type { CursorPaginationInfo, CursorPaginatedResult };
```

### Backend API Endpoint: `GET /api/Services/cursor`
- **Method**: `GET`
- **Path**: `/api/Services/cursor`
- **Query Parameters**:
  - `SearchText` (string, optional): Search keyword matching service Code or Name.
  - `PageSize` (number, optional, default: `20`): Maximum number of items returned per page.
  - `Before` (string, optional): Opaque cursor token for backward pagination (previous page).
  - `After` (string, optional): Opaque cursor token for forward pagination (next page).
- **Response Format (`CursorPaginatedResult<Service>`)**:
  ```json
  {
    "items": [
      {
        "id": 1,
        "code": "SRV-001",
        "name": "Haircut & Styling",
        "description": "Premium haircut including wash and blow-dry styling",
        "price": 200000,
        "discountPrice": 180000,
        "commission": 15,
        "isActive": true
      }
    ],
    "paging": {
      "before": "opaque_cursor_token_before",
      "after": "opaque_cursor_token_after",
      "hasNext": true,
      "hasPrevious": false
    }
  }
  ```

---

## Component Architecture & UI Specifications

### 1. Server Component (`app/services/page.tsx`)
- An async React Server Component (RSC) receiving Next.js searchParams (`searchText`, `before`, `after`).
- Normalizes search parameters and invokes `getServices({ searchText, pageSize: 20, before, after })`.
- Handles API failures gracefully with user-friendly error banners.
- Layout:
  - Header:
    - Left: Title "Services" and subtitle "Manage salon service catalog, pricing, and promotions."
    - Right: Placeholder "Add Service" button (renders with `Plus` icon, styled with primary action button styling, with no modal/action attached at this stage).
  - Filter bar: `<ServiceFilter />`
  - Table & Pagination container: `<ServicesTable services={...} errorMsg={...} />` and `<ServicesCursorPagination />`.

### 2. Search & Filter Bar (`components/services/service-filter.tsx`)
- Client component with a search input field and action buttons:
  - Text input: `placeholder="Search by name or code..."`
  - Search trigger on "Enter" key press or clicking "Apply".
  - "Apply" button updates URL search parameter `?searchText=...` and resets pagination tokens (`before`, `after`).
  - "Clear" button resets input field, removes `searchText` from URL, and resets pagination tokens.
  - Synchronizes internal state with browser URL search params for back/forward navigation.

### 3. Services Table (`components/services/services-table.tsx`)
- Table columns:
  1. **Code**: Bold badge/cell with service code (e.g. `SRV-001`).
  2. **Name**: Service name.
  3. **Price**: Formatted regular price in VND (e.g. `200.000 ₫`).
  4. **Promotion Price**: Formatted discount price in VND (e.g. `180.000 ₫`) or `"-"` if null.
  5. **Commission**: Displayed as percentage (e.g. `15%`) or amount if present, or `"-"`.
  6. **Status**: Badge indicating `Active` (green) or `Inactive` (neutral/muted).
  7. **Note**: Service description/note (`description`) or `"-"` if empty, with text truncation and tooltip/title for longer notes.
- Empty State: Displays friendly message ("No services found.") when query yields 0 results.
- Error State: Displays alert message when API fetch fails.

### 4. Cursor Pagination (`components/services/services-cursor-pagination.tsx`)
- Client component displaying item counts and Previous / Next navigation controls:
  - "Showing X services".
  - "Previous" button linked to `?before=<token>` with existing `searchText` preserved; disabled (`pointer-events-none opacity-50`) when `hasPrevious === false`.
  - "Next" button linked to `?after=<token>` with existing `searchText` preserved; disabled when `hasNext === false`.
  - Hidden when total items is 0 and no pagination cursor exists.

### 5. Navigation Links (`salon-sidebar.tsx` & `salon-header.tsx`)
- Added `{ href: '/services', label: 'Services', icon: Scissors }` to the primary navigation links array.
- Highlight active state when pathname starts with `/services`.

---

## Code Style & Conventions

```typescript
// Example: lib/api/serviceApi.ts cursor implementation
import { fetchApi } from './fetchApi';
import type { CursorPaginatedResult } from '@/types/pagination';
import type { GetServicesParams, Service } from '@/types/service';

export async function getServices(
  params?: GetServicesParams
): Promise<CursorPaginatedResult<Service>> {
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
    ? `/api/Services/cursor?${queryString}`
    : '/api/Services/cursor';

  const response = await fetchApi<CursorPaginatedResult<Service>>(endpoint);

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

## Testing Strategy

- **Test Runner**: Vitest (`pnpm test --run`)
- **Unit & Component Tests**:
  1. `tests/services.test.tsx`:
     - Verifies `getServices` correctly constructs query parameters (`SearchText`, `PageSize`, `Before`, `After`) and handles empty responses.
  2. `components/services/services-table.test.tsx`:
     - Verifies column rendering (Code, Name, Price, Promotion Price, Note, Status, Commission).
     - Verifies price formatting in VND currency.
     - Verifies empty state when no services are present.
     - Verifies error message rendering.
  3. `components/services/service-filter.test.tsx`:
     - Verifies input change, Apply triggering URL updates, and Clear button resetting filters.
  4. `components/services/services-cursor-pagination.test.tsx`:
     - Verifies Next/Previous button enablement and correct cursor URL generation preserving search parameters.
  5. `app/services/page.test.tsx`:
     - Server Component test verifying data fetching with searchParams and proper component tree rendering.
- **Coverage Expectation**: 100% test coverage on all newly introduced components and API wrappers.

---

## Boundaries

- **Always do**:
  - Use strict TypeScript typing without `any`.
  - Use Next.js Server Components for page data fetching.
  - Use `cn()` from `@/lib/utils` for conditional class names.
  - Format currency using `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
  - Preserve search query parameters when paging forward or backward.
  - Run `pnpm typecheck`, `pnpm lint`, and `pnpm test --run` to ensure pristine quality.
- **Ask first**:
  - Introducing new third-party dependencies or UI component libraries.
  - Changing existing shared pagination interfaces in `types/pagination.ts`.
- **Never do**:
  - Hardcode API endpoints without using `fetchApi`.
  - Mutate server states or cause client-side hydration mismatches.
  - Delete or bypass existing test suites.

---

## Success Criteria & Acceptance Criteria

- [x] Route `/services` exists and renders the Service Management Dashboard.
- [x] Header includes "Services" title, description, and an "Add Service" button placeholder with no action attached.
- [x] Table displays salon services with columns: Code, Name, Price (VND), Promotion Price (VND), Commission (%), Status badge, and Note (`description`).
- [x] Default page size is set to `20` items per request.
- [x] When Promotion Price is present, it is formatted in VND alongside the regular price (or `"-"` when null).
- [x] Commission is formatted and displayed as a normal column (or `"-"` when null).
- [x] Note / Description is displayed cleanly (with fallback `"-"` when null).
- [x] Search input allows filtering service items by Code or Name, and Enter / Apply triggers the search.
- [x] Clear button resets the search input and removes the search query from the URL.
- [x] Forward (`After`) and backward (`Before`) cursor pagination functions correctly using `/api/Services/cursor`.
- [x] Pagination controls preserve active search filters when navigating between pages.
- [x] Empty state and API error states are handled with clear UI messages.
- [x] Navigation sidebar and mobile sheet menu include the Services link with `Scissors` icon.
- [x] All unit tests pass (`pnpm test --run`) and TypeScript passes cleanly (`pnpm typecheck`).

---

## Open Questions & Assumptions

### Assumptions Surfaced & Confirmed
1. **API Endpoint**: The backend provides `GET /api/Services/cursor` following the exact pattern of `/api/Products/cursor` and `/api/Orders/cursor`, accepting query parameters `SearchText`, `PageSize` (default: 20), `Before`, and `After`, and returning `{ items: Service[], paging: CursorPaginationInfo }`.
2. **Search Matching**: The backend parameter `SearchText` performs case-insensitive substring matching against both service Code and Name.
3. **Currency & Locale**: All service prices and promotion prices are in Vietnamese Dong (`VND`), matching the existing application convention.
4. **Scope Decisions (Confirmed by User)**:
   - **Page Size**: `20` items per page.
   - **Commission**: Displayed normally as a dedicated column in the table.
   - **Action Buttons**: Render one "Add Service" button in the header with no action at this stage (modal/form to be implemented in a subsequent phase).
