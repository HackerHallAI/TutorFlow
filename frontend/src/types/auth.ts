export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'tutor' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  bio?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  avatar_url?: string;
  subjects?: string[];
  hourly_rate?: number;
  experience_years?: number;
  education?: string;
  certifications?: string[];
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'tutor' | 'admin';
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'tutor' | 'admin';
}

export interface RegisterResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'tutor' | 'admin';
  message: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
} 