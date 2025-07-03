'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Navigation } from '@/components/layout/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Calendar, 
  DollarSign, 
  Star, 
  Users, 
  Clock, 
  ArrowRight,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { bookingApi, tutorApi } from '@/lib/api';
import { Booking, TutorProfile, TutorDashboardStats, TutorProfileFormData } from '@/types/tutor';
import { TutorProfileForm } from '@/components/tutors/tutor-profile-form';

export default function TutorDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user?.role === 'tutor') {
      loadTutorDashboardData();
    }
  }, [user]);

  const loadTutorDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsData, profileData] = await Promise.all([
        bookingApi.getBookings(),
        tutorApi.getTutorProfile().catch(() => null) // Profile might not exist yet
      ]);
      setBookings(bookingsData);
      setTutorProfile(profileData);
    } catch (error) {
      console.error('Error loading tutor dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (data: TutorProfileFormData) => {
    try {
      setSavingProfile(true);
      const updatedProfile = await tutorApi.createTutorProfile(data);
      setTutorProfile(updatedProfile);
      setShowProfileForm(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    } finally {
      setSavingProfile(false);
    }
  };

  const getTutorStats = (): TutorDashboardStats => {
    const now = new Date();
    const upcomingBookings = bookings.filter(b => 
      b.status === 'confirmed' && new Date(b.start_time) > now
    );
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    
    const totalEarnings = completedBookings.reduce((total, booking) => {
      const duration = (new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / (1000 * 60 * 60);
      return total + (duration * (tutorProfile?.hourly_rate || 0));
    }, 0);

    const averageRating = tutorProfile?.rating || 0;

    return {
      totalSessions: bookings.length,
      upcomingSessions: upcomingBookings.length,
      totalEarnings,
      averageRating,
      completedSessions: completedBookings.length,
      pendingSessions: pendingBookings.length,
    };
  };

  const stats = getTutorStats();

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

  // Show profile setup if no profile exists
  if (!tutorProfile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to TutorFlow!</h1>
                <p className="text-gray-600">Complete your profile to start receiving booking requests from students.</p>
              </div>
              <TutorProfileForm onSubmit={handleProfileSubmit} isLoading={savingProfile} />
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
            {/* Header Section */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {tutorProfile.first_name}!
                </h1>
                <p className="text-gray-600">
                  Manage your sessions, earnings, and profile information.
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowProfileForm(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>

            {/* Profile Summary Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Subjects</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tutorProfile.subjects.map((subject, index) => (
                        <Badge key={index} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Hourly Rate</p>
                    <p className="text-lg font-semibold">${tutorProfile.hourly_rate}/hr</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <Badge variant={tutorProfile.is_verified ? "default" : "secondary"}>
                      {tutorProfile.is_verified ? "Verified" : "Pending Verification"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
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
                    All time sessions
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
                  <p className="text-xs text-muted-foreground">
                    Confirmed sessions
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    From completed sessions
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.averageRating > 0 ? 'Student ratings' : 'No ratings yet'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Manage Sessions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    View and manage your upcoming and past tutoring sessions.
                  </p>
                  <Button asChild>
                    <Link href="/bookings" className="flex items-center space-x-2">
                      <span>View Sessions</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Availability</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Set your availability schedule to receive more booking requests.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/dashboard/tutor/availability" className="flex items-center space-x-2">
                      <span>Set Availability</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No sessions yet. Complete your profile to start receiving bookings!</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{booking.subject}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.start_time).toLocaleDateString()} at {new Date(booking.start_time).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant={
                          booking.status === 'confirmed' ? 'default' :
                          booking.status === 'completed' ? 'secondary' :
                          booking.status === 'pending' ? 'outline' : 'destructive'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Profile Form Modal */}
        {showProfileForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Edit Profile</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowProfileForm(false)}
                  >
                    ✕
                  </Button>
                </div>
                <TutorProfileForm 
                  initialData={tutorProfile}
                  onSubmit={handleProfileSubmit}
                  isLoading={savingProfile}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 