'use client';

import React, { useState, useRef } from 'react';
import { DiagramPin } from '@/lib/mock-data';
import { ImageUploader } from './ImageUploader';
import { MapPin, Plus, Trash2, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface DiagramPinToolProps {
  diagramUrl?: string;
  onDiagramUrlChange: (url: string | undefined) => void;
  pins: DiagramPin[];
  onPinsChange: (pins: DiagramPin[]) => void;
  startingQuestionNumber: number;
}

export function DiagramPinTool({
  diagramUrl,
  onDiagramUrlChange,
  pins,
  onPinsChange,
  startingQuestionNumber,
}: DiagramPinToolProps) {
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!diagramUrl || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = Math.round((x / rect.width) * 1000) / 10;
    const yPercent = Math.round((y / rect.height) * 1000) / 10;

    const nextPinNum = startingQuestionNumber + pins.length;

    const newPin: DiagramPin = {
      id: `pin-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      pinNumber: nextPinNum,
      xPercent,
      yPercent,
      correctAnswer: 'Answer Key',
      acceptedAlternates: [],
    };

    const updatedPins = [...pins, newPin];
    onPinsChange(updatedPins);
    setSelectedPinId(newPin.id);
  };

  const updatePin = (pinId: string, fields: Partial<DiagramPin>) => {
    const updated = pins.map((p) => (p.id === pinId ? { ...p, ...fields } : p));
    onPinsChange(updated);
  };

  const deletePin = (pinId: string) => {
    const updated = pins.filter((p) => p.id !== pinId);
    // Renumber remaining pins
    const renumbered = updated.map((p, idx) => ({
      ...p,
      pinNumber: startingQuestionNumber + idx,
    }));
    onPinsChange(renumbered);
    if (selectedPinId === pinId) setSelectedPinId(null);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Image Upload Component */}
      <ImageUploader
        label="Diagram / Illustration Image"
        value={diagramUrl}
        onChange={onDiagramUrlChange}
        helperText="Upload diagram image, then click anywhere on the image preview to drop interactive numbered pins!"
      />

      {diagramUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Interactive Image Pin Marker Canvas */}
          <div className="lg:col-span-7 bg-slate-900 p-4 rounded-3xl space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-emerald-300 font-bold px-1">
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Click image to drop pin marker</span>
              </span>
              <span>{pins.length} Pins Placed</span>
            </div>

            <div
              onClick={handleImageClick}
              className="relative cursor-crosshair overflow-hidden rounded-2xl bg-slate-950 flex items-center justify-center select-none"
            >
              <img
                ref={imageRef}
                src={diagramUrl}
                alt="Diagram Pin Placement"
                className="max-h-96 w-auto object-contain block mx-auto pointer-events-none"
              />

              {/* Render Pins Overlay */}
              {pins.map((pin) => (
                <div
                  key={pin.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPinId(pin.id);
                  }}
                  style={{
                    left: `${pin.xPercent}%`,
                    top: `${pin.yPercent}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-[#90%] transition-transform hover:scale-125 z-10 ${
                    selectedPinId === pin.id ? 'scale-125 z-20' : ''
                  }`}
                  title={`Pin ${pin.pinNumber}: Click to edit key`}
                >
                  <div className="flex flex-col items-center">
                    <span className="bg-red-600 text-white font-black text-xs px-2 py-0.5 rounded-full shadow-lg border-2 border-white flex items-center justify-center min-w-[24px]">
                      {pin.pinNumber}
                    </span>
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-600 drop-shadow-md"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pins Editor Panel */}
          <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 max-h-[460px] overflow-y-auto">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center justify-between border-b border-slate-100 pb-2">
              <span>Diagram Pin Keys ({pins.length})</span>
              <span className="text-[10px] text-slate-400 font-mono">x/y coordinates saved</span>
            </h4>

            {pins.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Click on the diagram image to place Pin markers corresponding to candidate answer keys.
              </div>
            ) : (
              pins.map((pin) => (
                <div
                  key={pin.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                    selectedPinId === pin.id ? 'border-[#005C53] bg-emerald-50/40 shadow-sm' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs">
                      Pin #{pin.pinNumber} (Q{pin.pinNumber})
                    </span>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
                      <span>({pin.xPercent}%, {pin.yPercent}%)</span>
                      <button
                        onClick={() => deletePin(pin.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Correct Answer Key</label>
                    <input
                      type="text"
                      value={pin.correctAnswer}
                      onChange={(e) => updatePin(pin.id, { correctAnswer: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-[#005C53] focus:outline-none focus:ring-1 focus:ring-[#005C53]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Accepted Alternates (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. oxygen species, ROS"
                      value={(pin.acceptedAlternates || []).join(', ')}
                      onChange={(e) =>
                        updatePin(pin.id, {
                          acceptedAlternates: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className="w-full px-3 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#005C53]"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
