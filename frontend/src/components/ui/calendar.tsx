'use client';

import * as React from 'react';
import { addMonths, format, isSameDay, isToday, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth } from 'date-fns';

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

export function Calendar({ selected, onSelect, className = '' }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(selected || new Date());

  const startMonth = startOfMonth(currentMonth);
  const endMonth = endOfMonth(currentMonth);
  const startDate = startOfWeek(startMonth, { weekStartsOn: 0 });
  const endDate = endOfWeek(endMonth, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const handlePrevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm w-full max-w-xs ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={handlePrevMonth} className="px-2 py-1 rounded hover:bg-gray-100 text-gray-600">{'<'}</button>
        <span className="font-semibold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</span>
        <button type="button" onClick={handleNextMonth} className="px-2 py-1 rounded hover:bg-gray-100 text-gray-600">{'>'}</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-500 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const isSelected = selected && isSameDay(d, selected);
          const isCurrentMonth = isSameMonth(d, currentMonth);
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={!isCurrentMonth}
              onClick={() => isCurrentMonth && onSelect?.(d)}
              className={`rounded-full w-8 h-8 flex items-center justify-center
                ${isSelected ? 'bg-blue-600 text-white font-bold' : ''}
                ${isToday(d) ? 'border border-blue-400' : ''}
                ${!isCurrentMonth ? 'text-gray-300' : 'hover:bg-blue-100'}
              `}
            >
              {format(d, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
} 