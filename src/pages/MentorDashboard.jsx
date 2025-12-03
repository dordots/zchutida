import React from 'react';
import { Session, Mentor, Mentee } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '../utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Calendar, Clock, GraduationCap, AlertTriangle, X, Clock as ClockIcon } from 'lucide-react';

export default function MentorDashboard() {
  const navigate = useNavigate();

  // Get id_number from localStorage
  const idNumber = localStorage.getItem('zchut_user_id');

  // Load mentor profile from database
  const { data: profile } = useQuery({
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

  // Check if user is also a mentee (to redirect to combined dashboard)
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

  // Redirect to combined dashboard if user is both
  React.useEffect(() => {
    if (profile && menteeProfile) {
      navigate(createPageUrl('CombinedDashboard'));
    }
  }, [profile, menteeProfile, navigate]);

  // Redirect to home if not logged in
  React.useEffect(() => {
    if (!idNumber) {
      navigate(createPageUrl('Home'));
    }
  }, [idNumber, navigate]);

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

  const queryClient = useQueryClient();
  
  const dismissNotification = async (sessionId) => {
    await Session.update(sessionId, { notification_dismissed_by_mentor: true });
    queryClient.invalidateQueries(['cancelledSessionsMentor']);
  };

  const isApproved = profile?.admin_approved === true;

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
        <div className="text-slate-600">טוען...</div>
      </div>
    );
  }

  // Show approval pending message if not approved
  if (!isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <ClockIcon className="h-5 w-5 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>הבקשה שלך ממתינה לאישור מנהל המערכת</strong>
                <br />
                <span className="text-sm">אין לך הרשאה לגשת לעמודים אלה עד שהמנהל יאשר את הפרופיל שלך.</span>
              </AlertDescription>
            </Alert>
            {profile.admin_rejection_reason && (
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>הבקשה שלך נדחתה על ידי המנהל:</strong> {profile.admin_rejection_reason}
                  <br />
                  <span className="text-sm">ניתן לעדכן את הפרטים ולשלוח שוב לאישור.</span>
                </AlertDescription>
              </Alert>
            )}
            <Button 
              onClick={() => navigate(createPageUrl('MentorProfile'))}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              לפרופיל שלי
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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