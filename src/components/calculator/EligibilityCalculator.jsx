import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calculator, CheckCircle2, XCircle, MessageCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createPageUrl } from '../../utils';
import { useNavigate } from 'react-router-dom';

export default function EligibilityCalculator() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    year: '',
    reserveDays: '',
    combatUnit: '',
    chaimesh: '',
    tuitionPaid: ''
  });
  const [result, setResult] = useState(null);

  const handleGetStarted = () => {
    // Check local authentication instead of base44
    const userData = localStorage.getItem('zchut_user');
    if (userData) {
      navigate(createPageUrl('Payment'));
    } else {
      // Navigate to home and scroll to login section
      navigate(createPageUrl('Home'));
      setTimeout(() => {
        const element = document.getElementById('login-section');
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const calculateEligibility = () => {
    const days = parseInt(formData.reserveDays);
    const tuition = parseFloat(formData.tuitionPaid);
    const year = formData.year;
    const isCombat = formData.combatUnit === 'yes';
    const hasChaimesh = formData.chaimesh === 'yes';

    // Check minimum days
    const minDays = year === 'tashpah' ? 60 : 50;
    if (days < minDays) {
      setResult({
        eligible: false,
        reason: `לצערנו, אינך זכאי. נדרשים לפחות ${minDays} ימי מילואים בשנת ${year === 'tashpah' ? 'תשפ"ד' : 'תשפ"ה'}.`
      });
      return;
    }

    // Calculate eligible amount based on year and unit type
    let maxAmount;
    let percentage;

    if (year === 'tashpah') {
      // תשפ"ד
      if (isCombat) {
        maxAmount = 11653;
        percentage = 100;
      } else {
        maxAmount = 3495;
        percentage = 30;
      }
    } else {
      // תשפ"ה
      if (hasChaimesh) {
        // With Chaimesh grant
        if (isCombat) {
          maxAmount = 1432; // 10% only
          percentage = 10;
        } else {
          maxAmount = 0; // Not eligible if not combat
          percentage = 0;
        }
      } else {
        // Without Chaimesh
        if (isCombat) {
          maxAmount = 10149;
          percentage = 100;
        } else {
          maxAmount = 3044;
          percentage = 30;
        }
      }
    }

    if (maxAmount === 0) {
      setResult({
        eligible: false,
        reason: 'לא זכאי למלגה זו (רק לוחמים עם חיימ"ש זכאים להחזר של 10%)'
      });
      return;
    }

    // Calculate actual amount
    const calculatedAmount = Math.min((tuition * percentage) / 100, maxAmount);
    const actualAmount = Math.min(calculatedAmount, tuition);

    setResult({
      eligible: true,
      amount: Math.round(actualAmount),
      maxPossible: maxAmount,
      percentage,
      year: year === 'tashpah' ? 'תשפ"ד' : 'תשפ"ה'
    });
  };

  const handleNext = () => {
    if (step === 1 && formData.year) setStep(2);
    else if (step === 2 && formData.reserveDays) setStep(3);
    else if (step === 3 && formData.combatUnit) {
      if (formData.year === 'tashpah') {
        setStep(5); // Skip Chaimesh question for תשפ"ד
      } else {
        setStep(4);
      }
    }
    else if (step === 4 && formData.chaimesh) setStep(5);
    else if (step === 5 && formData.tuitionPaid) {
      calculateEligibility();
      setStep(6);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFormData({
      year: '',
      reserveDays: '',
      combatUnit: '',
      chaimesh: '',
      tuitionPaid: ''
    });
    setResult(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl" dir="rtl">
      <CardHeader className="bg-gradient-to-l from-emerald-50 to-teal-50 border-b">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Calculator className="w-6 h-6 text-emerald-600" />
          מחשבון זכאות למענק מילואים
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {step !== 6 && (
          <div className="mb-6">
            <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
              <span>שאלה {step} מתוך 5</span>
              <span>{Math.round((step / 5) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-l from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 1: Year */}
        {step === 1 && (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">באיזו שנת לימודים למדת?</Label>
            <RadioGroup value={formData.year} onValueChange={(val) => setFormData({ ...formData, year: val })}>
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="tashpah" id="tashpah" />
                <Label htmlFor="tashpah" className="cursor-pointer flex-1">
                  <div className="font-semibold">תשפ"ד (2023-2024)</div>
                  <div className="text-sm text-slate-600">שירתי בין 07.10.2023 - 30.09.2024</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="tashpeh" id="tashpeh" />
                <Label htmlFor="tashpeh" className="cursor-pointer flex-1">
                  <div className="font-semibold">תשפ"ה (2024-2025)</div>
                  <div className="text-sm text-slate-600">שירתי בין 27.10.2024 - 30.09.2025</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Step 2: Reserve Days */}
        {step === 2 && (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">כמה ימי מילואים שירתת?</Label>
            <p className="text-sm text-slate-600">
              {formData.year === 'tashpah' ? 'נדרשים לפחות 60 ימים' : 'נדרשים לפחות 50 ימים'}
            </p>
            <Input
              type="number"
              placeholder="למשל: 75"
              value={formData.reserveDays}
              onChange={(e) => setFormData({ ...formData, reserveDays: e.target.value })}
              className="text-lg"
            />
          </div>
        )}

        {/* Step 3: Combat Unit */}
        {step === 3 && (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">האם שירתת במערך לוחם?</Label>
            <p className="text-sm text-slate-600">מערך לוחם זכאי להחזר גבוה יותר</p>
            <RadioGroup value={formData.combatUnit} onValueChange={(val) => setFormData({ ...formData, combatUnit: val })}>
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="yes" id="combat-yes" />
                <Label htmlFor="combat-yes" className="cursor-pointer flex-1">
                  כן, שירתי במערך לוחם
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="no" id="combat-no" />
                <Label htmlFor="combat-no" className="cursor-pointer flex-1">
                  לא, שירתי ביחידה אחרת
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Step 4: Chaimesh (only for תשפ"ה) */}
        {step === 4 && formData.year === 'tashpeh' && (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">האם קיבלת מלגת חיימ"ש השנה?</Label>
            <p className="text-sm text-slate-600">מלגת טכנאים והנדסאים מקרן חיימ"ש</p>
            <RadioGroup value={formData.chaimesh} onValueChange={(val) => setFormData({ ...formData, chaimesh: val })}>
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="yes" id="chaimesh-yes" />
                <Label htmlFor="chaimesh-yes" className="cursor-pointer flex-1">
                  כן, קיבלתי מלגת חיימ"ש
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="no" id="chaimesh-no" />
                <Label htmlFor="chaimesh-no" className="cursor-pointer flex-1">
                  לא קיבלתי
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Step 5: Tuition Paid */}
        {step === 5 && (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">כמה שילמת שכר לימוד השנה?</Label>
            <p className="text-sm text-slate-600">הזן את הסכום המלא ששילמת (בשקלים)</p>
            <Input
              type="number"
              placeholder="למשל: 12000"
              value={formData.tuitionPaid}
              onChange={(e) => setFormData({ ...formData, tuitionPaid: e.target.value })}
              className="text-lg"
            />
          </div>
        )}

        {/* Step 6: Result */}
        {step === 6 && result && (
          <div className="space-y-6">
            {result.eligible ? (
              <>
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800 font-semibold">
                    מעולה! אתה זכאי למענק מילואים
                  </AlertDescription>
                </Alert>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8 text-center border-2 border-emerald-200">
                  <div className="text-slate-700 mb-2">הסכום המשוער שמגיע לך:</div>
                  <div className="text-5xl font-bold text-emerald-600 mb-2">
                    ₪{result.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">
                    ({result.percentage}% משכר הלימוד, עד {result.maxPossible.toLocaleString()} ₪)
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">💡 השלבים הבאים:</p>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>הירשם למערכת זכותידע</li>
                    <li>העלה את המסמכים הנדרשים</li>
                    <li>בחר חונך מהמגוון שלנו</li>
                    <li>התחל ללמוד ונדאג שהכסף יגיע אליך</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleGetStarted}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg"
                  >
                    התחל עכשיו - קבל את הכסף שמגיע לך
                  </Button>
                  
                  <Button
                    onClick={() => window.open('https://wa.me/972528126679', '_blank')}
                    variant="outline"
                    className="w-full border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 py-6 text-lg"
                  >
                    <MessageCircle className="w-5 h-5 ml-2" />
                    דברו איתנו בוואטסאפ
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <AlertDescription className="text-red-800 font-semibold">
                    {result.reason}
                  </AlertDescription>
                </Alert>

                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-700">
                    אם אתה חושב שיש טעות או שיש לך שאלות, אנחנו כאן לעזור!
                  </p>
                </div>
              </>
            )}

            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              חשב מחדש
            </Button>
          </div>
        )}

        {/* Navigation Buttons */}
        {step > 0 && step < 6 && (
          <div className="flex flex-row-reverse gap-3 mt-6">
            <Button
              onClick={handleNext}
              disabled={
                (step === 1 && !formData.year) ||
                (step === 2 && !formData.reserveDays) ||
                (step === 3 && !formData.combatUnit) ||
                (step === 4 && !formData.chaimesh) ||
                (step === 5 && !formData.tuitionPaid)
              }
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              המשך
            </Button>
            {step > 1 && (
              <Button
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="flex-1"
              >
                חזור
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}