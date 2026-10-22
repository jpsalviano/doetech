export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  token?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserQueryDto {
  email?: string;
  isAdmin?: boolean;
  createdAtFrom?: number;
  createdAtTo?: number;
  page?: number;
  pageSize?: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  isAdmin?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  isAdmin?: boolean;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    isAdmin: boolean;
    createdAt: number;
  };
}