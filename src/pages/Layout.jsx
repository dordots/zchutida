
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Button } from '@/components/ui/button';
import { GraduationCap, User, LogOut, Menu, X, Calendar, CreditCard, CalendarPlus, Home, Clock, Users } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [userData, setUserData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem('zchut_user');
    if (data) {
      const parsed = JSON.parse(data);
      setUserData(parsed);
    }
  }, [currentPageName]);

  const handleLogout = () => {
    localStorage.removeItem('zchut_user');
    navigate(createPageUrl('Home'));
  };

  // Pages without layout (landing page)
  if (currentPageName === 'Home') {
    return children;
  }

  // If not logged in via our system, don't show layout
  if (!userData) {
    return children;
  }

  const userType = userData.type; // 'mentee', 'mentor', 'both', or 'admin'

  // Check if user is also a mentor (to hide booking option for combined users)
  const isBothMenteeAndMentor = userType === 'both';

  const menteeNavItems = [
    { name: 'MenteeDashboard', label: 'ראשי', icon: Home },
    { name: 'MenteeProfile', label: 'פרופיל', icon: User },
    { name: 'Calendar', label: 'לוח שנה', icon: Calendar },
    { name: 'BookSession', label: 'קביעת מפגש', icon: CalendarPlus },
    { name: 'Payment', label: 'תשלום', icon: CreditCard },
    { name: 'SelectMentor', label: 'חונכים', icon: GraduationCap },
  ];

  const mentorNavItems = [
        { name: 'MentorDashboard', label: 'ראשי', icon: Home },
        { name: 'MentorProfile', label: 'פרופיל', icon: User },
        { name: 'Calendar', label: 'לוח שנה', icon: Calendar },
        { name: 'ReportHours', label: 'ניהול שעות', icon: Clock },
        { name: 'ApproveSessionsMentor', label: 'אישור מפגשים', icon: CalendarPlus },
      ];

      const adminNavItems = [
        { name: 'AdminDashboard', label: 'פאנל ניהול', icon: Home },
      ];

  // Determine which nav to show based on current page context
  const mentorPages = ['MentorDashboard', 'MentorProfile', 'ReportHours', 'ApproveSessionsMentor'];
  const menteePages = ['MenteeDashboard', 'MenteeProfile', 'Payment', 'SelectMentor', 'BookSession'];
  
  let navItems = menteeNavItems;
  let displayType = 'חניך';
  let typeColor = 'bg-emerald-100 text-emerald-700';

  // Get stored context for shared pages
  const storedContext = localStorage.getItem('zchut_context');
  
  // Determine context based on current page or stored preference
  let currentContext = 'mentee';
  
  if (mentorPages.includes(currentPageName)) {
    currentContext = 'mentor';
  } else if (menteePages.includes(currentPageName)) {
    currentContext = 'mentee';
  } else if (storedContext) {
    currentContext = storedContext;
  } else if (userType === 'mentor') {
    currentContext = 'mentor';
  }
  
  // Apply context
      if (userType === 'admin') {
        navItems = adminNavItems;
        displayType = 'מנהל';
        typeColor = 'bg-purple-100 text-purple-700';
      } else if (userType === 'both') {
        navItems = []; // Combined dashboard has its own navigation
        displayType = 'חניך + חונך';
        typeColor = 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700';
      } else if (currentContext === 'mentor' && userType === 'mentor') {
        navItems = mentorNavItems;
        displayType = 'חונך';
        typeColor = 'bg-teal-100 text-teal-700';
      } else if (userType === 'mentee') {
        navItems = menteeNavItems;
        displayType = 'חניך';
        typeColor = 'bg-emerald-100 text-emerald-700';
      } else if (userType === 'mentor') {
        navItems = mentorNavItems;
        displayType = 'חונך';
        typeColor = 'bg-teal-100 text-teal-700';
      }

  const profileName = userData.profile?.full_name || 'משתמש';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-l from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                זכותידע
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.name)}
                    onClick={() => {
                      if (mentorPages.includes(item.name)) localStorage.setItem('zchut_context', 'mentor');
                      else if (menteePages.includes(item.name)) localStorage.setItem('zchut_context', 'mentee');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm ${
                      currentPageName === item.name
                        ? 'bg-emerald-100 text-emerald-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{profileName}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${typeColor}`}>
                  {displayType}
                </span>
                <Link
                                      to={createPageUrl(userType === 'both' ? 'CombinedDashboard' : userType === 'mentor' || currentContext === 'mentor' ? 'MentorDashboard' : 'MenteeDashboard')}
                                      className="text-slate-600 hover:text-slate-800"
                                      title="חזרה לדאשבורד"
                                    >
                                      <Home className="w-5 h-5" />
                                    </Link>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-slate-600"
              >
                <LogOut className="w-4 h-4 ml-1" />
                יציאה
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-600" />
              ) : (
                <Menu className="w-6 h-6 text-slate-600" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 border-t pt-4 space-y-1">
              <div className="flex items-center gap-2 px-4 py-2 mb-2">
                <span className="text-sm text-slate-600">{profileName}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${typeColor}`}>
                  {displayType}
                </span>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.name)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
                      currentPageName === item.name
                        ? 'bg-emerald-100 text-emerald-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (mentorPages.includes(item.name)) localStorage.setItem('zchut_context', 'mentor');
                      else if (menteePages.includes(item.name)) localStorage.setItem('zchut_context', 'mentee');
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <Button
                variant="outline"
                className="w-full justify-start text-slate-600 mt-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 ml-2" />
                יציאה
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
