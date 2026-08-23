export interface CursorPaginationInfo {
  before: string | null;
  after: string | null;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CursorPaginatedResult<T> {
  items: T[];
  paging: CursorPaginationInfo;
}
