export interface Role {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  created_by_user?: { first_name: string; last_name: string } | null;
}

export interface RolesState {
  roles: Role[];
  selectedRole: Role | null;
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
}
