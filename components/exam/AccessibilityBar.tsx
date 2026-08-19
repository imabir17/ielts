'use client';

import React, { useState, useEffect } from 'react';
import { Type, Sun, Moon, Volume2 } from 'lucide-react';

interface AccessibilityBarProps {
  onVolumeChange?: (volume: number) => void;
}

export function AccessibilityBar({ onVolumeChange }: AccessibilityBarProps) {
  const [fontScale, setFontScale] = useState<number>(1);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);

  // Apply Font Scale
  useEffect(() => {
    document.documentElement.style.setProperty('--exam-font-scale', fontScale.toString());
  }, [fontScale]);

  // Apply High Contrast
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Apply Volume
  useEffect(() => {
    if (onVolumeChange) {
      onVolumeChange(volume);
    }
  }, [volume, onVolumeChange]);

  const cycleFont = () => {
    setFontScale((prev) => (prev === 1 ? 1.15 : prev === 1.15 ? 0.85 : 1));
  };

  return (
    <div className="flex items-center gap-3 bg-[var(--ink)]/40 px-3 py-1.5 rounded-[3px] border border-[var(--sidebar-line)]">
      <button 
        onClick={cycleFont}
        className="text-[var(--paper-alt)] hover:text-white transition-colors flex items-center justify-center p-1"
        title="Adjust Font Size"
      >
        <Type className="w-4 h-4" />
        <span className="text-[10px] ml-1 font-mono">{fontScale === 1 ? 'M' : fontScale > 1 ? 'L' : 'S'}</span>
      </button>

      <div className="w-px h-4 bg-[var(--sidebar-line)]" />

      <button
        onClick={() => setHighContrast(!highContrast)}
        className="text-[var(--paper-alt)] hover:text-white transition-colors flex items-center justify-center p-1"
        title="Toggle High Contrast"
      >
        {highContrast ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className="w-px h-4 bg-[var(--sidebar-line)]" />

      <div className="flex items-center gap-2" title="Adjust Audio Volume">
        <Volume2 className="w-4 h-4 text-[var(--paper-alt)]" />
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.05" 
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-16 h-1 bg-[var(--sidebar-line)] rounded-full appearance-none outline-none accent-[var(--brick)]"
        />
      </div>
    </div>
  );
}
