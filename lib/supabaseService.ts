// Supabase Service Layer for Admin Dashboard
// Handles all database operations for real data integration

import { supabase, supabaseAdmin } from './supabaseClient';
import type { 
  Student, 
  Course, 
  Notification 
} from '../types';

// Extended types for comprehensive data management
export interface ExtendedStudent extends Student {
  auth_user_id?: string;
  full_name: string;
  phone?: string;
  parent_phone?: string;
  date_of_birth?: string;
  country?: string;
  city?: string;
  education_level?: string;
  bio?: string;
  profile_image_url?: string;
  enrollment_date: string;
  last_activity: string;
  total_courses: number;
  completed_courses: number[] | null;
  study_hours: number;
}

export interface ExtendedCourse extends Course {
  category: string;
  subcategory?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  price: number;
  is_free: boolean;
  status: 'draft' | 'published' | 'archived';
  total_students: number;
  total_reviews: number;
  average_rating: number;
  featured: boolean;
  published_at?: string;
  created_at: string;
}

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

// Student Management Service
class StudentService {
  // Get all students with pagination and filtering
  static async getStudents(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ students: ExtendedStudent[]; total: number }> {
    try {
      // تأكد من استخدام service role key للوصول إلى البيانات
      let query = supabaseAdmin
        .from('students')
        .select('*', { count: 'exact' });

      // Apply filters
      if (params.search) {
        // Escape special characters for search
        const escapedSearch = params.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query = query.or(`full_name.ilike.%${escapedSearch}%,email.ilike.%${escapedSearch}%`);
      }

      if (params.status) {
        query = query.eq('status', params.status);
      }

      // Apply sorting
      const sortBy = params.sortBy || 'enrollment_date';
      const sortOrder = params.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`فشل في جلب بيانات الطلاب: ${error.message || 'خطأ غير معروف'}`);
      }

      return {
        students: (data || []).map(student => ({
          id: student.id,
          name: student.full_name,
          email: student.email,
          created_at: student.enrollment_date,
          status: student.status,
          phone: student.phone,
          parent_phone: student.parent_phone,
          account_expires_at: student.account_expires_at,
          auth_user_id: student.auth_user_id,
          full_name: student.full_name,
          enrollment_date: student.enrollment_date,
          last_activity: student.last_activity,
          total_courses: student.total_courses || 0,
          completed_courses: student.completed_courses || 0,
          study_hours: student.study_hours || 0,
          ...student
        })),
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error instanceof Error ? error : new Error('فشل في جلب بيانات الطلاب');
    }
  }

  // Get student by ID
  static async getStudentById(id: string): Promise<ExtendedStudent | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        id: data.id,
        name: data.full_name,
        email: data.email,
        created_at: data.enrollment_date,
        status: data.status,
        ...data
      };
    } catch (error) {
      console.error('Error fetching student:', error);
      return null;
    }
  }

  // Create new student with authentication account
  static async createStudent(studentData: {
    name: string;
    phone: string;
    parent_phone: string;
    email: string;
    password: string;
    account_expires_at?: string;
    status: 'active' | 'suspended' | 'pending' | 'inactive';
  }): Promise<ExtendedStudent> {
    try {
      // Validate input data
      if (!studentData.name || !studentData.name.trim()) {
        throw new Error('اسم الطالب مطلوب');
      }
      
      if (!studentData.email || !studentData.email.trim()) {
        throw new Error('البريد الإلكتروني مطلوب');
      }
      
      if (!studentData.password || studentData.password.length < 6) {
        throw new Error('كلمة المرور يجب أن تكون على الأقل 6 أحرف');
      }
      
      // Step 1: Create authentication user
      let authData: any;
      let authError: any;
      
      try {
        const { data: tempAuthData, error: tempAuthError } = await supabaseAdmin.auth.admin.createUser({
          email: studentData.email,
          password: studentData.password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: studentData.name,
            role: 'student',
            phone: studentData.phone,
            parent_phone: studentData.parent_phone
          }
        });
        
        authData = tempAuthData;
        authError = tempAuthError;
      } catch (e) {
        authError = e;
      }

      if (authError) {
        console.error('Auth creation error:', authError);
        throw new Error(`فشل في إنشاء حساب المصادقة: ${authError.message || 'خطأ غير معروف'}`);
      }

      if (!authData.user) {
        throw new Error('فشل في إنشاء حساب المصادقة');
      }

      // Step 2: Create student record in students table with auth_user_id
      const studentRecord = {
        auth_user_id: authData.user.id, // حفظ الـ ID من Auth
        full_name: studentData.name,
        email: studentData.email,
        phone: studentData.phone,
        parent_phone: studentData.parent_phone,
        status: studentData.status,
        enrollment_date: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        total_courses: 0,
        completed_courses: null, // مصفوفة من IDs الدورات المكتملة
        study_hours: 0,
        account_expires_at: studentData.account_expires_at
      };

      let studentDataResult: any;
      let studentError: any;
      
      try {
        const { data: tempStudentData, error: tempStudentError } = await supabaseAdmin
          .from('students')
          .insert(studentRecord)
          .select()
          .single();
          
        studentDataResult = tempStudentData;
        studentError = tempStudentError;
      } catch (e) {
        studentError = e;
      }

      if (studentError) {
        // Rollback: Delete the auth user if student creation fails
        try {
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        } catch (deleteError) {
          console.error('Failed to rollback auth user:', deleteError);
        }
        
        console.error('Student creation error:', studentError);
        throw new Error(`فشل في إنشاء سجل الطالب: ${studentError.message || 'خطأ غير معروف'}`);
      }

      // Step 3: Log the activity
      try {
        await ActivityLogsService.logActivity({
          user_id: 'admin', // Current admin user
          user_name: 'مدير النظام',
          user_role: 'admin',
          action: 'student_created',
          action_type: 'create',
          resource_type: 'user',
          resource_id: studentDataResult.id,
          details: {
            student_name: studentData.name,
            student_email: studentData.email,
            created_with_auth: true
          },
          severity: 'low',
          status: 'success'
        });
      } catch (logError) {
        console.warn('Failed to log student creation activity:', logError);
      }

      return {
        id: studentDataResult.id,
        name: studentDataResult.full_name,
        email: studentDataResult.email,
        created_at: studentDataResult.enrollment_date,
        status: studentDataResult.status,
        auth_user_id: studentDataResult.auth_user_id,
        full_name: studentDataResult.full_name,
        phone: studentDataResult.phone,
        parent_phone: studentDataResult.parent_phone,
        enrollment_date: studentDataResult.enrollment_date,
        last_activity: studentDataResult.last_activity,
        total_courses: studentDataResult.total_courses || 0,
        completed_courses: Array.isArray(studentDataResult.completed_courses) ? studentDataResult.completed_courses : null,
        study_hours: studentDataResult.study_hours || 0,
        account_expires_at: studentDataResult.account_expires_at
      };
    } catch (error) {
      console.error('Error creating student:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('فشل في إنشاء الطالب');
    }
  }

  // Update student
  static async updateStudent(id: string, updates: Partial<ExtendedStudent>): Promise<ExtendedStudent> {
    try {
      // التأكد من وجود الـ ID
      if (!id) {
        throw new Error('معرف الطالب مطلوب للتحديث');
      }
      
      // الحصول على بيانات الطالب الحالية
      const { data: currentStudent, error: fetchError } = await supabaseAdmin
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError || !currentStudent) {
        throw new Error('الطالب غير موجود في قاعدة البيانات');
      }
      
      // استخدام دالة مساعدة لتحديث بيانات الطلاب
      const updatedStudent = await this.updateStudentData(id, updates);
      return updatedStudent;
    } catch (error) {
      console.error('Error in updateStudent:', error);
      throw error;
    }
  }

  // دالة مساعدة لتحديث بيانات الطلاب
  private static async updateStudentData(id: string, updates: Partial<ExtendedStudent>): Promise<ExtendedStudent> {
    try {
      // إنشاء كائن التحديث
      const updateData: Record<string, any> = {};
      
      // إضافة الحقول المطلوبة للتحديث
      if (updates.name !== undefined) {
        updateData.full_name = updates.name;
      }
      if (updates.email !== undefined) {
        updateData.email = updates.email;
      }
      if (updates.phone !== undefined) {
        updateData.phone = updates.phone;
      }
      if (updates.parent_phone !== undefined) {
        updateData.parent_phone = updates.parent_phone;
      }
      if (updates.status !== undefined) {
        updateData.status = updates.status;
      }
      if (updates.account_expires_at !== undefined) {
        updateData.account_expires_at = updates.account_expires_at;
      }
      
      // التأكد من وجود بيانات للتحديث
      if (Object.keys(updateData).length === 0) {
        throw new Error('لا توجد بيانات صالحة للتحديث');
      }
      
      // التأكد من وجود البيانات قبل التحديث
      if (!id) {
        throw new Error('معرف الطالب مطلوب للتحديث');
      }
      
      // التأكد من وجود بيانات للتحديث
      if (Object.keys(updateData).length === 0) {
        throw new Error('لا توجد بيانات صالحة للتحديث');
      }
      
      // تحديث بيانات الطالب في جدول الطلاب
      const { data, error } = await supabaseAdmin
        .from('students')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      // التحقق من وجود البيانات بعد التحديث
      if (!data) {
        throw new Error('فشل في جلب البيانات بعد التحديث');
      }
      

        
      // التحقق من وجود auth_user_id للتحديث في Auth
      let authUpdateSuccess = false;
      
      // تحديث رسالة التحديث بناءً على النتيجة
      const updatedAuth = authUpdateSuccess ? " و auth" : "";
      console.log(`تم تحديث البيانات في students${updatedAuth}`);
      
      if (data.auth_user_id) {
        try {
          // محاولة تحديث بيانات Auth
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(data.auth_user_id, { 
            email: updates.email,
            user_metadata: {
              full_name: updates.name || updates.full_name,
              phone: updates.phone,
              parent_phone: updates.parent_phone
            }
          });
          
          // إذا كان هناك خطأ في التحديث، قم بتسجيله ولكن لا تتوقف عن تحديث جدول الطلاب
          if (updateError) {
            console.log('فشل تحديث بيانات Auth، سيتم تحديث البيانات فقط في جدول الطلاب');
            console.log('خطأ التفاصيل:', updateError);
          } else {
            authUpdateSuccess = true;
            console.log('تم تحديث البيانات في students و auth');
          }
        } catch (authError) {
          console.error('Error updating auth:', authError);
          console.log('تم تحديث البيانات في students فقط');
          // لا نرمي الخطأ هنا لأن تحديث جدول الطلاب نجح
        }
      } else {
        console.log('تم تحديث البيانات في students فقط (لا يوجد auth_user_id)');
      }

      if (error) {
        console.error('Student update error:', error);
        throw new Error(`فشل في تحديث بيانات الطالب: ${error.message || 'خطأ غير معروف'}`);
      }

      // Log the activity
      try {
        await ActivityLogsService.logActivity({
          user_id: 'admin',
          user_name: 'مدير النظام',
          user_role: 'admin',
          action: 'student_updated',
          action_type: 'update',
          resource_type: 'user',
          resource_id: id,
          details: {
            updated_fields: Object.keys(updateData),
            student_name: data.full_name
          },
          severity: 'low',
          status: 'success'
        });
      } catch (logError) {
        console.warn('Failed to log student update activity:', logError);
      }

      return {
        id: data.id,
        name: data.full_name,
        email: data.email,
        created_at: data.enrollment_date,
        status: data.status,
        full_name: data.full_name,
        phone: data.phone,
        parent_phone: data.parent_phone,
        enrollment_date: data.enrollment_date,
        last_activity: data.last_activity,
        total_courses: data.total_courses || 0,
        completed_courses: Array.isArray(data.completed_courses) ? data.completed_courses : null,
        study_hours: data.study_hours || 0,
        ...data
      };
    } catch (error) {
      console.error('Error updating student:', error);
      throw new Error('Failed to update student');
    }
  }

  /**
   * حذف الطالب وجميع البيانات المرتبطة به بشكل نهائي
   * يتضمن ذلك حذف:
   * 1. سجلات الأنشطة المرتبطة بالطالب
   * 2. سجل الطالب في قاعدة البيانات
   * 3. حساب المصادقة المرتبط بالطالب (إذا وجد)
   * 
   * @param id معرف الطالب المراد حذفه
   * @returns وعد يحتوي على قيمة منطقية تشير إلى نجاح أو فشل عملية الحذف
   */
  static async deleteStudent(id: string): Promise<boolean> {
    try {
      // First, get the student data including auth_user_id
      const { data: student, error: fetchError } = await supabaseAdmin
        .from('students')
        .select('full_name, auth_user_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching student for deletion:', fetchError);
        throw new Error(`فشل في جلب بيانات الطالب: ${fetchError.message || 'خطأ غير معروف'}`);
      }

      // Delete activity logs related to this student
      try {
        const { error: logsDeleteError } = await supabaseAdmin
          .from('activity_logs')
          .delete()
          .eq('resource_id', id)
          .eq('resource_type', 'user');

        if (logsDeleteError) {
          console.error('Error deleting student activity logs:', logsDeleteError);
          // Continue execution even if logs deletion fails
        }
      } catch (logsError) {
        console.error('Exception during activity logs deletion:', logsError);
        // Continue execution even if logs deletion fails
      }

      // Delete student record from database
      const { error: deleteError } = await supabaseAdmin
        .from('students')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting student record:', deleteError);
        throw new Error(`فشل في حذف سجل الطالب: ${deleteError.message || 'خطأ غير معروف'}`);
      }

      // Delete authentication account if auth_user_id exists
      if (student.auth_user_id) {
        try {
          const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(student.auth_user_id);
          if (authDeleteError) {
            console.error('Error deleting auth account:', authDeleteError);
            // Continue execution even if auth deletion fails
          }
        } catch (authError) {
          console.error('Exception during auth account deletion:', authError);
          // Continue execution even if auth deletion fails
        }
      }

      // Log the activity
      try {
        await ActivityLogsService.logActivity({
          user_id: 'admin',
          user_name: 'مدير النظام',
          user_role: 'admin',
          action: 'student_deleted',
          action_type: 'delete',
          resource_type: 'user',
          resource_id: id,
          details: {
            student_name: student.full_name,
            deleted_auth_account: !!student.auth_user_id,
            permanent_deletion: true
          },
          severity: 'medium',
          status: 'success'
        });
      } catch (logError) {
        console.warn('Failed to log student deletion activity:', logError);
      }

      return true;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw new Error('Failed to delete student');
    }
  }

  // Get student statistics
  static async getStudentStats(): Promise<{
    total: number;
    active: number;
    suspended: number;
    newThisMonth: number;
  }> {
    try {
      const { data: students, error } = await supabaseAdmin
        .from('students')
        .select('status, enrollment_date');

      if (error) {
        console.error('Error fetching student stats:', error);
        throw new Error(`فشل في جلب إحصائيات الطلاب: ${error.message || 'خطأ غير معروف'}`);
      }

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats = students?.reduce((acc, student) => {
        acc.total++;
        if (student.status === 'active') acc.active++;
        if (student.status === 'suspended') acc.suspended++;
        if (new Date(student.enrollment_date) >= thisMonth) acc.newThisMonth++;
        return acc;
      }, { total: 0, active: 0, suspended: 0, newThisMonth: 0 }) || { total: 0, active: 0, suspended: 0, newThisMonth: 0 };

      return stats;
    } catch (error) {
      console.error('Error fetching student stats:', error);
      return { total: 0, active: 0, suspended: 0, newThisMonth: 0 };
    }
  }
}

// Course Management Service
class CourseService {
  // Get all courses
  static async getCourses(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  } = {}): Promise<{ courses: ExtendedCourse[]; total: number }> {
    try {
      let query = supabase
        .from('courses')
        .select(`
          *
        `, { count: 'exact' });

      // Apply filters
      if (params.search) {
        query = query.ilike('title', `%${params.search}%`);
      }

      if (params.status) {
        query = query.eq('status', params.status);
      }

      if (params.category) {
        query = query.eq('category', params.category);
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching courses:', error);
        throw new Error(`فشل في جلب بيانات الدورات: ${error.message || 'خطأ غير معروف'}`);
      }

      return {
        courses: (data || []),
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  // Get course statistics
  static async getCourseStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    totalStudents: number;
  }> {
    try {
      const { data: courses, error } = await supabase
        .from('courses')
        .select('status, total_students');

      if (error) {
        console.error('Error fetching course stats:', error);
        throw new Error(`فشل في جلب إحصائيات الدورات: ${error.message || 'خطأ غير معروف'}`);
      }

      const stats = courses?.reduce((acc, course) => {
        acc.total++;
        if (course.status === 'published') acc.published++;
        if (course.status === 'draft') acc.draft++;
        acc.totalStudents += course.total_students || 0;
        return acc;
      }, { total: 0, published: 0, draft: 0, totalStudents: 0 }) || { total: 0, published: 0, draft: 0, totalStudents: 0 };

      return stats;
    } catch (error) {
      console.error('Error fetching course stats:', error);
      return { total: 0, published: 0, draft: 0, totalStudents: 0 };
    }
  }
}

// Notification Management Service
class NotificationService {
  // Get all notifications with pagination and filtering
  static async getNotifications(params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
  } = {}): Promise<{ notifications: Notification[]; total: number }> {
    try {
      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' });

      // Apply filters
      if (params.search) {
        query = query.or(`title.ilike.%${params.search}%,message.ilike.%${params.search}%`);
      }

      if (params.type) {
        query = query.eq('type', params.type);
      }

      if (params.status) {
        query = query.eq('status', params.status);
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        notifications: (data || []).map(notif => ({
          id: parseInt(notif.id) || 0,
          title: notif.title || '',
          message: notif.message,
          time: notif.created_at,
          isRead: notif.is_read,
          type: notif.type || 'info',
          status: notif.status || 'pending',
          target_audience: notif.target_audience,
          user_id: notif.user_id,
          scheduled_at: notif.scheduled_at,
          sent_at: notif.sent_at,
          created_at: notif.created_at
        })),
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [], total: 0 };
    }
  }

  // Get notification statistics
  static async getNotificationStats(): Promise<{
    total: number;
    sent: number;
    pending: number;
    scheduled: number;
  }> {
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('status');

      if (error) throw error;

      const stats = notifications?.reduce((acc, notif) => {
        acc.total++;
        if (notif.status === 'sent') acc.sent++;
        if (notif.status === 'pending') acc.pending++;
        if (notif.status === 'scheduled') acc.scheduled++;
        return acc;
      }, { total: 0, sent: 0, pending: 0, scheduled: 0 }) || { total: 0, sent: 0, pending: 0, scheduled: 0 };

      return stats;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return { total: 0, sent: 0, pending: 0, scheduled: 0 };
    }
  }

  // Create notification
  static async createNotification(notification: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    target_audience?: 'all' | 'students' | 'specific';
    user_id?: string;
    scheduled_at?: string;
    status?: 'pending' | 'sent' | 'scheduled';
  }): Promise<{ success: boolean; id?: string }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          status: notification.status || 'pending',
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;
      return { success: true, id: data.id };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false };
    }
  }

  // Update notification
  static async updateNotification(id: string, updates: {
    title?: string;
    message?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    status?: 'pending' | 'sent' | 'scheduled';
    scheduled_at?: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating notification:', error);
      return false;
    }
  }

  // Delete notification
  static async deleteNotification(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Send notification immediately
  static async sendNotification(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }
}

// Dashboard Analytics Service
class DashboardService {
  // Get comprehensive dashboard statistics
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch all stats in parallel
      const [
        studentStats,
        courseStats,
        monthlyData
      ] = await Promise.all([
        StudentService.getStudentStats(),
        CourseService.getCourseStats(),
        this.getMonthlySignups()
      ]);

      return {
        totalStudents: studentStats.total,
        activeStudents: studentStats.active,
        totalCourses: courseStats.total,
        publishedCourses: courseStats.published,
        monthlySignups: monthlyData,
        recentActivity: await this.getRecentActivity()
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalStudents: 0,
        activeStudents: 0,
        totalCourses: 0,
        publishedCourses: 0,
        monthlySignups: [],
        recentActivity: []
      };
    }
  }

  // Get monthly signup data for charts
  private static async getMonthlySignups(): Promise<Array<{ name: string; students: number }>> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('enrollment_date');

      if (error) throw error;

      const months = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];

      const now = new Date();
      const monthlyData = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const count = data?.filter(student => {
          const enrollmentDate = new Date(student.enrollment_date);
          return enrollmentDate >= date && enrollmentDate < nextMonth;
        }).length || 0;

        monthlyData.push({
          name: months[date.getMonth()],
          students: count
        });
      }

      return monthlyData;
    } catch (error) {
      console.error('Error fetching monthly signups:', error);
      return [];
    }
  }

  // Get recent activity
  private static async getRecentActivity(): Promise<Array<{
    id: string;
    type: 'enrollment' | 'completion' | 'new_student';
    message: string;
    timestamp: string;
  }>> {
    try {
      // This could be implemented with a proper activity log table
      // For now, we'll use recent enrollments and students
      const { data: recentStudents, error } = await supabaseAdmin
        .from('students')
        .select('full_name, enrollment_date')
        .order('enrollment_date', { ascending: false })
        .limit(5);

      if (error) throw error;

      return (recentStudents || []).map((student, index) => ({
        id: `activity_${index}`,
        type: 'new_student' as const,
        message: `انضم ${student.full_name} إلى المنصة`,
        timestamp: student.enrollment_date
      }));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }
}

// Admin Authentication Service
class AdminAuthService {
  // Check if current user is admin
  static async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { data, error } = await supabase
        .from('admin_users')
        .select('is_active')
        .eq('auth_user_id', user.id)
        .eq('is_active', true)
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Get admin user data
  static async getAdminUserData(): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching admin user data:', error);
      return null;
    }
  }
}

// Content Management Service
class ContentService {
  // Get all content sections with pagination and filtering
  static async getContentSections(params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
  } = {}): Promise<{ content: any[]; total: number }> {
    try {
      let query = supabase
        .from('content_sections')
        .select('*', { count: 'exact' });

      // Apply filters
      if (params.search) {
        query = query.ilike('title', `%${params.search}%`);
      }

      if (params.type) {
        query = query.eq('type', params.type);
      }

      if (params.status) {
        query = query.eq('status', params.status);
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // Order by last modified
      query = query.order('last_modified', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        content: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching content sections:', error);
      return { content: [], total: 0 };
    }
  }

  // Get content statistics
  static async getContentStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    archived: number;
  }> {
    try {
      const { data: content, error } = await supabase
        .from('content_sections')
        .select('status');

      if (error) throw error;

      const stats = content?.reduce((acc, item) => {
        acc.total++;
        if (item.status === 'published') acc.published++;
        if (item.status === 'draft') acc.draft++;
        if (item.status === 'archived') acc.archived++;
        return acc;
      }, { total: 0, published: 0, draft: 0, archived: 0 }) || { total: 0, published: 0, draft: 0, archived: 0 };

      return stats;
    } catch (error) {
      console.error('Error fetching content stats:', error);
      return { total: 0, published: 0, draft: 0, archived: 0 };
    }
  }

  // Create content section
  static async createContentSection(content: {
    title: string;
    type: string;
    content: any;
    status?: string;
    author?: string;
  }): Promise<{ success: boolean; id?: string }> {
    try {
      const { data, error } = await supabase
        .from('content_sections')
        .insert({
          ...content,
          status: content.status || 'draft',
          last_modified: new Date().toISOString(),
          author: content.author || 'مدير المحتوى'
        })
        .select('id')
        .single();

      if (error) throw error;
      return { success: true, id: data.id };
    } catch (error) {
      console.error('Error creating content section:', error);
      return { success: false };
    }
  }

  // Update content section
  static async updateContentSection(id: string, updates: {
    title?: string;
    content?: any;
    status?: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('content_sections')
        .update({
          ...updates,
          last_modified: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating content section:', error);
      return false;
    }
  }

  // Delete content section
  static async deleteContentSection(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('content_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting content section:', error);
      return false;
    }
  }

  // Publish content section
  static async publishContentSection(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('content_sections')
        .update({ 
          status: 'published',
          last_modified: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error publishing content section:', error);
      return false;
    }
  }

  // Get homepage settings
  static async getHomepageSettings(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'homepage_settings')
        .single();

      if (error) throw error;
      return data?.value || {};
    } catch (error) {
      console.error('Error fetching homepage settings:', error);
      return {};
    }
  }

  // Update homepage settings
  static async updateHomepageSettings(settings: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'homepage_settings',
          value: settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating homepage settings:', error);
      return false;
    }
  }
}

// Settings Management Service
class SettingsService {
  // Get all settings
  static async getAllSettings(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;
      
      // Organize settings by category
      const settings: any = {};
      (data || []).forEach((setting: any) => {
        const category = setting.key.split('_')[0]; // e.g., 'system_siteName' -> 'system'
        if (!settings[category]) {
          settings[category] = {};
        }
        const settingKey = setting.key.split('_').slice(1).join('_');
        settings[category][settingKey] = setting.value;
      });
      
      return settings;
    } catch (error) {
      console.error('Error fetching all settings:', error);
      return {};
    }
  }

  // Update settings for a specific category
  static async updateSettings(category: string, settings: any): Promise<boolean> {
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key: `${category}_${key}`,
        value,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('site_settings')
        .upsert(updates);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }

  // Get specific setting
  static async getSetting(key: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error) throw error;
      return data?.value;
    } catch (error) {
      console.error('Error fetching setting:', error);
      return null;
    }
  }

  // Set specific setting
  static async setSetting(key: string, value: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error setting value:', error);
      return false;
    }
  }

  // Reset settings to defaults for a category
  static async resetToDefaults(category: string): Promise<boolean> {
    try {
      const defaults = {
        system: {
          siteName: 'المنصة التعليمية العربية',
          siteDescription: 'منصة تعليمية شاملة لتعلم المهارات والحصول على شهادات معتمدة',
          siteLanguage: 'ar',
          timezone: 'Asia/Riyadh',
          theme: 'auto',
          maintenanceMode: false,
          registrationEnabled: true,
          emailVerificationRequired: true
        },
        contact: {
          contactEmail: 'info@educational-platform.com',
          supportEmail: 'support@educational-platform.com',
          phoneNumber: '+966 50 123 4567',
          address: 'المملكة العربية السعودية، الرياض'
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          welcomeEmailTemplate: 'مرحباً بك في المنصة التعليمية! نتمنى لك تجربة تعليمية ممتعة ومفيدة.'
        },
        security: {
          passwordMinLength: 8,
          requireSpecialCharacters: true,
          sessionTimeout: 24,
          maxLoginAttempts: 5
        }
      };

      const categoryDefaults = defaults[category as keyof typeof defaults];
      if (!categoryDefaults) {
        throw new Error(`No defaults found for category: ${category}`);
      }

      return await this.updateSettings(category, categoryDefaults);
    } catch (error) {
      console.error('Error resetting to defaults:', error);
      return false;
    }
  }
}

// Activity Logs Management Service
class ActivityLogsService {
  // Get activity logs with filtering and pagination
  static async getActivityLogs(params: {
    page?: number;
    limit?: number;
    search?: string;
    action?: string;
    user?: string;
    severity?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<{ logs: any[]; total: number }> {
    try {
      let query = supabase
        .from('activity_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false });

      // Apply filters
      if (params.search) {
        query = query.or(`action.ilike.%${params.search}%,user_name.ilike.%${params.search}%,details->>description.ilike.%${params.search}%`);
      }

      if (params.action) {
        query = query.eq('action_type', params.action);
      }

      if (params.user) {
        query = query.eq('user_role', params.user);
      }

      if (params.severity) {
        query = query.eq('severity', params.severity);
      }

      if (params.status) {
        query = query.eq('status', params.status);
      }

      if (params.dateFrom) {
        query = query.gte('timestamp', `${params.dateFrom}T00:00:00`);
      }

      if (params.dateTo) {
        query = query.lte('timestamp', `${params.dateTo}T23:59:59`);
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase error:', error);
        // Return mock data if database fails
        return this.getMockActivityLogs(params);
      }

      return {
        logs: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return this.getMockActivityLogs(params);
    }
  }

  // Get activity statistics
  static async getActivityStats(): Promise<any> {
    try {
      const { data, error } = await supabase
        .rpc('get_activity_stats');

      if (error) {
        console.error('Error fetching activity stats:', error);
        return this.getMockActivityStats();
      }

      return data || this.getMockActivityStats();
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      return this.getMockActivityStats();
    }
  }

  // Create activity log entry
  static async createActivityLog(logData: {
    user_id: string;
    user_name: string;
    user_role: string;
    action: string;
    action_type: string;
    resource_type: string;
    resource_id?: string;
    details?: any;
    ip_address?: string;
    user_agent?: string;
    severity?: string;
    status?: string;
  }): Promise<boolean> {
    try {
      // استخدام supabAdmin بدلاً من supabase للوصول إلى activity_logs
      // استخدام UUID الخاص بالمسؤول بدلاً من القيمة النصية
      const adminUserId = '185d0f59-7f93-4655-bbe0-5bb5511e70b9';
      const userId = logData.user_id === 'admin' ? adminUserId : logData.user_id;
      
      const { error } = await supabaseAdmin
        .from('activity_logs')
        .insert({
          user_id: userId,
          action: logData.action,
          action_type: logData.action_type,
          resource_type: logData.resource_type,
          resource_id: logData.resource_id,
          details: logData.details,
          ip_address: logData.ip_address,
          user_agent: logData.user_agent,
          severity: logData.severity || 'low',
          status: logData.status || 'success',
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating activity log:', error);
      return false;
    }
  }

  // Alias for createActivityLog to match usage in the code
  static async logActivity(logData: {
    user_id: string;
    user_name: string;
    user_role: string;
    action: string;
    action_type: string;
    resource_type: string;
    resource_id?: string;
    details?: any;
    ip_address?: string;
    user_agent?: string;
    severity?: string;
    status?: string;
  }): Promise<boolean> {
    return await this.createActivityLog(logData);
  }

  // Export activity logs
  static async exportActivityLogs(filters: any): Promise<void> {
    try {
      const { logs } = await this.getActivityLogs({ ...filters, limit: 10000 });
      
      const csvContent = this.convertToCSV(logs);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting activity logs:', error);
      throw error;
    }
  }

  // Convert logs to CSV format
  private static convertToCSV(logs: any[]): string {
    if (logs.length === 0) return '';
    
    const headers = ['التوقيت', 'المستخدم', 'الدور', 'الإجراء', 'نوع الإجراء', 'نوع المورد', 'المستوى', 'الحالة', 'التفاصيل'];
    
    const csvRows = [
      headers.join(','),
      ...logs.map(log => [
        log.timestamp,
        log.user_name,
        log.user_role,
        log.action,
        log.action_type,
        log.resource_type,
        log.severity,
        log.status,
        JSON.stringify(log.details || {})
      ].map(field => `"${field}"`).join(','))
    ];
    
    return csvRows.join('\n');
  }

  // Mock data for fallback
  private static getMockActivityLogs(params: any): { logs: any[]; total: number } {
    const mockLogs = [
      {
        id: '1',
        user_id: 'admin-1',
        user_name: 'مدير النظام',
        user_role: 'admin',
        action: 'user_created',
        action_type: 'create',
        resource_type: 'user',
        resource_id: 'user-123',
        details: { description: 'تم إنشاء مستخدم جديد', email: 'user@example.com' },
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0...',
        severity: 'low',
        status: 'success',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        user_id: 'admin-1',
        user_name: 'مدير النظام',
        user_role: 'admin',
        action: 'settings_updated',
        action_type: 'update',
        resource_type: 'settings',
        resource_id: 'system_settings',
        details: { description: 'تم تحديث إعدادات النظام', changes: ['siteName', 'theme'] },
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0...',
        severity: 'medium',
        status: 'success',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        user_id: 'user-123',
        user_name: 'أحمد محمد',
        user_role: 'student',
        action: 'login_attempt',
        action_type: 'login',
        resource_type: 'auth',
        details: { description: 'محاولة تسجيل دخول فاشلة', reason: 'invalid_password' },
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0...',
        severity: 'high',
        status: 'failed',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: '4',
        user_id: 'system',
        user_name: 'النظام',
        user_role: 'system',
        action: 'system_backup',
        action_type: 'system',
        resource_type: 'system',
        details: { description: 'تم إجراء نسخ احتياطي للنظام', size: '2.5GB' },
        severity: 'low',
        status: 'success',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '5',
        user_id: 'admin-1',
        user_name: 'مدير النظام',
        user_role: 'admin',
        action: 'export_data',
        action_type: 'export',
        resource_type: 'user',
        details: { description: 'تم تصدير بيانات المستخدمين', count: 1245 },
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0...',
        severity: 'medium',
        status: 'success',
        timestamp: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    // Apply filters to mock data
    let filteredLogs = mockLogs;
    
    if (params.search) {
      filteredLogs = filteredLogs.filter(log => 
        log.action.toLowerCase().includes(params.search.toLowerCase()) ||
        log.user_name.toLowerCase().includes(params.search.toLowerCase())
      );
    }
    
    if (params.action) {
      filteredLogs = filteredLogs.filter(log => log.action_type === params.action);
    }
    
    if (params.user) {
      filteredLogs = filteredLogs.filter(log => log.user_role === params.user);
    }
    
    if (params.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === params.severity);
    }
    
    if (params.status) {
      filteredLogs = filteredLogs.filter(log => log.status === params.status);
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      logs: filteredLogs.slice(start, end),
      total: filteredLogs.length
    };
  }

  private static getMockActivityStats(): any {
    return {
      totalLogs: 1245,
      todayLogs: 85,
      successfulActions: 1180,
      failedActions: 65,
      criticalEvents: 3
    };
  }
}

// Export all services
export {
  StudentService,
  CourseService,
  NotificationService,
  DashboardService,
  AdminAuthService,
  ContentService,
  SettingsService,
  ActivityLogsService
};