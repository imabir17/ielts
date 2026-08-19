'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Type, Palette, Sun, Moon, Sparkles, ChevronDown } from 'lucide-react';

export type ExamTheme = 'standard' | 'high-contrast' | 'yellow-on-black' | 'sepia';
export type FontScale = 0.85 | 1 | 1.15 | 1.3;

interface AccessibilityBarProps {
  volume?: number; // 0 to 1
  onVolumeChange?: (volume: number) => void;
  showVolume?: boolean;
}

export function AccessibilityBar({ volume = 0.8, onVolumeChange, showVolume = true }: AccessibilityBarProps) {
  const [fontScale, setFontScale] = useState<FontScale>(1);
  const [theme, setTheme] = useState<ExamTheme>('standard');
  const [currentVolume, setCurrentVolume] = useState<number>(volume);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [prevVolume, setPrevVolume] = useState<number>(volume);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  // Sync font scale to CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--exam-font-scale', String(fontScale));
    return () => {
      document.documentElement.style.removeProperty('--exam-font-scale');
    };
  }, [fontScale]);

  // Sync theme to root attribute
  useEffect(() => {
    if (theme === 'standard') {
      document.documentElement.removeAttribute('data-exam-theme');
    } else {
      document.documentElement.setAttribute('data-exam-theme', theme);
    }
    return () => {
      document.documentElement.removeAttribute('data-exam-theme');
    };
  }, [theme]);

  const handleVolumeSlide = (newVal: number) => {
    setCurrentVolume(newVal);
    if (newVal > 0 && isMuted) {
      setIsMuted(false);
    }
    if (onVolumeChange) {
      onVolumeChange(newVal);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      const restore = prevVolume > 0 ? prevVolume : 0.8;
      setCurrentVolume(restore);
      if (onVolumeChange) onVolumeChange(restore);
    } else {
      setPrevVolume(currentVolume);
      setIsMuted(true);
      setCurrentVolume(0);
      if (onVolumeChange) onVolumeChange(0);
    }
  };

  const cycleFontScale = (direction: 'up' | 'down' | 'reset') => {
    const scales: FontScale[] = [0.85, 1, 1.15, 1.3];
    if (direction === 'reset') {
      setFontScale(1);
      return;
    }
    const currIdx = scales.indexOf(fontScale);
    if (direction === 'up' && currIdx < scales.length - 1) {
      setFontScale(scales[currIdx + 1]);
    } else if (direction === 'down' && currIdx > 0) {
      setFontScale(scales[currIdx - 1]);
    }
  };

  const themes: { id: ExamTheme; label: string; bg: string; text: string; border: string }[] = [
    { id: 'standard', label: 'Standard', bg: 'bg-white', text: 'text-slate-900', border: 'border-slate-300' },
    { id: 'high-contrast', label: 'High Contrast (Dark)', bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-700' },
    { id: 'yellow-on-black', label: 'Yellow on Black', bg: 'bg-black', text: 'text-yellow-300', border: 'border-yellow-400' },
    { id: 'sepia', label: 'Soft Sepia', bg: 'bg-[#fbf0d9]', text: 'text-[#433422]', border: 'border-[#d8c8a8]' },
  ];

  return (
    <div className="flex items-center space-x-2 text-xs select-none">
      {/* Font Size Controls */}
      <div className="flex items-center bg-slate-900/60 border border-slate-700/80 rounded-lg p-0.5 space-x-0.5 shadow-inner">
        <button
          type="button"
          onClick={() => cycleFontScale('down')}
          disabled={fontScale <= 0.85}
          title="Decrease Font Size (A-)"
          className="px-2 py-1 text-slate-300 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded font-bold transition-colors"
        >
          A<span className="text-[9px] font-normal">−</span>
        </button>
        <button
          type="button"
          onClick={() => cycleFontScale('reset')}
          title="Reset Font Size (100%)"
          className={`px-2 py-1 rounded font-bold transition-colors ${
            fontScale === 1 ? 'bg-[#005C53] text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          A
        </button>
        <button
          type="button"
          onClick={() => cycleFontScale('up')}
          disabled={fontScale >= 1.3}
          title="Increase Font Size (A+)"
          className="px-2 py-1 text-slate-300 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded font-bold transition-colors"
        >
          A<span className="text-[10px] font-bold">+</span>
        </button>
      </div>

      {/* Contrast / Color Scheme Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsThemeOpen(!isThemeOpen)}
          title="Accessibility Contrast Theme"
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-200 font-medium transition-colors"
        >
          <Palette className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline text-[11px] font-mono capitalize">{theme.replace('-', ' ')}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {isThemeOpen && (
          <div className="absolute right-0 mt-1.5 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1 border-b border-slate-800">
              Color & Contrast
            </div>
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setIsThemeOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-bold transition-all ${
                  theme === t.id ? 'bg-[#005C53] text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{t.label}</span>
                <span className={`w-3.5 h-3.5 rounded-full border ${t.bg} ${t.border}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Volume Control (shown for listening or global) */}
      {showVolume && (
        <div className="flex items-center space-x-1.5 bg-slate-900/60 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200">
          <button
            type="button"
            onClick={toggleMute}
            className="p-0.5 text-slate-300 hover:text-white transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted || currentVolume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : currentVolume}
            onChange={(e) => handleVolumeSlide(parseFloat(e.target.value))}
            className="w-16 sm:w-20 accent-[#005C53] h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            title={`Volume: ${Math.round((isMuted ? 0 : currentVolume) * 100)}%`}
          />
        </div>
      )}
    </div>
  );
}
