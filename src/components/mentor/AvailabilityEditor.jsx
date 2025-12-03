import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Clock } from 'lucide-react';

const DAYS = [
  { value: 'sunday', label: 'ראשון' },
  { value: 'monday', label: 'שני' },
  { value: 'tuesday', label: 'שלישי' },
  { value: 'wednesday', label: 'רביעי' },
  { value: 'thursday', label: 'חמישי' },
  { value: 'friday', label: 'שישי' }
];

export default function AvailabilityEditor({ slots = [], onChange }) {
  const [newSlot, setNewSlot] = useState({ day: '', start_time: '', end_time: '' });

  const addSlot = () => {
    if (newSlot.day && newSlot.start_time && newSlot.end_time) {
      onChange([...slots, newSlot]);
      setNewSlot({ day: '', start_time: '', end_time: '' });
    }
  };

  const removeSlot = (index) => {
    onChange(slots.filter((_, i) => i !== index));
  };

  const getDayLabel = (dayValue) => {
    return DAYS.find(d => d.value === dayValue)?.label || dayValue;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          שעות זמינות לחונכות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">הגדר את השעות שבהן אתה זמין לקבל חניכים</p>

        {/* Current slots */}
        {slots.length > 0 && (
          <div className="space-y-2">
            {slots.map((slot, index) => (
              <div key={index} className="flex items-center gap-3 bg-emerald-50 p-3 rounded-lg">
                <span className="font-medium text-emerald-800">{getDayLabel(slot.day)}</span>
                <span className="text-emerald-700">{slot.start_time} - {slot.end_time}</span>
                <button
                  type="button"
                  onClick={() => removeSlot(index)}
                  className="mr-auto text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new slot */}
        <div className="grid grid-cols-4 gap-3 items-end">
          <div>
            <Label>יום</Label>
            <Select value={newSlot.day} onValueChange={(val) => setNewSlot({ ...newSlot, day: val })}>
              <SelectTrigger>
                <SelectValue placeholder="בחר יום" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map(day => (
                  <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>משעה</Label>
            <Input
              type="time"
              value={newSlot.start_time}
              onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
            />
          </div>
          <div>
            <Label>עד שעה</Label>
            <Input
              type="time"
              value={newSlot.end_time}
              onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
            />
          </div>
          <Button
            type="button"
            onClick={addSlot}
            disabled={!newSlot.day || !newSlot.start_time || !newSlot.end_time}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 ml-1" />
            הוסף
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}