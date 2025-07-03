export interface Tutor {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  avatar_url?: string;
  subjects: string;
  hourly_rate: number;
  rating?: number;
  total_sessions: number;
  is_verified: boolean;
  created_at: string;
}

export interface TutorProfile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  phone?: string;
  avatar_url?: string;
  subjects: string[];
  hourly_rate: number;
  availability_schedule: Record<string, unknown>;
  is_verified: boolean;
  rating?: number;
  total_sessions: number;
  created_at: string;
  updated_at: string;
}

export interface TutorProfileFormData {
  first_name: string;
  last_name: string;
  bio?: string;
  phone?: string;
  subjects: string[];
  hourly_rate: number;
  availability_schedule?: Record<string, unknown>;
}

export interface TutorDetail extends Tutor {
  phone?: string;
  availability_schedule?: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  student_id: string;
  tutor_id: string;
  subject: string;
  start_time: string;
  end_time: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  created_at: string;
  updated_at: string;
}

export interface BookingCreate {
  tutor_id: string;
  subject: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface BookingUpdate {
  notes?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
}

export interface AvailabilityRequest {
  start_time: string;
  end_time: string;
}

export interface AvailabilityResponse {
  tutor_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  conflicting_bookings: Array<{
    id: number;
    start_time: string;
    end_time: string;
    status: string;
  }>;
}

export interface TutorFilters {
  subject?: string;
  min_rate?: number;
  max_rate?: number;
  skip?: number;
  limit?: number;
  verified_only?: boolean;
}

export interface TutorDashboardStats {
  totalSessions: number;
  upcomingSessions: number;
  totalEarnings: number;
  averageRating: number;
  completedSessions: number;
  pendingSessions: number;
} 