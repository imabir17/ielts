'use client';

import React, { useState } from 'react';
import { useStore } from '@/components/providers/StoreProvider';
import { WritingGradingForm } from '@/components/exam/WritingGradingForm';
import { WritingAssessment } from '@/lib/mock-data';
import { getTestById } from '@/lib/test-store';
import { FileEdit, CheckCircle2, Clock, Search, Filter, AlertCircle, ArrowLeft, Award, User, Calendar } from 'lucide-react';

export default function OrgGradingPage() {
  const { examLogs, updateExamLog, currentUser, students } = useStore();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded'>('pending');

  if (!currentUser) return null;

  // Filter logs to find submissions belonging to this organization that have Writing
  const orgStudents = students.filter(s => s.orgId === currentUser.id || currentUser.role === 'tenant');
  const orgStudentIds = orgStudents.map(s => s.id);

  const writingLogs = examLogs
    .filter(log => {
      const isOurStudent = orgStudentIds.includes(log.studentId) || log.orgId === currentUser.id;
      const tookWriting = log.modulesTaken?.includes('writing') || Boolean(log.answers?.writing && Object.keys(log.answers.writing).length > 0);
      return isOurStudent && tookWriting;
    })
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  const filteredLogs = writingLogs.filter(log => {
    const isPending = log.scores?.writing === undefined || log.status !== 'Graded';
    if (statusFilter === 'pending' && !isPending) return false;
    if (statusFilter === 'graded' && isPending) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = log.studentName?.toLowerCase().includes(q);
      const matchTest = log.testTitle?.toLowerCase().includes(q);
      return matchName || matchTest;
    }
    return true;
  });

  const selectedLog = examLogs.find(l => l.id === selectedLogId);
  const selectedTest = selectedLog ? getTestById(selectedLog.testId) : null;

  const handleAssessmentSave = (assessment: WritingAssessment) => {
    if (!selectedLog) return;

    const wScore = assessment.overallWritingBand || 6.0;
    const newScores = {
      ...selectedLog.scores,
      writing: wScore
    };

    // Calculate new overall band across available modules
    const scoresList: number[] = [];
    if (newScores.reading !== undefined) scoresList.push(newScores.reading);
    if (newScores.listening !== undefined) scoresList.push(newScores.listening);
    if (newScores.speaking !== undefined) scoresList.push(newScores.speaking);
    scoresList.push(wScore);

    const sum = scoresList.reduce((a, b) => a + b, 0);
    const avg = sum / scoresList.length;
    const overallBand = Math.round(avg * 2) / 2;

    // Generate readable general summary for legacy writingFeedback field
    const summaryFeedback = [
      assessment.generalNotes ? `Overall Feedback: ${assessment.generalNotes}` : '',
      assessment.task1 ? `Task 1 (Band ${assessment.task1.overallTaskBand?.toFixed(1)}): TA ${assessment.task1.taskAchievementScore}, CC ${assessment.task1.coherenceScore}, LR ${assessment.task1.lexicalScore}, GRA ${assessment.task1.grammarScore}` : '',
      assessment.task2 ? `Task 2 (Band ${assessment.task2.overallTaskBand?.toFixed(1)}): TR ${assessment.task2.taskAchievementScore}, CC ${assessment.task2.coherenceScore}, LR ${assessment.task2.lexicalScore}, GRA ${assessment.task2.grammarScore}` : ''
    ].filter(Boolean).join('\n\n');

    updateExamLog(selectedLog.id, {
      status: 'Graded',
      writingAssessment: assessment,
      writingFeedback: summaryFeedback,
      scores: newScores,
      overallBand
    });

    setSelectedLogId(null);
  };

  const pendingCount = writingLogs.filter(l => l.scores?.writing === undefined || l.status !== 'Graded').length;

  return (
    <>
      <div className="topbar mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="eyebrow"><span className="dot"></span>Examiner Workbench</div>
            <h1 className="text-[28px]">Writing Assessment & Evaluation</h1>
            <p className="page-sub">Grade student essays with targeted 4-criteria feedback.</p>
          </div>
          {pendingCount > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>{pendingCount} Pending Assessment{pendingCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {selectedLog && selectedTest ? (
        <div className="space-y-6">
          {/* Back button and candidate header */}
          <div className="panel p-5 flex items-center justify-between bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedLogId(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Back to submissions list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="text-xs font-bold text-[#005C53] uppercase tracking-wider">Evaluating Candidate Submission</div>
                <h2 className="text-lg font-bold text-slate-900">{selectedLog.studentName}</h2>
                <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5 font-mono">
                  <span>Test: {selectedLog.testTitle}</span>
                  <span>•</span>
                  <span>Submitted: {new Date(selectedLog.completedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Writing Grading Rubric */}
          <WritingGradingForm
            tasks={selectedTest.writing}
            studentAnswers={selectedLog.answers?.writing || {}}
            initialAssessment={selectedLog.writingAssessment}
            onSave={handleAssessmentSave}
            onCancel={() => setSelectedLogId(null)}
            evaluatorRole="Organization Examiner"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filters and Search Bar */}
          <div className="panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name or test title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#005C53]"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Submissions ({writingLogs.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'pending' ? 'bg-[#005C53] text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Pending Review ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('graded')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'graded' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Graded ({writingLogs.length - pendingCount})
              </button>
            </div>
          </div>

          {/* Submissions List */}
          <div className="panel p-0 overflow-hidden">
            <div className="p-5 border-b border-[var(--line)] bg-[var(--paper-card)] flex items-center justify-between">
              <h3 className="font-medium text-[16px] text-[var(--ink)]">Student Writing Submissions</h3>
              <span className="text-xs text-[var(--ink-faint)] font-mono">{filteredLogs.length} Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="audit-table w-full">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Test Name</th>
                    <th>Submission Date</th>
                    <th>Writing Status</th>
                    <th>Writing Band</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-[var(--ink-faint)]">
                        <FileEdit className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-medium">No writing submissions found matching your filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => {
                      const isPending = log.scores?.writing === undefined || log.status !== 'Graded';
                      const student = students.find(s => s.id === log.studentId);

                      return (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td>
                            <div className="font-bold text-slate-900">{log.studentName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{student?.studentId || 'ID'}</div>
                          </td>
                          <td className="text-xs text-slate-700 font-medium">{log.testTitle}</td>
                          <td className="text-xs text-slate-500 font-mono">
                            {new Date(log.completedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td>
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              isPending
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {isPending ? 'Pending Evaluation' : 'Graded & Evaluated'}
                            </span>
                          </td>
                          <td>
                            <span className={`font-mono text-sm font-bold ${
                              log.scores?.writing !== undefined ? 'text-[#005C53]' : 'text-slate-400'
                            }`}>
                              {log.scores?.writing !== undefined ? `Band ${log.scores.writing.toFixed(1)}` : '—'}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => setSelectedLogId(log.id)}
                              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                isPending
                                  ? 'bg-[#005C53] hover:bg-[#004740] text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                              }`}
                            >
                              {isPending ? 'Assess & Grade' : 'View / Edit Assessment'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
