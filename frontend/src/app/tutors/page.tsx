'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Navigation } from '@/components/layout/navigation';
import { TutorCard } from '@/components/tutors/tutor-card';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Users, Star } from 'lucide-react';
import { Tutor } from '@/types/tutor';
import { tutorApi } from '@/lib/api';

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [priceRange, setPriceRange] = useState('');

  useEffect(() => {
    loadTutors();
  }, []);

  useEffect(() => {
    filterTutors();
  }, [tutors, searchTerm, selectedSubject, priceRange]);

  const loadTutors = async () => {
    try {
      setLoading(true);
      const data = await tutorApi.getTutors();
      setTutors(data);
    } catch (error) {
      console.error('Error loading tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTutors = () => {
    let filtered = [...tutors];

    // Filter by search term (name or bio)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tutor => 
        tutor.first_name.toLowerCase().includes(term) ||
        tutor.last_name.toLowerCase().includes(term) ||
        tutor.bio?.toLowerCase().includes(term) ||
        tutor.subjects.some(subject => subject.toLowerCase().includes(term))
      );
    }

    // Filter by subject
    if (selectedSubject && selectedSubject !== 'all') {
      filtered = filtered.filter(tutor => 
        tutor.subjects.some(subject => subject.toLowerCase().includes(selectedSubject.toLowerCase()))
      );
    }

    // Filter by price range
    if (priceRange && priceRange !== 'any') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(tutor => {
        if (max) {
          return tutor.hourly_rate >= min && tutor.hourly_rate <= max;
        }
        return tutor.hourly_rate >= min;
      });
    }

    setFilteredTutors(filtered);
  };

  const getUniqueSubjects = () => {
    const allSubjects = new Set<string>();
    tutors.forEach(tutor => {
      let subjects: string[] = [];
      if (Array.isArray(tutor.subjects)) {
        subjects = tutor.subjects;
      } else if (typeof tutor.subjects === 'string') {
        try {
          subjects = JSON.parse(tutor.subjects);
        } catch {
          subjects = [];
        }
      }
      subjects.forEach((subject: string) => allSubjects.add(subject));
    });
    return Array.from(allSubjects).sort();
  };

  const getStats = () => {
    const totalTutors = tutors.length;
    const avgRating = tutors.reduce((sum, tutor) => sum + (tutor.rating || 0), 0) / totalTutors || 0;
    const totalSessions = tutors.reduce((sum, tutor) => sum + tutor.total_sessions, 0);
    
    return { totalTutors, avgRating, totalSessions };
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-80 bg-gray-200 rounded"></div>
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
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Tutor</h1>
              <p className="text-gray-600">Connect with experienced tutors to help you achieve your learning goals</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tutors</p>
                      <p className="text-2xl font-bold">{stats.totalTutors}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Rating</p>
                      <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                      <p className="text-2xl font-bold">{stats.totalSessions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tutors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All subjects</SelectItem>
                      {getUniqueSubjects().map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Price range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any price</SelectItem>
                      <SelectItem value="0-30">Under $30/hr</SelectItem>
                      <SelectItem value="30-50">$30 - $50/hr</SelectItem>
                      <SelectItem value="50-75">$50 - $75/hr</SelectItem>
                      <SelectItem value="75-">Over $75/hr</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="mb-4">
              <p className="text-gray-600">
                Showing {filteredTutors.length} of {tutors.length} tutors
              </p>
            </div>

            {/* Tutors Grid */}
            {filteredTutors.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tutors found</h3>
                  <p className="text-gray-500">
                    Try adjusting your filters or search terms to find more tutors.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 