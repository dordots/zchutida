import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, GraduationCap, CheckCircle2, XCircle, Clock, 
  Eye, FileText, Loader2, Calendar, TrendingUp, Download 
} from 'lucide-react';
import moment from 'moment';

export default function AdminDashboard() {
  const [adminProfile, setAdminProfile] = useState(null);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [hoursToAssign, setHoursToAssign] = useState('');
  const [menteeDialogOpen, setMenteeDialogOpen] = useState(false);
  const [mentorDialogOpen, setMentorDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const userData = localStorage.getItem('zchut_user');
    if (!userData) {
      navigate(createPageUrl('Home'));
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.type === 'admin') {
      setAdminProfile(parsed.profile);
    } else {
      navigate(createPageUrl('Home'));
    }
  }, [navigate]);

  // Fetch all data
  const { data: mentees = [], isLoading: menteesLoading } = useQuery({
    queryKey: ['allMentees'],
    queryFn: () => base44.entities.Mentee.list()
  });

  const { data: mentors = [], isLoading: mentorsLoading } = useQuery({
    queryKey: ['allMentors'],
    queryFn: () => base44.entities.Mentor.list()
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['allSessions'],
    queryFn: () => base44.entities.Session.list()
  });

  // Mutations
  const approveMenteeMutation = useMutation({
    mutationFn: async ({ menteeId, hours }) => {
      return await base44.entities.Mentee.update(menteeId, {
        admin_approved: true,
        hours_balance: parseFloat(hours) || 0,
        status: 'admin_approved'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allMentees']);
      setMenteeDialogOpen(false);
      setSelectedMentee(null);
      setHoursToAssign('');
    }
  });

  const rejectMenteeMutation = useMutation({
    mutationFn: async ({ menteeId, reason }) => {
      return await base44.entities.Mentee.update(menteeId, {
        admin_approved: false,
        status: 'army_rejected',
        admin_rejection_reason: reason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allMentees']);
      setMenteeDialogOpen(false);
      setSelectedMentee(null);
      setRejectionReason('');
    }
  });

  const approveMentorMutation = useMutation({
    mutationFn: async (mentorId) => {
      return await base44.entities.Mentor.update(mentorId, {
        status: 'approved',
        admin_approved: true,
        available: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allMentors']);
      setMentorDialogOpen(false);
      setSelectedMentor(null);
    }
  });

  const rejectMentorMutation = useMutation({
    mutationFn: async ({ mentorId, reason }) => {
      return await base44.entities.Mentor.update(mentorId, {
        status: 'suspended',
        admin_approved: false,
        admin_rejection_reason: reason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allMentors']);
      setMentorDialogOpen(false);
      setSelectedMentor(null);
      setRejectionReason('');
    }
  });

  const updateHoursMutation = useMutation({
    mutationFn: async ({ menteeId, hours }) => {
      return await base44.entities.Mentee.update(menteeId, {
        hours_balance: parseFloat(hours)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allMentees']);
    }
  });

  // Stats
  const pendingMentees = mentees.filter(m => !m.admin_approved);
  const approvedMentees = mentees.filter(m => m.admin_approved);
  const pendingMentors = mentors.filter(m => !m.admin_approved);
  const approvedMentors = mentors.filter(m => m.admin_approved);
  
  const totalHoursUsed = sessions
    .filter(s => s.status === 'approved' || s.status === 'completed')
    .reduce((sum, s) => sum + (s.duration_hours || 0), 0);

  const getMentorName = (mentorId) => mentors.find(m => m.id === mentorId)?.full_name || 'לא ידוע';
  const getMenteeName = (menteeId) => mentees.find(m => m.id === menteeId)?.full_name || 'לא ידוע';

  // Export functions
  const exportToCSV = (data, filename, headers) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${moment().format('YYYY-MM-DD')}.csv`;
    link.click();
  };

  const exportMentees = () => {
    const data = mentees.map(m => ({
      'שם מלא': m.full_name,
      'תעודת זהות': m.id_number,
      'מוסד': m.institution,
      'סטטוס': m.admin_approved ? 'מאושר' : 'ממתין',
      'יתרת שעות': m.hours_balance || 0,
      'סכום ששולם': m.payment_amount || 0
    }));
    exportToCSV(data, 'חניכים', ['שם מלא', 'תעודת זהות', 'מוסד', 'סטטוס', 'יתרת שעות', 'סכום ששולם']);
  };

  const exportMentors = () => {
    const data = mentors.map(m => ({
      'שם מלא': m.full_name,
      'תעודת זהות': m.id_number,
      'מוסד': m.institution,
      'סטטוס': m.status === 'approved' ? 'מאושר' : m.status === 'suspended' ? 'מושעה' : 'ממתין',
      'תעריף לשעה': m.hourly_rate || 0
    }));
    exportToCSV(data, 'חונכים', ['שם מלא', 'תעודת זהות', 'מוסד', 'סטטוס', 'תעריף לשעה']);
  };

  const exportSessions = () => {
    const data = sessions.map(s => ({
      'תאריך': moment(s.date).format('DD/MM/YYYY'),
      'חניך': getMenteeName(s.mentee_id),
      'חונך': getMentorName(s.mentor_id),
      'נושא': s.subject || 'מפגש חונכות',
      'שעת התחלה': s.start_time,
      'שעת סיום': s.end_time,
      'משך': s.duration_hours,
      'סטטוס': s.status === 'approved' ? 'מאושר' : s.status === 'rejected' ? 'נדחה' : 'ממתין'
    }));
    exportToCSV(data, 'מפגשים', ['תאריך', 'חניך', 'חונך', 'נושא', 'שעת התחלה', 'שעת סיום', 'משך', 'סטטוס']);
  };

  if (!adminProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">פאנל ניהול</h1>
          <p className="text-slate-600">שלום {adminProfile.full_name}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 opacity-80" />
                <span className="text-sm opacity-80">חניכים ממתינים</span>
              </div>
              <div className="text-4xl font-bold">{pendingMentees.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-500" />
                <span className="text-sm text-slate-500">חניכים מאושרים</span>
              </div>
              <div className="text-4xl font-bold text-green-600">{approvedMentees.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 opacity-80" />
                <span className="text-sm opacity-80">חונכים ממתינים</span>
              </div>
              <div className="text-4xl font-bold">{pendingMentors.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-slate-500">חונכים מאושרים</span>
              </div>
              <div className="text-4xl font-bold text-blue-600">{approvedMentors.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-slate-500">שעות שנוצלו</span>
              </div>
              <div className="text-4xl font-bold text-emerald-600">{totalHoursUsed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="mentees" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="mentees">חניכים ({mentees.length})</TabsTrigger>
            <TabsTrigger value="mentors">חונכים ({mentors.length})</TabsTrigger>
            <TabsTrigger value="sessions">מפגשים ({sessions.length})</TabsTrigger>
            <TabsTrigger value="hours">ניהול שעות</TabsTrigger>
          </TabsList>

          {/* Mentees Tab */}
          <TabsContent value="mentees">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>ניהול חניכים</CardTitle>
                <Button variant="outline" size="sm" onClick={exportMentees}>
                  <Download className="w-4 h-4 ml-1" />
                  ייצוא לאקסל
                </Button>
              </CardHeader>
              <CardContent>
                {menteesLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mentees.map((mentee) => (
                      <div key={mentee.id} className="p-4 bg-slate-50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            mentee.admin_approved ? 'bg-green-100' : 'bg-yellow-100'
                          }`}>
                            {mentee.admin_approved ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <Clock className="w-5 h-5 text-yellow-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{mentee.full_name}</div>
                            <div className="text-sm text-slate-500">ת.ז: {mentee.id_number}</div>
                            <div className="text-sm text-slate-500">יתרת שעות: {mentee.hours_balance || 0}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            mentee.admin_approved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {mentee.admin_approved ? 'מאושר' : 'ממתין'}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMentee(mentee);
                              setHoursToAssign(mentee.hours_balance?.toString() || '');
                              setMenteeDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 ml-1" />
                            פרטים
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mentors Tab */}
          <TabsContent value="mentors">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>ניהול חונכים</CardTitle>
                <Button variant="outline" size="sm" onClick={exportMentors}>
                  <Download className="w-4 h-4 ml-1" />
                  ייצוא לאקסל
                </Button>
              </CardHeader>
              <CardContent>
                {mentorsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mentors.map((mentor) => (
                      <div key={mentor.id} className="p-4 bg-slate-50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            mentor.status === 'approved' ? 'bg-green-100' : 
                            mentor.status === 'suspended' ? 'bg-red-100' : 'bg-yellow-100'
                          }`}>
                            {mentor.status === 'approved' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : mentor.status === 'suspended' ? (
                              <XCircle className="w-5 h-5 text-red-600" />
                            ) : (
                              <Clock className="w-5 h-5 text-yellow-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{mentor.full_name}</div>
                            <div className="text-sm text-slate-500">ת.ז: {mentor.id_number}</div>
                            <div className="text-sm text-slate-500">{mentor.institution}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            mentor.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : mentor.status === 'suspended'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {mentor.status === 'approved' ? 'מאושר' : mentor.status === 'suspended' ? 'מושעה' : 'ממתין'}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMentor(mentor);
                              setMentorDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 ml-1" />
                            פרטים
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>כל המפגשים</CardTitle>
                <Button variant="outline" size="sm" onClick={exportSessions}>
                  <Download className="w-4 h-4 ml-1" />
                  ייצוא לאקסל
                </Button>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">אין מפגשים</p>
                ) : (
                  <div className="space-y-3">
                    {sessions
                      .sort((a, b) => moment(b.date).diff(moment(a.date)))
                      .map((session) => (
                        <div key={session.id} className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                session.status === 'approved' ? 'bg-green-100' : 
                                session.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
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
                                <div className="font-medium text-slate-900">{session.subject || 'מפגש חונכות'}</div>
                                <div className="text-sm text-slate-500">
                                  חניך: {getMenteeName(session.mentee_id)} | חונך: {getMentorName(session.mentor_id)}
                                </div>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              session.status === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : session.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {session.status === 'approved' ? 'מאושר' : session.status === 'rejected' ? 'נדחה' : 'ממתין'}
                            </span>
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-4 mr-14">
                            <span>📅 {moment(session.date).format('DD/MM/YYYY')}</span>
                            <span>🕐 {session.start_time} - {session.end_time}</span>
                            <span>⏱️ {session.duration_hours} שעות</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hours Management Tab */}
          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>ניהול יתרות שעות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {approvedMentees.map((mentee) => {
                    const usedHours = sessions
                      .filter(s => s.mentee_id === mentee.id && (s.status === 'approved' || s.status === 'completed'))
                      .reduce((sum, s) => sum + (s.duration_hours || 0), 0);
                    const remainingHours = (mentee.hours_balance || 0) - usedHours;
                    
                    return (
                      <div key={mentee.id} className="p-4 bg-slate-50 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-900">{mentee.full_name}</div>
                          <div className="text-sm text-slate-500">
                            יתרה: {mentee.hours_balance || 0} | נוצלו: {usedHours} | נותרו: {remainingHours}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-20"
                            defaultValue={mentee.hours_balance || 0}
                            onBlur={(e) => {
                              if (e.target.value !== mentee.hours_balance?.toString()) {
                                updateHoursMutation.mutate({ 
                                  menteeId: mentee.id, 
                                  hours: e.target.value 
                                });
                              }
                            }}
                          />
                          <span className="text-sm text-slate-500">שעות</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Mentee Details Dialog */}
        <Dialog open={menteeDialogOpen} onOpenChange={setMenteeDialogOpen}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>פרטי חניך - {selectedMentee?.full_name}</DialogTitle>
            </DialogHeader>
            {selectedMentee && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-500">מספר זהות</label>
                    <div className="font-medium">{selectedMentee.id_number}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">מוסד לימודים</label>
                    <div className="font-medium">{selectedMentee.institution || 'לא צוין'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">סטטוס תשלום</label>
                    <div className="font-medium">{selectedMentee.payment_status === 'paid' ? 'שולם' : 'ממתין'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">סכום ששולם</label>
                    <div className="font-medium">₪{selectedMentee.payment_amount || 0}</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="text-sm text-slate-500 block mb-2">מסמכים</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedMentee.study_confirmation_url ? (
                      <a href={selectedMentee.study_confirmation_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="border-green-300 text-green-700">
                          <FileText className="w-4 h-4 ml-1" />
                          אישור לימודים ✓
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" size="sm" disabled className="opacity-50">
                        <FileText className="w-4 h-4 ml-1" />
                        אישור לימודים (חסר)
                      </Button>
                    )}
                    {selectedMentee.aid_fund_confirmation_url ? (
                      <a href={selectedMentee.aid_fund_confirmation_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="border-green-300 text-green-700">
                          <FileText className="w-4 h-4 ml-1" />
                          אישור קרן סיוע ✓
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" size="sm" disabled className="opacity-50">
                        <FileText className="w-4 h-4 ml-1" />
                        אישור קרן סיוע (חסר)
                      </Button>
                    )}
                    {selectedMentee.payment_receipt_url ? (
                      <a href={selectedMentee.payment_receipt_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="border-green-300 text-green-700">
                          <FileText className="w-4 h-4 ml-1" />
                          אסמכתת תשלום ✓
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" size="sm" disabled className="opacity-50">
                        <FileText className="w-4 h-4 ml-1" />
                        אסמכתת תשלום (חסר)
                      </Button>
                    )}
                    {selectedMentee.army_approval_document_url ? (
                      <a href={selectedMentee.army_approval_document_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="border-green-300 text-green-700">
                          <FileText className="w-4 h-4 ml-1" />
                          אישור צבא/קרן ✓
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" size="sm" disabled className="opacity-50">
                        <FileText className="w-4 h-4 ml-1" />
                        אישור צבא/קרן (חסר)
                      </Button>
                    )}
                    {selectedMentee.invoice_url && (
                      <a href={selectedMentee.invoice_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
                          <FileText className="w-4 h-4 ml-1" />
                          קבלה
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="text-sm text-slate-500 block mb-2">קביעת יתרת שעות</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={hoursToAssign}
                      onChange={(e) => setHoursToAssign(e.target.value)}
                      placeholder="מספר שעות"
                      className="w-32"
                    />
                    <span className="text-sm text-slate-500">שעות</span>
                  </div>
                </div>

                {!selectedMentee.admin_approved && (
                  <div className="border-t pt-4">
                    <label className="text-sm text-slate-500 block mb-2">סיבת דחייה (אם רלוונטי)</label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="הסבר למה הבקשה נדחתה..."
                      className="min-h-20"
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setMenteeDialogOpen(false)}>
                סגור
              </Button>
              {selectedMentee && !selectedMentee.admin_approved && (
                <>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-300"
                    onClick={() => rejectMenteeMutation.mutate({ menteeId: selectedMentee.id, reason: rejectionReason })}
                    disabled={rejectMenteeMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 ml-1" />
                    דחה
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => approveMenteeMutation.mutate({ 
                      menteeId: selectedMentee.id, 
                      hours: hoursToAssign 
                    })}
                    disabled={approveMenteeMutation.isPending || !hoursToAssign}
                  >
                    <CheckCircle2 className="w-4 h-4 ml-1" />
                    אשר וקבע שעות
                  </Button>
                </>
              )}
              {selectedMentee && selectedMentee.admin_approved && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => updateHoursMutation.mutate({ 
                    menteeId: selectedMentee.id, 
                    hours: hoursToAssign 
                  })}
                  disabled={updateHoursMutation.isPending}
                >
                  עדכן שעות
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mentor Details Dialog */}
        <Dialog open={mentorDialogOpen} onOpenChange={setMentorDialogOpen}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>פרטי חונך - {selectedMentor?.full_name}</DialogTitle>
            </DialogHeader>
            {selectedMentor && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-500">מספר זהות</label>
                    <div className="font-medium">{selectedMentor.id_number}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">מוסד לימודים</label>
                    <div className="font-medium">{selectedMentor.institution || 'לא צוין'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">תעריף לשעה</label>
                    <div className="font-medium">₪{selectedMentor.hourly_rate || 0}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">שנות ניסיון</label>
                    <div className="font-medium">{selectedMentor.experience_years || 0}</div>
                  </div>
                </div>

                {selectedMentor.mentoring_subjects?.length > 0 && (
                  <div>
                    <label className="text-sm text-slate-500 block mb-2">תחומי חניכה</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedMentor.mentoring_subjects.map(s => (
                        <span key={s} className="bg-slate-100 px-3 py-1 rounded-full text-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <label className="text-sm text-slate-500 block mb-2">מסמכים</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedMentor.study_confirmation_url && (
                      <a href={selectedMentor.study_confirmation_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 ml-1" />
                          אישור לימודים
                        </Button>
                      </a>
                    )}
                    {selectedMentor.employment_procedure_url && (
                      <a href={selectedMentor.employment_procedure_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 ml-1" />
                          נוהל העסקה
                        </Button>
                      </a>
                    )}
                    {selectedMentor.form_101_url && (
                      <a href={selectedMentor.form_101_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 ml-1" />
                          טופס 101
                        </Button>
                      </a>
                    )}
                    {selectedMentor.commitment_letter_url && (
                      <a href={selectedMentor.commitment_letter_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 ml-1" />
                          כתב התחייבות
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {selectedMentor.status === 'pending_approval' && (
                  <div className="border-t pt-4">
                    <label className="text-sm text-slate-500 block mb-2">סיבת דחייה (אם רלוונטי)</label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="הסבר למה הבקשה נדחתה..."
                      className="min-h-20"
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setMentorDialogOpen(false)}>
                סגור
              </Button>
              {selectedMentor && selectedMentor.status === 'pending_approval' && (
                <>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-300"
                    onClick={() => rejectMentorMutation.mutate({ mentorId: selectedMentor.id, reason: rejectionReason })}
                    disabled={rejectMentorMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 ml-1" />
                    דחה
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => approveMentorMutation.mutate(selectedMentor.id)}
                    disabled={approveMentorMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 ml-1" />
                    אשר חונך
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}