import React, { useState } from 'react';
import { ChevronDownIcon } from './Icons';

const faqs = [
    {
        question: "كيف يمكنني التسجيل في كورس جديد؟",
        answer: "يمكنك تصفح جميع الكورسات المتاحة من خلال صفحة 'الكورسات'. عند العثور على الكورس الذي تريده، اضغط على زر 'ابدأ التعلم الآن' واتبع خطوات التسجيل البسيطة."
    },
    {
        question: "هل أحصل على شهادة بعد إتمام الكورس؟",
        answer: "نعم، عند إتمامك لجميع متطلبات الكورس بنجاح، ستحصل على شهادة إتمام معتمدة من منصة 'دروسنا' يمكنك تحميلها ومشاركتها."
    },
    {
        question: "ما هي طرق الدفع المتاحة؟",
        answer: "نحن ندعم حاليًا الدفع عبر البطاقات الائتمانية (Visa, MasterCard) بالإضافة إلى خدمات الدفع الإلكتروني الأخرى. جميع عمليات الدفع آمنة ومشفرة بالكامل."
    },
    {
        question: "هل يمكنني الوصول للكورسات من هاتفي المحمول؟",
        answer: "بالتأكيد. منصة 'دروسنا' مصممة لتكون متجاوبة بالكامل مع جميع الأجهزة. يمكنك متابعة دروسك ومشاهدة الفيديوهات من أي جهاز سواء كان كمبيوتر، تابلت، أو هاتف محمول."
    },
    {
        question: "ماذا أفعل إذا واجهت مشكلة تقنية؟",
        answer: "إذا واجهت أي مشكلة تقنية، يمكنك التواصل مباشرة مع فريق الدعم الفني من خلال صفحة 'الدعم'. فريقنا جاهز لمساعدتك في أسرع وقت ممكن."
    }
];

const AccordionItem: React.FC<{ question: string; answer: string; }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-right p-6 text-lg font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
                <span>{question}</span>
                <ChevronDownIcon className={`w-6 h-6 transition-transform duration-300 text-gray-500 dark:text-gray-400 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
            >
                <div className="p-6 pt-0 text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
};


const HelpCenterPage: React.FC = () => {
    return (
        <div className="py-20 md:py-28 section-glow">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20 animate-fade-in-up">
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-4">
                        مركز <span className="text-gradient bg-gradient-to-r from-blue-400 via-violet-500 to-amber-400">المساعدة</span>
                    </h1>
                    <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-400">
                        هل لديك سؤال؟ لقد قمنا بتجميع إجابات للأسئلة الأكثر شيوعًا هنا.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl backdrop-blur-lg overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HelpCenterPage;