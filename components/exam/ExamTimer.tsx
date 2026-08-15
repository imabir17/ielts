'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ExamTimerProps {
  initialSeconds: number;
  onTimeUp?: () => void;
}

export function ExamTimer({ initialSeconds, onTimeUp }: ExamTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    // Reset if initialSeconds changes
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }
    
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isCritical = minutes < 5 && secondsLeft > 0;

  return (
    <div
      className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-[3px] font-mono text-sm font-bold border transition-colors ${
        isCritical
          ? 'bg-[#B23A2A] text-white border-[#8C2C1F] animate-pulse shadow-md'
          : 'bg-[#101C2E] text-[var(--paper-alt)] border-[var(--sidebar-line)]'
      }`}
    >
      <Clock className={`w-4 h-4 ${isCritical ? 'text-white' : 'text-[var(--paper-alt)]'}`} />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
