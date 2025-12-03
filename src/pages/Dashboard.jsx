import React from 'react';
import { Mentee, Mentor } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '../utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, GraduationCap, LogOut } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  // Get id_number from localStorage
  const idNumber = localStorage.getItem('zchut_user_id');

  // Load mentee profile from database
  const { data: menteeProfile } = useQuery({
    queryKey: ['menteeProfileForDashboard', idNumber],
    queryFn: async () => {
      if (!idNumber) return null;
      const mentees = await Mentee.filter({ id_number: idNumber });
      return mentees.length > 0 ? mentees[0] : null;
    },
    enabled: !!idNumber,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Load mentor profile from database
  const { data: mentorProfile } = useQuery({
    queryKey: ['mentorProfileForDashboard', idNumber],
    queryFn: async () => {
      if (!idNumber) return null;
      const mentors = await Mentor.filter({ id_number: idNumber });
      return mentors.length > 0 ? mentors[0] : null;
    },
    enabled: !!idNumber,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Redirect based on user type
  React.useEffect(() => {
    if (!idNumber) {
      navigate(createPageUrl('Home'));
    } else if (menteeProfile && mentorProfile) {
      // Both - stay on this page
    } else if (menteeProfile) {
      navigate(createPageUrl('MenteeDashboard'));
    } else if (mentorProfile) {
      navigate(createPageUrl('MentorDashboard'));
    }
  }, [idNumber, menteeProfile, mentorProfile, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('zchut_user_id');
    navigate(createPageUrl('Home'));
  };

  if (!menteeProfile || !mentorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
        <div className="text-slate-600">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-l from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              זכותידע
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">שלום, {menteeProfile?.full_name || mentorProfile?.full_name}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">חניך + חונך</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 ml-2" />
              יציאה
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">שלום {menteeProfile?.full_name || mentorProfile?.full_name}!</h1>
        <p className="text-slate-600 mb-8">אתה רשום גם כחניך וגם כחונך. בחר לאיזה אזור להיכנס:</p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-emerald-500" 
            onClick={() => navigate(createPageUrl('MenteeDashboard'))}
          >
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-4">🎓</div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">אזור חניך</h2>
              <p className="text-slate-600 text-sm">צפה בפרופיל, קבע מפגשים, תשלומים</p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-teal-500" 
            onClick={() => navigate(createPageUrl('MentorDashboard'))}
          >
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-4">👨‍🏫</div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">אזור חונך</h2>
              <p className="text-slate-600 text-sm">נהל זמינות, דווח שעות, צפה במפגשים</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}