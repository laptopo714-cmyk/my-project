// Admin Permissions and Role Management System
export interface AdminPermissions {
  // Dashboard permissions
  viewDashboard: boolean;
  viewAnalytics: boolean;
  viewReports: boolean;

  // Student management permissions
  viewStudents: boolean;
  addStudents: boolean;
  editStudents: boolean;
  deleteStudents: boolean;
  viewStudentProgress: boolean;

  // Course management permissions
  viewCourses: boolean;
  addCourses: boolean;
  editCourses: boolean;
  deleteCourses: boolean;
  manageCourseContent: boolean;
  publishCourses: boolean;

  // Content management permissions
  manageWebsiteContent: boolean;
  editHomePage: boolean;
  manageNews: boolean;
  manageAnnouncements: boolean;

  // System management permissions
  manageSettings: boolean;
  viewSystemLogs: boolean;
  manageNotifications: boolean;
  manageBackups: boolean;
  manageIntegrations: boolean;

  // Financial permissions
  viewFinancials: boolean;
  managePayments: boolean;
  generateFinancialReports: boolean;

  // Communication permissions
  sendNotifications: boolean;
  manageMessages: boolean;
  broadcastAnnouncements: boolean;
}

export interface AdminRole {
  id: string;
  name: string;
  nameArabic: string;
  description: string;
  descriptionArabic: string;
  permissions: AdminPermissions;
  level: number; // Higher number = more privileged
}

// Full admin permissions (super admin)
export const SUPER_ADMIN_PERMISSIONS: AdminPermissions = {
  // Dashboard permissions
  viewDashboard: true,
  viewAnalytics: true,
  viewReports: true,

  // Student management permissions
  viewStudents: true,
  addStudents: true,
  editStudents: true,
  deleteStudents: true,
  viewStudentProgress: true,

  // Course management permissions
  viewCourses: true,
  addCourses: true,
  editCourses: true,
  deleteCourses: true,
  manageCourseContent: true,
  publishCourses: true,

  // Content management permissions
  manageWebsiteContent: true,
  editHomePage: true,
  manageNews: true,
  manageAnnouncements: true,

  // System management permissions
  manageSettings: true,
  viewSystemLogs: true,
  manageNotifications: true,
  manageBackups: true,
  manageIntegrations: true,

  // Financial permissions
  viewFinancials: true,
  managePayments: true,
  generateFinancialReports: true,

  // Communication permissions
  sendNotifications: true,
  manageMessages: true,
  broadcastAnnouncements: true,
};

// Predefined admin roles
export const ADMIN_ROLES: AdminRole[] = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    nameArabic: 'مدير عام',
    description: 'Full access to all system features and settings',
    descriptionArabic: 'صلاحيات كاملة لجميع ميزات النظام والإعدادات',
    permissions: SUPER_ADMIN_PERMISSIONS,
    level: 100,
  },
  {
    id: 'course_manager',
    name: 'Course Manager',
    nameArabic: 'مدير الكورسات',
    description: 'Manage courses and content',
    descriptionArabic: 'إدارة الكورسات والمحتوى',
    permissions: {
      ...SUPER_ADMIN_PERMISSIONS,
      // Restricted permissions for course manager
      manageSettings: false,
      viewSystemLogs: false,
      manageBackups: false,
      deleteStudents: false,
      viewFinancials: false,
      managePayments: false,
      generateFinancialReports: false,
    },
    level: 80,
  },
  {
    id: 'student_advisor',
    name: 'Student Advisor',
    nameArabic: 'مرشد أكاديمي',
    description: 'Manage students and track their progress',
    descriptionArabic: 'إدارة الطلاب ومتابعة تقدمهم الأكاديمي',
    permissions: {
      // Dashboard permissions
      viewDashboard: true,
      viewAnalytics: true,
      viewReports: true,

      // Student management permissions
      viewStudents: true,
      addStudents: true,
      editStudents: true,
      deleteStudents: false, // Can't delete students
      viewStudentProgress: true,

      // Limited course permissions
      viewCourses: true,
      addCourses: false,
      editCourses: false,
      deleteCourses: false,
      manageCourseContent: false,
      publishCourses: false,

      // No content management
      manageWebsiteContent: false,
      editHomePage: false,
      manageNews: false,
      manageAnnouncements: false,

      // No system management
      manageSettings: false,
      viewSystemLogs: false,
      manageNotifications: true,
      manageBackups: false,
      manageIntegrations: false,

      // No financial permissions
      viewFinancials: false,
      managePayments: false,
      generateFinancialReports: false,

      // Communication permissions
      sendNotifications: true,
      manageMessages: true,
      broadcastAnnouncements: false,
    },
    level: 60,
  },
];

// Get admin user information and permissions
export const getAdminUserInfo = (email: string, userMetadata?: any): { role: AdminRole; isDefault: boolean } => {
  // Check if it's the default super admin
  if (email === 'admin@educational-platform.com') {
    return {
      role: ADMIN_ROLES[0], // Super admin role
      isDefault: true,
    };
  }

  // Check user metadata for role information
  if (userMetadata?.role) {
    const roleId = userMetadata.role;
    const foundRole = ADMIN_ROLES.find(role => role.id === roleId);
    if (foundRole) {
      return {
        role: foundRole,
        isDefault: false,
      };
    }
  }

  // Check if user has admin role in metadata
  if (userMetadata?.is_super_admin) {
    return {
      role: ADMIN_ROLES[0], // Super admin role
      isDefault: false,
    };
  }

  // For other admins, return course manager as default
  return {
    role: ADMIN_ROLES[1], // Course manager role
    isDefault: false,
  };
};

// Check if user has specific permission
export const hasPermission = (userEmail: string, permission: keyof AdminPermissions, userMetadata?: any): boolean => {
  const { role } = getAdminUserInfo(userEmail, userMetadata);
  return role.permissions[permission];
};

// Get user's admin level
export const getAdminLevel = (userEmail: string, userMetadata?: any): number => {
  const { role } = getAdminUserInfo(userEmail, userMetadata);
  return role.level;
};

// Check if user can perform action on another user (based on levels)
export const canManageUser = (managerEmail: string, targetEmail: string, managerMetadata?: any, targetMetadata?: any): boolean => {
  const managerLevel = getAdminLevel(managerEmail, managerMetadata);
  const targetLevel = getAdminLevel(targetEmail, targetMetadata);
  return managerLevel > targetLevel;
};