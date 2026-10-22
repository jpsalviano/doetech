import { User } from './user.models';
import { Account } from './account.models';

export interface Person {
  user: User;
  account?: Account;
}

export interface PersonFormData {
  email: string;
  password?: string;
  isAdmin: boolean;
  name?: string;
  businessName?: string;
  cpf?: string;
  cnpj?: string;
  birthdayDate: string;
  role: 'Donor' | 'Receptor';
  allowsAdvertising: boolean;
  address: {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    postalCode: string;
  };
  phone: {
    countryCode: string;
    stateCode: string;
    phoneNumber: string;
  };
}
