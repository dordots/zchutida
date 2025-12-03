import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, User, CheckCircle2, Loader2 } from 'lucide-react';
import moment from 'moment';

const DAYS = [
  { value: 'sunday', label: 'ראשון' },
  { value: 'monday', label: 'שני' },
  { value: 'tuesday', label: 'שלישי' },
  { value: 'wednesday', label: 'רביעי' },
  { value: 'thursday', label: 'חמישי' },
  { value: 'friday', label: 'שישי' }
];

export default function BookSession() {
  const [menteeProfile, setMenteeProfile] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotType, setSlotType] = useState('recurring'); // 'recurring' or 'specific'
  const [selectedDate, setSelectedDate] = useState('');
  const [bookingStartTime, setBookingStartTime] = useState('');
  const [bookingEndTime, setBookingEndTime] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const userData = localStorage.getItem('zchut_user');
    if (!userData) {
      navigate(createPageUrl('Home'));
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.menteeProfile) {
      setMenteeProfile(parsed.menteeProfile);
    } else if (parsed.type === 'mentee') {
      setMenteeProfile(parsed.profile);
    }
  }, [navigate]);

  // Get mentor profile if user is also a mentor (to filter out self)
  const [mentorProfileId, setMentorProfileId] = useState(null);
  useEffect(() => {
    const userData = localStorage.getItem('zchut_user');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.mentorProfile) {
        setMentorProfileId(parsed.mentorProfile.id);
      } else if (parsed.type === 'mentor') {
        setMentorProfileId(parsed.profile?.id);
      }
    }
  }, []);

  const { data: mentors = [], isLoading } = useQuery({
    queryKey: ['availableMentors'],
    queryFn: async () => {
      return await base44.entities.Mentor.filter({ status: 'approved', available: true, admin_approved: true });
    }
  });

  // Get existing sessions to check availability
  const { data: existingSessions = [] } = useQuery({
    queryKey: ['existingSessions'],
    queryFn: async () => {
      return await base44.entities.Session.filter({ status: 'pending' });
    }
  });

  const { data: approvedSessions = [] } = useQuery({
    queryKey: ['approvedSessions'],
    queryFn: async () => {
      return await base44.entities.Session.filter({ status: 'approved' });
    }
  });

  const allBookedSessions = [...existingSessions, ...approvedSessions];

  // Check if a time slot overlaps with existing sessions
  const isSlotAvailable = (mentorId, date, startTime, endTime) => {
    return !allBookedSessions.some(session => {
      if (session.mentor_id !== mentorId) return false;
      if (session.date !== date) return false;
      // Check time overlap
      const sessionStart = session.start_time;
      const sessionEnd = session.end_time;
      return !(endTime <= sessionStart || startTime >= sessionEnd);
    });
  };

  const bookSessionMutation = useMutation({
    mutationFn: async (data) => {
      // Create the session
      const session = await base44.entities.Session.create(data);
      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sessions']);
      queryClient.invalidateQueries(['availableMentors']);
      setSuccess(true);
      setTimeout(() => navigate(createPageUrl('Calendar')), 2000);
    }
  });

  const handleBook = () => {
    if (!menteeProfile || !selectedMentor || !selectedSlot || !selectedDate || !bookingStartTime || !bookingEndTime) return;

    const duration = calculateDuration(bookingStartTime, bookingEndTime);
    
    // Check hours balance
    const usedHours = allBookedSessions
      .filter(s => s.mentee_id === menteeProfile.id && s.status !== 'rejected')
      .reduce((sum, s) => sum + (s.duration_hours || 0), 0);
    const remainingHours = (menteeProfile.hours_balance || 0) - usedHours;
    
    if (duration > remainingHours) {
      alert(`אין לך מספיק שעות. יתרה: ${remainingHours} שעות`);
      return;
    }

    bookSessionMutation.mutate({
      mentee_id: menteeProfile.id,
      mentor_id: selectedMentor.id,
      date: selectedDate,
      start_time: bookingStartTime,
      end_time: bookingEndTime,
      duration_hours: duration,
      subject: selectedSubject,
      status: 'pending',
      booked_by: 'mentee',
      mentee_approved: true
    });
  };

  const calculateDuration = (start, end) => {
    const startParts = start.split(':');
    const endParts = end.split(':');
    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
    return (endMinutes - startMinutes) / 60;
  };

  const isValidTimeRange = (start, end) => {
    if (!start || !end) return false;
    return calculateDuration(start, end) > 0;
  };

  const isWithinSlotRange = (start, end, slot) => {
    if (!start || !end || !slot) return true;
    if (slotType === 'specific') return true; // No restrictions for specific dates
    return start >= slot.start_time && end <= slot.end_time;
  };

  const getDayLabel = (dayValue) => {
    return DAYS.find(d => d.value === dayValue)?.label || dayValue;
  };

  const getNextDateForDay = (dayValue) => {
    const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 };
    const targetDay = dayMap[dayValue];
    const today = moment();
    let daysToAdd = targetDay - today.day();
    if (daysToAdd <= 0) daysToAdd += 7;
    return today.add(daysToAdd, 'days').format('YYYY-MM-DD');
  };

  // Get valid dates for a specific day slot
  const getValidDatesForSlot = (dayValue) => {
    const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 };
    const targetDay = dayMap[dayValue];
    const dates = [];
    const today = moment();
    
    for (let i = 0; i < 28; i++) { // Next 4 weeks
      const date = today.clone().add(i, 'days');
      if (date.day() === targetDay) {
        dates.push(date.format('YYYY-MM-DD'));
      }
    }
    return dates;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">המפגש נשמר בהצלחה!</h2>
            <p className="text-slate-600">מעביר אותך ללוח השנה...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">קביעת מפגש</h1>
          <p className="text-slate-600">בחר חונך ושעה פנויה</p>
        </div>

        {/* Step 1: Select Mentor */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              1. בחר חונך
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {mentors.filter(m => m.available_slots?.length > 0 && m.id !== mentorProfileId).map(mentor => (
                <div
                  key={mentor.id}
                  onClick={() => {
                    setSelectedMentor(mentor);
                    setSelectedSlot(null);
                    setSelectedDate('');
                  }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedMentor?.id === mentor.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {mentor.profile_image_url ? (
                      <img src={mentor.profile_image_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-slate-900">{mentor.full_name}</div>
                      <div className="text-sm text-slate-500">{mentor.institution}</div>
                    </div>
                  </div>
                  {mentor.mentoring_subjects?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {mentor.mentoring_subjects.slice(0, 3).map(s => (
                        <span key={s} className="text-xs bg-slate-100 px-2 py-1 rounded">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {mentors.filter(m => m.available_slots?.length > 0 && m.id !== mentorProfileId).length === 0 && (
              <p className="text-slate-500 text-center py-4">אין חונכים זמינים כרגע</p>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Select Slot Type */}
        {selectedMentor && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                2. בחר סוג זמינות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div
                  onClick={() => {
                    setSlotType('recurring');
                    setSelectedSlot(null);
                    setSelectedDate('');
                    setBookingStartTime('');
                    setBookingEndTime('');
                  }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${
                    slotType === 'recurring'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                  <div className="font-semibold text-slate-900">לפי ימים קבועים</div>
                  <div className="text-sm text-slate-500">בחר מהזמינות הקבועה של החונך</div>
                </div>
                <div
                  onClick={() => {
                    setSlotType('specific');
                    setSelectedSlot({ day: 'specific', start_time: '08:00', end_time: '20:00' });
                    setSelectedDate('');
                    setBookingStartTime('');
                    setBookingEndTime('');
                  }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${
                    slotType === 'specific'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="font-semibold text-slate-900">תאריך ספציפי</div>
                  <div className="text-sm text-slate-500">בחר תאריך ושעה לפי בחירתך</div>
                </div>
              </div>

              {slotType === 'recurring' && (
                <>
                  <p className="text-sm text-slate-600 mb-4">בחר את החלון הזמין ואז הגדר את השעות המדויקות</p>
                  <div className="grid md:grid-cols-3 gap-3">
                    {selectedMentor.available_slots?.map((slot, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setSelectedDate(getNextDateForDay(slot.day));
                          setBookingStartTime(slot.start_time);
                          setBookingEndTime('');
                        }}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${
                          selectedSlot?.day === slot.day && selectedSlot?.start_time === slot.start_time
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="font-semibold text-slate-900">{getDayLabel(slot.day)}</div>
                        <div className="text-emerald-600">{slot.start_time} - {slot.end_time}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {slotType === 'specific' && (
                <>
                  <p className="text-sm text-slate-600 mb-4">בחר תאריך ושעות לפי בחירתך</p>
                  <div className="space-y-4">
                    <div>
                      <Label>תאריך המפגש</Label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={moment().format('YYYY-MM-DD')}
                        className="max-w-xs"
                      />
                    </div>
                    {selectedDate && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>שעת התחלה</Label>
                          <Input
                            type="time"
                            value={bookingStartTime}
                            onChange={(e) => setBookingStartTime(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>שעת סיום</Label>
                          <Input
                            type="time"
                            value={bookingEndTime}
                            onChange={(e) => setBookingEndTime(e.target.value)}
                            min={bookingStartTime}
                          />
                        </div>
                      </div>
                    )}
                    {bookingStartTime && bookingEndTime && selectedDate && !isSlotAvailable(selectedMentor.id, selectedDate, bookingStartTime, bookingEndTime) && (
                      <p className="text-sm text-red-600">
                        ⚠️ השעות האלה כבר תפוסות, בחר שעות אחרות
                      </p>
                    )}
                    {bookingStartTime && bookingEndTime && calculateDuration(bookingStartTime, bookingEndTime) > 0 && (
                      <p className="text-sm text-purple-600">
                        משך המפגש: {calculateDuration(bookingStartTime, bookingEndTime)} שעות
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Select exact time within slot (only for recurring) */}
        {selectedSlot && slotType === 'recurring' && selectedSlot.day !== 'specific' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                3. בחר שעות מדויקות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                החונך פנוי בין {selectedSlot.start_time} ל-{selectedSlot.end_time}. בחר את השעות שמתאימות לך:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>שעת התחלה</Label>
                  <Input
                    type="time"
                    value={bookingStartTime}
                    onChange={(e) => setBookingStartTime(e.target.value)}
                    min={selectedSlot.start_time}
                    max={selectedSlot.end_time}
                  />
                </div>
                <div>
                  <Label>שעת סיום</Label>
                  <Input
                    type="time"
                    value={bookingEndTime}
                    onChange={(e) => setBookingEndTime(e.target.value)}
                    min={bookingStartTime || selectedSlot.start_time}
                    max={selectedSlot.end_time}
                  />
                </div>
              </div>
              {bookingStartTime && bookingEndTime && !isValidTimeRange(bookingStartTime, bookingEndTime) && (
                <p className="text-sm text-red-600 mt-2">
                  ⚠️ שעת ההתחלה חייבת להיות לפני שעת הסיום
                </p>
              )}
              {bookingStartTime && bookingEndTime && isValidTimeRange(bookingStartTime, bookingEndTime) && !isWithinSlotRange(bookingStartTime, bookingEndTime, selectedSlot) && (
                <p className="text-sm text-red-600 mt-2">
                  ⚠️ השעות חייבות להיות בטווח {selectedSlot.start_time} - {selectedSlot.end_time}
                </p>
              )}
              {bookingStartTime && bookingEndTime && selectedDate && isValidTimeRange(bookingStartTime, bookingEndTime) && !isSlotAvailable(selectedMentor.id, selectedDate, bookingStartTime, bookingEndTime) && (
                <p className="text-sm text-red-600 mt-2">
                  ⚠️ השעות האלה כבר תפוסות, בחר שעות אחרות
                </p>
              )}
              {bookingStartTime && bookingEndTime && isValidTimeRange(bookingStartTime, bookingEndTime) && (
                <p className="text-sm text-emerald-600 mt-2">
                  משך המפגש: {calculateDuration(bookingStartTime, bookingEndTime)} שעות
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Select Subject */}
        {selectedSlot && bookingStartTime && bookingEndTime && selectedMentor && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                {slotType === 'specific' ? '3' : '4'}. בחר נושא לימוד
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label>מה תרצה ללמוד?</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="בחר נושא" />
                </SelectTrigger>
                <SelectContent>
                  {selectedMentor.mentoring_subjects?.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Select Date (only for recurring slots) */}
        {selectedSlot && slotType === 'recurring' && selectedSlot.day !== 'specific' && bookingStartTime && bookingEndTime && selectedSubject && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                5. בחר תאריך
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>תאריך המפגש (יום {getDayLabel(selectedSlot.day)} בלבד)</Label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="max-w-xs mt-2">
                    <SelectValue placeholder="בחר תאריך" />
                  </SelectTrigger>
                  <SelectContent>
                    {getValidDatesForSlot(selectedSlot.day).map(date => (
                      <SelectItem key={date} value={date}>
                        {moment(date).format('DD/MM/YYYY')} (יום {getDayLabel(selectedSlot.day)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-2">
                  * ניתן לבחור רק תאריכים שחלים ביום {getDayLabel(selectedSlot.day)} בשעות {selectedSlot.start_time}-{selectedSlot.end_time}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        {selectedMentor && selectedSlot && selectedDate && bookingStartTime && bookingEndTime && selectedSubject && (
          <Alert className="mb-6 bg-emerald-50 border-emerald-200">
            <AlertDescription className="text-emerald-800">
              <strong>סיכום:</strong> מפגש {selectedSubject} עם {selectedMentor.full_name} ביום {moment(selectedDate).format('DD/MM/YYYY')} בין השעות {bookingStartTime} - {bookingEndTime}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleBook}
            disabled={!selectedMentor || !selectedSlot || !selectedDate || !bookingStartTime || !bookingEndTime || !selectedSubject || bookSessionMutation.isPending || !isSlotAvailable(selectedMentor?.id, selectedDate, bookingStartTime, bookingEndTime) || !isValidTimeRange(bookingStartTime, bookingEndTime) || !isWithinSlotRange(bookingStartTime, bookingEndTime, selectedSlot)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {bookSessionMutation.isPending ? 'שומר...' : 'קבע מפגש'}
          </Button>
          <Button variant="outline" onClick={() => navigate(createPageUrl('Calendar'))}>
            ביטול
          </Button>
        </div>
      </div>
    </div>
  );
}