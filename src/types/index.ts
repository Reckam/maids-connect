export type UserType = 'maid' | 'employer' | 'admin';

export interface User {
  id: string;
  email: string;
  user_type: UserType;
  full_name: string;
  avatar_url?: string;
  is_admin: boolean;
  is_verified: boolean;
  district: string;
}

export interface MaidProfile extends User {
  skills: string[];
  experience: number;
  hourly_rate: number;
  languages: string[];
  availability: string;
  bio: string;
  rating: number;
  review_count: number;
}

export interface EmployerProfile extends User {
  services_needed: string[];
  preferred_schedule: string;
  requirements: string;
  location_details: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  employer_id: string;
  maid_id: string;
  date: string;
  time: string;
  duration: number; // in hours
  total_price: number;
  status: BookingStatus;
  notes?: string;
  services: string[];
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved';
  created_at: string;
}