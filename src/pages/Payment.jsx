import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, CheckCircle2, FileText, Upload, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import FileUploadField from '../components/profile/FileUploadField';

export default function Payment() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState('payment'); // 'payment', 'invoice', 'army_approval'
  const [paymentData, setPaymentData] = useState({
    full_name: '',
    id_number: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    institution: '',
    comments: '',
    payment_amount: 2000
  });
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [armyApprovalUrl, setArmyApprovalUrl] = useState('');

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Pre-fill email from auth
      if (currentUser?.email) {
        setPaymentData(prev => ({ ...prev, email: currentUser.email }));
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

  // Auto-fill form from existing profile
  useEffect(() => {
    if (menteeProfile) {
      setPaymentData(prev => ({
        ...prev,
        full_name: menteeProfile.full_name || prev.full_name,
        id_number: menteeProfile.id_number || prev.id_number,
        institution: menteeProfile.institution || prev.institution,
        // Keep existing values if profile doesn't have them
        address: prev.address,
        city: prev.city,
        phone: prev.phone,
        email: prev.email || user?.email || '',
        comments: prev.comments
      }));

      if (menteeProfile.payment_status === 'paid' && menteeProfile.army_approval_status === 'pending') {
        setStep('army_approval');
      } else if (menteeProfile.payment_status === 'paid') {
        setStep('invoice');
      }
    }
  }, [menteeProfile, user]);

  const processPaymentMutation = useMutation({
    mutationFn: async (data) => {
      // סימולציה של תשלום - במציאות כאן תהיה אינטגרציה עם ספק תשלומים
      const fakeInvoiceUrl = `https://example.com/invoice_${Date.now()}.pdf`;
      
      if (menteeProfile) {
        return await base44.entities.Mentee.update(menteeProfile.id, {
          full_name: data.full_name,
          id_number: data.id_number,
          institution: data.institution,
          payment_amount: data.payment_amount,
          payment_status: 'paid',
          payment_date: new Date().toISOString().split('T')[0],
          invoice_url: fakeInvoiceUrl,
          status: 'paid_pending_army_approval'
        });
      } else {
        return await base44.entities.Mentee.create({
          full_name: data.full_name,
          id_number: data.id_number,
          institution: data.institution,
          payment_amount: data.payment_amount,
          payment_status: 'paid',
          payment_date: new Date().toISOString().split('T')[0],
          invoice_url: fakeInvoiceUrl,
          status: 'paid_pending_army_approval',
          army_approval_status: 'pending'
        });
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['menteeProfile']);
      setInvoiceUrl(data.invoice_url);
      setStep('invoice');
    }
  });

  const submitArmyApprovalMutation = useMutation({
    mutationFn: async (approvalUrl) => {
      return await base44.entities.Mentee.update(menteeProfile.id, {
        army_approval_document_url: approvalUrl,
        army_approval_status: 'approved',
        status: 'army_approved_ready',
        profile_complete: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['menteeProfile']);
      navigate(createPageUrl('SelectMentor'));
    }
  });

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    processPaymentMutation.mutate(paymentData);
  };

  const handleFileUpload = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setArmyApprovalUrl(file_url);
  };

  const handleArmyApprovalSubmit = () => {
    submitArmyApprovalMutation.mutate(armyApprovalUrl);
  };

  const goToStep = (targetStep) => {
    const steps = ['payment', 'invoice', 'army_approval'];
    const currentIndex = steps.indexOf(step);
    const targetIndex = steps.indexOf(targetStep);
    
    // Can always go back
    if (targetIndex < currentIndex) {
      setStep(targetStep);
      return;
    }
    
    // Can only go forward if conditions are met
    if (targetStep === 'invoice' && menteeProfile?.payment_status === 'paid') {
      setStep('invoice');
    } else if (targetStep === 'army_approval' && menteeProfile?.payment_status === 'paid') {
      setStep('army_approval');
    }
  };

  const canGoBack = () => {
    return step !== 'payment';
  };

  const canGoForward = () => {
    if (step === 'payment' && menteeProfile?.payment_status === 'paid') return true;
    if (step === 'invoice') return true;
    return false;
  };

  const goBack = () => {
    if (step === 'invoice') setStep('payment');
    else if (step === 'army_approval') setStep('invoice');
  };

  const goForward = () => {
    if (step === 'payment' && menteeProfile?.payment_status === 'paid') setStep('invoice');
    else if (step === 'invoice') setStep('army_approval');
  };

  if (!user) return <div className="p-6">טוען...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">תהליך תשלום ואישור</h1>
          <p className="text-slate-600">שלם מראש וקבל אישור מהצבא למימוש הזכאות</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <button 
            onClick={() => goToStep('payment')}
            className={`flex items-center gap-2 transition-colors ${step === 'payment' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              step === 'payment' ? 'bg-emerald-600 text-white' : 
              menteeProfile?.payment_status === 'paid' ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200'
            }`}>
              {menteeProfile?.payment_status === 'paid' && step !== 'payment' ? <CheckCircle2 className="w-5 h-5" /> : '1'}
            </div>
            <span className="font-medium">תשלום</span>
          </button>
          <div className="w-12 h-0.5 bg-slate-300" />
          <button 
            onClick={() => goToStep('invoice')}
            disabled={menteeProfile?.payment_status !== 'paid'}
            className={`flex items-center gap-2 transition-colors ${
              step === 'invoice' ? 'text-emerald-600' : 
              menteeProfile?.payment_status === 'paid' ? 'text-slate-400 hover:text-slate-600' : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              step === 'invoice' ? 'bg-emerald-600 text-white' : 
              step === 'army_approval' ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200'
            }`}>
              {step === 'army_approval' ? <CheckCircle2 className="w-5 h-5" /> : '2'}
            </div>
            <span className="font-medium">קבלה</span>
          </button>
          <div className="w-12 h-0.5 bg-slate-300" />
          <button 
            onClick={() => goToStep('army_approval')}
            disabled={menteeProfile?.payment_status !== 'paid'}
            className={`flex items-center gap-2 transition-colors ${
              step === 'army_approval' ? 'text-emerald-600' : 
              menteeProfile?.payment_status === 'paid' ? 'text-slate-400 hover:text-slate-600' : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              step === 'army_approval' ? 'bg-emerald-600 text-white' : 'bg-slate-200'
            }`}>
              3
            </div>
            <span className="font-medium">אישור צבא</span>
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mb-6">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={!canGoBack()}
            className="flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4" />
            הקודם
          </Button>
          <Button
            variant="outline"
            onClick={goForward}
            disabled={!canGoForward()}
            className="flex items-center gap-2"
          >
            הבא
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Step 1: Payment */}
        {step === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                תשלום מראש
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  <strong>איך זה עובד?</strong> אתה משלם מראש, מקבל קבלה, מגיש לצבא. 
                  אם לא תקבל אישור מהצבא - נבצע לך החזר כספי מלא.
                </AlertDescription>
              </Alert>

              {menteeProfile?.payment_status === 'paid' && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    התשלום כבר בוצע! ניתן להמשיך לשלב הבא.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                {/* Row 1: Name and ID */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">
                      <span className="text-red-500">*</span> שם משפחה ושם פרטי:
                    </Label>
                    <Input
                      id="full_name"
                      value={paymentData.full_name}
                      onChange={(e) => setPaymentData({ ...paymentData, full_name: e.target.value })}
                      required
                      placeholder="שם מלא"
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">הקבלה תופק על שם זה.</p>
                  </div>
                  <div>
                    <Label htmlFor="id_number">תעודת זהות:</Label>
                    <Input
                      id="id_number"
                      value={paymentData.id_number}
                      onChange={(e) => setPaymentData({ ...paymentData, id_number: e.target.value })}
                      required
                      maxLength={9}
                      placeholder="123456789"
                      className="mt-1"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Row 2: Address and City */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address">כתובת:</Label>
                    <Input
                      id="address"
                      value={paymentData.address}
                      onChange={(e) => setPaymentData({ ...paymentData, address: e.target.value })}
                      placeholder="רחוב ומספר"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">עיר:</Label>
                    <Input
                      id="city"
                      value={paymentData.city}
                      onChange={(e) => setPaymentData({ ...paymentData, city: e.target.value })}
                      placeholder="עיר"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Row 3: Phone and Email */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">טלפון:</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={paymentData.phone}
                      onChange={(e) => setPaymentData({ ...paymentData, phone: e.target.value })}
                      placeholder="050-1234567"
                      className="mt-1"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">אימייל:</Label>
                    <Input
                      id="email"
                      type="email"
                      value={paymentData.email}
                      onChange={(e) => setPaymentData({ ...paymentData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="mt-1"
                      dir="ltr"
                    />
                    <p className="text-xs text-slate-500 mt-1">קבלה תשלח למייל זה.</p>
                  </div>
                </div>

                {/* Row 4: Institution */}
                <div>
                  <Label htmlFor="institution">
                    <span className="text-red-500">*</span> מוסד לימודים:
                  </Label>
                  <Input
                    id="institution"
                    value={paymentData.institution}
                    onChange={(e) => setPaymentData({ ...paymentData, institution: e.target.value })}
                    required
                    placeholder="למשל: אוניברסיטת תל אביב"
                    className="mt-1"
                  />
                </div>

                {/* Row 5: Comments */}
                <div>
                  <Label htmlFor="comments">הערות:</Label>
                  <Textarea
                    id="comments"
                    value={paymentData.comments}
                    onChange={(e) => setPaymentData({ ...paymentData, comments: e.target.value })}
                    placeholder="הערות נוספות (אופציונלי)"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <hr className="my-6" />

                {/* Payment Amount */}
                <div className="bg-emerald-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-700 font-medium">
                      <span className="text-red-500">*</span> סכום לחיוב:
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">
                      ₪{paymentData.payment_amount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    סכום זה יוחזר במלואו במידה ולא תקבל אישור מהצבא
                  </p>
                </div>

                {/* Credit Card Section */}
                <div className="bg-slate-50 p-4 rounded-lg mb-4 border-2 border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-slate-600" />
                    <span className="font-medium text-slate-700">חיוב בודד / תשלומים באמצעות אשראי</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="card_number">
                        <span className="text-red-500">*</span> מספר כרטיס אשראי:
                      </Label>
                      <Input 
                        id="card_number"
                        placeholder="1234 5678 9012 3456" 
                        className="mt-1"
                        dir="ltr"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="card_expiry">
                          <span className="text-red-500">*</span> תוקף:
                        </Label>
                        <Input 
                          id="card_expiry"
                          placeholder="לדוגמא 0426" 
                          className="mt-1"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <Label htmlFor="card_cvv">3 ספרות בגב הכרטיס:</Label>
                        <Input 
                          id="card_cvv"
                          placeholder="CVV" 
                          className="mt-1"
                          dir="ltr"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                    🔒 תשלום מאובטח
                  </p>
                </div>

                {/* Terms */}
                <div className="flex items-center gap-2 text-sm">
                  <input type="checkbox" id="terms" required className="rounded" />
                  <label htmlFor="terms">
                    אני מסכים ל<span className="text-blue-600 cursor-pointer hover:underline">תקנון האתר</span>.
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={processPaymentMutation.isPending || menteeProfile?.payment_status === 'paid'}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg"
                >
                  <CreditCard className="w-5 h-5 ml-2" />
                  {processPaymentMutation.isPending ? 'מעבד תשלום...' : 
                   menteeProfile?.payment_status === 'paid' ? 'התשלום בוצע ✓' : 'אישור תשלום'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Invoice */}
        {step === 'invoice' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                תשלום בוצע בהצלחה!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  התשלום שלך בוצע בהצלחה. הורד את הקבלה והגש אותה לצבא לאישור זכאות.
                </AlertDescription>
              </Alert>

              <div className="bg-slate-50 p-6 rounded-lg mb-6 text-center">
                <FileText className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">הקבלה שלך מוכנה</h3>
                <p className="text-slate-600 mb-4">סכום: ₪{menteeProfile?.payment_amount?.toLocaleString() || paymentData.payment_amount.toLocaleString()}</p>
                <Button
                  onClick={() => window.open(menteeProfile?.invoice_url || invoiceUrl, '_blank')}
                  variant="outline"
                  className="border-emerald-600 text-emerald-600"
                >
                  <FileText className="w-4 h-4 ml-2" />
                  הורד קבלה
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">השלבים הבאים:</h3>
                <ol className="list-decimal list-inside space-y-2 text-slate-700">
                  <li>הורד את הקבלה</li>
                  <li>הגש את הקבלה לצבא/קרן הסיוע לאישור זכאות</li>
                  <li>לאחר קבלת האישור - העלה אותו כאן</li>
                </ol>
              </div>

              <Button
                onClick={() => setStep('army_approval')}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700"
              >
                קיבלתי אישור מהצבא - המשך
                <ChevronLeft className="w-4 h-4 mr-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Army Approval */}
        {step === 'army_approval' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                העלאת אישור מהצבא
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  העלה את אישור הזכאות שקיבלת מהצבא/קרן הסיוע. 
                  לאחר העלאה תוכל להמשיך לבחירת חונך והתחלת הלימודים.
                </AlertDescription>
              </Alert>

              <FileUploadField
                label="אישור זכאות מהצבא"
                required
                fileUrl={armyApprovalUrl}
                onUpload={handleFileUpload}
                description="העלה את מכתב האישור שקיבלת מקרן הסיוע"
              />

              <Button
                onClick={handleArmyApprovalSubmit}
                disabled={!armyApprovalUrl || submitArmyApprovalMutation.isPending}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="w-4 h-4 ml-2" />
                {submitArmyApprovalMutation.isPending ? 'שומר...' : 'המשך לבחירת חונך'}
              </Button>

              <div className="mt-4 text-center">
                <p className="text-sm text-slate-600">
                  לא קיבלת אישור?{' '}
                  <button className="text-emerald-600 hover:underline">
                    בקש החזר כספי
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}