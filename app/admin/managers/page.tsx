'use client';

import React, { useState } from 'react';
import { useStore } from '@/components/providers/StoreProvider';
import { Shield, Plus, Trash2, Lock, Key } from 'lucide-react';

export default function PlatformManagersPage() {
  const { managers, addManager, deleteManager, currentUser } = useStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleOpenNew = () => {
    setName(''); setEmail(''); setPassword(''); setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    addManager({ id: `mgr-${Date.now()}`, name, email, password, role: 'manager' });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to revoke access for this manager?')) {
      deleteManager(id);
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow"><span className="dot"></span>Admin controls</div>
          <h1>Platform Managers</h1>
          <p className="page-sub">Manage administrative access to the superadmin dashboard.</p>
        </div>
        <div className="topbar-actions">
          <button onClick={handleOpenNew} className="btn btn-fill"><Plus className="w-4 h-4" /> Add Manager</button>
        </div>
      </div>

      <hr className="rule" />

      <div className="panel">
        <div className="panel-body p-0">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Manager Profile</th>
                <th className="text-right">Credentials & Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager) => (
                <tr key={manager.id}>
                  <td className="who pl-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-[3px] border ${manager.role === 'superadmin' ? 'bg-[#B23A2A]/10 border-[#B23A2A]/20 text-[#B23A2A]' : 'bg-[var(--forest)]/10 border-[var(--forest)]/20 text-[var(--forest)]'} flex items-center justify-center`}>
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-[var(--ink)] flex items-center gap-2">
                          {manager.name}
                          {manager.role === 'superadmin' && <span className="pill pass" style={{ backgroundColor: 'var(--brick)', color: 'white' }}>Primary Owner</span>}
                          {currentUser?.id === manager.id && <span className="pill mid">You</span>}
                        </div>
                        <div className="font-mono text-[11px] text-[var(--ink-faint)] mt-0.5">{manager.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right pr-6">
                    <div className="flex items-center justify-end gap-6">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--ink-soft)] bg-[var(--paper-card)] border border-[var(--line-soft)] px-2.5 py-1 rounded-[2px]">
                        <Key className="w-3.5 h-3.5" /> {manager.password}
                      </div>
                      
                      {manager.role === 'superadmin' ? (
                        <button disabled className="bg-transparent border-none text-[var(--line)] cursor-not-allowed"><Lock className="w-4 h-4" /></button>
                      ) : (
                        <button onClick={() => handleDelete(manager.id)} className="bg-transparent border-none text-[var(--ink-faint)] hover:text-[#B23A2A] cursor-pointer" title="Revoke Access">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[var(--ink)]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[4px] p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line-soft)] pb-4 mb-6">
              <h2 className="font-display text-[22px] text-[var(--ink)] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--brick)]" /> Add Platform Manager
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-transparent border-none text-[var(--ink-faint)] hover:text-[var(--ink)] text-[20px] cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">Full Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-[var(--paper-card)] text-[14px] focus:outline-none focus:border-[var(--ink)]" />
              </div>
              
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">Login Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-[var(--paper-card)] text-[14px] focus:outline-none focus:border-[var(--ink)]" />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">Temporary Password</label>
                <input required type="text" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-[var(--paper-card)] text-[14px] focus:outline-none focus:border-[var(--ink)]" />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--line-soft)] mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-fill">Grant Access</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
