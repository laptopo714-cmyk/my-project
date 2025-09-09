export interface Course {
  id: string; // Use string for UUIDs from Supabase
  title: string;
  description: string;
  progress?: number;
  thumbnail: string;
  thumbnail_url?: string;
  isVisible?: boolean;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  status: 'pending' | 'sent' | 'scheduled';
  target_audience?: 'all' | 'students' | 'specific';
  user_id?: string;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
}

export interface Student {
  id: string; // Use string for UUIDs from Supabase
  name: string;
  email: string;
  created_at: string;
  status: 'active' | 'suspended' | 'pending' | 'inactive';
  phone?: string;
  parent_phone?: string;
  account_expires_at?: string;
}

// Extended interfaces for comprehensive data management
export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalCourses: number;
  publishedCourses: number;
  monthlySignups: Array<{ name: string; students: number }>;
  recentActivity: Array<{
    id: string;
    type: 'enrollment' | 'completion' | 'new_student';
    message: string;
    timestamp: string;
  }>;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  permissions: Record<string, boolean>;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}
