import React from 'react';
import {
  DevicePhoneMobileIcon,
  ChartPieIcon,
  SparklesIcon,
  AcademicCapIcon,
} from './Icons';

interface HomePageProps {
  onStart: () => void;
}

// --- Sub-components for better structure ---

const CtaButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`px-8 py-3 font-bold rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 ${className}`}
  >
    {children}
  </button>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl text-center backdrop-blur-lg transform hover:-translate-y-2 transition-transform duration-300 hover:shadow-2xl hover:shadow-violet-500/10 dark:hover:shadow-violet-400/10">
    <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-2xl shadow-lg">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{children}</p>
  </div>
);

// --- Main Home Page Component ---

const HomePage: React.FC<HomePageProps> = ({ onStart }) => {
  const features = [
    { icon: <SparklesIcon />, title: "محتوى تعليمي عالي الجودة", description: "كورسات مصممة من قبل خبراء في المجال لتزويدك بأحدث المعارف والمهارات." },
    { icon: <AcademicCapIcon />, title: "شهادات معتمدة", description: "احصل على شهادات إتمام معتمدة بعد كل كورس لتعزيز سيرتك الذاتية." },
    { icon: <ChartPieIcon />, title: "متابعة تقدمك الدراسي", description: "نظام سهل لتتبع مستوى تقدمك في الكورسات ومعرفة نقاط قوتك وضعفك." },
    { icon: <DevicePhoneMobileIcon />, title: "وصول من جميع أجهزتك", description: "تعلم في أي وقت ومن أي مكان، عبر الكمبيوتر أو الهاتف المحمول أو التابلت." },
  ];
  
  const courses = [
      { img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070", title: "تطوير الويب الشامل", desc: "انطلق في عالم تطوير الويب من الصفر إلى الاحتراف مع أحدث التقنيات." },
      { img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070", title: "علم البيانات والذكاء الاصطناعي", desc: "تعلم تحليل البيانات وبناء نماذج الذكاء الاصطناعي لاتخاذ قرارات أذكى." },
      { img: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1974", title: "التسويق الرقمي المتقدم", desc: "اكتسب المهارات اللازمة للنجاح في عالم التسويق الرقمي وإدارة الحملات." },
  ];

  const testimonials = [
      { name: "خالد الرشيد", role: "طالب", quote: "منصة دروسنا هي الأفضل على الإطلاق! المحتوى احترافي والواجهة تفاعلية بشكل لا يصدق. لقد تعلمت الكثير في وقت قصير." },
      { name: "نورة العبدالله", role: "طالبة", quote: "تجربة المستخدم سلسة جدًا، والفيديوهات عالية الجودة. أنصح بها لكل من يبحث عن منصة تعليمية موثوقة وممتعة." },
      { name: "سارة علي", role: "طالبة", quote: "المنصة سهلة الاستخدام ومحتواها غني جدًا. الدعم الفني سريع ومتعاون. تجربة رائعة لا يمكن وصفها بالكلمات!" },
  ];

  return (
    <>
        {/* Hero Section */}
        <section id="home" className="py-20 md:py-32 section-glow">
          <div className="container mx-auto px-6 text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-7xl font-black text-gray-900 dark:text-white leading-tight mb-6">
                طور مستقبلك معنا، <span className="text-gradient bg-gradient-to-r from-blue-400 via-violet-500 to-amber-400">تعلم بلا حدود</span>
              </h1>
              <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-400 mb-10">
                انضم إلى آلاف الطلاب واكتسب المهارات التي تحتاجها للنجاح. كورسات تفاعلية، متابعة للتقدم، وشهادات معتمدة بين يديك.
              </p>
              <CtaButton onClick={onStart} className="bg-amber-400 text-gray-900 shadow-lg shadow-amber-500/30 dark:shadow-amber-400/20 px-10 py-4 text-lg focus:ring-amber-300">
                ابدأ رحلتك التعليمية
              </CtaButton>
            </div>
            <div className="mt-20 relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-violet-700 rounded-2xl blur-xl opacity-25 dark:opacity-40"></div>
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071" alt="Students learning online" className="rounded-2xl shadow-2xl max-w-5xl mx-auto relative"/>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">لماذا تختار <span className="text-gradient bg-gradient-to-r from-blue-400 to-violet-500">دروسنا؟</span></h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">نقدم لك كل ما تحتاجه لتحقيق أهدافك التعليمية والمهنية.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((f, i) => <div key={f.title} className="animate-fade-in-up" style={{animationDelay: `${i * 0.1}s`}}><FeatureCard icon={f.icon} title={f.title}>{f.description}</FeatureCard></div>)}
            </div>
          </div>
        </section>
        
        {/* Courses Preview Section */}
        <section id="courses" className="py-20 bg-gray-50 dark:bg-gray-800/50 section-glow">
            <div className="container mx-auto px-6">
                 <div className="text-center mb-16 animate-fade-in-up">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">اكتشف أحدث الكورسات</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">كورسات مصممة بعناية من قبل خبراء لتناسب جميع المستويات.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((c, i) => (
                        <div key={c.title} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300 animate-fade-in-up" style={{animationDelay: `${i * 0.1}s`}}>
                            <img src={c.img} alt={c.title} className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-500" />
                            <div className="p-6">
                                <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">{c.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{c.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-12 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                     <CtaButton onClick={() => alert('Navigate to full courses page!')} className="bg-transparent border-2 border-violet-500 text-violet-500 dark:text-violet-400 dark:border-violet-400 hover:bg-violet-500 hover:text-white dark:hover:bg-violet-400 dark:hover:text-gray-900 focus:ring-violet-400">
                        استعراض جميع الكورسات
                    </CtaButton>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20">
             <div className="container mx-auto px-6">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">آراء طلابنا</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">نحن فخورون بثقة طلابنا ونسعى دائمًا لتقديم الأفضل.</p>
                </div>
                <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={t.name} className="bg-white/80 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl backdrop-blur-sm animate-fade-in-up" style={{animationDelay: `${i * 0.1}s`}}>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg relative before:content-['“'] before:absolute before:-top-6 before:-right-4 before:text-8xl before:text-gradient before:bg-gradient-to-br before:from-violet-600 before:to-blue-600 before:opacity-20 dark:before:opacity-30 before:font-serif">
                                {t.quote}
                            </p>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-lg">{t.name}</h4>
                                <p className="text-sm text-amber-500 dark:text-amber-400 font-semibold">{t.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 my-10">
             <div className="container mx-auto px-6 text-center animate-fade-in-up">
                <div className="bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl p-12 shadow-2xl shadow-violet-500/20 dark:shadow-violet-400/10">
                 <h2 className="text-3xl md:text-5xl font-black mb-4">هل أنت مستعد لبدء رحلتك؟</h2>
                 <p className="text-lg mb-8 max-w-2xl mx-auto text-blue-100">انضم الآن إلى آلاف المتعلمين والمبدعين في أكبر مجتمع تعليمي عربي.</p>
                 <CtaButton onClick={onStart} className="bg-white text-gray-900 shadow-lg px-10 py-4 text-lg focus:ring-white/50">
                    انضم كطالب الآن!
                </CtaButton>
                </div>
             </div>
        </section>
    </>
  );
};

export default HomePage;