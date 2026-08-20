'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface ExamTimerProps {
  initialSeconds: number;
  onTimeUp?: () => void;
  onWarning?: (type: 'warning' | 'critical', minutesLeft: number) => void;
}

export function ExamTimer({ initialSeconds, onTimeUp, onWarning }: ExamTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const prevSeconds = useRef(initialSeconds);

  useEffect(() => {
    // Reset if initialSeconds changes
    setSecondsLeft(initialSeconds);
    prevSeconds.current = initialSeconds;
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }
    
    // Check for warnings on boundary crossing
    if (onWarning) {
      if (prevSeconds.current > 600 && secondsLeft <= 600) {
        onWarning('warning', 10);
      }
      if (prevSeconds.current > 300 && secondsLeft <= 300) {
        onWarning('critical', 5);
      }
    }
    prevSeconds.current = secondsLeft;
    
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
  }, [secondsLeft, onTimeUp, onWarning]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  
  const isCritical = secondsLeft <= 300 && secondsLeft > 0; // <= 5 mins
  const isWarning = secondsLeft <= 600 && secondsLeft > 300; // <= 10 mins, > 5 mins

  return (
    <div
      className={`flex items-center space-x-1.5 px-3 py-1 rounded-[2px] font-mono text-xs font-semibold border transition-colors ${
        isCritical
          ? 'bg-[#B23A2A] text-white border-[#8C2C1F] animate-pulse'
          : isWarning 
          ? 'bg-amber-500 text-slate-950 border-amber-600 animate-pulse'
          : 'bg-[#16233A] text-slate-200 border-slate-700'
      }`}
      title="Time Remaining"
    >
      <Clock className={`w-3.5 h-3.5 ${isCritical || isWarning ? 'text-current' : 'text-slate-300'}`} />
      <span className="tracking-wide">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} remaining
      </span>
    </div>
  );
}

