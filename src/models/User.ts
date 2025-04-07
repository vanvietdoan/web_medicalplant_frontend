export interface User {
  created_at: string;
  updated_at: string;
  user_id: number;
  full_name: string;
  title: string;
  proof: string;
  specialty: string;
  avatar: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
} 