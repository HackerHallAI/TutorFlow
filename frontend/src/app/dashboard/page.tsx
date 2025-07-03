'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Navigation } from '@/components/layout/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, GraduationCap, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { tutorApi, bookingApi } from '@/lib/api';
import { Tutor, Booking } from '@/types/tutor';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect tutors to their specific dashboard
    if (user?.role === 'tutor') {
      router.push('/dashboard/tutor');
      return;
    }
    
    loadDashboardData();
  }, [user, router]);



  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [tutorsData, bookingsData] = await Promise.all([
        tutorApi.getTutors({ limit: 100 }),
        bookingApi.getBookings()
      ]);
      setTutors(tutorsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const totalTutors = tutors.length;
    const upcomingBookings = bookings.filter(b => 
      b.status === 'confirmed' && new Date(b.start_time) > new Date()
    ).length;
    const totalSessions = bookings.filter(b => b.status === 'completed').length;
    
    // Get unique subjects from tutors
    const allSubjects = new Set<string>();
    tutors.forEach(tutor => {
      try {
        const subjects = JSON.parse(tutor.subjects || '[]');
        subjects.forEach((subject: string) => allSubjects.add(subject));
      } catch {
        // Handle invalid JSON
      }
    });
    
    return {
      totalTutors,
      upcomingBookings,
      totalSessions,
      uniqueSubjects: allSubjects.size
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to TutorFlow</h1>
              <p className="text-gray-600">Your learning journey starts here. Find tutors, book sessions, and track your progress.</p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSessions}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalSessions === 0 ? 'No sessions yet' : 'Completed sessions'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.upcomingBookings === 0 ? 'No upcoming sessions' : 'Scheduled sessions'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Tutors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTutors}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalTutors === 0 ? 'No tutors available' : 'Verified tutors'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.uniqueSubjects}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.uniqueSubjects === 0 ? 'No subjects available' : 'Available subjects'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Find Tutors</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Browse our verified tutors and find the perfect match for your learning needs.
                  </p>
                  <Button asChild>
                    <Link href="/tutors" className="flex items-center space-x-2">
                      <span>Browse Tutors</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>My Bookings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    View and manage your upcoming and past tutoring sessions.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/bookings" className="flex items-center space-x-2">
                      <span>View Bookings</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 