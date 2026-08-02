export interface Service {
  id: number;
  code: string;
  name: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  commission: number | null;
  isActive: boolean | null;
}
