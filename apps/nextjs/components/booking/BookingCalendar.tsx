'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingCalendarProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
];

// Mock unavailable times
const UNAVAILABLE_TIMES = ['9:30 AM', '11:00 AM', '2:00 PM', '3:30 PM'];

function generateAvailability(year: number, month: number): Set<number> {
  const available = new Set<number>();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dow = date.getDay();
    // Available Mon-Fri, not past dates
    if (dow !== 0 && dow !== 6 && date >= new Date()) {
      available.add(day);
    }
  }
  return available;
}

export default function BookingCalendar({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}: BookingCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [direction, setDirection] = useState(1);

  const availableDays = useMemo(
    () => generateAvailability(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    setDirection(-1);
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    setDirection(1);
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          aria-label="Previous month"
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ChevronLeft size={16} />
        </button>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.h3
            key={monthName}
            custom={direction}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -20 }}
            className="text-white font-semibold"
          >
            {monthName}
          </motion.h3>
        </AnimatePresence>
        <button
          onClick={nextMonth}
          aria-label="Next month"
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${viewYear}-${viewMonth}`}
          custom={direction}
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -30 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-7 gap-1"
        >
          {/* Empty cells for first week */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const isAvailable = availableDays.has(day);
            const date = new Date(viewYear, viewMonth, day);
            const isSelected =
              selectedDate?.getDate() === day &&
              selectedDate?.getMonth() === viewMonth &&
              selectedDate?.getFullYear() === viewYear;
            const isToday =
              today.getDate() === day &&
              today.getMonth() === viewMonth &&
              today.getFullYear() === viewYear;

            return (
              <button
                key={day}
                onClick={() => isAvailable && onDateSelect(date)}
                disabled={!isAvailable}
                aria-label={`${day} ${monthName}${isAvailable ? '' : ', unavailable'}`}
                aria-pressed={isSelected}
                className={cn(
                  'relative h-9 w-full rounded-lg text-sm font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-blue-500',
                  isSelected
                    ? 'bg-[#0066ff] text-white'
                    : isAvailable
                    ? 'text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer'
                    : 'text-gray-700 cursor-not-allowed',
                  isToday && !isSelected && 'ring-1 ring-blue-500/50'
                )}
              >
                {day}
                {isAvailable && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                )}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Time slots */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h4 className="text-sm font-medium text-gray-300">
            Available times for{' '}
            <span className="text-white">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((time) => {
              const isUnavailable = UNAVAILABLE_TIMES.includes(time);
              const isSelected = selectedTime === time;

              return (
                <button
                  key={time}
                  onClick={() => !isUnavailable && onTimeSelect(time)}
                  disabled={isUnavailable}
                  aria-label={`${time}${isUnavailable ? ', unavailable' : ''}`}
                  aria-pressed={isSelected}
                  className={cn(
                    'px-2 py-2 rounded-lg text-xs font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-blue-500',
                    isSelected
                      ? 'bg-[#0066ff] text-white'
                      : isUnavailable
                      ? 'bg-white/2 text-gray-700 cursor-not-allowed line-through'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                  )}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
