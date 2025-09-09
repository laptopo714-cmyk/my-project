// Types for the educational platform

// Section type
export interface Section {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// Video type
export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  section_id: string;
  duration_minutes: number;
  thumbnail?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  sections?: {
    title: string;
  };
}

// Course type (keeping for backward compatibility)
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  price: number;
  is_free: boolean;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// Student type
export interface Student {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  profile_picture?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

// Dashboard statistics
export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  newStudentsThisMonth: number;
  totalSections: number;
  publishedSections: number;
  featuredSections: number;
  totalVideos: number;
  publishedVideos: number;
}

// Admin user
export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

// Notification
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}