import React, { useState, useEffect } from 'react';
import { 
  ClipboardDocumentListIcon,
  UserGroupIcon,
  EyeIcon,
  SearchIcon,
  FilterIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '../../Icons';
import { ActivityLogsService } from '../../../lib/supabaseService';

interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: 'admin' | 'student' | 'teacher' | 'system';
  action: string;
  action_type: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export' | 'system';
  resource_type: 'user' | 'course' | 'notification' | 'content' | 'settings' | 'system' | 'auth';
  resource_id?: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
}

interface ManageActivityLogsPageProps {
  theme: 'light' | 'dark';
}

const ManageActivityLogsPage: React.FC<ManageActivityLogsPageProps> = ({ theme }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [stats, setStats] = useState({
    totalLogs: 0,
    todayLogs: 0,
    successfulActions: 0,
    failedActions: 0,
    criticalEvents: 0
  });

  const logsPerPage = 20;

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [currentPage, searchTerm, filterAction, filterUser, filterSeverity, filterStatus, dateRange]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const result = await ActivityLogsService.getActivityLogs({
        page: currentPage,
        limit: logsPerPage,
        search: searchTerm,
        action: filterAction,
        user: filterUser,
        severity: filterSeverity,
        status: filterStatus,
        dateFrom: dateRange.from,
        dateTo: dateRange.to
      });
      setLogs(result.logs);
      setTotalLogs(result.total);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const logStats = await ActivityLogsService.getActivityStats();
      setStats(logStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const refreshLogs = () => {
    fetchLogs();
    fetchStats();
  };

  const exportLogs = async () => {
    try {
      const filters = {
        search: searchTerm,
        action: filterAction,
        user: filterUser,
        severity: filterSeverity,
        status: filterStatus,
        dateFrom: dateRange.from,
        dateTo: dateRange.to
      };
      
      await ActivityLogsService.exportActivityLogs(filters);
    } catch (error) {
      console.error('Error exporting logs:', error);
      alert('حدث خطأ في تصدير السجلات');
    }
  };

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'create': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'update': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'delete': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'login': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200';
      case 'logout': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
      case 'view': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'export': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
      case 'system': return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'failed': return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      case 'pending': return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      default: return <InformationCircleIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      'user_created': 'إنشاء مستخدم',
      'user_updated': 'تحديث مستخدم',
      'user_deleted': 'حذف مستخدم',
      'course_created': 'إنشاء دورة',
      'course_updated': 'تحديث دورة',
      'course_deleted': 'حذف دورة',
      'notification_sent': 'إرسال إشعار',
      'settings_updated': 'تحديث الإعدادات',
      'login_attempt': 'محاولة تسجيل دخول',
      'logout': 'تسجيل خروج',
      'password_reset': 'إعادة تعيين كلمة المرور',
      'export_data': 'تصدير البيانات',
      'system_backup': 'نسخ احتياطي للنظام',
      'system_maintenance': 'صيانة النظام'
    };
    return labels[action] || action;
  };

  const totalPages = Math.ceil(totalLogs / logsPerPage);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">سجلات النشاط</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">مراقبة وتتبع جميع أنشطة النظام والمستخدمين</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshLogs}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            تحديث
          </button>
          <button
            onClick={exportLogs}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ClipboardDocumentListIcon className="h-4 w-4" />
            تصدير السجلات
          </button>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي السجلات</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalLogs}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <ClipboardDocumentListIcon />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">اليوم</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.todayLogs}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <ClockIcon />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">العمليات الناجحة</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.successfulActions}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircleIcon />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">العمليات الفاشلة</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.failedActions}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <ExclamationTriangleIcon />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">الأحداث الحرجة</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.criticalEvents}</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <ExclamationTriangleIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-lg shadow-sm border mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} dark:bg-gray-800 dark:border-gray-700`}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <div className="relative">
            <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="البحث في السجلات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">كل الإجراءات</option>
            <option value="create">إنشاء</option>
            <option value="update">تحديث</option>
            <option value="delete">حذف</option>
            <option value="login">تسجيل دخول</option>
            <option value="logout">تسجيل خروج</option>
            <option value="view">عرض</option>
            <option value="export">تصدير</option>
          </select>

          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">كل المستخدمين</option>
            <option value="admin">المديرون</option>
            <option value="teacher">المدرسون</option>
            <option value="student">الطلاب</option>
            <option value="system">النظام</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">كل المستويات</option>
            <option value="critical">حرج</option>
            <option value="high">عالي</option>
            <option value="medium">متوسط</option>
            <option value="low">منخفض</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">كل الحالات</option>
            <option value="success">نجح</option>
            <option value="failed">فشل</option>
            <option value="pending">معلق</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className={`rounded-lg shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} dark:bg-gray-800 dark:border-gray-700`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} dark:bg-gray-700>
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الوقت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المستخدم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراء
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المستوى
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التفاصيل
                </th>
              </tr>
            </thead>
            <tbody className={`${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} dark:bg-gray-800 dark:divide-gray-700`}>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    جاري التحميل...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    لا توجد سجلات
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className={`${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} dark:hover:bg-gray-700`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {log.user_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {log.user_role}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {getActionLabel(log.action)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionTypeColor(log.action_type)} dark:text-white dark:opacity-90`}>
                        {log.action_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)} dark:text-white dark:opacity-90`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(log.status)}
                        <span className="mr-2 text-sm text-gray-900 dark:text-gray-100">
                          {log.status === 'success' && 'نجح'}
                          {log.status === 'failed' && 'فشل'}
                          {log.status === 'pending' && 'معلق'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-gray-100">
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="عرض التفاصيل"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`px-4 py-3 flex items-center justify-between border-t sm:px-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} dark:bg-gray-800 dark:border-gray-700`}>
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  عرض <span className="font-medium dark:text-gray-100">{(currentPage - 1) * logsPerPage + 1}</span> إلى{' '}
                  <span className="font-medium dark:text-gray-100">
                    {Math.min(currentPage * logsPerPage, totalLogs)}
                  </span>{' '}
                  من <span className="font-medium dark:text-gray-100">{totalLogs}</span> نتيجة
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    السابق
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage - 2 + i;
                    if (page < 1 || page > totalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    التالي
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className={`relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} dark:bg-gray-800 dark:border-gray-700`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">تفاصيل السجل</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong className="dark:text-gray-200">المستخدم:</strong> {selectedLog.user_name}
                </div>
                <div>
                  <strong className="dark:text-gray-200">الدور:</strong> {selectedLog.user_role}
                </div>
                <div>
                  <strong className="dark:text-gray-200">الإجراء:</strong> {getActionLabel(selectedLog.action)}
                </div>
                <div>
                  <strong className="dark:text-gray-200">نوع الإجراء:</strong> {selectedLog.action_type}
                </div>
                <div>
                  <strong className="dark:text-gray-200">نوع المورد:</strong> {selectedLog.resource_type}
                </div>
                <div>
                  <strong className="dark:text-gray-200">معرف المورد:</strong> {selectedLog.resource_id || 'غير محدد'}
                </div>
                <div>
                  <strong className="dark:text-gray-200">المستوى:</strong> {selectedLog.severity}
                </div>
                <div>
                  <strong className="dark:text-gray-200">الحالة:</strong> {selectedLog.status}
                </div>
                <div>
                  <strong className="dark:text-gray-200">الوقت:</strong> {formatTimestamp(selectedLog.timestamp)}
                </div>
                <div>
                  <strong className="dark:text-gray-200">عنوان IP:</strong> {selectedLog.ip_address || 'غير محدد'}
                </div>
              </div>

              {selectedLog.details && (
                <div>
                  <strong className="dark:text-gray-200">التفاصيل:</strong>
                  <pre className={`p-3 rounded mt-2 text-sm overflow-auto max-h-40 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} dark:bg-gray-700`}>
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.user_agent && (
                <div>
                  <strong className="dark:text-gray-200">المتصفح:</strong>
                  <div className={`p-2 rounded mt-1 text-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} dark:bg-gray-700`}>
                    {selectedLog.user_agent}
                  </div>
                </div>
              )}
            </div>

            <div className={`flex justify-end pt-4 border-t mt-6 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} dark:border-gray-700`}>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageActivityLogsPage;
