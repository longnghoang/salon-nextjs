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

export interface GetProductsParams {
  searchText?: string;
  pageSize?: number;
  before?: string;
  after?: string;
}
