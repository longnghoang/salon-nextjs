'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Plus,
  Minus,
  Trash2,
  Search,
  X,
  Check,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { cn, matchVietnameseText } from '@/lib/utils';
import {
  saveOrderAction,
  getOrderAction,
  updateOrderAction,
  getProductsAction,
  getServicesAction,
  getEmployeesAction,
  searchCustomersAction,
} from '@/app/actions/orderActions';
import type { Product } from '@/types/product';
import type { Service } from '@/types/service';
import type { Employee } from '@/types/employee';
import type { Customer } from '@/types/customer';
import type { OrderDetail, OrderDetailEmployee } from '@/types/order';

interface UIOrderDetail {
  id?: number;
  localId: string;
  type: 'product' | 'service' | null;
  selectedItem: Product | Service | null;
  price: number;
  quantity: number;
  discountAmount: number;
  assignedStaff: OrderDetailEmployee[];
}

interface ItemSelectorPopoverContentProps {
  services: Service[];
  products: Product[];
  onSelect: (item: Product | Service, type: 'product' | 'service') => void;
  formatVND: (value: number) => string;
}

function ItemSelectorPopoverContent({
  services,
  products,
  onSelect,
  formatVND,
}: ItemSelectorPopoverContentProps) {
  const [searchText, setSearchText] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Auto focus input on popover mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const filteredServices = React.useMemo(() => {
    const q = searchText.trim();
    return services.filter(
      (s) => matchVietnameseText(s.name, q) || matchVietnameseText(s.code, q)
    );
  }, [services, searchText]);

  const filteredProducts = React.useMemo(() => {
    const q = searchText.trim();
    return products.filter(
      (p) => matchVietnameseText(p.name, q) || matchVietnameseText(p.code, q)
    );
  }, [products, searchText]);

  // Combined list for keyboard navigation
  const combinedItems = React.useMemo(() => {
    const items: Array<{
      item: Product | Service;
      type: 'product' | 'service';
    }> = [];

    filteredServices.forEach((s) => items.push({ item: s, type: 'service' }));
    filteredProducts.forEach((p) => items.push({ item: p, type: 'product' }));

    return items;
  }, [filteredServices, filteredProducts]);

  // Safe highlighted index bounded by available items length
  const safeHighlightedIndex =
    highlightedIndex < combinedItems.length ? highlightedIndex : 0;

  // Scroll active item into view when safeHighlightedIndex changes
  React.useEffect(() => {
    if (listRef.current && combinedItems.length > 0) {
      const activeEl = listRef.current.querySelector<HTMLElement>(
        `[data-index="${safeHighlightedIndex}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [safeHighlightedIndex, combinedItems.length]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (combinedItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % combinedItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(
        (prev) => (prev - 1 + combinedItems.length) % combinedItems.length
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = combinedItems[safeHighlightedIndex];
      if (current) {
        onSelect(current.item, current.type);
      }
    }
  };

  let globalCounter = 0;

  return (
    <PopoverContent className="flex max-h-80 w-80 flex-col p-2" align="start">
      <div className="mb-1.5 flex shrink-0 items-center border-b border-border px-2 pb-1.5">
        <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        <input
          ref={inputRef}
          placeholder="Search product or service..."
          value={searchText}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="flex h-7 w-full rounded-md bg-transparent text-xs outline-hidden placeholder:text-muted-foreground"
        />
        {searchText && (
          <button
            type="button"
            onClick={() => {
              setSearchText('');
              setHighlightedIndex(0);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <div
        ref={listRef}
        className="min-h-0 flex-1 touch-pan-y space-y-3 overflow-y-auto overscroll-contain p-1"
        onWheel={(e) => e.stopPropagation()}
      >
        {filteredServices.length > 0 && (
          <div>
            <div className="border-b border-border/40 px-2 pb-1 text-[10px] font-bold text-muted-foreground uppercase">
              Services
            </div>
            <div className="mt-1 space-y-0.5">
              {filteredServices.map((s) => {
                const index = globalCounter++;
                const isHighlighted = safeHighlightedIndex === index;
                return (
                  <button
                    key={s.id}
                    data-index={index}
                    type="button"
                    onClick={() => onSelect(s, 'service')}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors',
                      isHighlighted
                        ? 'bg-accent font-semibold text-accent-foreground ring-1 ring-primary/30'
                        : 'hover:bg-muted'
                    )}
                  >
                    <span className="mr-2 truncate font-medium">{s.name}</span>
                    <span className="text-muted-foreground">
                      {formatVND(s.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {filteredProducts.length > 0 && (
          <div>
            <div className="border-b border-border/40 px-2 pb-1 text-[10px] font-bold text-muted-foreground uppercase">
              Products
            </div>
            <div className="mt-1 space-y-0.5">
              {filteredProducts.map((p) => {
                const index = globalCounter++;
                const isHighlighted = safeHighlightedIndex === index;
                return (
                  <button
                    key={p.id}
                    data-index={index}
                    type="button"
                    onClick={() => onSelect(p, 'product')}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors',
                      isHighlighted
                        ? 'bg-accent font-semibold text-accent-foreground ring-1 ring-primary/30'
                        : 'hover:bg-muted'
                    )}
                  >
                    <span className="mr-2 truncate font-medium">{p.name}</span>
                    <span className="text-muted-foreground">
                      {formatVND(p.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {combinedItems.length === 0 && (
          <div className="py-4 text-center text-xs text-muted-foreground">
            No products or services found.
          </div>
        )}
      </div>
    </PopoverContent>
  );
}

interface CustomerSelectorPopoverContentProps {
  customerSearchText: string;
  onSearchChange: (text: string) => void;
  customersList: Customer[];
  isSearchingCustomers: boolean;
  onSelectCustomer: (customer: Customer) => void;
}

function CustomerSelectorPopoverContent({
  customerSearchText,
  onSearchChange,
  customersList,
  isSearchingCustomers,
  onSelectCustomer,
}: CustomerSelectorPopoverContentProps) {
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Auto focus search input when popover mounts
  React.useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const safeHighlightedIndex =
    highlightedIndex < customersList.length ? highlightedIndex : 0;

  // Scroll active customer into view
  React.useEffect(() => {
    if (listRef.current && customersList.length > 0) {
      const activeEl = listRef.current.querySelector<HTMLElement>(
        `[data-index="${safeHighlightedIndex}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [safeHighlightedIndex, customersList.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (customersList.length === 0 || isSearchingCustomers) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % customersList.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(
        (prev) => (prev - 1 + customersList.length) % customersList.length
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = customersList[safeHighlightedIndex];
      if (selected) {
        onSelectCustomer(selected);
      }
    }
  };

  return (
    <PopoverContent className="flex max-h-80 w-80 flex-col p-2" align="start">
      <div className="flex shrink-0 items-center border-b border-border px-3 pb-2">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          ref={inputRef}
          placeholder="Type name or phone..."
          value={customerSearchText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex h-8 w-full rounded-md bg-transparent text-sm outline-hidden placeholder:text-muted-foreground"
        />
        {customerSearchText && (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              setHighlightedIndex(0);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div
        ref={listRef}
        className="min-h-0 flex-1 touch-pan-y space-y-1 overflow-y-auto overscroll-contain pt-2"
        onWheel={(e) => e.stopPropagation()}
      >
        {isSearchingCustomers ? (
          <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
            <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Searching...
          </div>
        ) : customersList.length > 0 ? (
          customersList.map((cust, index) => {
            const isHighlighted = safeHighlightedIndex === index;
            return (
              <button
                key={cust.id}
                data-index={index}
                type="button"
                onClick={() => onSelectCustomer(cust)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  'flex w-full flex-col rounded-md px-3 py-2 text-left text-sm transition-colors duration-150',
                  isHighlighted
                    ? 'bg-accent text-accent-foreground ring-1 ring-primary/30'
                    : 'hover:bg-muted'
                )}
              >
                <span className="font-medium">{cust.fullName}</span>
                <span className="text-xs text-muted-foreground">
                  {cust.mobile}
                </span>
              </button>
            );
          })
        ) : (
          <div className="py-4 text-center text-xs text-muted-foreground">
            {customerSearchText.trim()
              ? 'No customers found.'
              : 'Type name or phone number to search.'}
          </div>
        )}
      </div>
    </PopoverContent>
  );
}

export interface OrderFormDialogProps {
  mode?: 'create' | 'edit';
  orderId?: number | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function OrderFormDialog({
  mode = 'create',
  orderId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: OrderFormDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setIsOpen = React.useCallback(
    (open: boolean) => {
      if (isControlled) {
        controlledOnOpenChange?.(open);
      } else {
        setInternalOpen(open);
      }
    },
    [isControlled, controlledOnOpenChange]
  );

  // Catalogs loaded on open
  const [products, setProducts] = React.useState<Product[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);

  // Existing order code when editing
  const [existingOrderCode, setExistingOrderCode] = React.useState<
    string | null
  >(null);

  // Customer Information (Section 1)
  const [saveCustomerInfo, setSaveCustomerInfo] = React.useState(false);
  const [customerSearchText, setCustomerSearchText] = React.useState('');
  const [customersList, setCustomersList] = React.useState<Customer[]>([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    React.useState<Customer | null>(null);

  // Order Details (Section 2)
  const [orderDetails, setOrderDetails] = React.useState<UIOrderDetail[]>([
    {
      localId: 'default-1',
      type: null,
      selectedItem: null,
      price: 0,
      quantity: 1,
      discountAmount: 0,
      assignedStaff: [],
    },
  ]);

  // Global Footer calculations
  const [orderDiscountValue, setOrderDiscountValue] = React.useState(0);
  const [vatPercent, setVatPercent] = React.useState(0);
  const [vatValue, setVatValue] = React.useState(0);

  // Submission & Loading State
  const [isLoadingOrder, setIsLoadingOrder] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  // Search filter state for staff popovers
  const [staffSearchTexts, setStaffSearchTexts] = React.useState<
    Record<string, string>
  >({});

  // Reset form to defaults
  const resetForm = React.useCallback(() => {
    setExistingOrderCode(null);
    setSaveCustomerInfo(false);
    setCustomerSearchText('');
    setCustomersList([]);
    setSelectedCustomer(null);
    setStaffSearchTexts({});
    setOrderDetails([
      {
        localId: 'default-1',
        type: null,
        selectedItem: null,
        price: 0,
        quantity: 1,
        discountAmount: 0,
        assignedStaff: [],
      },
    ]);
    setOrderDiscountValue(0);
    setVatPercent(0);
    setVatValue(0);
    setErrorMsg('');
  }, []);

  // Load catalogs and order details (if edit mode) once modal is opened
  React.useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function loadData() {
      if (mode === 'edit' && orderId) {
        setIsLoadingOrder(true);
      }
      try {
        const [prodList, servList, empList] = await Promise.all([
          getProductsAction(),
          getServicesAction(),
          getEmployeesAction(),
        ]);

        if (!isMounted) return;
        const activeProds = prodList.filter((p) => p.isActive !== false);
        const activeServs = servList.filter((s) => s.isActive !== false);
        setProducts(activeProds);
        setServices(activeServs);
        setEmployees(empList);

        if (mode === 'edit' && orderId) {
          const orderData = await getOrderAction(orderId);
          if (!isMounted) return;

          setExistingOrderCode(orderData.code || null);

          // Populate Customer
          if (orderData.customerId || orderData.customerName) {
            setSaveCustomerInfo(true);
            setSelectedCustomer({
              id: orderData.customerId || 0,
              fullName: orderData.customerName || '',
              mobile: orderData.customerMobile || '',
              email: orderData.customerEmail || '',
            } as Customer);
          } else {
            setSaveCustomerInfo(false);
            setSelectedCustomer(null);
          }

          // Populate Order Details
          if (orderData.orderDetails && orderData.orderDetails.length > 0) {
            const mappedUIItems: UIOrderDetail[] = orderData.orderDetails.map(
              (detail, idx) => {
                const isService = Boolean(detail.serviceId);
                let selectedItem: Product | Service | null = null;

                if (isService) {
                  selectedItem =
                    activeServs.find((s) => s.id === detail.serviceId) ||
                    ({
                      id: detail.serviceId!,
                      name: detail.serviceName || 'Service',
                      price: detail.servicePrice || detail.price,
                      code: '',
                    } as Service);
                } else if (detail.productId) {
                  selectedItem =
                    activeProds.find((p) => p.id === detail.productId) ||
                    ({
                      id: detail.productId!,
                      name: detail.productName || 'Product',
                      price: detail.productPrice || detail.price,
                      code: '',
                    } as Product);
                }

                return {
                  id: detail.id,
                  localId: detail.id
                    ? `detail-${detail.id}`
                    : `edit-item-${idx}`,
                  type: isService
                    ? 'service'
                    : detail.productId
                      ? 'product'
                      : null,
                  selectedItem,
                  price: detail.price,
                  quantity: detail.quantity,
                  discountAmount: detail.discountAmount || 0,
                  assignedStaff: (detail.orderDetailEmployees || []).map(
                    (emp) => ({
                      id: emp.id,
                      userId: emp.userId,
                      employeeName: emp.employeeName,
                      commissionPercentage: emp.commissionPercentage || 0,
                      commissionAmount: emp.commissionAmount || 0,
                    })
                  ),
                };
              }
            );
            setOrderDetails(mappedUIItems);
          }

          setOrderDiscountValue(orderData.discountAmount || 0);
          setVatValue(orderData.vat || 0);
        }
      } catch (err) {
        console.error('Failed to load order form data:', err);
        if (isMounted) {
          setErrorMsg('Failed to load data. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingOrder(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, mode, orderId]);

  // Debounced search for customers
  React.useEffect(() => {
    if (!saveCustomerInfo || !customerSearchText.trim()) {
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingCustomers(true);
      try {
        const results = await searchCustomersAction(customerSearchText);
        setCustomersList(results);
      } catch (err) {
        console.error('Customer search failed:', err);
      } finally {
        setIsSearchingCustomers(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [customerSearchText, saveCustomerInfo]);

  // Helper to format currency
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Stepper handlers
  const handleQuantityChange = (localId: string, value: number) => {
    if (value <= 0 || isNaN(value)) return;
    setOrderDetails((prev) =>
      prev.map((item) =>
        item.localId === localId ? { ...item, quantity: value } : item
      )
    );
  };

  // Discount Item input handler
  const handleItemDiscountChange = (localId: string, val: number) => {
    if (val < 0 || isNaN(val)) return;
    setOrderDetails((prev) =>
      prev.map((item) =>
        item.localId === localId ? { ...item, discountAmount: val } : item
      )
    );
  };

  // Calculate subtotals
  const getLineSubtotal = (item: UIOrderDetail) => {
    const total = item.price * item.quantity - item.discountAmount;
    return Math.max(0, total);
  };

  const subtotal = orderDetails.reduce(
    (sum, item) => sum + getLineSubtotal(item),
    0
  );

  // Order Discount (Value in VND)
  const handleGlobalDiscountValueChange = (val: number) => {
    if (val < 0 || isNaN(val)) return;
    setOrderDiscountValue(val);
    if (vatPercent > 0) {
      const taxable = Math.max(0, subtotal - val);
      setVatValue(Math.round(taxable * (vatPercent / 100)));
    }
  };

  // Sync VAT (Percentage vs Value)
  const handleVatPercentChange = (pct: number) => {
    if (pct < 0 || isNaN(pct)) return;
    setVatPercent(pct);
    const taxable = Math.max(0, subtotal - orderDiscountValue);
    setVatValue(Math.round(taxable * (pct / 100)));
  };

  const handleVatValueChange = (val: number) => {
    if (val < 0 || isNaN(val)) return;
    setVatValue(val);
    const taxable = Math.max(0, subtotal - orderDiscountValue);
    setVatPercent(
      taxable > 0 ? parseFloat(((val / taxable) * 100).toFixed(2)) : 0
    );
  };

  // Recalculate VAT if subtotal or discount changes
  React.useEffect(() => {
    const taxable = Math.max(0, subtotal - orderDiscountValue);
    const calculatedVat = Math.round(taxable * (vatPercent / 100));

    const timer = setTimeout(() => {
      setVatValue(calculatedVat);
    }, 0);

    return () => clearTimeout(timer);
  }, [subtotal, orderDiscountValue, vatPercent]);

  const grandTotal = Math.max(0, subtotal - orderDiscountValue + vatValue);

  // Add line item row
  const addLineItem = () => {
    setOrderDetails((prev) => [
      ...prev,
      {
        localId: `item-${Date.now()}-${Math.random()}`,
        type: null,
        selectedItem: null,
        price: 0,
        quantity: 1,
        discountAmount: 0,
        assignedStaff: [],
      },
    ]);
  };

  // Remove line item row
  const removeLineItem = (localId: string) => {
    if (orderDetails.length === 1) {
      // Keep at least one empty row
      setOrderDetails([
        {
          localId: 'default-1',
          type: null,
          selectedItem: null,
          price: 0,
          quantity: 1,
          discountAmount: 0,
          assignedStaff: [],
        },
      ]);
    } else {
      setOrderDetails((prev) =>
        prev.filter((item) => item.localId !== localId)
      );
    }
  };

  // Selection handler for product or service
  const handleItemSelect = (
    localId: string,
    item: Product | Service,
    type: 'product' | 'service'
  ) => {
    setOrderDetails((prev) =>
      prev.map((row) => {
        if (row.localId !== localId) return row;
        return {
          ...row,
          type,
          selectedItem: item,
          price: item.price,
          assignedStaff: [],
        };
      })
    );
  };

  // Clear selected item
  const handleClearItem = (localId: string) => {
    setOrderDetails((prev) =>
      prev.map((row) =>
        row.localId === localId
          ? {
              ...row,
              type: null,
              selectedItem: null,
              price: 0,
              assignedStaff: [],
            }
          : row
      )
    );
  };

  // Staff Split Commission handlers
  const handleToggleStaff = (rowLocalId: string, emp: Employee) => {
    setOrderDetails((prev) =>
      prev.map((row) => {
        if (row.localId !== rowLocalId) return row;
        const isAssigned = row.assignedStaff.some((s) => s.userId === emp.id);
        let nextStaffList: OrderDetailEmployee[] = [];

        if (isAssigned) {
          nextStaffList = row.assignedStaff.filter((s) => s.userId !== emp.id);
        } else {
          nextStaffList = [
            ...row.assignedStaff,
            {
              userId: emp.id,
              employeeName: emp.name,
              commissionPercentage: 0,
              commissionAmount: 0,
            },
          ];
        }

        // Re-split commission equally by default
        const N = nextStaffList.length;
        const defaultTotalCommissionPercent =
          row.type === 'service' && row.selectedItem
            ? (row.selectedItem as Service).commission || 10
            : 10;

        const splitPct =
          N > 0
            ? parseFloat((defaultTotalCommissionPercent / N).toFixed(2))
            : 0;
        const lineTotal = getLineSubtotal(row);

        nextStaffList = nextStaffList.map((s) => {
          const sPct = splitPct;
          const sAmt = Math.round(lineTotal * (sPct / 100));
          return {
            ...s,
            commissionPercentage: sPct,
            commissionAmount: sAmt,
          };
        });

        return {
          ...row,
          assignedStaff: nextStaffList,
        };
      })
    );
  };

  const handleStaffCommissionChange = (
    rowLocalId: string,
    userId: number,
    pct: number
  ) => {
    if (pct < 0 || pct > 100 || isNaN(pct)) return;
    setOrderDetails((prev) =>
      prev.map((row) => {
        if (row.localId !== rowLocalId) return row;
        const lineTotal = getLineSubtotal(row);
        const nextStaffList = row.assignedStaff.map((s) => {
          if (s.userId !== userId) return s;
          return {
            ...s,
            commissionPercentage: pct,
            commissionAmount: Math.round(lineTotal * (pct / 100)),
          };
        });
        return {
          ...row,
          assignedStaff: nextStaffList,
        };
      })
    );
  };

  const handleRemoveStaff = (rowLocalId: string, userId: number) => {
    setOrderDetails((prev) =>
      prev.map((row) => {
        if (row.localId !== rowLocalId) return row;
        const nextStaffList = row.assignedStaff.filter(
          (s) => s.userId !== userId
        );
        const N = nextStaffList.length;
        const defaultTotalCommissionPercent =
          row.type === 'service' && row.selectedItem
            ? (row.selectedItem as Service).commission || 10
            : 10;

        const splitPct =
          N > 0
            ? parseFloat((defaultTotalCommissionPercent / N).toFixed(2))
            : 0;
        const lineTotal = getLineSubtotal(row);

        const updatedStaffList = nextStaffList.map((s) => ({
          ...s,
          commissionPercentage: splitPct,
          commissionAmount: Math.round(lineTotal * (splitPct / 100)),
        }));

        return {
          ...row,
          assignedStaff: updatedStaffList,
        };
      })
    );
  };

  // Submit form
  const handleSaveOrder = async () => {
    setErrorMsg('');

    // Validations
    if (saveCustomerInfo && !selectedCustomer) {
      setErrorMsg(
        'Please select a saved customer or turn off saved customer toggle.'
      );
      return;
    }

    const hasEmptyRow = orderDetails.some((row) => !row.selectedItem);
    if (hasEmptyRow) {
      setErrorMsg('Please select a product or service for all line items.');
      return;
    }

    const hasInvalidQty = orderDetails.some((row) => row.quantity <= 0);
    if (hasInvalidQty) {
      setErrorMsg('Quantity must be greater than 0.');
      return;
    }

    setIsSaving(true);
    try {
      // Map frontend details to API OrderDetailModel
      const mappedDetails: OrderDetail[] = orderDetails.map((row) => {
        const lineSubtotal = getLineSubtotal(row);
        const mappedRow: OrderDetail = {
          ...(row.id ? { id: row.id } : {}),
          price: row.price,
          quantity: row.quantity,
          discountAmount: row.discountAmount,
          totalAmount: lineSubtotal,
          serviceId:
            row.type === 'service' ? row.selectedItem?.id || null : null,
          serviceName:
            row.type === 'service' ? row.selectedItem?.name || null : null,
          servicePrice:
            row.type === 'service' ? row.selectedItem?.price || null : null,
          serviceDiscountPrice:
            row.type === 'service'
              ? (row.selectedItem as Service).discountPrice || null
              : null,
          productId:
            row.type === 'product' ? row.selectedItem?.id || null : null,
          productName:
            row.type === 'product' ? row.selectedItem?.name || null : null,
          productPrice:
            row.type === 'product' ? row.selectedItem?.price || null : null,
          productDiscountPrice:
            row.type === 'product'
              ? (row.selectedItem as Product).discountPrice || null
              : null,
          orderDetailEmployees: row.assignedStaff.map((staff) => ({
            ...(staff.id ? { id: staff.id } : {}),
            userId: staff.userId,
            employeeName: staff.employeeName,
            commissionPercentage: staff.commissionPercentage,
            commissionAmount: Math.round(
              lineSubtotal * ((staff.commissionPercentage || 0) / 100)
            ),
          })),
        };
        return mappedRow;
      });

      // Map global structure to backend OrderModel
      const payload = {
        orderDate: new Date().toISOString(),
        customerId:
          saveCustomerInfo && selectedCustomer ? selectedCustomer.id : null,
        customerName:
          saveCustomerInfo && selectedCustomer
            ? selectedCustomer.fullName
            : null,
        customerMobile:
          saveCustomerInfo && selectedCustomer ? selectedCustomer.mobile : null,
        customerEmail:
          saveCustomerInfo && selectedCustomer ? selectedCustomer.email : null,
        discountAmount: orderDiscountValue,
        vat: vatValue,
        amount: grandTotal,
        paymentAmount: 0,
        remainingAmount: grandTotal,
        status: 1, // Status: New
        isPayment: false,
        isBanking: false,
        orderDetails: mappedDetails,
      };

      if (mode === 'edit' && orderId) {
        await updateOrderAction(orderId, payload);
      } else {
        await saveOrderAction(payload);
      }

      setIsOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to save order. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const defaultTrigger = (
    <Button className="font-sans font-medium shadow-sm transition-transform duration-200 hover:scale-102 active:scale-98">
      <Plus className="mr-1 h-4 w-4" /> Add New
    </Button>
  );

  const dialogTitle =
    mode === 'edit'
      ? `Edit Order ${existingOrderCode ? `#${existingOrderCode}` : ''}`.trim()
      : 'Create New Order';

  const submitBtnText = mode === 'edit' ? 'Update Order' : 'Save';

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      {trigger !== null && (
        <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      )}

      <DialogContent
        className="max-w-4xl p-6 md:p-8"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="font-heading text-2xl tracking-tight text-foreground">
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>

        {isLoadingOrder ? (
          <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
            <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" />
            Loading order details...
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="animate-in rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive fade-in slide-in-from-top-1">
                {errorMsg}
              </div>
            )}

            <div className="space-y-6 py-4">
              {/* Section 1: Customer Information */}
              <div className="space-y-4 rounded-lg border border-border bg-muted/5 p-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold tracking-wide text-foreground uppercase">
                    Customer Information
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      Saved Profile
                    </span>
                    <input
                      type="checkbox"
                      checked={saveCustomerInfo}
                      onChange={(e) => {
                        setSaveCustomerInfo(e.target.checked);
                        setSelectedCustomer(null);
                        setCustomerSearchText('');
                      }}
                      className="h-4 w-8 cursor-pointer rounded-full border border-border bg-muted accent-primary transition-colors duration-200 checked:bg-primary"
                    />
                  </div>
                </div>

                {saveCustomerInfo ? (
                  <div className="space-y-3">
                    {selectedCustomer ? (
                      <div className="flex animate-in items-center justify-between rounded-md border border-primary/20 bg-primary/5 p-3 zoom-in-95">
                        <div>
                          <p className="font-medium text-foreground">
                            {selectedCustomer.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedCustomer.mobile}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setSelectedCustomer(null)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between font-normal text-muted-foreground"
                          >
                            <span>Search customer by name or phone...</span>
                            <Search className="h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <CustomerSelectorPopoverContent
                          customerSearchText={customerSearchText}
                          onSearchChange={(val) => {
                            setCustomerSearchText(val);
                            if (!val.trim()) {
                              setCustomersList([]);
                            }
                          }}
                          customersList={customersList}
                          isSearchingCustomers={isSearchingCustomers}
                          onSelectCustomer={(cust) => {
                            setSelectedCustomer(cust);
                            setCustomerSearchText('');
                          }}
                        />
                      </Popover>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Guest Checkout mode
                  </p>
                )}
              </div>

              {/* Section 2: Order Information */}
              <div className="space-y-4">
                <label className="text-sm font-semibold tracking-wide text-foreground uppercase">
                  Order Items
                </label>

                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="border-b border-border bg-muted/50 font-medium text-muted-foreground">
                      <tr>
                        <th className="p-3">Product / Service</th>
                        <th className="w-28 p-3">Unit Price</th>
                        <th className="w-32 p-3">Qty</th>
                        <th className="w-32 p-3">Discount</th>
                        <th className="w-28 p-3">Subtotal</th>
                        <th className="w-40 p-3">Staff Assign</th>
                        <th className="w-10 p-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orderDetails.map((row) => {
                        const staffQuery = (
                          staffSearchTexts[row.localId] || ''
                        ).trim();
                        const filteredEmployees = employees.filter(
                          (emp) =>
                            matchVietnameseText(emp.name, staffQuery) ||
                            matchVietnameseText(emp.userName, staffQuery) ||
                            matchVietnameseText(emp.email, staffQuery)
                        );

                        return (
                          <tr
                            key={row.localId}
                            className="transition-colors duration-150 hover:bg-muted/10"
                          >
                            {/* Product / Service Dropdown Selection */}
                            <td className="p-3">
                              {row.selectedItem ? (
                                <div className="flex animate-in items-center justify-between rounded-md border border-secondary bg-secondary/30 p-1.5 px-2.5 text-xs font-medium zoom-in-95">
                                  <span className="max-w-[200px] truncate">
                                    <span className="mr-1 text-[10px] text-muted-foreground uppercase">
                                      [{row.type}]
                                    </span>
                                    {row.selectedItem.name}
                                  </span>
                                  <button
                                    onClick={() => handleClearItem(row.localId)}
                                    className="ml-2 text-muted-foreground hover:text-foreground"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="h-9 w-full justify-between text-xs font-normal text-muted-foreground"
                                    >
                                      <span>Select item...</span>
                                      <Search className="h-3.5 w-3.5 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <ItemSelectorPopoverContent
                                    services={services}
                                    products={products}
                                    onSelect={(item, type) =>
                                      handleItemSelect(row.localId, item, type)
                                    }
                                    formatVND={formatVND}
                                  />
                                </Popover>
                              )}
                            </td>

                            {/* Unit Price */}
                            <td className="p-3 text-xs font-medium text-foreground">
                              {formatVND(row.price)}
                            </td>

                            {/* Quantity Stepper */}
                            <td className="p-3">
                              <div className="flex w-24 items-center rounded-md border border-border">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuantityChange(
                                      row.localId,
                                      row.quantity - 1
                                    )
                                  }
                                  className="px-2 py-1 text-muted-foreground hover:bg-muted"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <input
                                  type="number"
                                  value={row.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      row.localId,
                                      parseInt(e.target.value, 10)
                                    )
                                  }
                                  className="w-full border-0 bg-transparent p-0 text-center text-xs font-medium outline-hidden"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuantityChange(
                                      row.localId,
                                      row.quantity + 1
                                    )
                                  }
                                  className="px-2 py-1 text-muted-foreground hover:bg-muted"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </td>

                            {/* Discount Item Input */}
                            <td className="p-3">
                              <Input
                                type="number"
                                value={row.discountAmount || ''}
                                onChange={(e) =>
                                  handleItemDiscountChange(
                                    row.localId,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder="0"
                                className="h-8 text-xs font-medium"
                              />
                            </td>

                            {/* Line Subtotal */}
                            <td className="p-3 text-xs font-semibold text-foreground">
                              {formatVND(getLineSubtotal(row))}
                            </td>

                            {/* Staff Split Commission Assignment Popover */}
                            <td className="p-3">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {row.assignedStaff.map((staff) => (
                                  <Badge
                                    key={staff.userId}
                                    variant="secondary"
                                    className="flex items-center space-x-1 px-1.5 py-0.5 text-[10px]"
                                  >
                                    <span className="max-w-[60px] truncate">
                                      {staff.employeeName}
                                    </span>
                                    <span className="scale-90 text-muted-foreground">
                                      {staff.commissionPercentage}%
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveStaff(
                                          row.localId,
                                          staff.userId
                                        )
                                      }
                                      className="ml-1 text-muted-foreground transition-colors hover:text-destructive"
                                      title="Remove staff"
                                    >
                                      <X className="h-2.5 w-2.5" />
                                    </button>
                                  </Badge>
                                ))}
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon-xs"
                                      className="h-6 w-6 rounded-full"
                                      title={
                                        row.assignedStaff.length > 0
                                          ? 'Edit staff assignments'
                                          : 'Assign staff'
                                      }
                                    >
                                      {row.assignedStaff.length > 0 ? (
                                        <UserCheck className="h-3 w-3 text-primary" />
                                      ) : (
                                        <Plus className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="flex max-h-80 w-72 flex-col p-3"
                                    align="end"
                                  >
                                    <div className="mb-2 flex shrink-0 items-center justify-between">
                                      <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Assign Staff & Commission
                                      </h4>
                                      {row.assignedStaff.length > 0 && (
                                        <span className="text-[10px] font-medium text-muted-foreground">
                                          {row.assignedStaff.length} assigned
                                        </span>
                                      )}
                                    </div>

                                    {employees.length > 0 && (
                                      <div className="mb-2 flex shrink-0 items-center rounded-md border border-border px-2 py-1">
                                        <Search className="mr-1.5 h-3 w-3 shrink-0 opacity-50" />
                                        <input
                                          placeholder="Search staff..."
                                          value={
                                            staffSearchTexts[row.localId] || ''
                                          }
                                          onChange={(e) => {
                                            const text = e.target.value;
                                            setStaffSearchTexts((prev) => ({
                                              ...prev,
                                              [row.localId]: text,
                                            }));
                                          }}
                                          className="w-full bg-transparent text-xs outline-hidden placeholder:text-muted-foreground"
                                        />
                                        {staffSearchTexts[row.localId] && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setStaffSearchTexts((prev) => ({
                                                ...prev,
                                                [row.localId]: '',
                                              }))
                                            }
                                            className="text-muted-foreground hover:text-foreground"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        )}
                                      </div>
                                    )}

                                    {filteredEmployees.length > 0 ? (
                                      <div
                                        className="min-h-0 flex-1 touch-pan-y space-y-2 overflow-y-auto overscroll-contain"
                                        onWheel={(e) => e.stopPropagation()}
                                      >
                                        {filteredEmployees.map((emp) => {
                                          const isAssigned =
                                            row.assignedStaff.some(
                                              (s) => s.userId === emp.id
                                            );
                                          const staffInfo =
                                            row.assignedStaff.find(
                                              (s) => s.userId === emp.id
                                            );
                                          return (
                                            <div
                                              key={emp.id}
                                              className="flex items-center justify-between p-1 text-xs"
                                            >
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleToggleStaff(
                                                    row.localId,
                                                    emp
                                                  )
                                                }
                                                className="flex flex-1 items-center text-left transition-colors hover:text-primary"
                                              >
                                                <div
                                                  className={cn(
                                                    'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border transition-all',
                                                    isAssigned
                                                      ? 'border-primary bg-primary text-primary-foreground'
                                                      : 'border-border'
                                                  )}
                                                >
                                                  {isAssigned && (
                                                    <Check className="h-3 w-3" />
                                                  )}
                                                </div>
                                                <span className="font-medium text-foreground">
                                                  {emp.name}
                                                </span>
                                              </button>
                                              {isAssigned && staffInfo && (
                                                <div className="flex items-center space-x-1">
                                                  <Input
                                                    type="number"
                                                    value={
                                                      staffInfo.commissionPercentage ??
                                                      ''
                                                    }
                                                    onChange={(e) =>
                                                      handleStaffCommissionChange(
                                                        row.localId,
                                                        emp.id,
                                                        parseFloat(
                                                          e.target.value
                                                        ) || 0
                                                      )
                                                    }
                                                    className="h-6 w-14 p-0.5 text-center text-[10px] font-semibold"
                                                  />
                                                  <span className="text-muted-foreground">
                                                    %
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="py-2 text-center text-xs text-muted-foreground">
                                        No employees found.
                                      </div>
                                    )}
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </td>

                            {/* Delete Action */}
                            <td className="p-3">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => removeLineItem(row.localId)}
                                className="text-muted-foreground transition-colors duration-150 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLineItem}
                  className="mt-2 font-medium"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Row
                </Button>
              </div>
            </div>

            {/* Footer calculations & submission buttons */}
            <div className="grid grid-cols-1 items-end gap-6 border-t border-border pt-6 md:grid-cols-2">
              {/* Discount & VAT inputs */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Order Discount (-)
                    </label>
                    <div className="relative w-full">
                      <Input
                        type="number"
                        value={orderDiscountValue || ''}
                        onChange={(e) =>
                          handleGlobalDiscountValueChange(
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                        className="pr-6 text-xs font-semibold"
                      />
                      <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        đ
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      VAT (+)
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          value={vatPercent || ''}
                          onChange={(e) =>
                            handleVatPercentChange(
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          className="pr-6 text-xs font-semibold"
                        />
                        <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                          %
                        </span>
                      </div>
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          value={vatValue || ''}
                          onChange={(e) =>
                            handleVatValueChange(
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          className="pr-6 text-xs font-semibold"
                        />
                        <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                          đ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Totals Card */}
              <div className="space-y-2.5 rounded-lg border border-border bg-muted/20 p-4 text-sm">
                <div className="flex justify-between font-medium text-muted-foreground">
                  <span>Tạm tính (Subtotal):</span>
                  <span className="text-foreground">{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between font-medium text-muted-foreground">
                  <span>Giảm giá dịch vụ:</span>
                  <span className="font-semibold text-destructive">
                    -{formatVND(orderDiscountValue)}
                  </span>
                </div>
                <div className="flex justify-between font-medium text-muted-foreground">
                  <span>VAT:</span>
                  <span className="text-foreground">{formatVND(vatValue)}</span>
                </div>
                <div className="my-2 flex justify-between border-t border-border/60 pt-2.5 text-base font-bold tracking-wide text-foreground">
                  <span>Tổng cộng (Grand Total):</span>
                  <span className="text-lg text-primary">
                    {formatVND(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-8 border-t border-border pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveOrder}
                disabled={isSaving}
                className="flex w-full min-w-[100px] items-center justify-center sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  submitBtnText
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AddOrderDialog() {
  return <OrderFormDialog mode="create" />;
}
