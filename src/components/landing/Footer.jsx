import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer({ onCTAClick }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToEligibility = onCTAClick || (() => {
    const element = document.getElementById('check-eligibility');
    element?.scrollIntoView({ behavior: 'smooth' });
  });

  return (
    <footer className="relative py-16 px-6 border-t border-slate-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            אל תפספס את מה שמגיע לך
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            עם <span className="font-semibold text-emerald-400">זכותידע</span> – הזכאות שלך הופכת לידע אמיתי, בלי בירוקרטיה
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={scrollToEligibility}
              size="lg"
              className="bg-gradient-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold"
            >
              בדוק זכאות עכשיו
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            >
              <MessageCircle className="w-4 h-4 ml-2" />
              דברו איתנו ב־WhatsApp
            </Button>
          </div>
        </motion.div>

        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-slate-950" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-l from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                זכותידע
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 text-sm">
              <button onClick={scrollToTop} className="hover:text-emerald-400 transition-colors">
                חזרה למעלה
              </button>
              <a href="mailto:info@zachutidea.co.il" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                <Mail className="w-4 h-4" />
                info@zachutidea.co.il
              </a>
            </div>
          </div>

          <div className="mt-8 text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} זכותידע. כל הזכויות שמורות.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}