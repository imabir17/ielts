'use client';

import React, { useState } from 'react';
import { useStore } from '@/components/providers/StoreProvider';
import { OrgSidebar } from '@/components/layout/OrgSidebar';
import { getTestById } from '@/lib/test-store';
import { Calendar, Video, MapPin, CheckCircle2 } from 'lucide-react';

export default function SpeakingRequestsPage() {
  const { currentUser, speakingRequests, updateSpeakingRequest, students } = useStore();
  const [selectedReq, setSelectedReq] = useState<string | null>(null);
  
  // Form State
  const [date, setDate] = useState('');
  const [type, setType] = useState<'Online' | 'Physical'>('Online');
  const [link, setLink] = useState('');

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
                        ) : (
                          <div className="text-[11px] text-[var(--ink-soft)] font-medium flex flex-col space-y-1">
                            <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {new Date(req.scheduledDate!).toLocaleString()}</span>
                            <span className="flex items-center">
                              {req.type === 'Online' ? <Video className="w-3 h-3 mr-1"/> : <MapPin className="w-3 h-3 mr-1"/>}
                              {req.type}
                            </span>
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
    </>
  );
}
