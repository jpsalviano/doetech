import { Equipment } from './equipment.models';

export interface Donation {
  id: string;
  recipientAccountId: string;
  equipments: DonationEquipment[];
  status: DonationStatus;
  removed: boolean;
  createdAt: number;
  updatedAt: number;
  finishedAt?: number;
}

export interface DonationEquipment {
  id: string;
  donationId: string;
  equipmentId: string;
}

export enum DonationStatus {
  InProgress = 'InProgress',
  Canceled = 'Canceled',
  Finished = 'Finished',
  Pending = 'Pending',
  Approved = 'Approved'
}

export interface CreateDonationRequest {
  recipientAccountId: string;
  equipmentIds: string[];
  status: DonationStatus;
}

export interface UpdateDonationRequest {
  equipmentIds: string[];
  status: DonationStatus;
}

export interface DonationQueryDto {
  recipientAccountId?: string;
  donorAccountId?: string;
  equipmentIds?: string[];
  status?: DonationStatus;
  page?: number;
  pageSize?: number;
}

export interface EquipmentSelection {
  equipment: Equipment;
  selected: boolean;
}

export interface DonationCart {
  donorAccountId: string;
  selectedEquipments: Equipment[];
}