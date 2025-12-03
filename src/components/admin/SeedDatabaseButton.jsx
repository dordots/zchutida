// Seed Database Button Component
// This component provides a button to seed the database with sample data
// Only use this in development!

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { seedDatabase } from '@/firebase/seedData';

export default function SeedDatabaseButton() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSeed = async () => {
    if (!confirm('האם אתה בטוח שברצונך ליצור רשומות דוגמה? פעולה זו תוסיף נתונים לדאטאבייס.')) {
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      await seedDatabase();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-slate-50" dir="rtl">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-5 h-5 text-emerald-600" />
        <div>
          <h3 className="font-semibold text-slate-900">יצירת נתוני דוגמה</h3>
          <p className="text-sm text-slate-600">
            יצירת רשומות דוגמה ב-Firestore (חניכים, חונכים, מפגשים)
          </p>
        </div>
      </div>

      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            הנתונים נוצרו בהצלחה! בדוק את הקונסול לפרטים.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            שגיאה: {error}
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleSeed}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            יוצר נתונים...
          </>
        ) : (
          <>
            <Database className="w-4 h-4 ml-2" />
            צור נתוני דוגמה
          </>
        )}
      </Button>

      <p className="text-xs text-slate-500 mt-2 text-center">
        ⚠️ השתמש בזה רק בפיתוח!
      </p>
    </div>
  );
}

