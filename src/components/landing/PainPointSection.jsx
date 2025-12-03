import React from 'react';
import { motion } from 'framer-motion';
import { FileX, AlertCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function PainPointSection() {
  const painPoints = [
    {
      icon: FileX,
      text: 'באתרי המדינה כתוב שמגיע לך אלפי שקלים ללימודים אחרי מילואים'
    },
    {
      icon: AlertCircle,
      text: 'בפועל? רוב הסטודנטים לא מנצלים את זה: קבלות, טפסים, מורים פרטיים – כאב ראש'
    },
    {
      icon: XCircle,
      text: 'התוצאה: הזכאות נשארת על הנייר, והכסף מתבזבז'
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
            הבעיה ש<span className="text-red-400">כולם</span> מכירים
          </h2>
          <p className="text-xl text-slate-400">אבל לא כולם יודעים איך לפתור</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {painPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-slate-900/50 border-slate-800 p-8 h-full hover:border-red-500/30 transition-all duration-300">
                <point.icon className="w-12 h-12 text-red-400 mb-4" />
                <p className="text-slate-300 text-lg leading-relaxed">{point.text}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8 text-center backdrop-blur-sm"
        >
          <p className="text-2xl md:text-3xl text-slate-300 italic font-light mb-4">
            "ידעתי שמגיע לי, אבל לא הצלחתי להבין איך לנצל את זה…"
          </p>
          <p className="text-slate-500">- סטודנט אחרי מילואים</p>
        </motion.div>
      </div>
    </section>
  );
}