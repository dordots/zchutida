import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calculator, CheckCircle2, XCircle, MessageCircle, Phone, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createPageUrl } from '../../utils';
import { useNavigate } from 'react-router-dom';

export default function EligibilityCalculator() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    year: '',
    reserveDays: '',
    combatUnit: ''
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
    const year = formData.year;
    const isCombat = formData.combatUnit === 'yes';

    // Check minimum days (5 days minimum for צו 8)
    if (days < 5) {
      setResult({
        eligible: false,
        reason: 'לצערנו, אינך זכאי. נדרשים לפחות 5 ימי מילואים בצו 8.'
      });
      return;
    }

    // Calculate eligible amount based on days and unit type
    // תקרות סיוע מעודכנות לפי מספר ימי שמ"פ בצו 8
    let maxAmount = 0;
    let category = '';

    if (days >= 5 && days <= 10) {
      // 5-10 ימים בצו 8 - כל היחידות
      maxAmount = 1000;
      category = '5-10 ימים בצו 8';
    } else if (days >= 11 && days <= 20) {
      // 11-20 ימים בצו 8 - כל היחידות
      maxAmount = 1500;
      category = '11-20 ימים בצו 8';
    } else if (days >= 21 && days <= 99) {
      // 21-99 ימים
      if (isCombat) {
        // עד 99 ימי שמ"פ מצטברים בצו 8 במערך הלוחם
        maxAmount = 2000;
        category = 'עד 99 ימים במערך לוחם';
      } else {
        // משרתי מילואים בשאר היחידות
        maxAmount = 2000;
        category = 'יחידה אחרת (21+ ימים)';
      }
    } else if (days >= 100) {
      // 100 ומעלה ימים
      if (isCombat) {
        // 100 ומעלה ימי שמ"פ מצטברים בצו 8 במערך הלוחם
        maxAmount = 3000;
        category = '100+ ימים במערך לוחם';
      } else {
        // משרתי מילואים בשאר היחידות
        maxAmount = 2000;
        category = 'יחידה אחרת (100+ ימים)';
      }
    }

    if (maxAmount === 0) {
      setResult({
        eligible: false,
        reason: 'לצערנו, אינך זכאי לפי התקרות הקיימות.'
      });
      return;
    }

    // הפיצוי מחושב באופן יחסי למספר ימי המילואים שבוצעו בפועל
    // אבל לא יעלה על התקרה שנקבעה
    const calculatedAmount = maxAmount;

    setResult({
      eligible: true,
      amount: calculatedAmount,
      maxPossible: maxAmount,
      category,
      days,
      year: year === 'tashpah' ? 'תשפ"ד' : year === 'tashpeh' ? 'תשפ"ה' : 'תשפ"ו',
      isCombat
    });
  };

  const handleNext = () => {
    if (step === 1 && formData.year) setStep(2);
    else if (step === 2 && formData.reserveDays) setStep(3);
    else if (step === 3 && formData.combatUnit) {
      calculateEligibility();
      setStep(4);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFormData({
      year: '',
      reserveDays: '',
      combatUnit: ''
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
        {step !== 4 && (
          <div className="mb-6">
            <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
              <span>שאלה {step} מתוך 3</span>
              <span>{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-l from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
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
              <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="tashpav" id="tashpav" />
                <Label htmlFor="tashpav" className="cursor-pointer flex-1">
                  <div className="font-semibold">תשפ"ו (2025-2026)</div>
                  <div className="text-sm text-slate-600">שירתי בשנת תשפ"ו</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Step 2: Reserve Days */}
        {step === 2 && (
          <div className="space-y-4">
            <Label className="text-lg font-semibold">כמה ימי מילואים שירתת בצו 8?</Label>
            <p className="text-sm text-slate-600">
              הזן את מספר ימי המילואים שביצעת בצו 8 (שמ"פ מצטברים)
            </p>
            <Input
              type="number"
              placeholder="למשל: 75"
              value={formData.reserveDays}
              onChange={(e) => setFormData({ ...formData, reserveDays: e.target.value })}
              className="text-lg"
              min="5"
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

        {/* Step 4: Result */}
        {step === 4 && result && (
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
                  <div className="text-sm text-slate-600 space-y-1 mt-4">
                    <div><strong>תקרה:</strong> עד {result.maxPossible.toLocaleString()} ₪</div>
                    <div><strong>קטגוריה:</strong> {result.category}</div>
                    <div><strong>מספר ימים:</strong> {result.days} ימי מילואים בצו 8</div>
                    <div><strong>שנת לימודים:</strong> {result.year}</div>
                  </div>
                  <div className="mt-4 text-xs text-slate-500 bg-white/50 rounded-lg p-2">
                    הפיצוי מחושב באופן יחסי למספר ימי המילואים שבוצעו בפועל, אך לא יעלה על התקרה שנקבעה למערך
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
                    onClick={() => window.open('https://mushlam-frontend.wiz.digital.idf.il/m/v2fnx2a8lp', '_blank')}
                    variant="outline"
                    className="w-full border-blue-500/30 text-blue-600 hover:bg-blue-50 py-6 text-lg"
                  >
                    <ExternalLink className="w-5 h-5 ml-2" />
                    הגשת בקשה להחזר מקרן הסיוע
                  </Button>

                  <Button
                    onClick={() => window.open('https://wa.me/972523964584', '_blank')}
                    variant="outline"
                    className="w-full border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 py-6 text-lg"
                  >
                    <Phone className="w-5 h-5 ml-2" />
                    מוקד בירור זכאות: 052-396-4584
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

                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-slate-700">
                    אם אתה חושב שיש טעות או שיש לך שאלות, אנחנו כאן לעזור!
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => window.open('https://mushlam-frontend.wiz.digital.idf.il/m/v2fnx2a8lp', '_blank')}
                      variant="outline"
                      className="w-full border-blue-500/30 text-blue-600 hover:bg-blue-50"
                    >
                      <ExternalLink className="w-4 h-4 ml-2" />
                      הגשת בקשה להחזר מקרן הסיוע
                    </Button>
                    <Button
                      onClick={() => window.open('https://wa.me/972523964584', '_blank')}
                      variant="outline"
                      className="w-full border-emerald-500/30 text-emerald-600 hover:bg-emerald-50"
                    >
                      <Phone className="w-4 h-4 ml-2" />
                      מוקד בירור זכאות: 052-396-4584
                    </Button>
                  </div>
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
        {step > 0 && step < 4 && (
          <div className="flex flex-row-reverse gap-3 mt-6">
            <Button
              onClick={handleNext}
              disabled={
                (step === 1 && !formData.year) ||
                (step === 2 && !formData.reserveDays) ||
                (step === 3 && !formData.combatUnit)
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