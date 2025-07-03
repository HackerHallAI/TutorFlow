'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { tutorApi } from '@/lib/api';

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function emptySchedule() {
  return WEEKDAYS.reduce((acc, day) => {
    acc[day] = [];
    return acc;
  }, {} as Record<string, [string, string][]>);
}

interface TutorAvailabilityFormProps {
  initialSchedule?: Record<string, [string, string][]>;
  onSave?: (schedule: Record<string, [string, string][]>) => void;
}

export function TutorAvailabilityForm({ initialSchedule, onSave }: TutorAvailabilityFormProps) {
  // Merge initialSchedule with emptySchedule to ensure all days are present
  const mergedInitial = React.useMemo(() => {
    const base = emptySchedule();
    if (initialSchedule) {
      for (const day of WEEKDAYS) {
        if (initialSchedule[day]) base[day] = initialSchedule[day];
      }
    }
    return base;
  }, [initialSchedule]);

  const [schedule, setSchedule] = React.useState<Record<string, [string, string][]>>(mergedInitial);
  const [saving, setSaving] = React.useState(false);

  const handleTimeChange = (day: string, idx: number, which: 0 | 1, value: string) => {
    setSchedule((prev) => {
      const updated = [...prev[day]];
      updated[idx] = which === 0 ? [value, updated[idx][1]] : [updated[idx][0], value];
      return { ...prev, [day]: updated };
    });
  };

  const handleAddBlock = (day: string) => {
    setSchedule((prev) => ({ ...prev, [day]: [...prev[day], ['09:00', '17:00']] }));
  };

  const handleRemoveBlock = (day: string, idx: number) => {
    setSchedule((prev) => {
      const updated = [...prev[day]];
      updated.splice(idx, 1);
      return { ...prev, [day]: updated };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Fetch current profile
      const profile = await tutorApi.getTutorProfile();
      // Merge with new schedule
      await tutorApi.createTutorProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        subjects: Array.isArray(profile.subjects) ? profile.subjects : [],
        hourly_rate: profile.hourly_rate,
        availability_schedule: schedule,
      });
      toast.success('Availability updated!');
      if (onSave) onSave(schedule);
    } catch {
      toast.error('Failed to update availability.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Set Your Weekly Availability</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {WEEKDAYS.map((day) => (
            <div key={day} className="border-b pb-4 mb-4">
              <label className="capitalize text-base block mb-1">{day}</label>
              {(schedule[day] ?? []).length === 0 && (
                <div className="text-sm text-gray-400 mb-2">No availability set</div>
              )}
              {(schedule[day] ?? []).map(([start, end], idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <Input
                    type="time"
                    value={start}
                    onChange={(e) => handleTimeChange(day, idx, 0, e.target.value)}
                    className="w-32"
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    value={end}
                    onChange={(e) => handleTimeChange(day, idx, 1, e.target.value)}
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBlock(day, idx)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={() => handleAddBlock(day)}>
                Add Time Block
              </Button>
            </div>
          ))}
          <Button onClick={handleSave} className="w-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save Availability'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 