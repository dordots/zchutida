import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'כמה כסף אפשר לקבל?',
      answer: 'בין 2,000–3,000 ₪ בממוצע, תלוי במספר ימי המילואים ובמסלול הזכאות. נחשב עבורך את הסכום המדויק לפי הקריטריונים.'
    },
    {
      question: 'אני צריך לשלם מראש?',
      answer: 'כן – אתה משלם על השירות/שיעורים, ומקבל חשבונית עומדת־קריטריונים להגשה. אחרי ההגשה תקבל החזר כספי מהמדינה.'
    },
    {
      question: 'מה אם לא קיבלתי החזר?',
      answer: 'אנחנו מלווים אותך עד הסוף. אם עמדת בקריטריונים ולא התקבל החזר – יש לך אחריות מלאה מולנו ואנחנו נטפל בזה.'
    },
    {
      question: 'זה מתאים לכל סטודנט?',
      answer: 'כן – לכל מי שחזר ממילואים ועומד בתנאי הזכאות של המדינה. נבדוק את הזכאות שלך בתחילת התהליך.'
    },
    {
      question: 'כמה זמן לוקח התהליך?',
      answer: 'מרגע הפנייה ועד קבלת החזר: בדרך כלל 2-4 שבועות. התהליך כולל בדיקת זכאות, התאמת לימודים, והגשת הטפסים.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            שאלות <span className="text-emerald-400">נפוצות</span>
          </h2>
          <p className="text-xl text-slate-400">כל מה שרצית לדעת על התהליך</p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card 
                className={`bg-slate-900/50 border-slate-800 overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'border-emerald-500/30' : ''
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-right flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                >
                  <span className="text-lg font-semibold text-white pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-6 h-6 text-emerald-400" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 pt-2">
                        <p className="text-slate-400 text-lg leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}