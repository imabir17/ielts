'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StickyNote, X, Minimize2, Maximize2, Trash2 } from 'lucide-react';

interface FloatingNotepadProps {
  testId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FloatingNotepad({ testId, isOpen, onClose }: FloatingNotepadProps) {
  const [note, setNote] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 24, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 24,
    startY: 80,
  });

  const storageKey = `ielts_notepad_${testId || 'default'}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setNote(saved);
    }
  }, [storageKey]);

  const handleNoteChange = (text: string) => {
    setNote(text);
    localStorage.setItem(storageKey, text);
  };

  const handleClearNote = () => {
    if (window.confirm('Clear all notes in notepad?')) {
      setNote('');
      localStorage.removeItem(storageKey);
    }
  };

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      
      const newX = Math.max(10, Math.min(window.innerWidth - 320, dragStartRef.current.startX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 100, dragStartRef.current.startY + dy));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  const wordCount = note.trim() ? note.trim().split(/\s+/).length : 0;
  const charCount = note.length;

  return (
    <div
      style={{ right: `${position.x}px`, top: `${position.y}px` }}
      className={`fixed z-50 bg-slate-900 border border-slate-700 rounded-[3px] shadow-2xl flex flex-col font-sans transition-all duration-75 ${
        isMinimized ? 'w-64' : 'w-80 sm:w-96'
      }`}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDown}
        className="bg-slate-800 text-white px-3 py-2 border-b border-slate-700 flex items-center justify-between cursor-move select-none rounded-t-[3px]"
      >
        <div className="flex items-center space-x-2">
          <StickyNote className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-xs tracking-wide">Candidate Notepad</span>
        </div>

        <div className="flex items-center space-x-1.5 text-slate-400">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:text-white hover:bg-slate-700 rounded-[2px]"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:text-white hover:bg-slate-700 rounded-[2px]"
            title="Close Notepad"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notepad Content */}
      {!isMinimized && (
        <div className="p-3 bg-slate-950 flex flex-col space-y-2">
          <textarea
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="Jot down rough notes, outline ideas, or track keywords during the exam..."
            rows={8}
            className="w-full p-2.5 bg-slate-900 text-slate-100 placeholder-slate-500 border border-slate-700 rounded-[2px] text-xs font-mono leading-relaxed focus:outline-none focus:border-amber-400 resize-y"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span>
              {wordCount} words | {charCount} chars
            </span>
            <button
              onClick={handleClearNote}
              className="flex items-center space-x-1 text-red-400 hover:text-red-300 hover:underline"
              title="Clear notes"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
