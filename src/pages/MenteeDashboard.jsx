import React from 'react';
import { Session, Mentee, Mentor } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Calendar, CreditCard, GraduationCap, AlertTriangle, X, Clock, CalendarPlus } from 'lucide-react';

export default function MenteeDashboard() {
  const navigate = useNavigate();

  // Get id_number from localStorage
  const idNumber = localStorage.getItem('zchut_user_id');

  // Load mentee profile from database
  const { data: profile } = useQuery({
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

  // Check if user is also a mentor (to redirect to combined dashboard)
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

  // Redirect to combined dashboard if user is both
  React.useEffect(() => {
    if (profile && mentorProfile) {
      navigate(createPageUrl('CombinedDashboard'));
    }
  }, [profile, mentorProfile, navigate]);

  // Redirect to home if not logged in
  React.useEffect(() => {
    if (!idNumber) {
      navigate(createPageUrl('Home'));
    }
  }, [idNumber, navigate]);

  const { data: cancelledSessions = [] } = useQuery({
    queryKey: ['cancelledSessionsMentee', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      // Get rejected sessions by mentor
      const rejected = await Session.filter({ 
        mentee_id: profile.id, 
        status: 'rejected',
        cancelled_by: 'mentor',
        notification_dismissed_by_mentee: false
      });
      return rejected;
    },
    enabled: !!profile
  });

  const queryClient = useQueryClient();
  
  const dismissNotification = async (sessionId) => {
    await Session.update(sessionId, { notification_dismissed_by_mentee: true });
    queryClient.invalidateQueries(['cancelledSessionsMentee']);
  };

  const isApproved = profile?.admin_approved === true;

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
        <div className="text-slate-600">טוען...</div>
      </div>
    );
  }

  return (
    <div dir="rtl">
                <div className="p-6 max-w-5xl mx-auto">
                  <h1 className="text-3xl font-bold text-slate-900 mb-4">שלום {profile.full_name}!</h1>

                  {/* Pending approval notice */}
                  {!isApproved && !profile.admin_rejection_reason && (
                    <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        <strong>הבקשה שלך ממתינה לאישור מנהל המערכת.</strong>
                        <br />
                        בינתיים תוכל להשלים את הפרופיל שלך ולבצע תשלום. לאחר האישור תוכל ליצור קשר עם חונכים ולקבוע מפגשים.
                      </AlertDescription>
                    </Alert>
                  )}

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

                  {cancelledSessions.length > 0 && (
                                  <div className="mb-6 space-y-2">
                                    {cancelledSessions.map((session) => (
                                      <Alert key={session.id} className="bg-red-50 border-red-200">
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                        <AlertDescription className="flex flex-col gap-2">
                                          <div className="flex items-center justify-between">
                                            <span className="text-red-800">
                                              המפגש בתאריך {session.date} ({session.subject || 'מפגש חונכות'}) {session.status === 'rejected' ? 'נדחה' : 'בוטל'} על ידי החונך
                                            </span>
                                            <Button variant="ghost" size="sm" onClick={() => dismissNotification(session.id)}>
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

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('MenteeProfile'))}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                <User className="w-7 h-7 text-emerald-600" />
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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('Payment'))}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">תשלום ואישור</h3>
                <p className="text-sm text-slate-500">ניהול תשלומים ואישורים</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('SelectMentor'))}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isApproved ? 'bg-teal-100' : 'bg-slate-100'}`}>
                <GraduationCap className={`w-7 h-7 ${isApproved ? 'text-teal-600' : 'text-slate-400'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isApproved ? 'text-slate-900' : 'text-slate-500'}`}>החונכים</h3>
                <p className="text-sm text-slate-500">
                  {isApproved ? 'צפייה ובחירת חונך' : 'צפייה בחונכים (יצירת קשר לאחר אישור)'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`transition-shadow ${isApproved ? 'hover:shadow-lg cursor-pointer' : 'opacity-60 cursor-not-allowed'}`} 
            onClick={() => isApproved && navigate(createPageUrl('BookSession'))}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isApproved ? 'bg-orange-100' : 'bg-slate-100'}`}>
                <CalendarPlus className={`w-7 h-7 ${isApproved ? 'text-orange-600' : 'text-slate-400'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isApproved ? 'text-slate-900' : 'text-slate-500'}`}>קביעת מפגש</h3>
                <p className="text-sm text-slate-500">
                  {isApproved ? 'שיבוץ מפגש עם חונך' : 'זמין לאחר אישור מנהל'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}