'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ExamTimerProps {
  initialMinutes: number;
}

export function ExamTimer({ initialMinutes }: ExamTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isCritical = minutes < 5;

  return (
    <div
      className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
        isCritical
          ? 'bg-red-600 text-white border-red-700 animate-pulse shadow-md'
          : 'bg-[#002A25] text-emerald-300 border-emerald-800'
      }`}
    >
      <Clock className={`w-4 h-4 ${isCritical ? 'text-white' : 'text-emerald-400'}`} />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
