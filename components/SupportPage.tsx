import React from 'react';
import { PaperAirplaneIcon, WhatsappIcon } from './Icons';

const SupportPage: React.FC = () => {

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('شكراً لتواصلك مع فريق الدعم، سنقوم بالرد في أقرب وقت!');
    };

    return (
        <div className="py-20 md:py-28 section-glow">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20 animate-fade-in-up">
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-4">
                        مركز <span className="text-gradient bg-gradient-to-r from-blue-400 via-violet-500 to-amber-400">الدعم</span>
                    </h1>
                    <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-400">
                        فريقنا جاهز لمساعدتك. اختر طريقة التواصل التي تناسبك.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Contact Info */}
                    <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                         <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl backdrop-blur-lg">
                             <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">معلومات التواصل المباشر</h3>
                             <p className="text-gray-600 dark:text-gray-400 mb-6">للحصول على مساعدة سريعة، يمكنك التواصل معنا مباشرة عبر القنوات التالية:</p>
                             <div className="space-y-4">
                                <div className="flex items-center gap-4 text-lg">
                                    <span className="font-bold text-amber-500 dark:text-amber-400">البريد الإلكتروني:</span>
                                    <span className="text-gray-700 dark:text-gray-300">support@doroosna.com</span>
                                </div>
                                 <div className="flex items-center gap-4 text-lg">
                                    <span className="font-bold text-amber-500 dark:text-amber-400">واتساب:</span>
                                    <span className="text-gray-700 dark:text-gray-300" dir="ltr">+1 (555) 123-4567</span>
                                </div>
                             </div>
                              <button className="mt-6 w-full flex items-center justify-center gap-3 px-8 py-4 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 focus:ring-green-400">
                                <WhatsappIcon />
                                <span>تواصل عبر واتساب</span>
                            </button>
                         </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl backdrop-blur-lg animate-fade-in-up">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">أو أرسل لنا طلب دعم</h3>
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
                                <label htmlFor="message" className="block mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300">صف مشكلتك</label>
                                <textarea id="message" rows={5} required className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"></textarea>
                            </div>
                            <button type="submit" className="w-full flex items-center justify-center gap-3 px-8 py-4 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-violet-500/20 focus:ring-violet-400">
                                <PaperAirplaneIcon className="w-5 h-5" />
                                <span>إرسال الطلب</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;