import React from 'react';
import { FacebookIcon, YoutubeIcon, TelegramIcon, PaperAirplaneIcon } from './Icons';

const ContactPage: React.FC = () => {
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('شكراً لتواصلك معنا، سنقوم بالرد في أقرب وقت!');
    };

  return (
    <div className="py-20 md:py-28 section-glow">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-4">
            تواصل <span className="text-gradient bg-gradient-to-r from-blue-400 via-violet-500 to-amber-400">معنا</span>
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-400">
            نحن هنا لمساعدتك. إذا كان لديك أي سؤال أو استفسار، لا تتردد في التواصل معنا.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl backdrop-blur-lg animate-fade-in-up">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">أرسل لنا رسالة</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300">الاسم الكامل</label>
                        <input type="text" id="name" required className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" />
                    </div>
                     <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300">البريد الإلكتروني</label>
                        <input type="email" id="email" required className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" />
                    </div>
                     <div>
                        <label htmlFor="message" className="block mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300">رسالتك</label>
                        <textarea id="message" rows={5} required className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"></textarea>
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center gap-3 px-8 py-4 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-violet-500/20 focus:ring-violet-400">
                        <PaperAirplaneIcon className="w-5 h-5" />
                        <span>إرسال الرسالة</span>
                    </button>
                </form>
            </div>
            {/* Contact Info & Map */}
            <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl backdrop-blur-lg">
                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">معلومات التواصل</h3>
                     <p className="text-gray-600 dark:text-gray-400 mb-2"><strong>البريد الإلكتروني:</strong> support@doroosna.com</p>
                     <p className="text-gray-600 dark:text-gray-400"><strong>ساعات العمل:</strong> الأحد - الخميس، 9 صباحًا - 5 مساءً</p>
                     <div className="flex space-x-4 space-x-reverse mt-6">
                        <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors"><FacebookIcon/></a>
                        <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors"><YoutubeIcon/></a>
                        <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-sky-500 transition-colors"><TelegramIcon/></a>
                    </div>
                </div>
                 <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl backdrop-blur-lg overflow-hidden">
                     <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.766598884976!2d31.23344931511511!3d30.04351998188247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145840c74a3f8a69%3A0x1d43a6d7f9d854e4!2sTahrir%20Square!5e0!3m2!1sen!2seg!4v1676483505185!5m2!1sen!2seg"
                        width="100%"
                        height="350"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="خريطة الموقع"
                        className="dark:grayscale dark:invert"
                    ></iframe>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;