'use client';

import React, { useState } from 'react';
import { useStore } from '@/components/providers/StoreProvider';
import { Package } from '@/lib/mock-data';
import { Package as PackageIcon, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const { packages, addPackage, updatePackage, deletePackage } = useStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [idLimitType, setIdLimitType] = useState<'number' | 'unlimited'>('number');
  const [idLimitValue, setIdLimitValue] = useState(50);
  const [examLimitType, setExamLimitType] = useState<'number' | 'unlimited'>('number');
  const [examLimitValue, setExamLimitValue] = useState(100);
  const [description, setDescription] = useState('');

  const handleOpenNew = () => {
    setEditingId(null); setName(''); setPrice(0);
    setIdLimitType('number'); setIdLimitValue(50);
    setExamLimitType('number'); setExamLimitValue(100);
    setDescription(''); setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: Package) => {
    setEditingId(pkg.id); setName(pkg.name); setPrice(pkg.price);
    
    if (pkg.idLimit === 'unlimited') {
      setIdLimitType('unlimited'); setIdLimitValue(50);
    } else {
      setIdLimitType('number'); setIdLimitValue((pkg.idLimit as number) || 50);
    }

    if (pkg.examLimit === 'unlimited') {
      setExamLimitType('unlimited'); setExamLimitValue(100);
    } else {
      setExamLimitType('number'); setExamLimitValue((pkg.examLimit as number) || 100);
    }

    setDescription(pkg.description); setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const finalIdLimit = idLimitType === 'unlimited' ? 'unlimited' : idLimitValue;
    const finalExamLimit = examLimitType === 'unlimited' ? 'unlimited' : examLimitValue;
    const testsIncluded = examLimitType === 'unlimited' ? 99999 : examLimitValue;

    if (editingId) {
      updatePackage(editingId, { name, price, testsIncluded, description, idLimit: finalIdLimit, examLimit: finalExamLimit });
    } else {
      addPackage({
        id: `pkg-${Date.now()}`, name, price, testsIncluded, description,
        idLimit: finalIdLimit, examLimit: finalExamLimit
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      deletePackage(id);
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow"><span className="dot"></span>B2B Subscriptions</div>
          <h1>Packages & Settings</h1>
          <p className="page-sub">Create and manage B2B subscription packages for your coaching center tenants.</p>
        </div>
        <div className="topbar-actions">
          <button onClick={handleOpenNew} className="btn btn-fill"><Plus className="w-4 h-4" /> Create New Package</button>
        </div>
      </div>

      <hr className="rule" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="panel p-6 flex flex-col h-full hover:border-[var(--ink)] transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-[3px] border border-[var(--forest)]/20 bg-[var(--forest)]/10 text-[var(--forest)] flex items-center justify-center">
                <PackageIcon className="w-5 h-5" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenEdit(pkg)} className="bg-transparent border-none p-1.5 text-[var(--ink-faint)] hover:text-[var(--ink)] cursor-pointer rounded-[3px]">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(pkg.id)} className="bg-transparent border-none p-1.5 text-[var(--ink-faint)] hover:text-[#B23A2A] cursor-pointer rounded-[3px]">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="font-display text-[22px] text-[var(--ink)] mb-1">{pkg.name}</h3>
            <p className="text-[13px] text-[var(--ink-soft)] mb-5 flex-1">{pkg.description}</p>
            
            <div className="space-y-2 mb-5 bg-[var(--paper-alt)] p-4 rounded-[3px] border border-[var(--line-soft)]">
              <div className="flex justify-between text-[12px] font-mono tracking-[0.05em] uppercase">
                <span className="text-[var(--ink-soft)]">Student IDs</span>
                <span className="font-medium text-[var(--ink)]">
                  {pkg.idLimit === 'unlimited' ? 'Unlimited' : pkg.idLimit}
                </span>
              </div>
              <div className="flex justify-between text-[12px] font-mono tracking-[0.05em] uppercase">
                <span className="text-[var(--ink-soft)]">Total Exams</span>
                <span className="font-medium text-[var(--ink)]">
                  {pkg.examLimit === 'unlimited' ? 'Unlimited' : pkg.examLimit}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--line-soft)] flex justify-between items-end">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.05em] text-[var(--ink-faint)] mb-1">Price</div>
                <div className="font-mono text-[24px] text-[var(--ink)]">৳{pkg.price}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[var(--ink)]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[4px] p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line-soft)] pb-4 mb-6">
              <h2 className="font-display text-[22px] text-[var(--ink)] flex items-center gap-2">
                <PackageIcon className="w-5 h-5 text-[var(--brick)]" /> {editingId ? 'Edit Package' : 'Create Package'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-transparent border-none text-[var(--ink-faint)] hover:text-[var(--ink)] text-[20px] cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">Package Name *</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-[var(--paper-card)] text-[14px] focus:outline-none focus:border-[var(--ink)]" />
              </div>
              
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">Price (৳) *</label>
                <input required type="number" min="0" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-[var(--paper-card)] text-[14px] focus:outline-none focus:border-[var(--ink)]" />
              </div>

              <div className="space-y-4 p-5 bg-[var(--paper-card)] border border-[var(--line)] rounded-[3px]">
                <h4 className="font-mono text-[11px] font-medium text-[var(--ink)] uppercase tracking-[0.05em] m-0">Usage Limits</h4>
                
                <div>
                  <label className="block text-[12px] text-[var(--ink-soft)] mb-1.5">Student IDs Limit</label>
                  <div className="flex gap-2">
                    <select value={idLimitType} onChange={e => setIdLimitType(e.target.value as 'number' | 'unlimited')} className="px-3 py-2.5 rounded-[3px] border border-[var(--line)] text-[14px] focus:outline-none focus:border-[var(--ink)] bg-white min-w-[120px]">
                      <option value="number">Fixed</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                    {idLimitType === 'number' && (
                      <input type="number" min="1" value={idLimitValue} onChange={e => setIdLimitValue(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-[3px] border border-[var(--line)] text-[14px] focus:outline-none focus:border-[var(--ink)]" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] text-[var(--ink-soft)] mb-1.5">Total Exams Limit</label>
                  <div className="flex gap-2">
                    <select value={examLimitType} onChange={e => setExamLimitType(e.target.value as 'number' | 'unlimited')} className="px-3 py-2.5 rounded-[3px] border border-[var(--line)] text-[14px] focus:outline-none focus:border-[var(--ink)] bg-white min-w-[120px]">
                      <option value="number">Fixed</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                    {examLimitType === 'number' && (
                      <input type="number" min="1" value={examLimitValue} onChange={e => setExamLimitValue(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-[3px] border border-[var(--line)] text-[14px] focus:outline-none focus:border-[var(--ink)]" />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">Description</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-[var(--paper-card)] text-[14px] focus:outline-none focus:border-[var(--ink)]" />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--line-soft)] mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-fill">Save Package</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
