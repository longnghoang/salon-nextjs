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
}
