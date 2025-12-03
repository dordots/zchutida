import React, { useState } from 'react';
import { Session, Mentor, Mentee } from '@/api/entities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, Clock, User, X, AlertTriangle, Clock as ClockIcon } from 'lucide-react';
import moment from 'moment';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [selectedDay, setSelectedDay] = useState(null);
  const navigate = useNavigate();

  // Get id_number from localStorage
  const idNumber = localStorage.getItem('zchut_user_id');
  const context = localStorage.getItem('zchut_context');

  // Load mentor profile from database
  const { data: mentorProfile } = useQuery({
    queryKey: ['mentorProfileForCalendar', idNumber],
    queryFn: async () => {
      if (!idNumber) return null;
      const mentors = await Mentor.filter({ id_number: idNumber });
      return mentors.length > 0 ? mentors[0] : null;
    },
    enabled: !!idNumber,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Load mentee profile from database
  const { data: menteeProfile } = useQuery({
    queryKey: ['menteeProfileForCalendar', idNumber],
    queryFn: async () => {
      if (!idNumber) return null;
      const mentees = await Mentee.filter({ id_number: idNumber });
      return mentees.length > 0 ? mentees[0] : null;
    },
    enabled: !!idNumber,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Determine user type and profile
  const userType = context === 'mentor' && mentorProfile ? 'mentor' : 
                   (menteeProfile ? 'mentee' : 
                   (mentorProfile ? 'mentor' : null));
  const userProfile = userType === 'mentor' ? mentorProfile : menteeProfile;
  const isMentorApproved = mentorProfile?.admin_approved === true;

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions', userType, userProfile?.id],
    queryFn: async () => {
      if (!userProfile) return [];
      if (userType === 'mentee') {
        return await Session.filter({ mentee_id: userProfile.id });
      } else {
        return await Session.filter({ mentor_id: userProfile.id });
      }
    },
    enabled: !!userProfile
  });

  // Get mentors and mentees for display names
  const { data: mentors = [] } = useQuery({
    queryKey: ['mentors'],
    queryFn: () => Mentor.list()
  });

  const { data: mentees = [] } = useQuery({
    queryKey: ['mentees'],
    queryFn: () => Mentee.list()
  });

  const getMentorName = (mentorId) => mentors.find(m => m.id === mentorId)?.full_name || 'חונך';
  const getMenteeName = (menteeId) => mentees.find(m => m.id === menteeId)?.full_name || 'חניך';

  const queryClient = useQueryClient();

  const cancelSessionMutation = useMutation({
    mutationFn: async (sessionId) => {
      await Session.update(sessionId, {
        status: 'rejected',
        cancelled_by: userType
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sessions']);
    }
  });

  const getDaysInMonth = () => {
    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const startDay = startOfMonth.day();
    const days = [];

    // Add empty days for padding
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add days of month
    for (let d = startOfMonth.clone(); d.isSameOrBefore(endOfMonth); d.add(1, 'day')) {
      days.push(d.clone());
    }

    return days;
  };

  const getSessionsForDay = (day) => {
    if (!day) return [];
    return sessions.filter(s => moment(s.date).isSame(day, 'day') && s.status !== 'rejected' && s.status !== 'cancelled');
  };

  const days = getDaysInMonth();

  // Check if mentor is approved (if user is mentor)
  if (userType === 'mentor' && !isMentorApproved) {
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
            {mentorProfile?.admin_rejection_reason && (
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

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
        <div className="text-slate-600">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">לוח שנה</h1>
          <p className="text-slate-600">המפגשים והפעילויות שלך</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-600" />
              {currentMonth.format('MMMM YYYY')}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(currentMonth.clone().subtract(1, 'month'))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(currentMonth.clone().add(1, 'month'))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day, i) => (
                <div key={i} className="text-center text-sm font-medium text-slate-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                const daySessions = getSessionsForDay(day);
                const isToday = day && day.isSame(moment(), 'day');
                const isSelected = day && selectedDay && day.isSame(selectedDay, 'day');
                const hasPending = daySessions.some(s => s.status === 'pending');
                const hasApproved = daySessions.some(s => s.status === 'approved');

                return (
                  <div
                    key={i}
                    onClick={() => day && setSelectedDay(day)}
                    className={`min-h-24 p-2 rounded-lg border cursor-pointer transition-all ${
                      day ? 'bg-white hover:bg-slate-50' : 'bg-slate-50'
                    } ${isToday ? 'border-emerald-500 border-2' : isSelected ? 'border-blue-500 border-2 bg-blue-50' : 'border-slate-200'}`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-emerald-600' : isSelected ? 'text-blue-600' : 'text-slate-700'}`}>
                          {day.date()}
                        </div>
                        {daySessions.map((session, j) => (
                          <div
                            key={j}
                            className={`text-xs rounded px-2 py-1 mb-1 truncate ${
                              session.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : session.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            <Clock className="w-3 h-3 inline ml-1" />
                            {session.duration_hours} שעות - {session.subject || 'מפגש'}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Details */}
        {selectedDay && (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                לוז ליום {selectedDay.format('DD/MM/YYYY')}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDay(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {getSessionsForDay(selectedDay).length === 0 ? (
                <p className="text-slate-500 text-center py-4">אין מפגשים ביום זה</p>
              ) : (
                <div className="space-y-3">
                  {getSessionsForDay(selectedDay)
                    .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
                    .map((session, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              session.status === 'pending' ? 'bg-yellow-100' : 'bg-emerald-100'
                            }`}>
                              <User className={`w-5 h-5 ${session.status === 'pending' ? 'text-yellow-600' : 'text-emerald-600'}`} />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{session.subject || 'מפגש חונכות'}</div>
                              <div className="text-sm text-slate-600">
                                {userType === 'mentee' ? `עם ${getMentorName(session.mentor_id)}` : `עם ${getMenteeName(session.mentee_id)}`}
                              </div>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            session.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : session.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {session.status === 'approved' ? 'מאושר' : session.status === 'rejected' ? 'נדחה' : 'ממתין לאישור'}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-500 flex items-center gap-4">
                            <span>🕐 {session.start_time} - {session.end_time}</span>
                            <span>⏱️ {session.duration_hours} שעות</span>
                          </div>
                          {session.status !== 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelSessionMutation.mutate(session.id)}
                              disabled={cancelSessionMutation.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 ml-1" />
                              ביטול
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upcoming sessions list */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>מפגשים קרובים</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.filter(s => moment(s.date).isSameOrAfter(moment(), 'day') && s.status !== 'rejected').length === 0 ? (
              <p className="text-slate-500 text-center py-4">אין מפגשים קרובים</p>
            ) : (
              <div className="space-y-3">
                {sessions
                  .filter(s => moment(s.date).isSameOrAfter(moment(), 'day') && s.status !== 'rejected')
                  .sort((a, b) => moment(a.date).diff(moment(b.date)))
                  .slice(0, 5)
                  .map((session, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{session.subject || 'מפגש חונכות'}</div>
                            <div className="text-sm text-slate-600">
                              {userType === 'mentee' ? `עם ${getMentorName(session.mentor_id)}` : `עם ${getMenteeName(session.mentee_id)}`}
                            </div>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          session.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : session.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {session.status === 'approved' ? 'מאושר' : session.status === 'rejected' ? 'נדחה' : 'ממתין לאישור'}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-500 flex items-center gap-4">
                          <span>📅 {moment(session.date).format('DD/MM/YYYY')}</span>
                          <span>🕐 {session.start_time} - {session.end_time}</span>
                          <span>⏱️ {session.duration_hours} שעות</span>
                        </div>
                        {session.status !== 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelSessionMutation.mutate(session.id)}
                            disabled={cancelSessionMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 ml-1" />
                            ביטול
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}