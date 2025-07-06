import React from 'react';
import { Booking } from '@/types/tutor';
import { Button } from '@/components/ui/button';

interface SessionListProps {
  sessions: Booking[];
  userRole: 'student' | 'tutor' | 'admin';
  onCancel?: (id: number) => void;
  onUpdateStatus?: (id: number, status: Booking['status']) => void;
}

export const SessionList: React.FC<SessionListProps> = ({ sessions, userRole, onCancel, onUpdateStatus }) => {
  if (sessions.length === 0) {
    return <div className="text-center text-gray-500">No sessions found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Subject</th>
            <th className="px-4 py-2 text-left">Start</th>
            <th className="px-4 py-2 text-left">End</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id} className="border-b">
              <td className="px-4 py-2">{session.subject}</td>
              <td className="px-4 py-2">{new Date(session.start_time).toLocaleString()}</td>
              <td className="px-4 py-2">{new Date(session.end_time).toLocaleString()}</td>
              <td className="px-4 py-2 capitalize">{session.status}</td>
              <td className="px-4 py-2 space-x-2">
                {(userRole === 'student' || userRole === 'tutor' || userRole === 'admin') && session.status !== 'cancelled' && (
                  <Button variant="outline" size="sm" onClick={() => onCancel && onCancel(session.id)}>
                    Cancel
                  </Button>
                )}
                {userRole !== 'student' && session.status === 'pending' && (
                  <Button variant="outline" size="sm" onClick={() => onUpdateStatus && onUpdateStatus(session.id, 'confirmed')}>
                    Confirm
                  </Button>
                )}
                {userRole === 'admin' && session.status !== 'completed' && (
                  <Button variant="outline" size="sm" onClick={() => onUpdateStatus && onUpdateStatus(session.id, 'completed')}>
                    Mark Completed
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 