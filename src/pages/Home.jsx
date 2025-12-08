import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  CheckCircle2, 
  TrendingUp, 
  Shield, 
  Zap, 
  Clock, 
  FileCheck, 
  Users,
  ChevronDown,
  MessageCircle,
  ArrowLeft,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroSection from '../components/landing/HeroSection';
import PainPointSection from '../components/landing/PainPointSection';
import SolutionSection from '../components/landing/SolutionSection';
import WhyUsSection from '../components/landing/WhyUsSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CTASection from '../components/landing/CTASection';
import FAQSection from '../components/landing/FAQSection';
import Footer from '../components/landing/Footer';
import EligibilityCalculator from '../components/calculator/EligibilityCalculator';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToLogin = () => {
    setShowRegister(false);
    const element = document.getElementById('login-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToRegister = () => {
    setShowRegister(true);
    const element = document.getElementById('login-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToEligibility = () => {
    const element = document.getElementById('check-eligibility');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white" dir="rtl">
      {/* Floating Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-slate-900/95 backdrop-blur-lg shadow-xl' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-slate-950" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-l from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              זכותידע
            </span>
          </div>
          <Button 
                            onClick={scrollToLogin}
                            className="bg-gradient-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-semibold"
                          >
                            כניסה למערכת
                          </Button>
        </div>
      </motion.header>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative">
        <HeroSection onCTAClick={scrollToEligibility} />
        <PainPointSection />
        <SolutionSection />
        <WhyUsSection />
        <TestimonialsSection />
        
        {/* Calculator Section */}
        <section id="check-eligibility" className="py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                בדוק <span className="text-emerald-400">עכשיו</span> כמה מגיע לך
              </h2>
              <p className="text-xl text-slate-400">חישוב מדויק תוך דקה</p>
              
              {/* Support Contact Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-6 flex justify-center"
              >
                <Button
                  onClick={() => window.open('https://wa.me/972523964584', '_blank')}
                  variant="outline"
                  className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400"
                >
                  <Phone className="w-4 h-4 ml-2" />
                  מוקד בירור זכאות: 052-396-4584
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <EligibilityCalculator onGetStarted={scrollToEligibility} />
            </motion.div>
          </div>
        </section>

        {/* Login/Register Section */}
              <section id="login-section" className="py-20 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
                <div className="max-w-6xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                  >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                      <span className="text-emerald-400">{showRegister ? 'הרשמה' : 'כניסה'}</span> למערכת
                    </h2>
                    <p className="text-xl text-slate-400">
                      {showRegister ? 'הירשם כחניך או כחונך' : 'הזן את מספר תעודת הזהות שלך'}
                    </p>
                    <div className="flex justify-center gap-4 mt-4">
                      <button
                        onClick={() => setShowRegister(false)}
                        className={`px-4 py-2 rounded-lg transition-colors ${!showRegister ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                      >
                        כניסה
                      </button>
                      <button
                        onClick={() => setShowRegister(true)}
                        className={`px-4 py-2 rounded-lg transition-colors ${showRegister ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                      >
                        הרשמה
                      </button>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {showRegister ? <RegisterForm /> : <LoginForm />}
                  </motion.div>
                </div>
              </section>

              <CTASection onCTAClick={scrollToEligibility} />
        <FAQSection />
        <Footer onCTAClick={scrollToEligibility} />
      </div>
    </div>
  );
}