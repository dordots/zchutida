import React, { useState, useEffect } from 'react';
import { Mentor } from '@/api/entities';
import { uploadFile } from '@/firebase/storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, X, CheckCircle2, User, AlertTriangle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FileUploadField from '../components/profile/FileUploadField';
import ProfileProgress from '../components/profile/ProfileProgress';
import AvailabilityEditor from '../components/mentor/AvailabilityEditor';

const SUBJECT_OPTIONS = [
  'מתמטיקה',
  'פיזיקה',
  'אנגלית',
  'עברית',
  'מדעי המחשב',
  'כימיה',
  'ביולוגיה',
  'היסטוריה',
  'ספרות',
  'כלכלה',
  'פסיכולוגיה',
  'משפטים',
  'אחר'
];

export default function MentorProfile() {
  const [user, setUser] = useState(null);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showUpdateMessage, setShowUpdateMessage] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    id_number: '',
    institution: '',
    profile_image_url: '',
    study_confirmation_url: '',
    mentoring_subjects: [],
    employment_procedure_url: '',
    form_101_url: '',
    commitment_letter_url: '',
    hourly_rate: '',
    bio: '',
    experience_years: '',
    available_slots: []
  });

  const queryClient = useQueryClient();

  // Get id_number from localStorage - this is the only thing we store
  const getIdNumber = () => {
    return localStorage.getItem('zchut_user_id');
  };

  // Always load from database
  const { data: mentorProfile } = useQuery({
    queryKey: ['mentorProfile'],
    queryFn: async () => {
      const idNumber = getIdNumber();
      if (idNumber) {
        const profiles = await Mentor.filter({ id_number: idNumber });
        if (profiles.length > 0) {
          const profile = profiles[0];
          // Set user from database
          setUser({
            id: profile.id,
            email: profile.email || '',
            ...profile
          });
          return profile;
        }
      }
      return null;
    },
    enabled: !!getIdNumber(),
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  useEffect(() => {
    if (mentorProfile) {
      setFormData({
        full_name: mentorProfile.full_name || '',
        id_number: mentorProfile.id_number || '',
        institution: mentorProfile.institution || '',
        profile_image_url: mentorProfile.profile_image_url || '',
        study_confirmation_url: mentorProfile.study_confirmation_url || '',
        mentoring_subjects: mentorProfile.mentoring_subjects || [],
        employment_procedure_url: mentorProfile.employment_procedure_url || '',
        form_101_url: mentorProfile.form_101_url || '',
        commitment_letter_url: mentorProfile.commitment_letter_url || '',
        hourly_rate: mentorProfile.hourly_rate || '',
        bio: mentorProfile.bio || '',
        experience_years: mentorProfile.experience_years || '',
        available_slots: mentorProfile.available_slots || []
      });
      
      // Hide update message if profile is approved
      if (mentorProfile.admin_approved) {
        setShowUpdateMessage(false);
      }
      
      // Update rejection reason if exists
      if (mentorProfile.admin_rejection_reason) {
        setRejectionReason(mentorProfile.admin_rejection_reason);
        setPendingApproval(false);
      } else if (!mentorProfile.admin_approved && mentorProfile.status === 'pending_approval') {
        setPendingApproval(true);
      }
    }
  }, [mentorProfile]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (mentorProfile) {
        return await Mentor.update(mentorProfile.id, data);
      } else {
        return await Mentor.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mentorProfile']);
    }
  });

  const handleFileUpload = async (file, field) => {
    try {
      const result = await uploadFile(file, 'documents');
      if (result.success) {
        setFormData(prev => ({ ...prev, [field]: result.url }));
      } else {
        throw new Error(result.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert(`שגיאה בהעלאת הקובץ: ${error.message || 'נסה שוב מאוחר יותר'}`);
      throw error;
    }
  };

  const toggleSubject = (subject) => {
    setFormData(prev => ({
      ...prev,
      mentoring_subjects: prev.mentoring_subjects.includes(subject)
        ? prev.mentoring_subjects.filter(s => s !== subject)
        : [...prev.mentoring_subjects, subject]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const profileComplete = !!(
      formData.full_name &&
      formData.id_number &&
      formData.institution &&
      formData.study_confirmation_url &&
      formData.mentoring_subjects.length > 0 &&
      formData.employment_procedure_url &&
      formData.form_101_url &&
      formData.commitment_letter_url
    );

    // Check if ANY document changed (even just one)
    const studyConfirmationChanged = mentorProfile && 
      formData.study_confirmation_url !== mentorProfile.study_confirmation_url;
    const employmentProcedureChanged = mentorProfile && 
      formData.employment_procedure_url !== mentorProfile.employment_procedure_url;
    const form101Changed = mentorProfile && 
      formData.form_101_url !== mentorProfile.form_101_url;
    const commitmentLetterChanged = mentorProfile && 
      formData.commitment_letter_url !== mentorProfile.commitment_letter_url;
    
    const anyDocumentChanged = studyConfirmationChanged || employmentProcedureChanged || 
      form101Changed || commitmentLetterChanged;

    // Prepare update data
    const updateData = {
      ...formData,
      hourly_rate: parseFloat(formData.hourly_rate) || 0,
      experience_years: parseInt(formData.experience_years) || 0,
      profile_complete: profileComplete
    };

    // If ANY document changed or this is a new profile, change status to pending approval
    if (anyDocumentChanged || !mentorProfile) {
      // Any document changed or new profile - reset approval status, rejection reason and set status to pending
      updateData.status = 'pending_approval';
      updateData.admin_approved = false; // Reset approval - admin needs to approve again
      updateData.admin_rejection_reason = '';
      setRejectionReason('');
      setPendingApproval(true);
      setShowUpdateMessage(true);
    } else {
      // Only profile fields changed (name, id_number, institution, etc.) - keep existing status, approval and rejection reason
      // Don't change status, admin_approved or rejection reason
    }

    await saveMutation.mutateAsync(updateData);
  };

  const calculateProgress = () => {
    const fields = [
      formData.full_name,
      formData.id_number,
      formData.institution,
      formData.study_confirmation_url,
      formData.mentoring_subjects.length > 0,
      formData.employment_procedure_url,
      formData.form_101_url,
      formData.commitment_letter_url
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  if (!user) return <div className="p-6">טוען...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">הפרופיל שלי - חונך</h1>
          <p className="text-slate-600">השלם את הפרטים שלך כדי להתחיל לחנוך סטודנטים</p>
        </div>

        <ProfileProgress progress={calculateProgress()} />

        {/* Hourly Rate - Read Only */}
        {mentorProfile && (
          <Card className="mb-6 bg-teal-50 border-teal-200">
            <CardContent className="p-4">
              <Label className="text-teal-700 font-medium">תעריף לשעה</Label>
              <div className="text-2xl font-bold text-teal-600 mt-1">
                ₪{mentorProfile.hourly_rate || 0}
              </div>
              <p className="text-xs text-teal-600 mt-1">* התעריף נקבע על ידי מנהל המערכת</p>
            </CardContent>
          </Card>
        )}

        {rejectionReason && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>הבקשה נדחתה על ידי המנהל:</strong> {rejectionReason}
              <br />
              <span className="text-sm">ניתן לעדכן את הפרטים ולשלוח שוב לאישור.</span>
            </AlertDescription>
          </Alert>
        )}

        {showUpdateMessage && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              הפרטים עודכנו בהצלחה! הבקשה שלך נשלחה מחדש לאישור מנהל המערכת.
            </AlertDescription>
          </Alert>
        )}

        {pendingApproval && !rejectionReason && !showUpdateMessage && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              הבקשה שלך ממתינה לאישור מנהל המערכת. תוכל לעדכן את הפרטים בינתיים.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                פרטים אישיים
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>תמונת פרופיל</Label>
                <div className="flex items-center gap-4 mt-2">
                  {formData.profile_image_url ? (
                    <div className="relative">
                      <img
                        src={formData.profile_image_url}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, profile_image_url: '' })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'profile_image_url')}
                    />
                    <span className="text-sm text-emerald-600 hover:underline">העלה תמונה</span>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">שם מלא *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="id_number">מספר זהות *</Label>
                  <Input
                    id="id_number"
                    value={formData.id_number}
                    onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                    required
                    maxLength={9}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="institution">מקום הלימודים *</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="experience_years">שנות ניסיון</Label>
                <Input
                  id="experience_years"
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                  placeholder="2"
                />
              </div>

              <div>
                <Label htmlFor="bio">תיאור קצר</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="ספר קצת על עצמך, הניסיון שלך ושיטת ההוראה שלך..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>תחומי חניכה *</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">בחר לפחות תחום אחד שבו אתה יכול לחנוך</p>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_OPTIONS.map((subject) => (
                  <Badge
                    key={subject}
                    variant={formData.mentoring_subjects.includes(subject) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${
                      formData.mentoring_subjects.includes(subject)
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'hover:border-emerald-600'
                    }`}
                    onClick={() => toggleSubject(subject)}
                  >
                    {subject}
                    {formData.mentoring_subjects.includes(subject) && (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                מסמכים נדרשים
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUploadField
                label="אישור לימודים"
                required
                fileUrl={formData.study_confirmation_url}
                onUpload={(file) => handleFileUpload(file, 'study_confirmation_url')}
              />

              <FileUploadField
                label="נוהל העסקה חתום"
                required
                fileUrl={formData.employment_procedure_url}
                onUpload={(file) => handleFileUpload(file, 'employment_procedure_url')}
              />

              <FileUploadField
                label="טופס 101 חתום"
                required
                fileUrl={formData.form_101_url}
                onUpload={(file) => handleFileUpload(file, 'form_101_url')}
              />

              <FileUploadField
                label="כתב התחייבות"
                required
                fileUrl={formData.commitment_letter_url}
                onUpload={(file) => handleFileUpload(file, 'commitment_letter_url')}
              />
            </CardContent>
          </Card>

          <AvailabilityEditor
            slots={formData.available_slots}
            onChange={(slots) => setFormData({ ...formData, available_slots: slots })}
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saveMutation.isPending ? 'שומר...' : 'שמור פרטים'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}