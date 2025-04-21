import type { Role } from './Role';

export interface User {
  user_id: number;
  email: string;
  full_name: string;
  title: string;
  proof: string;
  specialty: string;
  active: boolean;
  avatar: string;
  role_id: number;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface CreateUser {
  email: string;
  full_name: string;
  title: string;
  proof: string;
  specialty: string;
  active: boolean;
  avatar: string;
  role_id: number;
  password: string;
}

export interface UserResponse {
  success: boolean;
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface Login{
  email: string;
  password: string;
  id: number;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: Login;
} 
