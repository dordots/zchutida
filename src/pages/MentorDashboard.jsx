import React, { useState, useEffect } from 'react';
import { Session } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '../utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Calendar, Clock, GraduationCap, AlertTriangle, X } from 'lucide-react';

export default function MentorDashboard() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('zchut_user');
    if (!userData) {
      navigate(createPageUrl('Home'));
      return;
    }
    const parsed = JSON.parse(userData);
    
    // If user is 'both', redirect to combined dashboard
    if (parsed.type === 'both') {
      navigate(createPageUrl('CombinedDashboard'));
      return;
    }
    
    // If not approved, redirect to profile
    if (!parsed.mentorApproved) {
      navigate(createPageUrl('MentorProfile'));
      return;
    }
    
    // Support 'mentor' type
    if (parsed.type === 'mentor') {
      setProfile(parsed.profile);
    } else {
      navigate(createPageUrl('Home'));
    }
  }, [navigate]);

  const { data: cancelledSessions = [] } = useQuery({
    queryKey: ['cancelledSessionsMentor', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      // Get rejected sessions by mentee
      const rejected = await Session.filter({ 
        mentor_id: profile.id, 
        status: 'rejected',
        cancelled_by: 'mentee',
        notification_dismissed_by_mentor: false
      });
      return rejected;
    },
    enabled: !!profile
  });

  const dismissNotification = async (sessionId) => {
    await Session.update(sessionId, { notification_dismissed_by_mentor: true });
  };

  if (!profile) return null;

  return (
    <div dir="rtl">
                <div className="p-6 max-w-5xl mx-auto">
                  <h1 className="text-3xl font-bold text-slate-900 mb-4">שלום {profile.full_name}!</h1>

                  {profile.admin_rejection_reason && (
                    <Alert className="mb-6 bg-red-50 border-red-200">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>הבקשה שלך נדחתה על ידי המנהל:</strong> {profile.admin_rejection_reason}
                      </AlertDescription>
                    </Alert>
                  )}

                  {cancelledSessions.length > 0 && (
                                  <div className="mb-6 space-y-2">
                                    {cancelledSessions.map((session) => (
                                      <Alert key={session.id} className="bg-red-50 border-red-200">
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                        <AlertDescription className="flex items-center justify-between">
                                          <span className="text-red-800">
                                            המפגש בתאריך {session.date} ({session.subject || 'מפגש חונכות'}) בוטל על ידי החניך
                                          </span>
                                          <Button variant="ghost" size="sm" onClick={() => dismissNotification(session.id)}>
                                            <X className="w-4 h-4" />
                                          </Button>
                                        </AlertDescription>
                                      </Alert>
                                    ))}
                                  </div>
                                )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('MentorProfile'))}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center">
                <User className="w-7 h-7 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">הפרופיל שלי</h3>
                <p className="text-sm text-slate-500">צפייה ועריכת פרטים אישיים</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('Calendar'))}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">לוח שנה</h3>
                <p className="text-sm text-slate-500">המפגשים והלוז שלי</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('ReportHours'))}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">ניהול שעות</h3>
                <p className="text-sm text-slate-500">דיווח על מפגשי חונכות</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('ApproveSessionsMentor'))}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">אישור מפגשים</h3>
                <p className="text-sm text-slate-500">אשר בקשות מחניכים</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}