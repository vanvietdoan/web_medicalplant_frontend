export interface Role {
  role_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface RoleResponse {
  data: Role[];
  total: number;
  page: number;
  limit: number;
} 