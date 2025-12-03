import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: 'תוך שבוע מצאתי מורה פרטי באנגלית, עם חשבונית מוכנה – והקרדיט שלי כיסה את הכל.',
      author: 'דניאל ל.',
      role: 'סטודנט לתואר שני, אוניברסיטת תל אביב'
    },
    {
      quote: 'חשבתי שזה מסובך מדי. עם זכותידע פשוט למדתי והם עשו הכל בשבילי.',
      author: 'נועה כ.',
      role: 'סטודנטית למדעי המחשב, הטכניון'
    }
  ];

  return (
    <section className="relative py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2 mb-6">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">עדויות</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            מה אומרים <span className="text-emerald-400">סטודנטים</span> שממשו את הזכאות?
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 border-slate-700 p-8 h-full relative overflow-hidden">
                <Quote className="absolute top-4 left-4 w-16 h-16 text-emerald-500/10" />
                <div className="relative z-10">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xl text-slate-200 leading-relaxed mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="border-t border-slate-700 pt-4">
                    <p className="font-semibold text-white">{testimonial.author}</p>
                    <p className="text-slate-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}