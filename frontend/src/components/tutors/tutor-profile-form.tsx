'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { TutorProfileFormData } from '@/types/tutor';
import { toast } from 'sonner';

const tutorProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  bio: z.string().optional(),
  phone: z.string().optional(),
  subjects: z.array(z.string()).min(1, 'At least one subject is required'),
  hourly_rate: z.number().min(1, 'Hourly rate must be at least $1'),
});

interface TutorProfileFormProps {
  initialData?: Partial<TutorProfileFormData>;
  onSubmit: (data: TutorProfileFormData) => Promise<void>;
  isLoading?: boolean;
}

export function TutorProfileForm({ initialData, onSubmit, isLoading = false }: TutorProfileFormProps) {
  const [newSubject, setNewSubject] = useState('');

  const form = useForm<z.infer<typeof tutorProfileSchema>>({
    resolver: zodResolver(tutorProfileSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      bio: initialData?.bio || '',
      phone: initialData?.phone || '',
      subjects: initialData?.subjects || [],
      hourly_rate: initialData?.hourly_rate || 25,
    },
  });

  const handleSubmit = async (data: z.infer<typeof tutorProfileSchema>) => {
    try {
      await onSubmit(data);
      toast.success('Profile saved successfully!');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const addSubject = () => {
    if (newSubject.trim() && !form.getValues('subjects').includes(newSubject.trim())) {
      const currentSubjects = form.getValues('subjects');
      form.setValue('subjects', [...currentSubjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const removeSubject = (subjectToRemove: string) => {
    const currentSubjects = form.getValues('subjects');
    form.setValue('subjects', currentSubjects.filter(subject => subject !== subjectToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubject();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Tutor Profile</CardTitle>
        <CardDescription>
          Set up your profile to start receiving booking requests from students.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell students about your teaching experience, education, and approach..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subjects You Teach</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a subject (e.g., Mathematics, Physics)"
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                          onKeyPress={handleKeyPress}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addSubject}
                          disabled={!newSubject.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {field.value.map((subject, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {subject}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1"
                              onClick={() => removeSubject(subject)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hourly_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Rate ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="25.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving Profile...' : 'Save Profile'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 