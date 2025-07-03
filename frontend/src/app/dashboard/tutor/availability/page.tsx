'use client';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Navigation } from '@/components/layout/navigation';
import { TutorAvailabilityForm } from '@/components/tutors/tutor-availability-form';
import { tutorApi } from '@/lib/api';
import { TutorProfile } from '@/types/tutor';

export default function TutorAvailabilityPage() {
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await tutorApi.getTutorProfile();
        setTutorProfile(profile);
      } catch {
        setTutorProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-2xl mx-auto py-12 px-4">
            <div className="animate-pulse h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-2xl mx-auto py-12 px-4">
          <h1 className="text-2xl font-bold mb-6">Manage Your Availability</h1>
          <TutorAvailabilityForm
            initialSchedule={tutorProfile?.availability_schedule as Record<string, [string, string][]>}
            onSave={(newSchedule) => setTutorProfile((prev) => prev ? { ...prev, availability_schedule: newSchedule } : prev)}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
} 