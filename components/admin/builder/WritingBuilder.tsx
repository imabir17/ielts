'use client';

import React from 'react';
import { WritingTask } from '@/lib/mock-data';
import { ImageUploader } from './ImageUploader';
import { Edit3, Image as ImageIcon, Clock, FileText, X } from 'lucide-react';

interface WritingBuilderProps {
  tasks: WritingTask[];
  onChange: (tasks: WritingTask[]) => void;
}

export function WritingBuilder({ tasks, onChange }: WritingBuilderProps) {
  // Ensure we have Task 1 and Task 2 objects
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const task1: WritingTask = safeTasks.find((t) => t.taskNumber === 1) || {
    id: 'wrt-1',
    taskNumber: 1,
    title: 'Task 1: Academic Data Analysis',
    prompt: 'The chart below shows the proportion of energy generated from renewable sources...',
    minWords: 150,
    recommendedTime: 20,
  };

  const task2: WritingTask = safeTasks.find((t) => t.taskNumber === 2) || {
    id: 'wrt-2',
    taskNumber: 2,
    title: 'Task 2: Essay Prompt',
    prompt: 'Some educators argue that artificial intelligence tools should be completely banned in academic settings...',
    minWords: 250,
    recommendedTime: 40,
  };


  const updateTask1 = (updatedFields: Partial<WritingTask>) => {
    onChange([{ ...task1, ...updatedFields }, task2]);
  };

  const updateTask2 = (updatedFields: Partial<WritingTask>) => {
    onChange([task1, { ...task2, ...updatedFields }]);
  };

  const handleTask1Image = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      updateTask1({ diagramUrl: url } as any);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs text-[#005C53]">
        <div className="flex items-center space-x-2 font-semibold">
          <Edit3 className="w-4 h-4" />
          <span>Writing Module Builder — Form Inputs (No JSON required)</span>
        </div>
        <span className="font-mono text-[11px] font-bold">Standard 2-Task Format</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Task 1 Builder */}
        <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#005C53]" />
              <span>Writing Task 1 (Data / Diagram Analysis)</span>
            </h3>
            <span className="text-xs font-bold uppercase bg-red-100 text-red-700 px-2.5 py-0.5 rounded">
              Task 1
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Task 1 Title</label>
            <input
              type="text"
              value={task1.title}
              onChange={(e) => updateTask1({ title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#005C53] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Task 1 Prompt & Instructions</label>
            <textarea
              rows={5}
              value={task1.prompt}
              onChange={(e) => updateTask1({ prompt: e.target.value })}
              placeholder="Enter Task 1 prompt instructions..."
              className="w-full p-4 rounded-xl border border-slate-300 text-slate-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#005C53] resize-y"
            />
          </div>

          {/* Time & Word Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Recommended Time (mins)</label>
              <input
                type="number"
                value={task1.recommendedTime}
                onChange={(e) => updateTask1({ recommendedTime: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Word Count</label>
              <input
                type="number"
                value={task1.minWords}
                onChange={(e) => updateTask1({ minWords: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
              />
            </div>
          </div>

          {/* Task 1 Diagram / Chart Image Attachment */}
          <ImageUploader
            label="Task 1 Chart / Graph / Map Image"
            value={task1.diagramUrl}
            onChange={(url) => updateTask1({ diagramUrl: url })}
            helperText="Upload local image files (PNG, JPG, SVG) or paste an image URL for Task 1 charts."
          />
        </div>

        {/* Task 2 Builder */}
        <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#005C53]" />
              <span>Writing Task 2 (Essay Question)</span>
            </h3>
            <span className="text-xs font-bold uppercase bg-red-100 text-red-700 px-2.5 py-0.5 rounded">
              Task 2
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Task 2 Title</label>
            <input
              type="text"
              value={task2.title}
              onChange={(e) => updateTask2({ title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#005C53] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Task 2 Prompt & Topic Question</label>
            <textarea
              rows={8}
              value={task2.prompt}
              onChange={(e) => updateTask2({ prompt: e.target.value })}
              placeholder="Enter Task 2 essay prompt..."
              className="w-full p-4 rounded-xl border border-slate-300 text-slate-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#005C53] resize-y"
            />
          </div>

          {/* Time & Word Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Recommended Time (mins)</label>
              <input
                type="number"
                value={task2.recommendedTime}
                onChange={(e) => updateTask2({ recommendedTime: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Word Count</label>
              <input
                type="number"
                value={task2.minWords}
                onChange={(e) => updateTask2({ minWords: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005C53]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
