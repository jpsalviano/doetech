import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { apiClient } from "../api/apiClient";

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: number;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega usuário e token armazenados localmente
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");

        if (token) {
          apiClient.defaults.headers.Authorization = `Bearer ${token}`;
        }

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("Erro ao carregar dados do usuário:", error);
        await AsyncStorage.multiRemove(["token", "user"]);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Os redirecionamentos (login, home) ficam no RootNavigator (app/_layout.tsx).

  const login = async (email: string, password: string) => {
    try {
      const { data } = await apiClient.post("/user/login", { email, password });

      const { token, user } = data;

      // Salva no AsyncStorage
      await AsyncStorage.multiSet([
        ["token", token],
        ["user", JSON.stringify(user)],
      ]);

      // Configura o header global de autenticação
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;

      // Atualiza o estado global
      setUser(user);
    } catch (error) {
      console.log("Erro ao fazer login:", error);
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
