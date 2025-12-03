import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function ProfileProgress({ progress }) {
  return (
    <Card className="mb-6 bg-gradient-to-l from-emerald-50 to-teal-50 border-emerald-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-900">השלמת פרופיל</h3>
            <p className="text-sm text-slate-600">מלא את כל השדות כדי להמשיך</p>
          </div>
          <div className="text-3xl font-bold text-emerald-600">{progress}%</div>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-l from-emerald-500 to-teal-500 h-full transition-all duration-500 flex items-center justify-end"
            style={{ width: `${progress}%` }}
          >
            {progress === 100 && (
              <CheckCircle2 className="w-4 h-4 text-white ml-1" />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}