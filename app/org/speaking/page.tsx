'use client';

import React, { useState } from 'react';
import { useStore } from '@/components/providers/StoreProvider';
import { OrgSidebar } from '@/components/layout/OrgSidebar';
import { getTestById } from '@/lib/test-store';
import { Calendar, Video, MapPin, CheckCircle2 } from 'lucide-react';

export default function SpeakingRequestsPage() {
  const { currentUser, speakingRequests, updateSpeakingRequest, students, examLogs, updateExamLog } = useStore();
  const [selectedReq, setSelectedReq] = useState<string | null>(null);
  
  // Form State
  const [date, setDate] = useState('');
  const [type, setType] = useState<'Online' | 'Physical'>('Online');
  const [link, setLink] = useState('');

  // Complete Form State
  const [selectedCompleteReq, setSelectedCompleteReq] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [bandScore, setBandScore] = useState('');

  if (!currentUser) return null;

  // Filter requests for this org
  const orgRequests = speakingRequests.filter(r => r.orgId === currentUser.id || currentUser.role === 'tenant'); // Simplify condition for mock

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;
    
    updateSpeakingRequest(selectedReq, {
      status: 'scheduled',
      scheduledDate: date,
      type: type,
      link: type === 'Online' ? link : undefined
    });

    setSelectedReq(null);
    setDate('');
    setLink('');
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompleteReq) return;

    const reqToComplete = speakingRequests.find(r => r.id === selectedCompleteReq);
    if (!reqToComplete) return;

    const bScore = parseFloat(bandScore);

    updateSpeakingRequest(selectedCompleteReq, {
      status: 'completed',
      feedback: feedback,
      bandScore: bScore
    });

    // Try to find an examLog to update overallBand
    const relatedLog = examLogs.find(l => l.studentId === reqToComplete.studentId && l.testId === reqToComplete.testId);
    if (relatedLog) {
      const newScores = { ...relatedLog.scores, speaking: bScore };
      
      let newOverallBand = relatedLog.overallBand;
      const scoresArray = [];
      if (newScores.reading !== undefined) scoresArray.push(newScores.reading);
      if (newScores.listening !== undefined) scoresArray.push(newScores.listening);
      if (newScores.writing !== undefined) scoresArray.push(newScores.writing);
      scoresArray.push(bScore);

      if (scoresArray.length > 0) {
        const sum = scoresArray.reduce((a, b) => a + b, 0);
        const avg = sum / scoresArray.length;
        newOverallBand = Math.round(avg * 2) / 2;
      }

      updateExamLog(relatedLog.id, {
        scores: newScores,
        overallBand: newOverallBand
      });
    }

    setSelectedCompleteReq(null);
    setFeedback('');
    setBandScore('');
  };

  return (
    <>
      <div className="topbar mb-6">
        <div>
          <h1>Speaking Mock Requests</h1>
        </div>
      </div>

      <div className="panel p-0 overflow-hidden">
        <div className="p-5 border-b border-[var(--line)] bg-[var(--paper-card)]">
          <h3 className="font-medium text-[16px] text-[var(--ink)]">Pending & Scheduled Requests</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="audit-table w-full">
            <thead>
              <tr>
                <th>Student</th>
                <th>Test</th>
                <th>Date Requested</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orgRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-[var(--ink-faint)]">
                    No speaking mock requests found.
                  </td>
                </tr>
              ) : (
                orgRequests.map(req => {
                  const student = students.find(s => s.id === req.studentId);
                  const test = getTestById(req.testId);
                  
                  return (
                    <tr key={req.id}>
                      <td className="font-medium text-[var(--ink)]">{student?.name || 'Unknown'}</td>
                      <td className="text-[13px]">{test?.title || req.testId}</td>
                      <td className="text-[12px] text-[var(--ink-soft)]">{new Date(req.requestedAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          req.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          'bg-[var(--forest)]/10 text-[var(--forest)]'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td>
                        {req.status === 'pending' ? (
                          <button
                            onClick={() => setSelectedReq(req.id)}
                            className="text-[12px] font-bold text-[var(--forest)] hover:underline"
                          >
                            Schedule Now
                          </button>
                        ) : req.status === 'scheduled' ? (
                          <div className="flex flex-col space-y-2">
                            <div className="text-[11px] text-[var(--ink-soft)] font-medium flex flex-col space-y-1">
                              <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {new Date(req.scheduledDate!).toLocaleString()}</span>
                              <span className="flex items-center">
                                {req.type === 'Online' ? <Video className="w-3 h-3 mr-1"/> : <MapPin className="w-3 h-3 mr-1"/>}
                                {req.type}
                              </span>
                            </div>
                            <button
                              onClick={() => setSelectedCompleteReq(req.id)}
                              className="text-[12px] font-bold text-blue-600 hover:underline text-left mt-2"
                            >
                              Mark Complete
                            </button>
                          </div>
                        ) : (
                          <div className="text-[11px] text-[var(--forest)] font-medium flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Completed
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-[var(--ink)]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3px] p-8 max-w-md w-full shadow-2xl font-sans">
            <h2 className="text-[20px] font-display text-[var(--ink)] mb-1">Schedule Speaking Mock</h2>
            <p className="text-[13px] text-[var(--ink-soft)] mb-6">Set the date, time, and location for the student's speaking exam.</p>
            
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 bg-[var(--paper)] border border-[var(--line-soft)] rounded-[3px] text-[14px] focus:outline-none focus:border-[var(--forest)]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'Online'|'Physical')}
                  className="w-full p-2.5 bg-[var(--paper)] border border-[var(--line-soft)] rounded-[3px] text-[14px] focus:outline-none focus:border-[var(--forest)]"
                >
                  <option value="Online">Online (Zoom/Meet)</option>
                  <option value="Physical">Physical (In-Center)</option>
                </select>
              </div>

              {type === 'Online' && (
                <div>
                  <label className="block text-[12px] font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Meeting Link</label>
                  <input
                    type="url"
                    required
                    placeholder="https://meet.google.com/..."
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full p-2.5 bg-[var(--paper)] border border-[var(--line-soft)] rounded-[3px] text-[14px] focus:outline-none focus:border-[var(--forest)]"
                  />
                </div>
              )}

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="px-4 py-2 text-[13px] font-bold text-[var(--ink-soft)] hover:text-[var(--ink)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-fill bg-[var(--forest)] border-[var(--forest)] px-6 py-2"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {selectedCompleteReq && (
        <div className="fixed inset-0 bg-[var(--ink)]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3px] p-8 max-w-md w-full shadow-2xl font-sans">
            <h2 className="text-[20px] font-display text-[var(--ink)] mb-1">Complete Speaking Mock</h2>
            <p className="text-[13px] text-[var(--ink-soft)] mb-6">Provide feedback for the student's speaking performance.</p>
            
            <form onSubmit={handleComplete} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Performance Feedback</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail the student's fluency, vocabulary, pronunciation..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-3 bg-[var(--paper)] border border-[var(--line-soft)] rounded-[3px] text-[14px] focus:outline-none focus:border-[var(--forest)]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Band Score</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  required
                  placeholder="e.g. 7.5"
                  value={bandScore}
                  onChange={(e) => setBandScore(e.target.value)}
                  className="w-full p-2.5 bg-[var(--paper)] border border-[var(--line-soft)] rounded-[3px] text-[14px] focus:outline-none focus:border-[var(--forest)]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedCompleteReq(null)}
                  className="px-4 py-2 text-[13px] font-bold text-[var(--ink-soft)] hover:text-[var(--ink)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-fill bg-blue-600 border-blue-600 px-6 py-2"
                >
                  Save & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
