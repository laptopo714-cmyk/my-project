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
  LinkIcon,
  PlayIcon
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
  status?: 'draft' | 'published' | 'archived';
  thumbnail?: string;
  featured?: boolean;
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

  // Reset video form
  const resetVideoForm = () => {
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
  };

  // Load sections
  const loadSections = async () => {
    try {
      setLoadingSections(true);
      const data = await SectionService.getAllSections();
      setSections(data || []);
      setTotalSections(data?.length || 0);
    } catch (error) {
      console.error('Error loading sections:', error);
      // Show user-friendly error message
      alert('حدث خطأ في تحميل الأقسام. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoadingSections(false);
    }
  };

  // Load videos
  const loadVideos = async () => {
    try {
      setLoadingVideos(true);
      const data = await VideoService.getVideos();
      setVideos(data || []);
      setTotalVideos(data?.length || 0);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const sectionsData = await SectionService.getSections({ page: 1, limit: 1000 });
      const videosData = await VideoService.getVideos({ page: 1, limit: 1000 });
      
      setStats({
        totalSections: sectionsData?.sections?.length || 0,
        publishedSections: sectionsData?.sections?.filter(s => s.status === 'published')?.length || 0,
        draftSections: sectionsData?.sections?.filter(s => s.status === 'draft')?.length || 0,
        totalVideos: videosData?.videos?.length || 0,
        publishedVideos: videosData?.videos?.filter(v => v.status === 'published')?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Handle section form submission
  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sectionFormData.title.trim()) {
      alert('يرجى إدخال عنوان القسم');
      return;
    }

    try {
      if (editingSection) {
        // Update existing section
        await SectionService.updateSection(editingSection.id, sectionFormData);
        alert('تم تحديث القسم بنجاح');
      } else {
        // Create new section
        await SectionService.createSection(sectionFormData);
        alert('تم إنشاء القسم بنجاح');
      }
      
      // Reset form and close modal
      setSectionFormData({
        title: '',
        description: '',
        status: 'draft',
        thumbnail: '',
        featured: false
      });
      setEditingSection(null);
      setShowAddSectionModal(false);
      
      // Reload sections
      await loadSections();
      await loadStats();
    } catch (error) {
      console.error('Error saving section:', error);
      alert(`حدث خطأ في ${editingSection ? 'تحديث' : 'إنشاء'} القسم: ${error.message}`);
    }
  };

  // Handle section deletion
  const handleSectionDelete = async (sectionId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الفيديوهات المرتبطة به أيضاً.')) {
      return;
    }

    try {
      await SectionService.deleteSection(sectionId);
      alert('تم حذف القسم بنجاح');
      
      // Reload sections
      await loadSections();
      await loadStats();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert(`حدث خطأ في حذف القسم: ${error.message}`);
    }
  };

  // Handle video form submission - ENHANCED VERSION
  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!videoFormData.title.trim()) {
      alert('يرجى إدخال عنوان الفيديو');
      return;
    }

    if (!videoFormData.url.trim()) {
      alert('يرجى إدخال رابط الفيديو');
      return;
    }

    // Validate URL format
    try {
      new URL(videoFormData.url);
    } catch {
      alert('يرجى إدخال رابط صحيح للفيديو');
      return;
    }

    if (!videoFormData.section_id) {
      alert('يرجى اختيار القسم الذي ينتمي إليه الفيديو');
      return;
    }

    if (videoFormData.duration_minutes <= 0) {
      alert('يرجى إدخال مدة الفيديو بالدقائق');
      return;
    }

    try {
      let result;
      if (editingVideo) {
        // Update existing video
        result = await VideoService.updateVideo(editingVideo.id, videoFormData);
        alert('تم تحديث الفيديو بنجاح ✅');
      } else {
        // Create new video
        result = await VideoService.createVideo(videoFormData);
        alert('تم إنشاء الفيديو بنجاح ✅');
      }
      
      // Verify the video was created/updated by checking the result
      if (result && result.id) {
        console.log('Video operation successful:', result);
        
        // Reset form and close modal
        resetVideoForm();
        setShowAddVideoModal(false);
        
        // Reload videos and stats
        await loadVideos();
        await loadStats();
        
        // Show success message with video details
        const action = editingVideo ? 'تحديث' : 'إنشاء';
        alert(`تم ${action} الفيديو "${result.title}" بنجاح!\nالمعرف: ${result.id}`);
      } else {
        throw new Error('لم يتم إرجاع بيانات الفيديو من الخادم');
      }
    } catch (error) {
      console.error('Error saving video:', error);
      const action = editingVideo ? 'تحديث' : 'إنشاء';
      alert(`حدث خطأ في ${action} الفيديو: ${error.message}`);
    }
  };

  // Handle video deletion - ENHANCED VERSION
  const handleVideoDelete = async (videoId: string, videoTitle: string) => {
    if (!confirm(`هل أنت متأكد من حذف الفيديو "${videoTitle}"؟\nلا يمكن التراجع عن هذا الإجراء.`)) {
      return;
    }

    try {
      await VideoService.deleteVideo(videoId);
      alert(`تم حذف الفيديو "${videoTitle}" بنجاح ✅`);
      
      // Reload videos and stats
      await loadVideos();
      await loadStats();
    } catch (error) {
      console.error('Error deleting video:', error);
      alert(`حدث خطأ في حذف الفيديو: ${error.message}`);
    }
  };

  useEffect(() => {
    loadSections();
    loadVideos();
    loadStats();
  }, []);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">إدارة الأقسام والفيديوهات</h1>
        <p className="text-gray-600 dark:text-gray-300">إدارة محتوى الدورات التدريبية والفيديوهات التعليمية</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">إجمالي الأقسام</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalSections}</p>
            </div>
            <FolderIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">أقسام منشورة</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.publishedSections}</p>
            </div>
            <BookOpenIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">أقسام مسودة</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.draftSections}</p>
            </div>
            <PencilIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">إجمالي الفيديوهات</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalVideos}</p>
            </div>
            <VideoCameraIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">فيديوهات منشورة</p>
              <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats.publishedVideos}</p>
            </div>
            <PlayIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('sections')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sections'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <FolderIcon className="w-5 h-5 inline-block ml-2" />
              الأقسام ({stats.totalSections})
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'videos'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <VideoCameraIcon className="w-5 h-5 inline-block ml-2" />
              الفيديوهات ({stats.totalVideos})
            </button>
          </nav>
        </div>
      </div>

      {/* Sections Tab */}
      {activeTab === 'sections' && (
        <div>
          {/* Sections Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setSectionFormData({
                    title: '',
                    description: ''
                  });
                  setEditingSection(null);
                  setShowAddSectionModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <FolderIcon className="w-4 h-4" />
                إضافة قسم جديد
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="البحث في الأقسام..."
                  value={searchTermSection}
                  onChange={(e) => setSearchTermSection(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Sections List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {loadingSections ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">جاري تحميل الأقسام...</p>
              </div>
            ) : sections.length === 0 ? (
              <div className="p-8 text-center">
                <FolderIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">لا توجد أقسام متاحة</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ابدأ بإضافة قسم جديد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        القسم
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        الوصف
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        تاريخ الإنشاء
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sections.map((section) => (
                      <tr key={section.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FolderIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 ml-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {section.title}
                              </div>
                              {section.featured && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  مميز
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-gray-300 max-w-xs truncate">
                            {section.description || 'لا يوجد وصف'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            section.status === 'published' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : section.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {section.status === 'published' ? 'منشور' : section.status === 'draft' ? 'مسودة' : 'مؤرشف'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(section.created_at).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingSection(section);
                                setSectionFormData({
                                  title: section.title,
                                  description: section.description || '',
                                  status: section.status || 'draft',
                                  thumbnail: section.thumbnail || '',
                                  featured: section.featured || false
                                });
                                setShowAddSectionModal(true);
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSectionDelete(section.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <div>
          {/* Videos Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
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
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <PlayIcon className="w-4 h-4" />
                إضافة فيديو جديد
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="البحث في الفيديوهات..."
                  value={searchTermVideo}
                  onChange={(e) => setSearchTermVideo(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Videos List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {loadingVideos ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">جاري تحميل الفيديوهات...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="p-8 text-center">
                <VideoCameraIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">لا توجد فيديوهات متاحة</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ابدأ بإضافة فيديو جديد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        الفيديو
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        القسم
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        المدة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        الرابط
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        تاريخ الإنشاء
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {videos.map((video) => (
                      <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <PlayIcon className="w-5 h-5 text-green-500 dark:text-green-400 ml-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {video.title}
                              </div>
                              {video.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                  {video.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-300">
                            {video.sections?.title || 'غير محدد'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-300">
                            {video.duration_minutes ? `${video.duration_minutes} دقيقة` : 'غير محدد'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            video.status === 'published' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : video.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {video.status === 'published' ? 'منشور' : video.status === 'draft' ? 'مسودة' : 'مؤرشف'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-blue-600 dark:text-blue-400 max-w-xs truncate">
                            <a href={video.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {video.url}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(video.created_at).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingVideo(video);
                                setVideoFormData({
                                  title: video.title,
                                  description: video.description || '',
                                  url: video.url,
                                  section_id: video.section_id || '',
                                  duration_minutes: video.duration_minutes || 0,
                                  status: video.status || 'draft',
                                  thumbnail: video.thumbnail || ''
                                });
                                setShowAddVideoModal(true);
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1"
                              title="تعديل الفيديو"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleVideoDelete(video.id, video.title)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1"
                              title="حذف الفيديو"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingSection ? 'تعديل القسم' : 'إضافة قسم جديد'}
            </h3>
            
            <form onSubmit={handleSectionSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    عنوان القسم *
                  </label>
                  <input
                    type="text"
                    value={sectionFormData.title}
                    onChange={(e) => setSectionFormData({...sectionFormData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="أدخل عنوان القسم"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    وصف القسم
                  </label>
                  <textarea
                    value={sectionFormData.description}
                    onChange={(e) => setSectionFormData({...sectionFormData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل وصف القسم"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    حالة القسم
                  </label>
                  <select
                    value={sectionFormData.status}
                    onChange={(e) => setSectionFormData({...sectionFormData, status: e.target.value as 'draft' | 'published' | 'archived'})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">مسودة</option>
                    <option value="published">منشور</option>
                    <option value="archived">مؤرشف</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sectionFormData.featured}
                      onChange={(e) => setSectionFormData({...sectionFormData, featured: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="mr-2 text-sm text-gray-700 dark:text-gray-300">قسم مميز</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSectionModal(false);
                    setEditingSection(null);
                    setSectionFormData({
                      title: '',
                      description: '',
                      status: 'draft',
                      thumbnail: '',
                      featured: false
                    });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg transition-colors"
                >
                  {editingSection ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Video Modal - ENHANCED VERSION */}
      {showAddVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingVideo ? 'تعديل الفيديو' : 'إضافة فيديو جديد'}
            </h3>
            
            <form onSubmit={handleVideoSubmit}>
              <div className="space-y-6">
                {/* Video Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    عنوان الفيديو *
                  </label>
                  <input
                    type="text"
                    value={videoFormData.title}
                    onChange={(e) => setVideoFormData({...videoFormData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="أدخل عنوان الفيديو"
                  />
                </div>
                
                {/* Video URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رابط الفيديو *
                  </label>
                  <input
                    type="url"
                    value={videoFormData.url}
                    onChange={(e) => setVideoFormData({...videoFormData, url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    يدعم روابط YouTube, Vimeo, وغيرها من منصات الفيديو
                  </p>
                </div>
                
                {/* Video Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    وصف الفيديو
                  </label>
                  <textarea
                    value={videoFormData.description}
                    onChange={(e) => setVideoFormData({...videoFormData, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل وصف مفصل للفيديو..."
                  />
                </div>

                {/* Section Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    القسم *
                  </label>
                  <select
                    value={videoFormData.section_id}
                    onChange={(e) => setVideoFormData({...videoFormData, section_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">اختر القسم</option>
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    مدة الفيديو (بالدقائق) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={videoFormData.duration_minutes}
                    onChange={(e) => setVideoFormData({...videoFormData, duration_minutes: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="30"
                  />
                </div>

                {/* Thumbnail URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رابط صورة الغلاف (اختياري)
                  </label>
                  <input
                    type="url"
                    value={videoFormData.thumbnail}
                    onChange={(e) => setVideoFormData({...videoFormData, thumbnail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    إذا تُرك فارغاً، سيتم استخدام الصورة الافتراضية من منصة الفيديو
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    حالة الفيديو
                  </label>
                  <select
                    value={videoFormData.status}
                    onChange={(e) => setVideoFormData({...videoFormData, status: e.target.value as 'draft' | 'published' | 'archived'})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">مسودة - غير مرئي للطلاب</option>
                    <option value="published">منشور - مرئي للطلاب</option>
                    <option value="archived">مؤرشف - محفوظ ولكن غير مرئي</option>
                  </select>
                </div>

                {/* Preview Section */}
                {videoFormData.url && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">معاينة الفيديو:</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>العنوان:</strong> {videoFormData.title || 'غير محدد'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>الرابط:</strong> {videoFormData.url}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>المدة:</strong> {videoFormData.duration_minutes} دقيقة
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>الحالة:</strong> {
                          videoFormData.status === 'published' ? 'منشور' : 
                          videoFormData.status === 'draft' ? 'مسودة' : 'مؤرشف'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddVideoModal(false);
                    resetVideoForm();
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg transition-colors font-medium"
                >
                  {editingVideo ? 'تحديث الفيديو' : 'إنشاء الفيديو'}
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