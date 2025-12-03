import React, { useState } from 'react';
import { Session, Mentee, Mentor } from '@/api/entities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, Clock, User, Calendar, Loader2, AlertTriangle, Clock as ClockIcon } from 'lucide-react';
import moment from 'moment';

export default function ApproveSessionsMentor() {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get id_number from localStorage
  const idNumber = localStorage.getItem('zchut_user_id');

  // Load mentor profile from database
  const { data: mentorProfile } = useQuery({
    queryKey: ['mentorProfileForApproveSessions', idNumber],
    queryFn: async () => {
      if (!idNumber) return null;
      const mentors = await Mentor.filter({ id_number: idNumber });
      return mentors.length > 0 ? mentors[0] : null;
    },
    enabled: !!idNumber,
    refetchOnMount: true,
    refetchOnWindowFocus: true
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

  const { data: pendingSessions = [], isLoading } = useQuery({
    queryKey: ['pendingSessions', mentorProfile?.id],
    queryFn: async () => {
      const sessions = await Session.filter({ 
        mentor_id: mentorProfile.id,
        status: 'pending'
      });
      return sessions;
    },
    enabled: !!mentorProfile
  });

  const { data: mentees = [] } = useQuery({
    queryKey: ['allMentees'],
    queryFn: () => Mentee.list(),
    enabled: !!mentorProfile
  });

  const approveMutation = useMutation({
    mutationFn: async (sessionId) => {
      return await Session.update(sessionId, {
        status: 'approved',
        mentor_approved: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingSessions']);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ sessionId, reason }) => {
      return await Session.update(sessionId, {
        status: 'rejected',
        cancelled_by: 'mentor',
        rejection_reason: reason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingSessions']);
      setRejectDialogOpen(false);
      setSelectedSession(null);
      setRejectReason('');
    }
  });

  const openRejectDialog = (session) => {
    setSelectedSession(session);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (selectedSession) {
      rejectMutation.mutate({ sessionId: selectedSession.id, reason: rejectReason });
    }
  };

  const getMenteeName = (menteeId) => {
    const mentee = mentees.find(m => m.id === menteeId);
    return mentee?.full_name || 'חניך';
  };

  if (isLoading || !mentorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">אישור מפגשים</h1>
          <p className="text-slate-600">אשר או דחה בקשות למפגשים מחניכים</p>
        </div>

        {pendingSessions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">אין מפגשים ממתינים</h3>
              <p className="text-slate-500">כל המפגשים אושרו</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingSessions.map((session) => (
              <Card key={session.id} className="border-r-4 border-r-yellow-500">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {session.subject || 'מפגש חונכות'}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-600 mt-1">
                          <User className="w-4 h-4" />
                          <span>{getMenteeName(session.mentee_id)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>{moment(session.date).format('DD/MM/YYYY')}</span>
                          <span>•</span>
                          <span>{session.start_time} - {session.end_time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => approveMutation.mutate(session.id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                        אשר
                      </Button>
                      <Button
                        onClick={() => openRejectDialog(session)}
                        disabled={rejectMutation.isPending}
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 ml-2" />
                        דחה
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>דחיית מפגש</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-slate-600 mb-3">
                האם ברצונך להוסיף הודעה לחניך? (אופציונלי)
              </p>
              <Textarea
                placeholder="לדוגמה: אני לא פנוי באותו יום, אפשר לקבוע ליום אחר..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-24"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                ביטול
              </Button>
              <Button 
                onClick={confirmReject}
                disabled={rejectMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {rejectMutation.isPending ? 'דוחה...' : 'דחה מפגש'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}