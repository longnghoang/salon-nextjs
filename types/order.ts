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
