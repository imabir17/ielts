'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react';

interface ExamTimerProps {
  initialSeconds: number;
  onTimeUp?: () => void;
  onWarningThreshold?: (thresholdMinutes: 10 | 5) => void;
  className?: string;
}

export function ExamTimer({ initialSeconds, onTimeUp, onWarningThreshold, className = '' }: ExamTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const notified10mRef = useRef(false);
  const notified5mRef = useRef(false);

  useEffect(() => {
    // Reset if initialSeconds changes
    setSecondsLeft(initialSeconds);
    notified10mRef.current = initialSeconds <= 600;
    notified5mRef.current = initialSeconds <= 300;
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    // Check warning thresholds
    if (secondsLeft <= 600 && secondsLeft > 300 && !notified10mRef.current) {
      notified10mRef.current = true;
      if (onWarningThreshold) onWarningThreshold(10);
    }
    if (secondsLeft <= 300 && !notified5mRef.current) {
      notified5mRef.current = true;
      if (onWarningThreshold) onWarningThreshold(5);
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
  }, [secondsLeft, onTimeUp, onWarningThreshold]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isCritical = secondsLeft <= 300 && secondsLeft > 0; // < 5 mins
  const isWarning = secondsLeft <= 600 && secondsLeft > 300; // 5-10 mins

  return (
    <div
      className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-lg font-mono text-sm font-bold border transition-all duration-300 shadow-sm ${
        isCritical
          ? 'bg-red-600 text-white border-red-700 animate-pulse ring-4 ring-red-500/30'
          : isWarning
          ? 'bg-amber-500 text-slate-950 border-amber-600 animate-[pulse_1.5s_ease-in-out_infinite] ring-4 ring-amber-400/30'
          : 'bg-[#101C2E] text-slate-100 border-[var(--sidebar-line)]'
      } ${className}`}
      title={isCritical ? 'Under 5 minutes remaining!' : isWarning ? 'Under 10 minutes remaining' : 'Time Remaining'}
    >
      {isCritical ? (
        <AlertCircle className="w-4 h-4 text-white animate-bounce shrink-0" />
      ) : isWarning ? (
        <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />
      ) : (
        <Clock className="w-4 h-4 text-slate-300 shrink-0" />
      )}
      <span className="tracking-wider">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      {isCritical && (
        <span className="hidden sm:inline text-[10px] uppercase font-sans font-extrabold tracking-tight bg-red-800 text-red-100 px-1.5 py-0.5 rounded ml-1">
          Final 5m
        </span>
      )}
      {isWarning && (
        <span className="hidden sm:inline text-[10px] uppercase font-sans font-extrabold tracking-tight bg-amber-600 text-amber-950 px-1.5 py-0.5 rounded ml-1">
          10m Left
        </span>
      )}
    </div>
  );
}

