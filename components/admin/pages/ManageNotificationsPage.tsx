import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  PaperAirplaneIcon, 
  ClockIcon, 
  UsersIcon, 
  AlertCircleIcon 
} from '../../Icons';
import { NotificationService } from '../../../lib/supabaseService';
import { Notification } from '../../../types';

const ManageNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    pending: 0,
    scheduled: 0
  });

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    target_audience: 'all' as 'all' | 'students' | 'specific',
    user_id: '',
    scheduled_at: '',
    status: 'pending' as 'pending' | 'sent' | 'scheduled'
  });

  const notificationsPerPage = 10;

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [currentPage, searchTerm, filterType, filterStatus]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const result = await NotificationService.getNotifications({
        page: currentPage,
        limit: notificationsPerPage,
        search: searchTerm,
        type: filterType,
        status: filterStatus
      });
      setNotifications(result.notifications);
      setTotalNotifications(result.total);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const notificationStats = await NotificationService.getNotificationStats();
      setStats(notificationStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNotification) {
        await NotificationService.updateNotification(editingNotification.id.toString(), formData);
      } else {
        await NotificationService.createNotification(formData);
      }
      setShowModal(false);
      setEditingNotification(null);
      resetForm();
      fetchNotifications();
      fetchStats();
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      target_audience: notification.target_audience || 'all',
      user_id: notification.user_id || '',
      scheduled_at: notification.scheduled_at || '',
      status: notification.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
      try {
        await NotificationService.deleteNotification(id.toString());
        fetchNotifications();
        fetchStats();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const handleSend = async (id: number) => {
    try {
      await NotificationService.sendNotification(id.toString());
      fetchNotifications();
      fetchStats();
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      target_audience: 'all',
      user_id: '',
      scheduled_at: '',
      status: 'pending'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100';
      case 'scheduled': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const totalPages = Math.ceil(totalNotifications / notificationsPerPage);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة الإشعارات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">إدارة وإرسال الإشعارات للطلاب بشكل فعال.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          إشعار جديد
        </button>
      </header>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي الإشعارات</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <BellIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">تم الإرسال</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.sent}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <PaperAirplaneIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">مجدولة</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.scheduled}</p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
              <ClockIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">في الانتظار</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.pending}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              <AlertCircleIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="ابحث بالعنوان أو المحتوى..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            عرض {notifications.length} من أصل {totalNotifications} إشعار
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">كل الأنواع</option>
            <option value="info">معلومات</option>
            <option value="success">نجاح</option>
            <option value="warning">تحذير</option>
            <option value="error">خطأ</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">كل الحالات</option>
            <option value="pending">في الانتظار</option>
            <option value="sent">تم الإرسال</option>
            <option value="scheduled">مجدولة</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('');
              setFilterStatus('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            إعادة تعيين
          </button>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="border-b-2 border-gray-100 dark:border-gray-700">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">العنوان</th>
                <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">النوع</th>
                <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">الحالة</th>
                <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">الجمهور المستهدف</th>
                <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">تاريخ الإنشاء</th>
                <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto"></div>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">جاري تحميل الإشعارات...</p>
                  </td>
                </tr>
              ) : notifications.length > 0 ? (
                notifications.map(notification => (
                  <tr key={notification.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-100">{notification.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {notification.message.length > 50 
                            ? notification.message.substring(0, 50) + '...'
                            : notification.message}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        notification.type === 'info' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                        notification.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                      }`}>
                        {notification.type === 'info' && 'معلومات'}
                        {notification.type === 'success' && 'نجاح'}
                        {notification.type === 'warning' && 'تحذير'}
                        {notification.type === 'error' && 'خطأ'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        notification.status === 'sent' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                        notification.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'
                      }`}>
                        {notification.status === 'pending' && 'في الانتظار'}
                        {notification.status === 'sent' && 'تم الإرسال'}
                        {notification.status === 'scheduled' && 'مجدولة'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {notification.target_audience === 'all' && 'الجميع'}
                      {notification.target_audience === 'students' && 'الطلاب'}
                      {notification.target_audience === 'specific' && 'محدد'}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {new Date(notification.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {notification.status === 'pending' && (
                          <button 
                            onClick={() => handleSend(notification.id)} 
                            className="text-gray-400 hover:text-green-500 transition-colors p-2 rounded-lg hover:bg-green-50" 
                            aria-label="إرسال"
                            title="إرسال الإشعار"
                          >
                            <PaperAirplaneIcon className="w-5 h-5"/>
                          </button>
                        )}
                        <button 
                          onClick={() => handleEdit(notification)} 
                          className="text-gray-400 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-blue-50" 
                          aria-label="تعديل"
                          title="تعديل الإشعار"
                        >
                          <PencilIcon className="w-5 h-5"/>
                        </button>
                        <button 
                          onClick={() => handleDelete(notification.id)} 
                          className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50" 
                          aria-label="حذف"
                          title="حذف الإشعار"
                        >
                          <TrashIcon className="w-5 h-5"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-4">
                      <BellIcon className="h-16 w-16 text-gray-300" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">لم يتم العثور على إشعارات</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">ابدأ بإضافة إشعارات جديدة أو تعديل معايير البحث</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              عرض {((currentPage - 1) * notificationsPerPage) + 1} إلى {Math.min(currentPage * notificationsPerPage, totalNotifications)} من أصل {totalNotifications} إشعار
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                صفحة {currentPage} من {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Notification */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl animate-fade-in-up max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingNotification ? 'تعديل الإشعار' : 'إضافة إشعار جديد'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {editingNotification ? 'تعديل بيانات الإشعار الحالي' : 'أدخل بيانات الإشعار الجديد لإرساله للطلاب'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">العنوان *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="عنوان الإشعار"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">الرسالة *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  required
                  placeholder="محتوى الرسالة"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">النوع *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  >
                    <option value="info">معلومات</option>
                    <option value="success">نجاح</option>
                    <option value="warning">تحذير</option>
                    <option value="error">خطأ</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">الجمهور المستهدف *</label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value as any })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  >
                    <option value="all">الجميع</option>
                    <option value="students">الطلاب</option>
                    <option value="specific">محدد</option>
                  </select>
                </div>
              </div>

              {formData.target_audience === 'specific' && (
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">معرف المستخدم</label>
                  <input
                    type="text"
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    placeholder="معرف المستخدم المستهدف"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">جدولة الإرسال (اختياري)</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    scheduled_at: e.target.value,
                    status: e.target.value ? 'scheduled' : 'pending'
                  })}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4 rounded-b-2xl">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingNotification(null);
                    resetForm();
                  }}
                  className="px-6 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="flex items-center gap-2 px-6 py-2 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
                >
                  {editingNotification ? 'تحديث الإشعار' : 'إضافة الإشعار'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageNotificationsPage;
