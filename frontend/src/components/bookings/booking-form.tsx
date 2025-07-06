'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { bookingApi } from '@/lib/api';
import { BookingCreate } from '@/types/tutor';
import { toast } from 'sonner';

const bookingSchema = z.object({
  date: z.date({ required_error: 'Please select a date' }),
  start_time: z.string().min(1, 'Start time is required'),
  duration: z.union([z.literal(30), z.literal(60)]),
  subject: z.string().min(1, 'Subject is required'),
  notes: z.string().optional(),
});

interface BookingFormProps {
  tutorId: string;
  subjects: string[];
  onSuccess?: () => void;
}

export function BookingForm({ tutorId, subjects, onSuccess }: BookingFormProps) {
  const [availableSlots, setAvailableSlots] = React.useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: undefined,
      start_time: '',
      duration: 30 as 30 | 60,
      subject: subjects[0] || '',
      notes: '',
    },
  });

  // Fetch available slots when date or duration changes
  React.useEffect(() => {
    const { date, duration } = form.getValues();
    if (!date || !duration) {
      setAvailableSlots([]);
      return;
    }
    setLoadingSlots(true);
    const fetchSlots = async () => {
      try {
        const res = await fetch(`/api/v1/bookings/slots/${tutorId}?date_str=${date.toISOString().slice(0, 10)}&duration=${duration}`);
        const data = await res.json();
        setAvailableSlots(data.slots || []);
      } catch {
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [form.watch('date'), form.watch('duration'), tutorId]);

  // Helper to combine date and time into UTC ISO string
  const combineDateTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    // Create a new Date in local time, then convert to UTC
    const dt = new Date(date);
    dt.setHours(hours, minutes, 0, 0);
    // Return as UTC ISO string
    return new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes())).toISOString();
  };

  const onSubmit = async (data: z.infer<typeof bookingSchema>) => {
    if (!data.date || !data.start_time || !data.duration) return;
    setSubmitting(true);
    try {
      const start = combineDateTime(data.date, data.start_time);
      const end = combineDateTime(data.date, data.start_time);
      const endDate = new Date(end);
      endDate.setMinutes(endDate.getMinutes() + data.duration);
      const booking: BookingCreate = {
        tutor_id: tutorId,
        subject: data.subject,
        start_time: start,
        end_time: endDate.toISOString(),
        notes: data.notes,
      };
      await bookingApi.createBooking(booking);
      toast.success('Booking created successfully!');
      if (onSuccess) onSuccess();
      form.reset();
      setAvailableSlots([]);
    } catch {
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Calendar selected={field.value} onSelect={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Duration</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full border rounded px-3 py-2"
                  onChange={e => field.onChange(Number(e.target.value))}
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="start_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <div>
                  {loadingSlots ? (
                    <div className="text-gray-500 py-2">Loading available times...</div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-gray-500 py-2">No available times for this day.</div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto border rounded bg-gray-50 p-2 flex flex-col gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          className={`border rounded px-4 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${field.value === slot ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-blue-100'}`}
                          onClick={() => field.onChange(slot)}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <select {...field} className="w-full border rounded px-3 py-2">
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any notes for your tutor..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={submitting || availableSlots.length === 0}>
          {submitting ? 'Booking...' : 'Book Session'}
        </Button>
      </form>
    </Form>
  );
} 