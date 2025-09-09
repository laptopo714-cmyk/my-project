import React from 'react';

const PrivacySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-3xl font-bold text-amber-500 dark:text-amber-400 mb-4">{title}</h2>
        <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300 leading-loose">
            {children}
        </div>
    </div>
);

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="py-20 md:py-28 section-glow">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-4">
            سياسة <span className="text-gradient bg-gradient-to-r from-blue-400 via-violet-500 to-amber-400">الخصوصية</span>
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-400">
            خصوصيتك تهمنا في "دروسنا". نلتزم بحماية بياناتك الشخصية.
          </p>
           <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">آخر تحديث: 1 أغسطس 2025</p>
        </div>

        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl backdrop-blur-lg p-8 md:p-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <PrivacySection title="1. مقدمة">
                <p>
                    مرحبًا بك في منصة "دروسنا". توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية عند استخدامك لخدماتنا. باستخدامك للمنصة، فإنك توافق على الممارسات الموضحة في هذه السياسة.
                </p>
            </PrivacySection>

            <PrivacySection title="2. المعلومات التي نجمعها">
                <p>
                    نقوم بجمع أنواع مختلفة من المعلومات، بما في ذلك:
                </p>
                <ul className="list-disc list-inside space-y-2 pr-4">
                    <li><strong>معلومات التسجيل:</strong> الاسم، البريد الإلكتروني، وكلمة المرور عند إنشاء حساب.</li>
                    <li><strong>معلومات التقدم الدراسي:</strong> بيانات حول الكورسات التي تشترك بها، وتقدمك، ونتائج الاختبارات.</li>
                    <li><strong>معلومات تقنية:</strong> عنوان IP، نوع المتصفح، ونظام التشغيل عند زيارتك للمنصة.</li>
                </ul>
            </PrivacySection>

            <PrivacySection title="3. كيف نستخدم معلوماتك">
                <p>
                    نستخدم معلوماتك للأغراض التالية:
                </p>
                 <ul className="list-disc list-inside space-y-2 pr-4">
                    <li>توفير وتخصيص خدماتنا التعليمية لك.</li>
                    <li>التواصل معك بخصوص حسابك أو إرسال إشعارات هامة.</li>
                    <li>تحليل استخدام المنصة لتحسين خدماتنا وتجربة المستخدم.</li>
                    <li>ضمان أمان وحماية منصتنا ومستخدميها.</li>
                </ul>
            </PrivacySection>

            <PrivacySection title="4. أمان البيانات">
                <p>
                    نتخذ إجراءات أمنية معقولة لحماية معلوماتك من الوصول غير المصرح به أو التغيير أو الكشف. نستخدم التشفير لحماية البيانات الحساسة ونراجع ممارساتنا الأمنية بانتظام.
                </p>
            </PrivacySection>
            
             <PrivacySection title="5. تحديثات على هذه السياسة">
                <p>
                    قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإعلامك بأي تغييرات جوهرية عن طريق نشر السياسة الجديدة على هذه الصفحة. نوصي بمراجعة هذه الصفحة بشكل دوري للاطلاع على أي تحديثات.
                </p>
            </PrivacySection>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;