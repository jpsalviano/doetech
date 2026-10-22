import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { router } from 'expo-router';

// Na web o app é servido pelo mesmo site da API; no Android, o endereço
// completo. EXPO_PUBLIC_API_URL troca os dois (ex.: uma API local).
const baseURL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.API_URL ||
  (Platform.OS === 'web' ? '/api/v1/doetech' : 'https://jpsalviano.com.br/api/v1/doetech');

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
});

// Interceptor para adicionar o token em todas as requisições
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erro 401
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem("token");
      if (typeof window !== 'undefined') {
        // window.location.href = '/auth/login';
        router.replace('/auth/login')
      } else { }
    }
    return Promise.reject(error);
  }
);
