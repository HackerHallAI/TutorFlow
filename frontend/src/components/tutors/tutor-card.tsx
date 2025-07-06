'use client';

import { Tutor } from '@/types/tutor';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface TutorCardProps {
  tutor: Tutor;
}

export function TutorCard({ tutor }: TutorCardProps) {
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
  const initials = `${tutor.first_name[0]}${tutor.last_name[0]}`;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={tutor.avatar_url} alt={`${tutor.first_name} ${tutor.last_name}`} />
            <AvatarFallback className="text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold truncate">
                {tutor.first_name} {tutor.last_name}
              </h3>
              {tutor.is_verified && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
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
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {tutor.bio && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {tutor.bio}
          </p>
        )}
        
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              Subjects
            </h4>
            <div className="flex flex-wrap gap-1">
              {subjects.slice(0, 3).map((subject: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {subject}
                </Badge>
              ))}
              {subjects.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{subjects.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">${tutor.hourly_rate}/hr</span>
            </div>
            
            <Button asChild size="sm">
              <Link href={`/tutors/${tutor.id}`}>
                View Profile
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 