import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, PencilIcon, TrashIcon, UserPlusIcon, EyeIcon, KeyIcon, CalendarIcon } from '../../Icons';
import { StudentService, ActivityLogsService } from '../../../lib/supabaseService';
import { ToastContainer, useToast } from '../../ToastNotification';
import type { Student } from '../../../types';
import type { AdminRole } from '../../../lib/adminPermissions';

interface ExtendedStudent extends Student {
  full_name?: string;
  phone?: string;
  parent_phone?: string;
  date_of_birth?: string;
  country?: string;
  city?: string;
  education_level?: string;
  bio?: string;
  profile_image_url?: string;
  enrollment_date?: string;
  last_activity?: string;
  total_courses?: number;
  completed_courses?: number[] | null;
  study_hours?: number;
  account_expires_at?: string;
}

interface StudentFormData {
  name: string;
  phone: string;
  parent_phone: string;
  email: string;
  password: string;
  account_expires_at: string;
  status: 'active' | 'suspended' | 'pending' | 'inactive';
}

// Enhanced Student Modal with comprehensive form
const StudentModal: React.FC<{ 
  student: Partial<ExtendedStudent> | null; 
  onClose: () => void; 
  onSave: (student: StudentFormData) => void; 
}> = ({ student, onClose, onSave }) => {
    if (!student) return null;

    const [formData, setFormData] = useState<StudentFormData>({
        name: student.name || student.full_name || '',
        phone: student.phone || '',
        parent_phone: student.parent_phone || '',
        email: student.email || '',
        password: '',
        account_expires_at: student.account_expires_at || '',
        status: student.status || 'active'
    });
    
    const [loading, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isNew = !student.id;

    // Generate email automatically based on name
    const generateEmail = (name: string) => {
        if (!name.trim()) return '';
        
        // Convert Arabic name to English transliteration
        const nameMap: { [key: string]: string } = {
            'أ': 'a', 'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
            'د': 'd', 'ذ': 'th', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd',
            'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l',
            'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y', 'ة': 'h', 'ئ': 'e', 'ؤ': 'o',
            'إ': 'i', 'آ': 'a'
        };
        
        let englishName = name.toLowerCase();
        
        // Replace Arabic characters with English equivalents
        for (const [arabic, english] of Object.entries(nameMap)) {
            englishName = englishName.replace(new RegExp(arabic, 'g'), english);
        }
        
        // Clean up and format
        englishName = englishName
            .replace(/[^a-z\s]/g, '') // Remove non-English characters
            .replace(/\s+/g, '.') // Replace spaces with dots
            .replace(/\.+/g, '.') // Remove multiple dots
            .replace(/^\.|\.$/, ''); // Remove leading/trailing dots
        
        return `${englishName}@kareem.com`;
    };

    // Generate secure password
    const generatePassword = () => {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';
        
        let password = '';
        
        // Ensure at least one character from each type
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        
        // Fill remaining 6 characters
        const allChars = lowercase + uppercase + numbers + symbols;
        for (let i = 4; i < 10; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Auto-generate email when name changes
        if (name === 'name' && isNew) {
            const newEmail = generateEmail(value);
            setFormData(prev => ({
                ...prev,
                email: newEmail
            }));
        }
    };

    const handleGeneratePassword = () => {
        const newPassword = generatePassword();
        setFormData(prev => ({
            ...prev,
            password: newPassword
        }));
        setShowPassword(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            alert('يرجى إدخال اسم الطالب');
            return;
        }
        
        if (!formData.email.trim()) {
            alert('يرجى إدخال البريد الإلكتروني');
            return;
        }
        
        if (isNew && !formData.password.trim()) {
            alert('يرجى إدخال أو توليد كلمة مرور');
            return;
        }
        
        setSaving(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error('Error saving student:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl animate-fade-in-up max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{isNew ? 'إضافة طالب جديد' : 'تعديل بيانات الطالب'}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">{isNew ? 'أدخل بيانات الطالب الجديد لإنشاء حساب فعال' : 'تعديل بيانات الطالب المحفوظة'}</p>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* الاسم الكامل */}
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">الاسم الكامل *</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                required 
                                placeholder="مثال: أحمد محمد علي"
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" 
                            />
                        </div>

                        {/* أرقام الهاتف */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">رقم هاتف الطالب *</label>
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    value={formData.phone} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="05xxxxxxxx"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" 
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">رقم هاتف ولي الأمر *</label>
                                <input 
                                    type="tel" 
                                    name="parent_phone" 
                                    value={formData.parent_phone} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="05xxxxxxxx"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" 
                                />
                            </div>
                        </div>

                        {/* البريد الإلكتروني */}
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">البريد الإلكتروني *</label>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="سيتم توليده تلقائياً من الاسم"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" 
                                />
                                {isNew && (
                                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        💡 يتم توليد البريد تلقائياً بصيغة: اسم.الطالب@kareem.com
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* كلمة المرور (للطلاب الجدد فقط) */}
                        {isNew && (
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">كلمة المرور *</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="password" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="أدخل كلمة مرور أو استخدم التوليد التلقائي"
                                        className="w-full p-3 pr-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <EyeIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <button
                                        type="button"
                                        onClick={handleGeneratePassword}
                                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                                    >
                                        <KeyIcon className="h-4 w-4" />
                                        توليد كلمة مرور آمنة
                                    </button>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        10 أحرف (كبيرة + صغيرة + أرقام + رموز)
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* تاريخ انتهاء الحساب */}
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">تاريخ انتهاء صلاحية الحساب</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    name="account_expires_at" 
                                    value={formData.account_expires_at} 
                                    onChange={handleChange} 
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" 
                                />
                                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                اتركه فارغاً إذا كنت لا تريد تحديد تاريخ انتهاء
                            </div>
                        </div>

                        {/* حالة الحساب */}
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">حالة الحساب *</label>
                            <select 
                                name="status" 
                                value={formData.status} 
                                onChange={handleChange} 
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                            >
                                <option value="active">نشط - يمكن للطالب تسجيل الدخول</option>
                                <option value="pending">معلق - في انتظار التفعيل</option>
                                <option value="inactive">غير نشط - تم إيقاف الحساب مؤقتاً</option>
                                <option value="suspended">محظور - تم حظر الحساب</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4 rounded-b-2xl">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={loading}
                            className="px-6 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                        >
                            إلغاء
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    {isNew ? 'إنشاء الطالب' : 'حفظ التغييرات'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ManageStudentsPage: React.FC<{adminRole: AdminRole}> = ({ adminRole }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Partial<ExtendedStudent> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalStudents, setTotalStudents] = useState(0);
    const { toasts, showSuccess, showError, showWarning, hideToast } = useToast();
    
    const studentsPerPage = 20;

    // Load students from Supabase
    useEffect(() => {
        fetchStudents();
    }, [currentPage, searchTerm]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const result = await StudentService.getStudents({
                page: currentPage,
                limit: studentsPerPage,
                search: searchTerm,
                sortBy: 'enrollment_date',
                sortOrder: 'desc'
            });
            setStudents(result.students);
            setTotalStudents(result.total);
        } catch (error) {
            console.error('Error fetching students:', error);
            showError('خطأ في تحميل البيانات', 'فشل في تحميل قائمة الطلاب');
        } finally {
            setLoading(false);
        }
    };
    
    const handleOpenModal = (student: Student | null = null) => {
        if (student) {
            setEditingStudent({
                ...student,
                full_name: student.name,
                phone: student.phone || '',
                parent_phone: student.parent_phone || '',
                account_expires_at: student.account_expires_at || ''
            });
        } else {
            setEditingStudent({
                name: '',
                email: '',
                status: 'active',
                phone: '',
                parent_phone: '',
                account_expires_at: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStudent(null);
    };

    const handleSaveStudent = async (studentData: StudentFormData) => {
        try {
            if (editingStudent?.id) {
                // Update existing student
                const updateResult = await StudentService.updateStudent(editingStudent.id, {
                    name: studentData.name,
                    email: studentData.email,
                    phone: studentData.phone,
                    parent_phone: studentData.parent_phone,
                    status: studentData.status,
                    account_expires_at: studentData.account_expires_at || undefined
                });
                
                // إظهار رسالة نجاح
                showSuccess('تم التحديث بنجاح', `تم تحديث بيانات الطالب ${studentData.name} بنجاح`);
                
                // تحديث حالة الطلاب مباشرة في الـ state بدلاً من الانتظار لإعادة التحميل الكاملة
                setStudents(prevStudents => 
                    prevStudents.map(student => 
                        student.id === editingStudent.id ? updateResult : student
                    )
                );
            } else {
                // Create new student with real authentication
                const newStudent = await StudentService.createStudent({
                    name: studentData.name,
                    phone: studentData.phone,
                    parent_phone: studentData.parent_phone,
                    email: studentData.email,
                    password: studentData.password,
                    account_expires_at: studentData.account_expires_at || undefined,
                    status: studentData.status
                });
                showSuccess('تم إنشاء الطالب بنجاح', `تم إنشاء حساب الطالب ${studentData.name} بنجاح. يمكنه الآن تسجيل الدخول باستخدام بريده وكلمة المرور.`);
                
                // إضافة الطالب الجديد مباشرة إلى الـ state
                setStudents(prevStudents => [...prevStudents, newStudent]);
            }
            
            // إغلاق النافذة المنبثقة بعد التحديث
            handleCloseModal();
        } catch (error) {
            console.error('Error saving student:', error);
            const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
            showError('فشل في حفظ بيانات الطالب', errorMessage);
        }
    };

    const handleDeleteStudent = async (id: string, studentName: string) => {
        if (window.confirm(`هل أنت متأكد من حذف الطالب "${studentName}"؟ \n\nهذا الإجراء سيحذف حساب المصادقة وجميع البيانات المرتبطة بالطالب بشكل نهائي ولا يمكن التراجع عنه.`)) {
            try {
                await StudentService.deleteStudent(id);
                showSuccess('تم الحذف بنجاح', `تم حذف الطالب "${studentName}" وجميع بياناته المرتبطة بنجاح`);
                fetchStudents(); // Refresh the list
            } catch (error) {
                console.error('Error deleting student:', error);
                const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء حذف الطالب';
                showError('فشل في حذف الطالب', errorMessage);
            }
        }
    };

    const totalPages = Math.ceil(totalStudents / studentsPerPage);

    return (
        <div className="animate-fade-in-up space-y-6">
            <ToastContainer toasts={toasts} onClose={hideToast} />
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-800 dark:text-gray-100">إدارة الطلاب</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">عرض، إضافة، وتعديل حسابات الطلاب بشكل فعال.</p>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        إجمالي الطلاب: <span className="font-semibold">{totalStudents}</span>
                    </div>
                </div>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white font-bold rounded-lg shadow-lg hover:bg-violet-700 hover:-translate-y-0.5 transform transition-all"
                >
                    <UserPlusIcon className="h-5 w-5" />
                    <span>إضافة طالب جديد</span>
                </button>
            </header>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-4 pr-12 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition"
                        />
                        <MagnifyingGlassIcon className="absolute top-1/2 right-4 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        عرض {students.length} من أصل {totalStudents} طالب
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto"></div>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">جاري تحميل بيانات الطلاب...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="border-b-2 border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">الاسم</th>
                                        <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">البريد الإلكتروني</th>
                                        <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">رقم الهاتف</th>
                                        <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">تاريخ التسجيل</th>
                                        <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">الحالة</th>
                                        <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.length > 0 ? (
                                        students.map(student => (
                                            <tr key={student.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="p-4 font-semibold text-gray-800 dark:text-gray-100">
                                                    <div>
                                                        <div>{student.name}</div>
                                                        {student.parent_phone && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">ولي الأمر: {student.parent_phone}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-600 dark:text-gray-300">{student.email}</td>
                                                <td className="p-4 text-gray-600 dark:text-gray-300">{student.phone || '-'}</td>
                                                <td className="p-4 text-gray-600 dark:text-gray-300">{new Date(student.created_at).toLocaleDateString('ar-EG')}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                        student.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                                        student.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                                        student.status === 'inactive' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300' :
                                                        'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                                    }`}>
                                                        {
                                                            student.status === 'active' ? 'نشط' :
                                                            student.status === 'pending' ? 'معلق' :
                                                            student.status === 'inactive' ? 'غير نشط' :
                                                            'محظور'
                                                        }
                                                    </span>
                                                    {student.account_expires_at && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            ينتهي: {new Date(student.account_expires_at).toLocaleDateString('ar-EG')}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleOpenModal(student)} 
                                                            className="text-gray-400 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-blue-50" 
                                                            aria-label="تعديل"
                                                            title="تعديل بيانات الطالب"
                                                        >
                                                            <PencilIcon className="w-5 h-5"/>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteStudent(student.id, student.name)} 
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50" 
                                                            aria-label="حذف"
                                                            title="حذف الطالب"
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
                                                    <UserPlusIcon className="h-16 w-16 text-gray-300" />
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">لم يتم العثور على طلاب</h3>
                                                        <p className="text-gray-500 dark:text-gray-400 mt-1">ابدأ بإضافة طلاب جدد أو تعديل معايير البحث</p>
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
                                    عرض {((currentPage - 1) * studentsPerPage) + 1} إلى {Math.min(currentPage * studentsPerPage, totalStudents)} من أصل {totalStudents} طالب
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
                    </>
                )}
            </div>
            {isModalOpen && <StudentModal student={editingStudent} onClose={handleCloseModal} onSave={handleSaveStudent} />}
        </div>
    );
};

export default ManageStudentsPage;
