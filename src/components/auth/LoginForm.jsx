import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, Loader2, UserCircle } from 'lucide-react';

export default function LoginForm({ onClose }) {
  const [idNumber, setIdNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check all tables - user can be mentee, mentor, or admin
      const mentees = await base44.entities.Mentee.filter({ id_number: idNumber });
      const mentors = await base44.entities.Mentor.filter({ id_number: idNumber });
      const admins = await base44.entities.Admin.filter({ id_number: idNumber });

      const isMentee = mentees.length > 0;
      const isMentor = mentors.length > 0;
      const isAdmin = admins.length > 0;

      if (!isMentee && !isMentor && !isAdmin) {
        setError('מספר הזהות לא נמצא במערכת. אנא פנה למנהל המערכת.');
        return;
      }

      // Admin takes priority
      if (isAdmin) {
        localStorage.setItem('zchut_user', JSON.stringify({
          type: 'admin',
          profile: admins[0]
        }));
        navigate(createPageUrl('AdminDashboard'));
        return;
      }

      // Check if user is approved by admin
      const menteeApproved = isMentee && mentees[0].admin_approved;
      const mentorApproved = isMentor && mentors[0].admin_approved;

      // Determine user type - 'both' if registered in both, regardless of approval status
      const userType = (isMentee && isMentor) ? 'both' : (isMentee ? 'mentee' : 'mentor');

      // Store user info - include all profiles, mark approval status
      localStorage.setItem('zchut_user', JSON.stringify({
        type: userType,
        menteeProfile: isMentee ? mentees[0] : null,
        mentorProfile: isMentor ? mentors[0] : null,
        profile: isMentee ? mentees[0] : mentors[0],
        menteeApproved,
        mentorApproved
      }));

      // Navigate based on type - always go to dashboard
      if (userType === 'both') {
        navigate(createPageUrl('CombinedDashboard'));
      } else if (userType === 'mentee') {
        navigate(createPageUrl('MenteeDashboard'));
      } else {
        navigate(createPageUrl('MentorDashboard'));
      }
    } catch (err) {
      setError('אירעה שגיאה. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0" dir="rtl">
      <CardHeader className="bg-gradient-to-l from-emerald-50 to-teal-50 border-b">
        <CardTitle className="flex items-center gap-2 text-xl">
          <UserCircle className="w-6 h-6 text-emerald-600" />
          כניסה למערכת
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="id_number" className="text-base">מספר תעודת זהות</Label>
            <Input
              id="id_number"
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="הזן 9 ספרות"
              maxLength={9}
              className="text-lg mt-2 text-center tracking-widest"
              required
            />
          </div>

          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={loading || idNumber.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                מתחבר...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 ml-2" />
                כניסה
              </>
            )}
          </Button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-4">
          עדיין לא רשום? פנה למנהל המערכת
        </p>
      </CardContent>
    </Card>
  );
}