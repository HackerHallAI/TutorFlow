'use client';
import { useEffect, useState } from 'react';
import { SessionList } from '@/components/bookings/session-list';
import { bookingApi } from '@/lib/api';
import { Booking } from '@/types/tutor';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Navigation } from '@/components/layout/navigation';

export default function StudentBookingsPage() {
  const [sessions, setSessions] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await bookingApi.getBookings();
        setSessions(data);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (id: number) => {
    await bookingApi.cancelBooking(id);
    setSessions((prev) => prev.map(s => s.id === id ? { ...s, status: 'cancelled' } : s));
  };

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
          {loading ? <div>Loading...</div> : <SessionList sessions={sessions} userRole="student" onCancel={handleCancel} />}
        </main>
      </div>
    </ProtectedRoute>
  );
} 