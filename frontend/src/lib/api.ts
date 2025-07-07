import { LoginRequest, RegisterRequest, AuthResponse, User, UserProfile } from '@/types/auth';
import { Tutor, TutorDetail, Booking, BookingCreate, BookingUpdate, AvailabilityRequest, AvailabilityResponse, TutorFilters, TutorProfile, TutorProfileFormData } from '@/types/tutor';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.detail || response.statusText);
    }

    return response.json();
  } catch (error) {
    console.error('API Request failed:', { url, error });
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Auth API functions
export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  async logout(): Promise<void> {
    return apiRequest<void>('/auth/logout', {
      method: 'POST',
    });
  },
};

// User API functions
export const userApi = {
  async getProfile(): Promise<UserProfile> {
    return apiRequest<UserProfile>('/users/profile');
  },

  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    return apiRequest<UserProfile>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async getCurrentUser(): Promise<User> {
    return apiRequest<User>('/auth/me');
  },
};

// Tutor API functions
export const tutorApi = {
  // Get all tutors
  getTutors: async (filters?: TutorFilters): Promise<Tutor[]> => {
    const params = new URLSearchParams();
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.min_rate) params.append('min_rate', filters.min_rate.toString());
    if (filters?.max_rate) params.append('max_rate', filters.max_rate.toString());
    if (filters?.skip) params.append('skip', filters.skip.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    // By default, show all tutors (both verified and unverified)
    const verifiedOnly = filters?.verified_only !== undefined ? filters.verified_only : false;
    params.append('verified_only', verifiedOnly.toString());

    const queryString = params.toString();
    return apiRequest<Tutor[]>(`/users/tutors${queryString ? `?${queryString}` : ''}`);
  },

  // Get tutor details
  getTutor: async (tutorId: string): Promise<TutorDetail> => {
    return apiRequest<TutorDetail>(`/users/tutors/${tutorId}`);
  },

  // Get current tutor's profile
  getTutorProfile: async (): Promise<TutorProfile> => {
    return apiRequest<TutorProfile>('/users/tutor/profile');
  },

  // Create or update tutor profile
  createTutorProfile: async (profileData: TutorProfileFormData): Promise<TutorProfile> => {
    return apiRequest<TutorProfile>('/users/tutor/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  // Verify a tutor (admin only)
  verifyTutor: async (tutorId: string, isVerified: boolean = true): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/users/tutors/${tutorId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ is_verified: isVerified }),
    });
  },
};


// Booking API functions
export const bookingApi = {
  // Create a new booking
  createBooking: async (bookingData: BookingCreate): Promise<Booking> => {
    return apiRequest<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Get user's bookings
  getBookings: async (status?: string, startDate?: string, endDate?: string): Promise<Booking[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const queryString = params.toString();
    return apiRequest<Booking[]>(`/bookings${queryString ? `?${queryString}` : ''}`);
  },

  // Get booking details
  getBooking: async (bookingId: number): Promise<Booking> => {
    return apiRequest<Booking>(`/bookings/${bookingId}`);
  },

  // Update booking
  updateBooking: async (bookingId: number, bookingData: BookingUpdate): Promise<Booking> => {
    return apiRequest<Booking>(`/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  },

  // Cancel booking
  cancelBooking: async (bookingId: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/bookings/${bookingId}`, {
      method: 'DELETE',
    });
  },

  // Check availability
  checkAvailability: async (tutorId: string, availabilityData: AvailabilityRequest): Promise<AvailabilityResponse> => {
    return apiRequest<AvailabilityResponse>(`/bookings/availability/${tutorId}`, {
      method: 'POST',
      body: JSON.stringify(availabilityData),
    });
  },
}; 