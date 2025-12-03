import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileCheck, Zap, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function WhyUsSection() {
  const reasons = [
    {
      icon: Shield,
      title: 'עומד בקריטריונים',
      description: 'השירות מותאם במדויק לתנאי הסיוע לסטודנטים במילואים',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FileCheck,
      title: 'בלי ניירת',
      description: 'אנחנו מטפלים בחשבוניות, בטפסים ובהגשות – אתה רק לומד',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Zap,
      title: 'מהיר ופשוט',
      description: 'תהליך קצר וברור: בודקים זכאות → לומדים → מקבלים החזר',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Eye,
      title: '100% שקיפות',
      description: 'אתה יודע מראש כמה מגיע לך, למה, ואיך התהליך עובד',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <section className="relative py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            למה דווקא <span className="bg-gradient-to-l from-emerald-400 to-teal-300 bg-clip-text text-transparent">זכותידע</span>?
          </h2>
          <p className="text-xl text-slate-400">ארבע סיבות טובות להתחיל עכשיו</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-slate-900/50 border-slate-800 p-8 h-full hover:bg-slate-800/50 transition-all duration-300 group">
                <div className={`w-14 h-14 bg-gradient-to-br ${reason.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <reason.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{reason.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{reason.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}