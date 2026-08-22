'use client';

import React, { useState } from 'react';
import { useStore } from '@/components/providers/StoreProvider';
import { Teacher } from '@/lib/mock-data';
import { 
  GraduationCap, Plus, Mail, Key, ShieldCheck, Trash2, Edit2, 
  Copy, Check, UserCheck, Award, Sparkles, BookOpen, AlertCircle, X
} from 'lucide-react';

export default function OrgTeachersPage() {
  const { teachers, addTeacher, updateTeacher, deleteTeacher, currentUser, tenants, examLogs } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('Writing & Speaking Evaluator');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const currentOrg = tenants.find(o => o.id === currentUser?.id) || (currentUser?.role === 'tenant' ? currentUser : tenants[0]);
  const orgTeachers = teachers.filter(t => t.orgId === currentOrg?.id || !t.orgId);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setPassword('teacher123');
    setSpecialization('Writing & Speaking Evaluator');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingId(t.id);
    setName(t.name);
    setEmail(t.email);
    setPassword(t.password || 'teacher123');
    setSpecialization(t.specialization || 'Writing & Speaking Evaluator');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingId) {
      updateTeacher(editingId, {
        name,
        email,
        password,
        specialization
      });
    } else {
      addTeacher({
        id: `tch-${Date.now()}`,
        name,
        email,
        password,
        specialization,
        orgId: currentOrg?.id || 'org-1',
        active: true,
        joinedDate: new Date().toISOString().split('T')[0]
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, teacherName: string) => {
    if (confirm(`Are you sure you want to revoke evaluation access for teacher "${teacherName}"?`)) {
      deleteTeacher(id);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getEvaluatedCount = (teacherName: string) => {
    return examLogs.filter(l => l.evaluatedBy && l.evaluatedBy.toLowerCase().includes(teacherName.toLowerCase())).length;
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow"><span className="dot"></span>Faculty Directory</div>
          <h1>Teachers &amp; Examiners</h1>
          <p className="page-sub">
            Manage your coaching center’s certified examiners, speaking interviewers, and writing evaluation specialists.
          </p>
        </div>
        <div className="topbar-actions">
          <button onClick={handleOpenAdd} className="btn btn-fill">
            <Plus className="w-4 h-4" /> Add New Teacher
          </button>
        </div>
      </div>

      <hr className="rule" />

      {/* Stats Summary */}
      <div className="stat-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-label">Total Faculty</span>
            <GraduationCap className="w-4 h-4 text-[var(--forest)]" />
          </div>
          <div className="stat-num">{orgTeachers.length}</div>
          <div className="stat-foot">Registered evaluators</div>
        </div>

        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-label">Active Evaluators</span>
            <UserCheck className="w-4 h-4 text-[var(--brick)]" />
          </div>
          <div className="stat-num">{orgTeachers.filter(t => t.active !== false).length}</div>
          <div className="stat-foot text-[var(--forest)]">Authorized to grade</div>
        </div>

        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-label">Teacher Evaluations</span>
            <Award className="w-4 h-4 text-[var(--gold)]" />
          </div>
          <div className="stat-num gold">
            {examLogs.filter(l => !!l.evaluatedBy).length}
          </div>
          <div className="stat-foot up">Attributed mock test marks</div>
        </div>
      </div>

      {/* Faculty Table Panel */}
      <div className="panel p-0 overflow-hidden">
        <div className="p-5 border-b border-[var(--line)] bg-[var(--paper-card)] flex items-center justify-between">
          <div>
            <h3 className="font-display text-[19px] text-[var(--ink)] m-0">Assigned Evaluators</h3>
            <p className="text-[12.5px] text-[var(--ink-soft)] mt-0.5">
              Teachers can log in directly with their credentials to review student submissions, override question marks, and record speaking evaluations.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="audit-table w-full">
            <thead>
              <tr>
                <th>Examiner Name</th>
                <th>Specialization &amp; Role</th>
                <th>Login Email</th>
                <th>Password</th>
                <th>Exams Evaluated</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[var(--ink-faint)] italic">
                    No faculty members created yet. Click &quot;Add New Teacher&quot; to issue evaluator access.
                  </td>
                </tr>
              ) : (
                orgTeachers.map((tch) => {
                  const evaluatedCount = getEvaluatedCount(tch.name);
                  return (
                    <tr key={tch.id} className="hover:bg-slate-50 transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-[4px] bg-[var(--forest)]/10 text-[var(--forest)] font-bold font-mono text-sm flex items-center justify-center border border-[var(--forest)]/20">
                            {tch.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-[var(--ink)] text-[14.5px]">{tch.name}</div>
                            <div className="text-[11px] text-[var(--ink-faint)]">ID: {tch.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-[3px] text-[11px] font-medium bg-[var(--paper-alt)] border border-[var(--line)] text-[var(--ink)]">
                          {tch.specialization || 'Writing & Speaking Evaluator'}
                        </span>
                      </td>
                      <td>
                        <div className="font-mono text-[12.5px] text-[var(--ink-soft)] flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {tch.email}
                        </div>
                      </td>
                      <td>
                        <div className="font-mono text-[12px] text-slate-600 flex items-center gap-2">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{tch.password || 'teacher123'}</span>
                          <button
                            onClick={() => handleCopy(tch.password || 'teacher123', tch.id)}
                            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                            title="Copy Password"
                          >
                            {copiedKey === tch.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-[13px] font-bold text-slate-800">
                          {evaluatedCount} exam{evaluatedCount === 1 ? '' : 's'}
                        </span>
                      </td>
                      <td>
                        <span className="pill pass">Active</span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(tch)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 transition-colors rounded hover:bg-slate-100"
                            title="Edit Teacher"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tch.id, tch.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                            title="Revoke Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[4px] p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--line-soft)] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[var(--forest)]/10 text-[var(--forest)] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-display text-[22px] text-[var(--ink)] m-0">
                  {editingId ? 'Edit Teacher Profile' : 'Add New Teacher / Examiner'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-[var(--paper-card)] text-[14px] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">
                  Login Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah.ielts@apex.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-[var(--paper-card)] text-[14px] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">
                  Initial Login Password *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. teacher123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-[var(--paper-card)] text-[14px] font-mono focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">
                  Specialization / Role
                </label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-[var(--paper-card)] text-[14px] focus:outline-none focus:border-[var(--ink)]"
                >
                  <option value="Writing & Speaking Evaluator">Writing &amp; Speaking Evaluator</option>
                  <option value="Certified IELTS Senior Examiner">Certified IELTS Senior Examiner</option>
                  <option value="Speaking Mock Interviewer">Speaking Mock Interviewer</option>
                  <option value="Writing Task 1 & 2 Specialist">Writing Task 1 &amp; 2 Specialist</option>
                  <option value="All IELTS Modules Evaluator">All IELTS Modules Evaluator</option>
                </select>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-200/60 rounded-[3px] text-xs text-blue-900 leading-relaxed">
                Teachers will only have permission to access <strong>Exam Results</strong> and <strong>Speaking Mocks</strong>. Any mock test evaluated by them will automatically display their nametag across the coaching center portal.
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--line-soft)] mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-fill"
                >
                  {editingId ? 'Update Teacher' : 'Add Teacher & Issue Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
