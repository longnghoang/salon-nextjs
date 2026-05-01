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
  status: number;
  statusName: string;
  totalCommissionAmount: number;
  createdBy: string;
  createdDateTime: string;
  updatedBy: string | null;
  updatedDateTime: string | null;
}
