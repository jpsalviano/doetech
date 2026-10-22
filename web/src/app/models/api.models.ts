export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}