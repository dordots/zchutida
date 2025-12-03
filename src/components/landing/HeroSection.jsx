import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function HeroSection({ onCTAClick }) {
  return (
    <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center">
      <div className="max-w-5xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-8"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-300 text-sm font-medium">הזכאות שלך מחכה לך</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          עשית מילואים?
          <br />
          <span className="bg-gradient-to-l from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            יש לך זכות ללמוד
          </span>
          <br />
          <span className="text-3xl md:text-5xl text-slate-300">ולקבל על זה כסף.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          בזכות <span className="font-semibold text-emerald-400">זכותידע</span> אתה לא נשאר רק עם זכאות על הנייר.
          <br />
          אנחנו הופכים את ההטבה שלך ללימודים אמיתיים – ומוודאים שהקרדיט שמגיע לך באמת נכנס לשימוש.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          <Button
            onClick={onCTAClick}
            size="lg"
            className="bg-gradient-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-lg px-8 py-6 rounded-xl shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 group"
          >
            בדוק עכשיו כמה מגיע לך
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-400 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>תואם קריטריוני המדינה</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>ליווי מלא עד קבלת הכסף</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>בלי ניירת מיותרת</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}