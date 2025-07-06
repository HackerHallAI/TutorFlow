'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Navigation } from '@/components/layout/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, XCircle, Search, Star, Users } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { tutorApi } from '@/lib/api';
import { Tutor } from '@/types/tutor';
import { toast } from 'sonner';

export default function AdminTutorsPage() {
  const { user } = useAuth();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadTutors();
    }
  }, [user]);

  const loadTutors = async () => {
    try {
      setLoading(true);
      // Load all tutors (both verified and unverified)
      const tutorsData = await tutorApi.getTutors({ verified_only: false, limit: 100 });
      setTutors(tutorsData);
    } catch (error) {
      console.error('Error loading tutors:', error);
      toast.error('Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTutor = async (tutorId: string, isVerified: boolean) => {
    try {
      setVerifying(tutorId);
      await tutorApi.verifyTutor(tutorId, isVerified);
      toast.success(`Tutor ${isVerified ? 'verified' : 'unverified'} successfully`);
      // Reload tutors to update the list
      await loadTutors();
    } catch (error) {
      console.error('Error verifying tutor:', error);
      toast.error('Failed to update tutor verification status');
    } finally {
      setVerifying(null);
    }
  };

  const filteredTutors = tutors.filter(tutor => {
    const fullName = `${tutor.first_name} ${tutor.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || tutor.email.toLowerCase().includes(searchLower);
  });

  const verifiedTutors = filteredTutors.filter(tutor => tutor.is_verified);
  const unverifiedTutors = filteredTutors.filter(tutor => !tutor.is_verified);

  if (user?.role !== 'admin') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutor Management</h1>
              <p className="text-gray-600">Manage tutor accounts and verification status.</p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tutors by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredTutors.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verified</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{verifiedTutors.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
                  <XCircle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{unverifiedTutors.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Tutors List */}
            <div className="space-y-6">
              {unverifiedTutors.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-orange-600">Pending Verification</h2>
                  <div className="space-y-4">
                    {unverifiedTutors.map((tutor) => (
                      <TutorRow 
                        key={tutor.id} 
                        tutor={tutor} 
                        onVerify={handleVerifyTutor}
                        verifying={verifying === tutor.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {verifiedTutors.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-green-600">Verified Tutors</h2>
                  <div className="space-y-4">
                    {verifiedTutors.map((tutor) => (
                      <TutorRow 
                        key={tutor.id} 
                        tutor={tutor} 
                        onVerify={handleVerifyTutor}
                        verifying={verifying === tutor.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {filteredTutors.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No tutors found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

interface TutorRowProps {
  tutor: Tutor;
  onVerify: (tutorId: string, isVerified: boolean) => Promise<void>;
  verifying: boolean;
}

function TutorRow({ tutor, onVerify, verifying }: TutorRowProps) {
  const initials = `${tutor.first_name[0]}${tutor.last_name[0]}`;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={tutor.avatar_url} alt={`${tutor.first_name} ${tutor.last_name}`} />
              <AvatarFallback className="text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold">
                  {tutor.first_name} {tutor.last_name}
                </h3>
                {tutor.is_verified && (
                  <Badge variant="default" className="text-xs">
                    Verified
                  </Badge>
                )}
                {!tutor.is_verified && (
                  <Badge variant="secondary" className="text-xs">
                    Pending
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-1">{tutor.email}</p>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {tutor.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{tutor.rating.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{tutor.total_sessions} sessions</span>
                </div>
                <span className="font-medium">${tutor.hourly_rate}/hr</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {(() => {
                  const subjects = tutor.subjects || [];
                  return subjects.map((subject: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {subject}
                    </Badge>
                  ));
                })()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {tutor.is_verified ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onVerify(tutor.id, false)}
                disabled={verifying}
              >
                {verifying ? 'Updating...' : 'Unverify'}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => onVerify(tutor.id, true)}
                disabled={verifying}
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 