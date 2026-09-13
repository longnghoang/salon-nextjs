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
