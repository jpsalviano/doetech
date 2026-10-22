export interface Equipment {
  id: string;
  donorAccountId: string;
  description: string;
  type: EquipmentType;
  status: EquipmentStatus;
  avaiabilityDate: number;
  donationDate?: number;
  createdAt: number;
  updatedAt: number;
  removed: boolean;
}

export enum EquipmentType {
  Desktop = 'Desktop',
  SmartPhone = 'SmartPhone',
  Tablet = 'Tablet',
  Notebook = 'Notebook',
  Peripherals = 'Peripherals',
}

export enum EquipmentStatus {
  Available = 'Available',
  Canceled = 'Canceled',
  InProgress = 'InProgress',
}

export interface CreateEquipmentRequest
  extends Omit<
    Equipment,
    'id' | 'createdAt' | 'updatedAt' | 'removed' | 'status' | 'donationDate'
  > {}

export interface UpdateEquipmentStatusRequest {
  status: EquipmentStatus;
  reason: string;
}

export interface EquipmentFilterOptions {
  types: EquipmentType[];
  statuses: EquipmentStatus[];
  donorAccountId?: string;
}

export interface EquipmentQueryDto {
  accountId?: string;
  createdAtFrom?: number;
  createdAtTo?: number;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
