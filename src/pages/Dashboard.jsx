import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, GraduationCap, LogOut } from 'lucide-react';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem('zchut_user');
    if (!data) {
      navigate(createPageUrl('Home'));
      return;
    }
    const parsed = JSON.parse(data);
    if (parsed.type !== 'both') {
      // Redirect to specific dashboard if not both
      if (parsed.type === 'mentee') navigate(createPageUrl('MenteeDashboard'));
      else if (parsed.type === 'mentor') navigate(createPageUrl('MentorDashboard'));
      return;
    }
    setUserData(parsed);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('zchut_user');
    navigate(createPageUrl('Home'));
  };

  if (!userData) return null;

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
            <span className="text-sm text-slate-600">שלום, {userData.profile?.full_name}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">חניך + חונך</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 ml-2" />
              יציאה
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">שלום {userData.profile?.full_name}!</h1>
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