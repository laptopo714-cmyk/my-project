import React from 'react';
import { FacebookIcon, YoutubeIcon, TelegramIcon } from './Icons';

type PublicPage = 'home' | 'features' | 'courses' | 'contact' | 'support' | 'help' | 'privacy';

interface FooterProps {
  onNavigate: (page: PublicPage) => void;
}

const FooterLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <li>
        <button onClick={onClick} className="text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">{children}</button>
    </li>
);


const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer id="contact-footer" className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 py-12">
      <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center md:text-right">
              <div>
                  <h3 className="text-3xl font-black text-gradient bg-gradient-to-r from-blue-400 to-violet-500 mb-4">دروسنا</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">منصة تعليمية تهدف إلى تمكين الشباب العربي بأحدث المهارات المطلوبة في سوق العمل.</p>
              </div>
              <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4">روابط سريعة</h4>
                  <ul className="space-y-2">
                      <FooterLink onClick={() => onNavigate('home')}>الرئيسية</FooterLink>
                      <FooterLink onClick={() => onNavigate('features')}>المميزات</FooterLink>
                      <FooterLink onClick={() => onNavigate('courses')}>الكورسات</FooterLink>
                  </ul>
              </div>
              <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4">الدعم</h4>
                   <ul className="space-y-2">
                      <FooterLink onClick={() => onNavigate('support')}>تواصل مع الدعم</FooterLink>
                      <FooterLink onClick={() => onNavigate('help')}>مركز المساعدة</FooterLink>
                      <FooterLink onClick={() => onNavigate('privacy')}>سياسة الخصوصية</FooterLink>
                  </ul>
              </div>
              <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4">تابعنا</h4>
                  <div className="flex justify-center md:justify-end space-x-4 space-x-reverse">
                      <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors"><FacebookIcon/></a>
                      <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors"><YoutubeIcon/></a>
                      <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-sky-500 transition-colors"><TelegramIcon/></a>
                  </div>
              </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>&copy; 2025 دروسنا - جميع الحقوق محفوظة.</p>
          </div>
          
          {/* Developer Info Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <div className="flex flex-col md:flex-row justify-center items-center gap-x-6 gap-y-2">
                <p className="flex items-center gap-2">
                    <span>👨‍💻</span>
                    <span>تم البرمجة والتطوير بواسطة: كريم عطية</span>
                </p>
                <p className="flex items-center gap-2">
                    <span>📞</span>
                    <span>للتواصل والاستفسارات: <span dir="ltr">01095288373</span></span>
                </p>
            </div>
          </div>
      </div>
    </footer>
  );
};

export default Footer;