import React, { useState, useEffect } from 'react';
import { 
  BookOpenIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  VideoCameraIcon,
  UsersIcon,
  FolderIcon,
  LinkIcon
} from '../../Icons';
import { CourseService, type ExtendedCourse } from '../../../lib/supabaseService';
import { SectionService, VideoService } from '../../../lib/sectionVideoService';
import type { AdminRole } from '../../../lib/adminPermissions';

interface ManageCoursesPageProps {
  adminRole: AdminRole;
}

interface SectionFormData {
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  thumbnail: string;
  featured: boolean;
}

interface VideoFormData {
  title: string;
  description: string;
  url: string;
  section_id: string;
  duration_minutes: number;
  status: 'draft' | 'published' | 'archived';
  thumbnail: string;
}

const ManageCoursesPage: React.FC<ManageCoursesPageProps> = ({ adminRole }) => {
  // State for sections
  const [sections, setSections] = useState<any[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [searchTermSection, setSearchTermSection] = useState('');
  const [statusFilterSection, setStatusFilterSection] = useState<string>('');
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<any | null>(null);
  const [currentPageSection, setCurrentPageSection] = useState(1);
  const [totalSections, setTotalSections] = useState(0);
  
  // State for videos
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [searchTermVideo, setSearchTermVideo] = useState('');
  const [statusFilterVideo, setStatusFilterVideo] = useState<string>('');
  const [sectionFilterVideo, setSectionFilterVideo] = useState<string>('');
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any | null>(null);
  const [currentPageVideo, setCurrentPageVideo] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  
  // Stats for both sections and videos
  const [stats, setStats] = useState({
    totalSections: 0,
    publishedSections: 0,
    draftSections: 0,
    totalVideos: 0,
    publishedVideos: 0
  });

  // Active tab (sections or videos)
  const [activeTab, setActiveTab] = useState<'sections' | 'videos'>('sections');

  // Form data for sections
  const [sectionFormData, setSectionFormData] = useState<SectionFormData>({
    title: '',
    description: '',
    status: 'draft',
    thumbnail: '',
    featured: false
  });
  
  // Form data for videos
  const [videoFormData, setVideoFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    url: '',
    section_id: '',
    duration_minutes: 0,
    status: 'draft',
    thumbnail: ''
  });

  const coursesPerPage = 10;
  const categories = [
    'تطوير الويب',
    'علوم البيانات',
    'التسويق الرقمي',
    'التصميم',
    'إدارة المشاريع',
    'الأمن السيبراني'
  ];

  const levels = [
    { value: 'beginner', label: 'مبتدئ' },
    { value: 'intermediate', label: 'متوسط' },
    { value: 'advanced', label: 'متقدم' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'مسودة', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    { value: 'published', label: 'منشور', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { value: 'archived', label: 'مؤرشف', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' }
  ];

  // Fetch sections data
  const fetchSections = async () => {
    try {
      setLoadingSections(true);
      const params = {
        page: currentPageSection,
        limit: coursesPerPage,
        search: searchTermSection || undefined,
        status: statusFilterSection || undefined
      };
      
      // Temporary mock data until database tables are created
      const mockSections = [
        {
          id: '1',
          title: 'مقدمة في البرمجة',
          description: 'تعلم أساسيات البرمجة والمفاهيم الأساسية',
          thumbnail: 'https://via.placeholder.com/300',
          status: 'published',
          featured: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          video_count: 5
        },
        {
          id: '2',
          title: 'تطوير تطبيقات الويب',
          description: 'تعلم كيفية بناء تطبيقات الويب الحديثة',
          thumbnail: 'https://via.placeholder.com/300',
          status: 'draft',
          featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          video_count: 3
        }
      ];
      
      try {
        const response = await SectionService.getSections(params);
        if (response && response.sections) {
          setSections(response.sections);
          setTotalSections(response.total);
        } else {
          throw new Error('No sections data returned');
        }
      } catch (e) {
        console.log('Using mock data for sections:', e);
        setSections(mockSections);
        setTotalSections(mockSections.length);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      // Ensure mock data is used even if outer try-catch fails
      const mockSections = [
        {
          id: '1',
          title: 'مقدمة في البرمجة',
          description: 'تعلم أساسيات البرمجة والمفاهيم الأساسية',
          thumbnail: 'https://via.placeholder.com/300',
          status: 'published',
          featured: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          video_count: 5
        },
        {
          id: '2',
          title: 'تطوير تطبيقات الويب',
          description: 'تعلم كيفية بناء تطبيقات الويب الحديثة',
          thumbnail: 'https://via.placeholder.com/300',
          status: 'draft',
          featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          video_count: 3
        }
      ];
      setSections(mockSections);
      setTotalSections(mockSections.length);
    } finally {
      setLoadingSections(false);
    }
  };

  // Fetch videos data
  const fetchVideos = async () => {
    try {
      setLoadingVideos(true);
      const params = {
        page: currentPageVideo,
        limit: coursesPerPage,
        search: searchTermVideo || undefined,
        status: statusFilterVideo || undefined,
        section_id: sectionFilterVideo || undefined
      };
      
      // Temporary mock data until database tables are created
      const mockVideos = [
        {
          id: '1',
          title: 'مقدمة في لغة JavaScript',
          description: 'تعلم أساسيات لغة JavaScript',
          url: 'https://www.youtube.com/watch?v=example1',
          section_id: '1',
          duration_minutes: 15,
          thumbnail: 'https://via.placeholder.com/300',
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sections: { title: 'مقدمة في البرمجة' }
        },
        {
          id: '2',
          title: 'العمل مع المصفوفات في JavaScript',
          description: 'تعلم كيفية استخدام المصفوفات في JavaScript',
          url: 'https://www.youtube.com/watch?v=example2',
          section_id: '1',
          duration_minutes: 20,
          thumbnail: 'https://via.placeholder.com/300',
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sections: { title: 'مقدمة في البرمجة' }
        },
        {
          id: '3',
          title: 'مقدمة في React.js',
          description: 'تعلم أساسيات مكتبة React.js',
          url: 'https://www.youtube.com/watch?v=example3',
          section_id: '2',
          duration_minutes: 25,
          thumbnail: 'https://via.placeholder.com/300',
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sections: { title: 'تطوير تطبيقات الويب' }
        }
      ];
      
      try {
        const response = await VideoService.getVideos(params);
        if (response && response.videos) {
          setVideos(response.videos);
          setTotalVideos(response.total);
        } else {
          throw new Error('No videos data returned');
        }
      } catch (e) {
        console.log('Using mock data for videos:', e);
        // Filter videos based on section_id if provided
        let filteredVideos = mockVideos;
        if (sectionFilterVideo) {
          filteredVideos = mockVideos.filter(video => video.section_id === sectionFilterVideo);
        }
        setVideos(filteredVideos);
        setTotalVideos(filteredVideos.length);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      // Ensure mock data is used even if outer try-catch fails
      const mockVideos = [
        {
          id: '1',
          title: 'مقدمة في لغة JavaScript',
          description: 'تعلم أساسيات لغة JavaScript',
          url: 'https://www.youtube.com/watch?v=example1',
          section_id: '1',
          duration_minutes: 15,
          thumbnail: 'https://via.placeholder.com/300',
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sections: { title: 'مقدمة في البرمجة' }
        },
        {
          id: '2',
          title: 'العمل مع المصفوفات في JavaScript',
          description: 'تعلم كيفية استخدام المصفوفات في JavaScript',
          url: 'https://www.youtube.com/watch?v=example2',
          section_id: '1',
          duration_minutes: 20,
          thumbnail: 'https://via.placeholder.com/300',
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sections: { title: 'مقدمة في البرمجة' }
        },
        {
          id: '3',
          title: 'مقدمة في React.js',
          description: 'تعلم أساسيات مكتبة React.js',
          url: 'https://www.youtube.com/watch?v=example3',
          section_id: '2',
          duration_minutes: 25,
          thumbnail: 'https://via.placeholder.com/300',
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sections: { title: 'تطوير تطبيقات الويب' }
        }
      ];
      // Filter videos based on section_id if provided
      let filteredVideos = mockVideos;
      if (sectionFilterVideo) {
        filteredVideos = mockVideos.filter(video => video.section_id === sectionFilterVideo);
      }
      setVideos(filteredVideos);
      setTotalVideos(filteredVideos.length);
    } finally {
      setLoadingVideos(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      // Temporary mock data for stats
      const mockStats = {
        totalSections: 2,
        totalVideos: 3,
        publishedSections: 1,
        publishedVideos: 2,
        featuredSections: 1,
        totalDuration: 60 // minutes
      };
      
      try {
        const statsData = await SectionService.getStats();
        if (statsData) {
          setStats(statsData);
        } else {
          throw new Error('No stats data returned');
        }
      } catch (e) {
        console.log('Using mock data for stats:', e);
        setStats(mockStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Ensure mock data is used even if outer try-catch fails
      const mockStats = {
        totalSections: 2,
        totalVideos: 3,
        publishedSections: 1,
        publishedVideos: 2,
        featuredSections: 1,
        totalDuration: 60 // minutes
      };
      setStats(mockStats);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchStats();
  }, [currentPageSection, searchTermSection, statusFilterSection]);

  useEffect(() => {
    fetchVideos();
  }, [currentPageVideo, searchTermVideo, statusFilterVideo, sectionFilterVideo]);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      level: 'beginner',
      duration_hours: 0,
      price: 0,
      is_free: true,
      status: 'draft',
      thumbnail: '',
      featured: false
    });
    setEditingCourse(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        console.log('Update course:', formData);
      } else {
        console.log('Create course:', formData);
      }
      
      setShowAddModal(false);
      resetForm();
      fetchCourses();
      fetchCourseStats();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  // Handle section submission
  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSection) {
        await SectionService.updateSection(editingSection.id, sectionFormData);
        toast.success('تم تحديث القسم بنجاح');
      } else {
        await SectionService.createSection(sectionFormData);
        toast.success('تم إضافة القسم بنجاح');
      }
      
      setShowAddSectionModal(false);
      fetchSections();
      fetchStats();
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('حدث خطأ أثناء حفظ القسم');
    }
  };

  // Handle video submission
  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVideo) {
        await VideoService.updateVideo(editingVideo.id, videoFormData);
        toast.success('تم تحديث الفيديو بنجاح');
      } else {
        await VideoService.createVideo(videoFormData);
        toast.success('تم إضافة الفيديو بنجاح');
      }
      
      setShowAddVideoModal(false);
      fetchVideos();
      fetchStats();
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('حدث خطأ أثناء حفظ الفيديو');
    }
  };

  // Handle delete section
  const handleDeleteSection = async (sectionId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الفيديوهات المرتبطة به.')) {
      try {
        await SectionService.deleteSection(sectionId);
        toast.success('تم حذف القسم بنجاح');
        fetchSections();
        fetchVideos();
        fetchStats();
      } catch (error) {
        console.error('Error deleting section:', error);
        toast.error('حدث خطأ أثناء حذف القسم');
      }
    }
  };

  // Handle delete video
  const handleDeleteVideo = async (videoId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
      try {
        await VideoService.deleteVideo(videoId);
        toast.success('تم حذف الفيديو بنجاح');
        fetchVideos();
        fetchStats();
      } catch (error) {
        console.error('Error deleting video:', error);
        toast.error('حدث خطأ أثناء حذف الفيديو');
      }
    }
  };

  const totalPages = Math.ceil((activeTab === 'sections' ? totalSections : totalVideos) / coursesPerPage);

  // Stats cards component
  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = 
    ({ title, value, icon, color }) => (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            {icon}
          </div>
        </div>
      </div>
    );

  // Course row component
  const CourseRow: React.FC<{ course: ExtendedCourse }> = ({ course }) => {
    const statusConfig = statusOptions.find(s => s.value === course.status);
    
    return (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <img 
              src={course.thumbnail || 'https://via.placeholder.com/48'} 
              alt={course.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="mr-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {course.title}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {course.category}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig?.color}`}>
            {statusConfig?.label}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          {course.total_students}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          {course.is_free ? 'مجاني' : `${course.price} ريال`}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
          {course.duration_hours} ساعة
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-2 space-x-reverse">
            <button
              onClick={() => handleEdit(course)}
              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
              title="تعديل"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(course.id)}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              title="حذف"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">الأقسام والفيديوهات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">إدارة الأقسام التعليمية والفيديوهات الخارجية</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setSectionFormData({
                title: '',
                description: '',
                status: 'draft',
                thumbnail: '',
                featured: false
              });
              setEditingSection(null);
              setShowAddSectionModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <FolderIcon className="w-4 h-4" />
            إضافة قسم جديد
          </button>
          <button
            onClick={() => {
              setVideoFormData({
                title: '',
                description: '',
                url: '',
                section_id: '',
                duration_minutes: 0,
                status: 'draft',
                thumbnail: ''
              });
              setEditingVideo(null);
              setShowAddVideoModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <VideoCameraIcon className="w-4 h-4" />
            إضافة فيديو جديد
          </button>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'sections' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('sections')}
        >
          <div className="flex items-center gap-2">
            <FolderIcon className="w-5 h-5" />
            الأقسام
          </div>
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'videos' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('videos')}
        >
          <div className="flex items-center gap-2">
            <VideoCameraIcon className="w-5 h-5" />
            الفيديوهات
          </div>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeTab === 'sections' ? (
          <>
            <StatCard
              title="إجمالي الأقسام"
              value={stats.totalSections}
              icon={<FolderIcon />}
              color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
            />
            <StatCard
              title="الأقسام المنشورة"
              value={stats.publishedSections}
              icon={<VideoCameraIcon />}
              color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
            />
            <StatCard
              title="الأقسام المسودة"
              value={stats.draftSections}
              icon={<PencilIcon />}
              color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
            />
            <StatCard
              title="إجمالي الفيديوهات"
              value={stats.totalVideos}
              icon={<UsersIcon />}
              color="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
            />
          </>
        ) : (
          <>
            <StatCard
              title="إجمالي الفيديوهات"
              value={stats.totalVideos}
              icon={<VideoCameraIcon />}
              color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
            />
            <StatCard
              title="الفيديوهات المنشورة"
              value={stats.publishedVideos}
              icon={<PencilIcon />}
              color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
            />
            <StatCard
              title="إجمالي الأقسام"
              value={stats.totalSections}
              icon={<FolderIcon />}
              color="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {activeTab === 'sections' ? (
            <>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="البحث في الأقسام..."
                  value={searchTermSection}
                  onChange={(e) => setSearchTermSection(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={statusFilterSection}
                onChange={(e) => setStatusFilterSection(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">جميع الحالات</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSearchTermSection('');
                  setStatusFilterSection('');
                  setCurrentPageSection(1);
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                إعادة تعيين
              </button>
            </>
          ) : (
            <>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="البحث في الفيديوهات..."
                  value={searchTermVideo}
                  onChange={(e) => setSearchTermVideo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={statusFilterVideo}
                onChange={(e) => setStatusFilterVideo(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">جميع الحالات</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>

              <select
                value={sectionFilterVideo}
                onChange={(e) => setSectionFilterVideo(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">جميع الأقسام</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>{section.title}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSearchTermVideo('');
                  setStatusFilterVideo('');
                  setSectionFilterVideo('');
                  setCurrentPageVideo(1);
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                إعادة تعيين
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sections and Videos Tables */}
      {activeTab === 'sections' ? (
        // Sections Table
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    القسم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    عدد الفيديوهات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    مميز
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loadingSections ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="mr-2 text-gray-600 dark:text-gray-400">جاري التحميل...</span>
                      </div>
                    </td>
                  </tr>
                ) : sections.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      لا توجد أقسام متاحة
                    </td>
                  </tr>
                ) : (
                  sections.map((section) => (
                    <tr key={section.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            src={section.thumbnail || 'https://via.placeholder.com/48'} 
                            alt={section.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {section.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {section.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {section.video_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusOptions.find(s => s.value === section.status)?.color}`}>
                          {statusOptions.find(s => s.value === section.status)?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {section.featured ? 'نعم' : 'لا'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2 space-x-reverse">
                          <button
                            onClick={() => {
                              setEditingSection(section);
                              setSectionFormData({
                                title: section.title,
                                description: section.description,
                                status: section.status,
                                thumbnail: section.thumbnail,
                                featured: section.featured
                              });
                              setShowAddSectionModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="تعديل"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="حذف"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination for Sections */}
          {totalSections > coursesPerPage && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  عرض {((currentPageSection - 1) * coursesPerPage) + 1} إلى {Math.min(currentPageSection * coursesPerPage, totalSections)} من {totalSections} قسم
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => setCurrentPageSection(prev => Math.max(prev - 1, 1))}
                    disabled={currentPageSection === 1}
                    className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    السابق
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    صفحة {currentPageSection} من {Math.ceil(totalSections / coursesPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPageSection(prev => Math.min(prev + 1, Math.ceil(totalSections / coursesPerPage)))}
                    disabled={currentPageSection === Math.ceil(totalSections / coursesPerPage)}
                    className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    التالي
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Videos Table
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الفيديو
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    القسم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    المدة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الرابط
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loadingVideos ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="mr-2 text-gray-600 dark:text-gray-400">جاري التحميل...</span>
                      </div>
                    </td>
                  </tr>
                ) : videos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      لا توجد فيديوهات متاحة
                    </td>
                  </tr>
                ) : (
                  videos.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            src={video.thumbnail || 'https://via.placeholder.com/48'} 
                            alt={video.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {video.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {video.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {sections.find(s => s.id === video.section_id)?.title || 'غير محدد'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {video.duration_minutes} دقيقة
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                          <LinkIcon className="w-4 h-4 ml-1" />
                          فتح الرابط
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusOptions.find(s => s.value === video.status)?.color}`}>
                          {statusOptions.find(s => s.value === video.status)?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2 space-x-reverse">
                          <button
                            onClick={() => {
                              setEditingVideo(video);
                              setVideoFormData({
                                title: video.title,
                                description: video.description,
                                url: video.url,
                                section_id: video.section_id,
                                duration_minutes: video.duration_minutes,
                                status: video.status,
                                thumbnail: video.thumbnail
                              });
                              setShowAddVideoModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="تعديل"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="حذف"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination for Videos */}
          {totalVideos > coursesPerPage && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  عرض {((currentPageVideo - 1) * coursesPerPage) + 1} إلى {Math.min(currentPageVideo * coursesPerPage, totalVideos)} من {totalVideos} فيديو
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => setCurrentPageVideo(prev => Math.max(prev - 1, 1))}
                    disabled={currentPageVideo === 1}
                    className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    السابق
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    صفحة {currentPageVideo} من {Math.ceil(totalVideos / coursesPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPageVideo(prev => Math.min(prev + 1, Math.ceil(totalVideos / coursesPerPage)))}
                    disabled={currentPageVideo === Math.ceil(totalVideos / coursesPerPage)}
                    className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    التالي
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingSection ? 'تعديل القسم' : 'إضافة قسم جديد'}
              </h2>
            </div>

            <form onSubmit={handleSectionSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    عنوان القسم *
                  </label>
                  <input
                    type="text"
                    required
                    value={sectionFormData.title}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    وصف القسم *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={sectionFormData.description}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الحالة *
                  </label>
                  <select
                    required
                    value={sectionFormData.status}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رابط صورة القسم
                  </label>
                  <input
                    type="url"
                    value={sectionFormData.thumbnail}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    checked={sectionFormData.featured}
                    onChange={(e) => setSectionFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    قسم مميز
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSectionModal(false);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingSection ? 'تحديث القسم' : 'إضافة القسم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Video Modal */}
      {showAddVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingVideo ? 'تعديل الفيديو' : 'إضافة فيديو جديد'}
              </h2>
            </div>

            <form onSubmit={handleVideoSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    عنوان الفيديو *
                  </label>
                  <input
                    type="text"
                    required
                    value={videoFormData.title}
                    onChange={(e) => setVideoFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    وصف الفيديو *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={videoFormData.description}
                    onChange={(e) => setVideoFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رابط الفيديو (يوتيوب، جوجل درايف، إلخ) *
                  </label>
                  <input
                    type="url"
                    required
                    value={videoFormData.url}
                    onChange={(e) => setVideoFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    القسم *
                  </label>
                  <select
                    required
                    value={videoFormData.section_id}
                    onChange={(e) => setVideoFormData(prev => ({ ...prev, section_id: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">اختر القسم</option>
                    {sections.map(section => (
                      <option key={section.id} value={section.id}>{section.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المدة (بالدقائق) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={videoFormData.duration_minutes}
                      onChange={(e) => setVideoFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الحالة *
                    </label>
                    <select
                      required
                      value={videoFormData.status}
                      onChange={(e) => setVideoFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رابط صورة الفيديو
                  </label>
                  <input
                    type="url"
                    value={videoFormData.thumbnail}
                    onChange={(e) => setVideoFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                    placeholder="سيتم استخدام صورة مصغرة تلقائية من الفيديو إذا تركت فارغة"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddVideoModal(false);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingVideo ? 'تحديث الفيديو' : 'إضافة الفيديو'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCoursesPage;