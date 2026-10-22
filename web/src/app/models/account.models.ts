export interface AccountAddress {
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface AccountPhone {
  countryCode: string;
  stateCode: string;
  phoneNumber: string;
}

export interface Account {
  id?: string;
  userId: string;
  name?: string;
  businessName?: string;
  cpf?: string;
  cnpj?: string;
  birthdayDate: number;
  address: AccountAddress;
  phone: AccountPhone;
  role: 'Donor' | 'Receptor';
  allowsAdvertising: boolean; 
  createdAt?: number;
  updatedAt?: number;
}


export interface AccountFormData {
  accountType: 'personal' | 'business';
  name?: string;
  cpf?: string;
  businessName?: string;
  cnpj?: string;
  birthdayDate?: string;
  role: 'Donor' | 'Receptor';
  allowsAdvertising: boolean;
  address: AccountAddress;
  phone: AccountPhone;
}

export interface AccountQueryDto {
  userId?: string;
  accountIds?: string[];
  name?: string;
  businessName?: string;
  cpf?: string;
  cnpj?: string;
  allowsAdvertising?: boolean;
  createdAtFrom?: number;
  createdAtTo?: number;
  page?: number;
  pageSize?: number;
}


export interface CreateAccountRequest extends Omit<Account, 'id' | 'createdAt' | 'updatedAt'> {
  birthdayDate: number;
}

export interface UpdateAccountRequest extends Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'userId'>> {
}