import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FileUploadField from '../components/profile/FileUploadField';
import ProfileProgress from '../components/profile/ProfileProgress';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { AlertTriangle, Clock } from 'lucide-react';

export default function MenteeProfile() {
  const [user, setUser] = useState(null);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    id_number: '',
    institution: '',
    study_confirmation_url: '',
    aid_fund_confirmation_url: '',
    payment_receipt_url: ''
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Check approval status from localStorage
      const userData = localStorage.getItem('zchut_user');
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.menteeProfile && !parsed.menteeApproved) {
          setPendingApproval(true);
          if (parsed.menteeProfile.admin_rejection_reason) {
            setRejectionReason(parsed.menteeProfile.admin_rejection_reason);
          }
        }
      }
    };
    loadUser();
  }, []);

  // Get id_number from localStorage for users who are both mentee and mentor
  const getIdNumber = () => {
    const userData = localStorage.getItem('zchut_user');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.menteeProfile?.id_number) {
        return parsed.menteeProfile.id_number;
      }
      if (parsed.profile?.id_number) {
        return parsed.profile.id_number;
      }
    }
    return null;
  };

  const { data: menteeProfile } = useQuery({
    queryKey: ['menteeProfile', user?.id],
    queryFn: async () => {
      const idNumber = getIdNumber();
      if (idNumber) {
        const profiles = await base44.entities.Mentee.filter({ id_number: idNumber });
        if (profiles.length > 0) return profiles[0];
      }
      // Fallback to created_by
      const profiles = await base44.entities.Mentee.filter({ created_by: user.email });
      return profiles[0] || null;
    },
    enabled: !!user
  });

  useEffect(() => {
    if (menteeProfile) {
      setFormData({
        full_name: menteeProfile.full_name || '',
        id_number: menteeProfile.id_number || '',
        institution: menteeProfile.institution || '',
        study_confirmation_url: menteeProfile.study_confirmation_url || '',
        aid_fund_confirmation_url: menteeProfile.aid_fund_confirmation_url || '',
        payment_receipt_url: menteeProfile.payment_receipt_url || ''
      });
    }
  }, [menteeProfile]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (menteeProfile) {
        return await base44.entities.Mentee.update(menteeProfile.id, data);
      } else {
        return await base44.entities.Mentee.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['menteeProfile']);
    }
  });

  const handleFileUpload = async (file, field) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, [field]: file_url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const profileComplete = !!(
      formData.full_name &&
      formData.id_number &&
      formData.institution &&
      formData.study_confirmation_url &&
      formData.aid_fund_confirmation_url &&
      formData.payment_receipt_url
    );

    await saveMutation.mutateAsync({
      ...formData,
      profile_complete: profileComplete,
      status: profileComplete ? 'pending_admin_approval' : 'pending_documents',
      admin_rejection_reason: ''
    });
    
    // Update local state
    setRejectionReason('');
    setPendingApproval(true);
    
    // Update localStorage
    const userData = localStorage.getItem('zchut_user');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.menteeProfile) {
        parsed.menteeProfile.admin_rejection_reason = '';
        localStorage.setItem('zchut_user', JSON.stringify(parsed));
      }
    }
  };

  const calculateProgress = () => {
    const fields = [
      formData.full_name,
      formData.id_number,
      formData.institution,
      formData.study_confirmation_url,
      formData.aid_fund_confirmation_url,
      formData.payment_receipt_url
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  if (!user) return <div className="p-6">טוען...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">הפרופיל שלי - חניך</h1>
          <p className="text-slate-600">השלם את הפרטים שלך כדי להתחיל את תהליך החניכה</p>
        </div>

        <ProfileProgress progress={calculateProgress()} />

        {/* Hours Balance - Read Only */}
        {menteeProfile && (
          <Card className="mb-6 bg-emerald-50 border-emerald-200">
            <CardContent className="p-4">
              <Label className="text-emerald-700 font-medium">יתרת שעות</Label>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                {menteeProfile.hours_balance || 0} שעות
              </div>
              <p className="text-xs text-emerald-600 mt-1">* יתרת השעות נקבעת על ידי מנהל המערכת</p>
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

        {pendingApproval && !rejectionReason && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              הבקשה שלך ממתינה לאישור מנהל המערכת. תוכל לעדכן את הפרטים בינתיים.
            </AlertDescription>
          </Alert>
        )}

        {menteeProfile?.profile_complete && !menteeProfile?.selected_mentor_id && !pendingApproval && (
          <Alert className="mb-6 bg-emerald-50 border-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">
              הפרופיל שלך הושלם! עכשיו אתה יכול{' '}
              <Link to={createPageUrl('SelectMentor')} className="font-semibold underline">
                לבחור חונך
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                פרטים אישיים
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">שם מלא *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    placeholder="שם מלא"
                  />
                </div>
                <div>
                  <Label htmlFor="id_number">מספר זהות *</Label>
                  <Input
                    id="id_number"
                    value={formData.id_number}
                    onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                    required
                    placeholder="123456789"
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
                  placeholder="למשל: אוניברסיטת תל אביב"
                />
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
                description="העלה אישור לימודים עדכני מהמוסד האקדמי"
              />

              <FileUploadField
                label="אישור זכאות מקרן הסיוע"
                required
                fileUrl={formData.aid_fund_confirmation_url}
                onUpload={(file) => handleFileUpload(file, 'aid_fund_confirmation_url')}
                description="העלה את האישור שקיבלת מקרן הסיוע לסטודנטים במילואים"
              />

              <FileUploadField
                label="אסמכתה לתשלום"
                required
                fileUrl={formData.payment_receipt_url}
                onUpload={(file) => handleFileUpload(file, 'payment_receipt_url')}
                description="העלה אסמכתה לתשלום או הוראת קבע"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
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