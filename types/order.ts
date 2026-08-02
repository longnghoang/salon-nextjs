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

export interface OrderWithDetails extends Order {
  orderDetails?: OrderDetail[] | null;
  isPayment?: boolean;
  isBanking?: boolean;
  discountAmount?: number | null;
  vat?: number | null;
}
