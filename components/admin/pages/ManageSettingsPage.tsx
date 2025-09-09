import React, { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon,
  UserGroupIcon,
  BellIcon,
  LockClosedIcon,
  DocumentTextIcon,
  SunIcon,
  MoonIcon,
  DevicePhoneMobileIcon,
  PaperAirplaneIcon,
  CheckIcon,
  ClockIcon
} from '../../Icons';
import { SettingsService } from '../../../lib/supabaseService';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  siteLanguage: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
}

interface ContactSettings {
  contactEmail: string;
  supportEmail: string;
  phoneNumber: string;
  address: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  welcomeEmailTemplate: string;
}

interface SecuritySettings {
  passwordMinLength: number;
  requireSpecialCharacters: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
}

interface ManageSettingsPageProps {
  theme: 'light' | 'dark';
}

const ManageSettingsPage: React.FC<ManageSettingsPageProps> = ({ theme }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'system' | 'contact' | 'notifications' | 'security'>('system');
  const [saved, setSaved] = useState(false);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: 'المنصة التعليمية العربية',
    siteDescription: 'منصة تعليمية شاملة لتعلم المهارات والحصول على شهادات معتمدة',
    siteLanguage: 'ar',
    timezone: 'Asia/Riyadh',
    theme: 'auto',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true
  });

  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    contactEmail: 'info@educational-platform.com',
    supportEmail: 'support@educational-platform.com',
    phoneNumber: '+966 50 123 4567',
    address: 'المملكة العربية السعودية، الرياض'
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    welcomeEmailTemplate: 'مرحباً بك في المنصة التعليمية! نتمنى لك تجربة تعليمية ممتعة ومفيدة.'
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    passwordMinLength: 8,
    requireSpecialCharacters: true,
    sessionTimeout: 24,
    maxLoginAttempts: 5
  });

  const stats = {
    totalSettings: 20,
    lastUpdated: '2024-01-15',
    systemStatus: 'متصل',
    activeUsers: 1245
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await SettingsService.getAllSettings();
      
      if (settings.system) setSystemSettings({ ...systemSettings, ...settings.system });
      if (settings.contact) setContactSettings({ ...contactSettings, ...settings.contact });
      if (settings.notifications) setNotificationSettings({ ...notificationSettings, ...settings.notifications });
      if (settings.security) setSecuritySettings({ ...securitySettings, ...settings.security });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const allSettings = {
        system: systemSettings,
        contact: contactSettings,
        notifications: notificationSettings,
        security: securitySettings
      };

      const success = await SettingsService.updateSettings(activeTab, allSettings[activeTab]);
      
      if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('حدث خطأ في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">اسم الموقع</label>
          <input
            type="text"
            value={systemSettings.siteName}
            onChange={(e) => setSystemSettings({ ...systemSettings, siteName: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">اللغة الافتراضية</label>
          <select
            value={systemSettings.siteLanguage}
            onChange={(e) => setSystemSettings({ ...systemSettings, siteLanguage: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">المنطقة الزمنية</label>
          <select
            value={systemSettings.timezone}
            onChange={(e) => setSystemSettings({ ...systemSettings, timezone: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
          >
            <option value="Asia/Riyadh">آسيا/الرياض</option>
            <option value="Asia/Dubai">آسيا/دبي</option>
            <option value="Africa/Cairo">أفريقيا/القاهرة</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">المظهر</label>
          <select
            value={systemSettings.theme}
            onChange={(e) => setSystemSettings({ ...systemSettings, theme: e.target.value as any })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
          >
            <option value="light">فاتح</option>
            <option value="dark">داكن</option>
            <option value="auto">تلقائي</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">وصف الموقع</label>
        <textarea
          value={systemSettings.siteDescription}
          onChange={(e) => setSystemSettings({ ...systemSettings, siteDescription: e.target.value })}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="maintenanceMode"
            checked={systemSettings.maintenanceMode}
            onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
          />
          <label htmlFor="maintenanceMode" className="mr-2 block text-sm text-gray-900">
            وضع الصيانة
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="registrationEnabled"
            checked={systemSettings.registrationEnabled}
            onChange={(e) => setSystemSettings({ ...systemSettings, registrationEnabled: e.target.checked })}
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
          />
          <label htmlFor="registrationEnabled" className="mr-2 block text-sm text-gray-900">
            تفعيل التسجيل الجديد
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="emailVerificationRequired"
            checked={systemSettings.emailVerificationRequired}
            onChange={(e) => setSystemSettings({ ...systemSettings, emailVerificationRequired: e.target.checked })}
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
          />
          <label htmlFor="emailVerificationRequired" className="mr-2 block text-sm text-gray-900">
            تأكيد البريد الإلكتروني مطلوب
          </label>
        </div>
      </div>
    </div>
  );

  const renderContactSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني للتواصل</label>
          <input
            type="email"
            value={contactSettings.contactEmail}
            onChange={(e) => setContactSettings({ ...contactSettings, contactEmail: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني للدعم الفني</label>
          <input
            type="email"
            value={contactSettings.supportEmail}
            onChange={(e) => setContactSettings({ ...contactSettings, supportEmail: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
          <input
            type="tel"
            value={contactSettings.phoneNumber}
            onChange={(e) => setContactSettings({ ...contactSettings, phoneNumber: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
        <textarea
          value={contactSettings.address}
          onChange={(e) => setContactSettings({ ...contactSettings, address: e.target.value })}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">أنواع الإشعارات</h4>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={notificationSettings.emailNotifications}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
              className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
            />
            <label htmlFor="emailNotifications" className="mr-2 block text-sm text-gray-900">
              إشعارات البريد الإلكتروني
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="smsNotifications"
              checked={notificationSettings.smsNotifications}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
              className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
            />
            <label htmlFor="smsNotifications" className="mr-2 block text-sm text-gray-900">
              إشعارات الرسائل النصية
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="pushNotifications"
              checked={notificationSettings.pushNotifications}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
              className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
            />
            <label htmlFor="pushNotifications" className="mr-2 block text-sm text-gray-900">
              الإشعارات الفورية
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">رسالة الترحيب</label>
        <textarea
          value={notificationSettings.welcomeEmailTemplate}
          onChange={(e) => setNotificationSettings({ ...notificationSettings, welcomeEmailTemplate: e.target.value })}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
        />
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى لطول كلمة المرور</label>
          <input
            type="number"
            value={securitySettings.passwordMinLength}
            onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
            min="6"
            max="20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">مهلة انتهاء الجلسة (ساعات)</label>
          <input
            type="number"
            value={securitySettings.sessionTimeout}
            onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
            min="1"
            max="168"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأقصى لمحاولات تسجيل الدخول</label>
          <input
            type="number"
            value={securitySettings.maxLoginAttempts}
            onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
            min="3"
            max="10"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="requireSpecialCharacters"
            checked={securitySettings.requireSpecialCharacters}
            onChange={(e) => setSecuritySettings({ ...securitySettings, requireSpecialCharacters: e.target.checked })}
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
          />
          <label htmlFor="requireSpecialCharacters" className="mr-2 block text-sm text-gray-900">
            طلب أحرف خاصة في كلمة المرور
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">الإعدادات العامة</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">إدارة وتخصيص إعدادات المنصة</p>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي الإعدادات</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalSettings}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Cog6ToothIcon />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">المستخدمون النشطون</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.activeUsers}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <UserGroupIcon />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">حالة النظام</p>
              <p className="text-xl font-bold text-green-600">{stats.systemStatus}</p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
              <CheckIcon />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">آخر تحديث</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{stats.lastUpdated}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <ClockIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className={`rounded-lg shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('system')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'system'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Cog6ToothIcon className="inline h-4 w-4 ml-2" />
              إعدادات النظام
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contact'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DevicePhoneMobileIcon className="inline h-4 w-4 ml-2" />
              معلومات التواصل
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BellIcon className="inline h-4 w-4 ml-2" />
              الإشعارات
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <LockClosedIcon className="inline h-4 w-4 ml-2" />
              الأمان
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">جاري التحميل...</div>
            </div>
          ) : (
            <>
              {activeTab === 'system' && renderSystemSettings()}
              {activeTab === 'contact' && renderContactSettings()}
              {activeTab === 'notifications' && renderNotificationSettings()}
              {activeTab === 'security' && renderSecuritySettings()}
            </>
          )}

          {/* Save Button */}
          <div className={`flex justify-end space-x-4 pt-6 border-t mt-6 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={saveSettings}
              disabled={saving}
              className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${
                saving
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : saved
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                  جاري الحفظ...
                </>
              ) : saved ? (
                <>
                  <CheckIcon className="h-4 w-4 ml-2" />
                  تم الحفظ
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSettingsPage;
