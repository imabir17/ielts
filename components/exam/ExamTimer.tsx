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
  const onTimeUpRef = useRef(onTimeUp);
  const onWarningRef = useRef(onWarning);
  const hasEndedRef = useRef(false);
  const warned10Ref = useRef(false);
  const warned5Ref = useRef(false);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
    onWarningRef.current = onWarning;
  });

  useEffect(() => {
    hasEndedRef.current = false;
    warned10Ref.current = false;
    warned5Ref.current = false;
    setSecondsLeft(initialSeconds);

    if (initialSeconds <= 0) return;

    const startTime = Date.now();
    const totalMs = initialSeconds * 1000;
    const endTime = startTime + totalMs;

    const interval = setInterval(() => {
      const remainingMs = endTime - Date.now();
      const remainingSecs = Math.max(0, Math.ceil(remainingMs / 1000));
      
      setSecondsLeft(remainingSecs);

      // Warning thresholds
      if (remainingSecs <= 600 && remainingSecs > 300 && !warned10Ref.current) {
        warned10Ref.current = true;
        if (onWarningRef.current) onWarningRef.current('warning', 10);
      }
      if (remainingSecs <= 300 && remainingSecs > 0 && !warned5Ref.current) {
        warned5Ref.current = true;
        if (onWarningRef.current) onWarningRef.current('critical', 5);
      }

      if (remainingSecs <= 0) {
        clearInterval(interval);
        if (!hasEndedRef.current) {
          hasEndedRef.current = true;
          if (onTimeUpRef.current) onTimeUpRef.current();
        }
      }
    }, 250); // 250ms interval for precision without drift

    return () => clearInterval(interval);
  }, [initialSeconds]);

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
