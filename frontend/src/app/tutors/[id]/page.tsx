'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { tutorApi } from '@/lib/api';
import { TutorDetail } from '@/types/tutor';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, BookOpen, Users, Clock } from 'lucide-react';
import { Navigation } from '@/components/layout/navigation';
import { BookingForm } from '@/components/bookings/booking-form';

export default function TutorProfilePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const [tutor, setTutor] = useState<TutorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchTutor = async () => {
      try {
        setLoading(true);
        const data = await tutorApi.getTutor(id);
        setTutor(data);
      } catch (err: unknown) {
        setError((err as Error).message || 'Failed to load tutor');
      } finally {
        setLoading(false);
      }
    };
    fetchTutor();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400 text-lg">Loading tutor profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-gray-500 text-lg">Tutor not found.</div>
      </div>
    );
  }

  const subjects = tutor.subjects || [];
  const initials = `${tutor.first_name[0]}${tutor.last_name[0]}`;

  return (
    <div>
      <Navigation />
      <div className="max-w-2xl mx-auto py-10 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 space-x-6 pb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={tutor.avatar_url} alt={`${tutor.first_name} ${tutor.last_name}`} />
              <AvatarFallback className="text-2xl font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-2xl font-bold truncate">
                  {tutor.first_name} {tutor.last_name}
                </h1>
                {tutor.is_verified && (
                  <Badge variant="secondary" className="text-xs">Verified</Badge>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {tutor.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{tutor.rating.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{tutor.total_sessions} sessions</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tutor.bio && (
              <p className="text-base text-muted-foreground mb-4 whitespace-pre-line">
                {tutor.bio}
              </p>
            )}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                Subjects
              </h4>
              <div className="flex flex-wrap gap-1">
                {subjects.map((subject: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-6 mb-4">
              <div className="flex items-center space-x-1 text-lg">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">${tutor.hourly_rate}/hr</span>
              </div>
              <Button onClick={() => setShowBooking(true)}>Book Now</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {showBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => setShowBooking(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Book a Session with {tutor.first_name}</h2>
            <BookingForm tutorId={tutor.id} subjects={subjects} onSuccess={() => setShowBooking(false)} />
          </div>
        </div>
      )}
    </div>
  );
} 