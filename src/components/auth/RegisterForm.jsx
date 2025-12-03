import React, { useState } from 'react';
import { Mentee, Mentor } from '@/api/entities';
import { uploadFile } from '@/firebase/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Loader2, GraduationCap, Users, CheckCircle2, Upload, FileText, User, X } from 'lucide-react';

const SUBJECT_OPTIONS = [
  'מתמטיקה', 'פיזיקה', 'אנגלית', 'עברית', 'מדעי המחשב',
  'כימיה', 'ביולוגיה', 'היסטוריה', 'ספרות', 'כלכלה',
  'פסיכולוגיה', 'משפטים', 'אחר'
];

function FileUploadInline({ label, required, fileUrl, onUpload, uploading }) {
  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex items-center gap-3">
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
            disabled={uploading}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <Button type="button" variant="outline" disabled={uploading} className="border-emerald-200 hover:bg-emerald-50" asChild>
            <span>
              {uploading ? (
                <><Loader2 className="w-4 h-4 ml-2 animate-spin" />מעלה...</>
              ) : (
                <><Upload className="w-4 h-4 ml-2" />העלה קובץ</>
              )}
            </span>
          </Button>
        </label>
        {fileUrl && (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            <span className="flex items-center gap-1"><FileText className="w-4 h-4" />הועלה</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterForm() {
  const [userType, setUserType] = useState('mentee');
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Mentee form data
  const [menteeData, setMenteeData] = useState({
    full_name: '',
    id_number: '',
    institution: '',
    study_confirmation_url: '',
    aid_fund_confirmation_url: '',
    payment_receipt_url: ''
  });

  // Mentor form data
  const [mentorData, setMentorData] = useState({
    full_name: '',
    id_number: '',
    institution: '',
    profile_image_url: '',
    study_confirmation_url: '',
    mentoring_subjects: [],
    employment_procedure_url: '',
    form_101_url: '',
    commitment_letter_url: '',
    bio: '',
    experience_years: ''
  });

  const handleFileUpload = async (file, field, isMentor) => {
    setUploadingField(field);
    try {
      const result = await uploadFile(file, 'documents');
      if (result.success) {
        if (isMentor) {
          setMentorData(prev => ({ ...prev, [field]: result.url }));
        } else {
          setMenteeData(prev => ({ ...prev, [field]: result.url }));
        }
      } else {
        throw new Error(result.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('File upload error:', error);
      setError('שגיאה בהעלאת הקובץ. נסה שוב.');
    } finally {
      setUploadingField(null);
    }
  };

  const toggleSubject = (subject) => {
    setMentorData(prev => ({
      ...prev,
      mentoring_subjects: prev.mentoring_subjects.includes(subject)
        ? prev.mentoring_subjects.filter(s => s !== subject)
        : [...prev.mentoring_subjects, subject]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (userType === 'mentee') {
        // Validate mentee
        if (!menteeData.full_name || !menteeData.id_number || !menteeData.institution ||
            !menteeData.study_confirmation_url || !menteeData.aid_fund_confirmation_url || 
            !menteeData.payment_receipt_url) {
          setError('נא למלא את כל השדות ולהעלות את כל המסמכים הנדרשים');
          return;
        }

        const existing = await Mentee.filter({ id_number: menteeData.id_number });
        if (existing.length > 0) {
          setError('מספר זהות זה כבר רשום כחניך במערכת');
          return;
        }

        await Mentee.create({
          ...menteeData,
          admin_approved: false,
          status: 'pending_admin_approval',
          profile_complete: true
        });
      } else {
        // Validate mentor
        if (!mentorData.full_name || !mentorData.id_number || !mentorData.institution ||
            !mentorData.study_confirmation_url || !mentorData.employment_procedure_url ||
            !mentorData.form_101_url || !mentorData.commitment_letter_url ||
            mentorData.mentoring_subjects.length === 0) {
          setError('נא למלא את כל השדות ולהעלות את כל המסמכים הנדרשים');
          return;
        }

        const existing = await Mentor.filter({ id_number: mentorData.id_number });
        if (existing.length > 0) {
          setError('מספר זהות זה כבר רשום כחונך במערכת');
          return;
        }

        await Mentor.create({
          ...mentorData,
          hourly_rate: 0, // יקבע על ידי המנהל
          experience_years: parseInt(mentorData.experience_years) || 0,
          admin_approved: false,
          status: 'pending_approval',
          profile_complete: true,
          available: false
        });
      }

      setSuccess(true);
    } catch (err) {
      setError('אירעה שגיאה בהרשמה. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0" dir="rtl">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">ההרשמה הושלמה!</h2>
          <p className="text-slate-600 mb-4">
            הבקשה שלך נשלחה למנהל המערכת לאישור.
            <br />
            תקבל הודעה כאשר חשבונך יאושר.
          </p>
          <p className="text-sm text-slate-500">
            לאחר האישור תוכל להתחבר באמצעות תעודת הזהות שלך.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0" dir="rtl">
      <CardHeader className="bg-gradient-to-l from-emerald-50 to-teal-50 border-b">
        <CardTitle className="flex items-center gap-2 text-xl">
          <UserPlus className="w-6 h-6 text-emerald-600" />
          הרשמה למערכת
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={userType} onValueChange={setUserType} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mentee" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              חניך
            </TabsTrigger>
            <TabsTrigger value="mentor" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              חונך
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-6">
          {userType === 'mentee' ? (
            <>
              {/* Mentee Form */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">פרטים אישיים</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>שם מלא *</Label>
                    <Input
                      value={menteeData.full_name}
                      onChange={(e) => setMenteeData({ ...menteeData, full_name: e.target.value })}
                      placeholder="שם מלא"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>מספר תעודת זהות *</Label>
                    <Input
                      value={menteeData.id_number}
                      onChange={(e) => setMenteeData({ ...menteeData, id_number: e.target.value.replace(/\D/g, '') })}
                      placeholder="9 ספרות"
                      maxLength={9}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>מוסד לימודים *</Label>
                  <Input
                    value={menteeData.institution}
                    onChange={(e) => setMenteeData({ ...menteeData, institution: e.target.value })}
                    placeholder="שם המוסד האקדמי"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">מסמכים נדרשים</h3>
                <FileUploadInline
                  label="אישור לימודים"
                  required
                  fileUrl={menteeData.study_confirmation_url}
                  onUpload={(file) => handleFileUpload(file, 'study_confirmation_url', false)}
                  uploading={uploadingField === 'study_confirmation_url'}
                />
                <FileUploadInline
                  label="אישור זכאות מקרן הסיוע"
                  required
                  fileUrl={menteeData.aid_fund_confirmation_url}
                  onUpload={(file) => handleFileUpload(file, 'aid_fund_confirmation_url', false)}
                  uploading={uploadingField === 'aid_fund_confirmation_url'}
                />
                <FileUploadInline
                  label="אסמכתה לתשלום"
                  required
                  fileUrl={menteeData.payment_receipt_url}
                  onUpload={(file) => handleFileUpload(file, 'payment_receipt_url', false)}
                  uploading={uploadingField === 'payment_receipt_url'}
                />
              </div>
            </>
          ) : (
            <>
              {/* Mentor Form */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">פרטים אישיים</h3>
                
                {/* Profile Image */}
                <div>
                  <Label>תמונת פרופיל</Label>
                  <div className="flex items-center gap-4 mt-2">
                    {mentorData.profile_image_url ? (
                      <div className="relative">
                        <img src={mentorData.profile_image_url} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-emerald-100" />
                        <button type="button" onClick={() => setMentorData({ ...mentorData, profile_image_url: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="w-10 h-10 text-slate-400" />
                      </div>
                    )}
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'profile_image_url', true)} />
                      <span className="text-sm text-emerald-600 hover:underline">העלה תמונה</span>
                    </label>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>שם מלא *</Label>
                    <Input value={mentorData.full_name} onChange={(e) => setMentorData({ ...mentorData, full_name: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>מספר תעודת זהות *</Label>
                    <Input value={mentorData.id_number} onChange={(e) => setMentorData({ ...mentorData, id_number: e.target.value.replace(/\D/g, '') })} maxLength={9} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>מוסד לימודים *</Label>
                  <Input value={mentorData.institution} onChange={(e) => setMentorData({ ...mentorData, institution: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>שנות ניסיון</Label>
                  <Input type="number" value={mentorData.experience_years} onChange={(e) => setMentorData({ ...mentorData, experience_years: e.target.value })} placeholder="2" className="mt-1" />
                </div>
                <div>
                  <Label>תיאור קצר</Label>
                  <Textarea value={mentorData.bio} onChange={(e) => setMentorData({ ...mentorData, bio: e.target.value })} placeholder="ספר קצת על עצמך..." rows={3} className="mt-1" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">תחומי חניכה *</h3>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_OPTIONS.map((subject) => (
                    <Badge
                      key={subject}
                      variant={mentorData.mentoring_subjects.includes(subject) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${mentorData.mentoring_subjects.includes(subject) ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:border-emerald-600'}`}
                      onClick={() => toggleSubject(subject)}
                    >
                      {subject}
                      {mentorData.mentoring_subjects.includes(subject) && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">מסמכים נדרשים</h3>
                <FileUploadInline
                  label="אישור לימודים"
                  required
                  fileUrl={mentorData.study_confirmation_url}
                  onUpload={(file) => handleFileUpload(file, 'study_confirmation_url', true)}
                  uploading={uploadingField === 'study_confirmation_url'}
                />
                <FileUploadInline
                  label="נוהל העסקה חתום"
                  required
                  fileUrl={mentorData.employment_procedure_url}
                  onUpload={(file) => handleFileUpload(file, 'employment_procedure_url', true)}
                  uploading={uploadingField === 'employment_procedure_url'}
                />
                <FileUploadInline
                  label="טופס 101 חתום"
                  required
                  fileUrl={mentorData.form_101_url}
                  onUpload={(file) => handleFileUpload(file, 'form_101_url', true)}
                  uploading={uploadingField === 'form_101_url'}
                />
                <FileUploadInline
                  label="כתב התחייבות"
                  required
                  fileUrl={mentorData.commitment_letter_url}
                  onUpload={(file) => handleFileUpload(file, 'commitment_letter_url', true)}
                  uploading={uploadingField === 'commitment_letter_url'}
                />
              </div>
            </>
          )}

          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={loading || uploadingField}
            className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 ml-2 animate-spin" />נרשם...</>
            ) : (
              <><UserPlus className="w-5 h-5 ml-2" />הרשמה כ{userType === 'mentee' ? 'חניך' : 'חונך'}</>
            )}
          </Button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-4">
          לאחר ההרשמה, מנהל המערכת יבדוק את המסמכים ויאשר את הבקשה.
        </p>
      </CardContent>
    </Card>
  );
}