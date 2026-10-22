export interface Notification {
  id: string;
  title: string;
  content: string;
  accountId: string;
  read: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface NotificationQueryDto {
  accountId?: string;
  read?: boolean;
  createdAtFrom?: number;
  createdAtTo?: number;
  page?: number;
  pageSize?: number;
}
