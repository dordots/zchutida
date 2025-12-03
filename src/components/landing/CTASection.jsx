import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, ArrowLeft, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function CTASection({ onCTAClick }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the email to your backend
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="check-eligibility" className="relative py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border-emerald-500/30 p-12 text-center backdrop-blur-sm relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 text-sm font-medium">התחל עכשיו</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                בדוק עכשיו כמה קרדיט מגיע לך מהמילואים
              </h2>
              
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                השאר פרטים ונחזור אליך תוך 24 שעות עם חישוב מדויק של הזכאות שלך
              </p>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-6">
                  <Input
                    type="email"
                    placeholder="האימייל שלך"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 text-lg py-6"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-white text-emerald-900 hover:bg-slate-100 font-bold text-lg px-8 py-6 whitespace-nowrap"
                  >
                    אני רוצה לממש את הזכות שלי
                    <ArrowLeft className="w-5 h-5 mr-2" />
                  </Button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-6 max-w-xl mx-auto mb-6"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-emerald-300 font-semibold text-lg">תודה! נחזור אליך בקרוב</p>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-400 mt-6">
                <span>כבר רשום?</span>
                <Button
                  variant="outline"
                  className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  onClick={() => {
                    // Check if user is logged in locally
                    const userData = localStorage.getItem('zchut_user');
                    if (userData) {
                      navigate(createPageUrl('Payment'));
                    } else {
                      // Navigate to home and scroll to login
                      navigate(createPageUrl('Home'));
                      setTimeout(() => {
                        const element = document.getElementById('login-section');
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                  }}
                >
                  כניסה לאזור האישי
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}