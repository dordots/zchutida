import React, { useState, useEffect } from 'react';
import { Session } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '../utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Calendar, CreditCard, GraduationCap, AlertTriangle, X, Clock, CalendarPlus } from 'lucide-react';

export default function CombinedDashboard() {
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
      navigate(createPageUrl('Home'));
      return;
    }
    setUserData(parsed);
  }, [navigate]);

  const menteeProfile = userData?.menteeProfile;
  const mentorProfile = userData?.mentorProfile;

  const { data: menteeCancelledSessions = [] } = useQuery({
    queryKey: ['cancelledSessionsMentee', menteeProfile?.id],
    queryFn: async () => {
      if (!menteeProfile) return [];
      return await Session.filter({ 
        mentee_id: menteeProfile.id, 
        status: 'rejected',
        cancelled_by: 'mentor',
        notification_dismissed_by_mentee: false
      });
    },
    enabled: !!menteeProfile
  });

  const { data: mentorCancelledSessions = [] } = useQuery({
    queryKey: ['cancelledSessionsMentor', mentorProfile?.id],
    queryFn: async () => {
      if (!mentorProfile) return [];
      return await Session.filter({ 
        mentor_id: mentorProfile.id, 
        status: 'rejected',
        cancelled_by: 'mentee',
        notification_dismissed_by_mentor: false
      });
    },
    enabled: !!mentorProfile
  });

  const dismissMenteeNotification = async (sessionId) => {
    await Session.update(sessionId, { notification_dismissed_by_mentee: true });
  };

  const dismissMentorNotification = async (sessionId) => {
    await Session.update(sessionId, { notification_dismissed_by_mentor: true });
  };

  if (!userData) return null;

  return (
    <div dir="rtl">
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          שלום {menteeProfile?.full_name || mentorProfile?.full_name}!
        </h1>

        {/* Admin rejection alerts */}
        {menteeProfile?.admin_rejection_reason && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>בקשת החניך נדחתה:</strong> {menteeProfile.admin_rejection_reason}
            </AlertDescription>
          </Alert>
        )}
        {mentorProfile?.admin_rejection_reason && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>בקשת החונך נדחתה:</strong> {mentorProfile.admin_rejection_reason}
            </AlertDescription>
          </Alert>
        )}

        {/* Cancelled sessions alerts */}
        {menteeCancelledSessions.length > 0 && (
          <div className="mb-4 space-y-2">
            {menteeCancelledSessions.map((session) => (
              <Alert key={session.id} className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-red-800">
                      המפגש בתאריך {session.date} ({session.subject || 'מפגש חונכות'}) נדחה על ידי החונך
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => dismissMenteeNotification(session.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {session.rejection_reason && (
                    <p className="text-sm text-red-700 bg-red-100 p-2 rounded">
                      הודעה מהחונך: {session.rejection_reason}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {mentorCancelledSessions.length > 0 && (
          <div className="mb-4 space-y-2">
            {mentorCancelledSessions.map((session) => (
              <Alert key={session.id} className="bg-orange-50 border-orange-200">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-orange-800">
                    המפגש בתאריך {session.date} ({session.subject || 'מפגש חונכות'}) בוטל על ידי החניך
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => dismissMentorNotification(session.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Mentee Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-600" />
            </div>
            אזור חניך
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('MenteeProfile'))}>
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">הפרופיל שלי</h3>
                  <p className="text-xs text-slate-500">פרטים אישיים</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('BookSession'))}>
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <CalendarPlus className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">קביעת מפגש</h3>
                  <p className="text-xs text-slate-500">שיבוץ עם חונך</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('SelectMentor'))}>
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">החונכים</h3>
                  <p className="text-xs text-slate-500">צפייה ובחירה</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('Payment'))}>
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">תשלום ואישור</h3>
                  <p className="text-xs text-slate-500">ניהול תשלומים</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mentor Section */}
        <div>
          <h2 className="text-xl font-semibold text-teal-700 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-teal-600" />
            </div>
            אזור חונך
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('MentorProfile'))}>
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">הפרופיל שלי</h3>
                  <p className="text-xs text-slate-500">פרטים אישיים</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('ReportHours'))}>
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">ניהול שעות</h3>
                  <p className="text-xs text-slate-500">דיווח מפגשים</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('ApproveSessionsMentor'))}>
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">אישור מפגשים</h3>
                  <p className="text-xs text-slate-500">בקשות מחניכים</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Shared Calendar */}
        <div className="mt-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('Calendar'))}>
            <CardContent className="p-5 flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">לוח שנה</h3>
                <p className="text-xs text-slate-500">כל המפגשים שלי</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}