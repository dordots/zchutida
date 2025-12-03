import React from 'react';
import { Session, Mentee, Mentor } from '@/api/entities';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle2, XCircle, Loader2, Calendar, Users, TrendingUp, AlertTriangle, Clock as ClockIcon } from 'lucide-react';
import moment from 'moment';

export default function ReportHours() {
  const navigate = useNavigate();

  // Get id_number from localStorage
  const idNumber = localStorage.getItem('zchut_user_id');

  // Load mentor profile from database
  const { data: mentorProfile } = useQuery({
    queryKey: ['mentorProfileForReportHours', idNumber],
    queryFn: async () => {
      if (!idNumber) return null;
      const mentors = await Mentor.filter({ id_number: idNumber });
      return mentors.length > 0 ? mentors[0] : null;
    },
    enabled: !!idNumber,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Get sessions for this mentor - must be called before any early returns
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['mentorSessions', mentorProfile?.id],
    queryFn: async () => {
      if (!mentorProfile?.id) return [];
      return await Session.filter({ mentor_id: mentorProfile.id });
    },
    enabled: !!mentorProfile?.id
  });

  // Get mentees for display names - must be called before any early returns
  const { data: mentees = [] } = useQuery({
    queryKey: ['mentees'],
    queryFn: () => Mentee.list()
  });

  // Get pending sessions that need mentor approval - must be called before any early returns
  const { data: pendingApproval = [] } = useQuery({
    queryKey: ['pendingApproval', mentorProfile?.id],
    queryFn: async () => {
      if (!mentorProfile?.id) return [];
      return await Session.filter({ mentor_id: mentorProfile.id, status: 'pending' });
    },
    enabled: !!mentorProfile?.id
  });

  const isApproved = mentorProfile?.admin_approved === true;

  if (!mentorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
        <div className="text-slate-600">טוען...</div>
      </div>
    );
  }

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
                <span className="text-sm">אין לך הרשאה לגשת לעמוד זה עד שהמנהל יאשר את הפרופיל שלך.</span>
              </AlertDescription>
            </Alert>
            {mentorProfile.admin_rejection_reason && (
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>הבקשה שלך נדחתה על ידי המנהל:</strong> {mentorProfile.admin_rejection_reason}
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

  const getMenteeName = (menteeId) => mentees.find(m => m.id === menteeId)?.full_name || 'חניך';

  const today = moment();
  
  // Past sessions (already happened) - only count these for completed hours
  const pastSessions = sessions.filter(s => moment(s.date).isBefore(today, 'day'));
  
  // Future sessions (upcoming) - exclude rejected
  const futureSessions = sessions.filter(s => moment(s.date).isSameOrAfter(today, 'day') && s.status !== 'rejected');
  
  // Current month sessions (past only)
  const currentMonthSessions = pastSessions.filter(s => moment(s.date).isSame(today, 'month'));
  
  // Completed hours this month (only past approved sessions)
  const completedHoursThisMonth = currentMonthSessions
    .filter(s => s.status === 'approved')
    .reduce((sum, s) => sum + (s.duration_hours || 0), 0);
  
  // Total completed hours (all past approved)
  const totalCompletedHours = pastSessions
    .filter(s => s.status === 'approved')
    .reduce((sum, s) => sum + (s.duration_hours || 0), 0);
  
  // Expected hours (future approved sessions)
  const expectedHours = futureSessions
    .filter(s => s.status === 'approved' || s.status === 'pending')
    .reduce((sum, s) => sum + (s.duration_hours || 0), 0);

  // Pending approval count
  const pendingCount = pendingApproval.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">ניהול שעות</h1>
          <p className="text-slate-600">סיכום המפגשים והשעות שלך</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 opacity-80" />
                <span className="text-sm opacity-80">שעות החודש</span>
              </div>
              <div className="text-4xl font-bold">{completedHoursThisMonth}</div>
              <div className="text-xs opacity-70 mt-1">שעות שהושלמו</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-slate-500">סה"כ שעות</span>
              </div>
              <div className="text-4xl font-bold text-blue-600">{totalCompletedHours}</div>
              <div className="text-xs text-slate-400 mt-1">כל הזמנים</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-slate-500">שעות צפויות</span>
              </div>
              <div className="text-4xl font-bold text-purple-600">{expectedHours}</div>
              <div className="text-xs text-slate-400 mt-1">מפגשים עתידיים</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-slate-500">ממתינים לאישור</span>
              </div>
              <div className="text-4xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-xs text-slate-400 mt-1">בקשות מחניכים</div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="upcoming">מפגשים קרובים ({futureSessions.length})</TabsTrigger>
            <TabsTrigger value="history">היסטוריה ({pastSessions.length})</TabsTrigger>
            <TabsTrigger value="all">כל המפגשים ({sessions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>מפגשים קרובים</CardTitle>
              </CardHeader>
              <CardContent>
                {futureSessions.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">אין מפגשים קרובים</p>
                ) : (
                  <div className="space-y-3">
                    {futureSessions
                      .sort((a, b) => moment(a.date).diff(moment(b.date)))
                      .map((session, i) => (
                        <SessionCard key={i} session={session} getMenteeName={getMenteeName} />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>היסטוריית מפגשים</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                  </div>
                ) : pastSessions.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">אין מפגשים קודמים</p>
                ) : (
                  <div className="space-y-3">
                    {pastSessions
                      .sort((a, b) => moment(b.date).diff(moment(a.date)))
                      .map((session, i) => (
                        <SessionCard key={i} session={session} getMenteeName={getMenteeName} />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>כל המפגשים</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">עדיין אין מפגשים</p>
                ) : (
                  <div className="space-y-3">
                    {sessions
                      .sort((a, b) => moment(b.date).diff(moment(a.date)))
                      .map((session, i) => (
                        <SessionCard key={i} session={session} getMenteeName={getMenteeName} />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SessionCard({ session, getMenteeName }) {
  const isPast = moment(session.date).isBefore(moment(), 'day');
  
  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            session.status === 'approved' 
              ? 'bg-green-100' 
              : session.status === 'rejected'
              ? 'bg-red-100'
              : 'bg-yellow-100'
          }`}>
            {session.status === 'approved' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : session.status === 'rejected' ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : (
              <Clock className="w-5 h-5 text-yellow-600" />
            )}
          </div>
          <div>
            <div className="font-medium text-slate-900">
              {session.subject || 'מפגש חונכות'}
            </div>
            <div className="text-sm text-slate-600">
              עם {getMenteeName(session.mentee_id)}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            session.status === 'approved' 
              ? 'bg-green-100 text-green-800' 
              : session.status === 'rejected'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {session.status === 'approved' ? 'מאושר' : session.status === 'rejected' ? 'נדחה' : 'ממתין לאישור'}
          </div>
          {!isPast && (
            <span className="text-xs text-purple-600">מפגש עתידי</span>
          )}
        </div>
      </div>
      <div className="text-sm text-slate-500 flex items-center gap-4 mr-14">
        <span>📅 {moment(session.date).format('DD/MM/YYYY')}</span>
        <span>🕐 {session.start_time} - {session.end_time}</span>
        <span>⏱️ {session.duration_hours} שעות</span>
      </div>
    </div>
  );
}