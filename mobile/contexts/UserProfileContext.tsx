import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { apiClient } from "../api/apiClient";
import { AuthContext } from "./AuthContext";

// Interfaces baseadas no modelo Account do backend
interface AccountAddress {
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  complement?: string;
}

interface AccountPhone {
  countryCode: string;
  stateCode: string;
  phoneNumber: string;
}

enum AccountRoleEnum {
  Donor = 'Donor',
  Receptor = 'Receptor'
}

interface Account {
  id: string;
  userId: string;
  name?: string;
  businessName?: string;
  cpf?: string;
  cnpj?: string;
  birthdayDate?: number;
  address: AccountAddress;
  phone: AccountPhone;
  role: AccountRoleEnum;
  createdAt: number;
  updatedAt: number;
  allowsAdvertising: boolean;
  active: boolean;
}

interface UserProfileContextData {
  account: Account | null;
  loading: boolean;
  error: string | null;
  refreshAccount: () => Promise<void>;
  updateAccount: (accountData: Partial<Account>) => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextData | null>(null);

interface UserProfileProviderProps {
  children: ReactNode;
}

export function UserProfileProvider({ children }: UserProfileProviderProps) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const fetchAccount = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/account/user/${userId}`);
      setAccount(response.data);
    } catch (error: any) {
      console.log("Erro ao buscar dados da conta:", error);
      setError(error.response?.data?.message || "Erro ao carregar dados da conta");
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async (accountData: Partial<Account>) => {
    if (!account) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put(`/account/${account.id}`, accountData);
      setAccount(response.data);
    } catch (error: any) {
      console.log("Erro ao atualizar dados da conta:", error);
      setError(error.response?.data?.message || "Erro ao atualizar dados da conta");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshAccount = async () => {
    if (user?.id) {
      await fetchAccount(user.id);
    }
  };

  useEffect(() => {
    if (user?.id && !account) {
      fetchAccount(user.id);
    } else if (!user) {
      setAccount(null);
      setError(null);
    }
  }, [user?.id]);

  return (
    <UserProfileContext.Provider 
      value={{ 
        account, 
        loading, 
        error, 
        refreshAccount, 
        updateAccount 
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile deve ser usado dentro do UserProfileProvider");
  }
  return context;
}

export { AccountRoleEnum, type Account, type AccountAddress, type AccountPhone };

