import React from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, FileCheck, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function SolutionSection() {
  const steps = [
    {
      icon: Search,
      number: '01',
      title: 'בודקים את הזכאות שלך',
      description: 'מחשבים עבורך בדיוק כמה מגיע לך, על פי הקריטריונים של המדינה'
    },
    {
      icon: BookOpen,
      number: '02',
      title: 'מתאימים לך מסלול לימוד',
      description: 'שיעורים פרטיים או קורסים שעומדים בתנאים ומתאימים בדיוק בשבילך'
    },
    {
      icon: FileCheck,
      number: '03',
      title: 'מפיקים חשבונית תקינה',
      description: 'חשבונית עומדת־קריטריונים כדי שתוכל לממש את הקרדיט בקלות'
    },
    {
      icon: TrendingUp,
      number: '04',
      title: 'מלווים עד קבלת הכסף',
      description: 'ליווי מלא בהגשה ומעקב עד שהכסף מתקבל – בלי בירוקרטיה'
    }
  ];

  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
            <span className="text-emerald-400 text-sm font-medium">הפתרון</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            איך <span className="bg-gradient-to-l from-emerald-400 to-teal-300 bg-clip-text text-transparent">זכותידע</span> עובד?
          </h2>
          <p className="text-xl text-slate-400">ארבעה שלבים פשוטים מהזכאות למימוש</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 p-8 h-full hover:border-emerald-500/30 transition-all duration-300 group">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="w-8 h-8 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-5xl font-bold text-slate-800 mb-2">{step.number}</div>
                    <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-slate-400 text-lg leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-l from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-8 inline-block">
            <p className="text-2xl font-semibold text-emerald-400">
              אתה לומד → אנחנו דואגים שהכסף יעבוד בשבילך
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}