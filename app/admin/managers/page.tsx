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
    setName('');
    setEmail('');
    setPassword('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    addManager({
      id: `mgr-${Date.now()}`,
      name,
      email,
      password,
      role: 'manager'
    });

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to revoke access for this manager?')) {
      deleteManager(id);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
            <span>Platform Managers</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage administrative access to the superadmin dashboard.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center space-x-2 bg-[#005C53] hover:bg-[#003831] text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Manager</span>
        </button>
      </div>

      {/* Managers List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {managers.map((manager) => (
            <div key={manager.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  manager.role === 'superadmin' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-[#005C53]'
                }`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <span>{manager.name}</span>
                    {manager.role === 'superadmin' && (
                      <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Primary Owner
                      </span>
                    )}
                    {currentUser?.id === manager.id && (
                      <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">{manager.email}</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md font-mono">
                  <Key className="w-3.5 h-3.5" />
                  <span>{manager.password}</span>
                </div>
                
                {manager.role === 'superadmin' ? (
                  <button disabled title="Cannot delete primary superadmin" className="p-2 text-slate-300 cursor-not-allowed">
                    <Lock className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={() => handleDelete(manager.id)} 
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Revoke Access"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full space-y-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-[#005C53]" />
                <span>Add Platform Manager</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input required type="text" placeholder="e.g. John Doe" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53]" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Login Email</label>
                <input required type="email" placeholder="e.g. john@mockielts.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53]" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Temporary Password</label>
                <input required type="text" placeholder="e.g. mock123" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53]" />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-[#005C53] hover:bg-[#003831] text-white rounded-xl text-sm font-bold shadow-sm">Grant Access</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
