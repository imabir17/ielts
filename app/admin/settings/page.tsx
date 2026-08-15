'use client';

import React, { useState } from 'react';
import { useStore } from '@/components/providers/StoreProvider';
import { Package } from '@/lib/mock-data';
import { Package as PackageIcon, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const { packages, addPackage, updatePackage, deletePackage } = useStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [idLimitType, setIdLimitType] = useState<'number' | 'unlimited'>('number');
  const [idLimitValue, setIdLimitValue] = useState(50);
  const [examLimitType, setExamLimitType] = useState<'number' | 'unlimited'>('number');
  const [examLimitValue, setExamLimitValue] = useState(100);
  const [description, setDescription] = useState('');

  const handleOpenNew = () => {
    setEditingId(null);
    setName('');
    setPrice(0);
    setIdLimitType('number');
    setIdLimitValue(50);
    setExamLimitType('number');
    setExamLimitValue(100);
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: Package) => {
    setEditingId(pkg.id);
    setName(pkg.name);
    setPrice(pkg.price);
    
    if (pkg.idLimit === 'unlimited') {
      setIdLimitType('unlimited');
      setIdLimitValue(50);
    } else {
      setIdLimitType('number');
      setIdLimitValue((pkg.idLimit as number) || 50);
    }

    if (pkg.examLimit === 'unlimited') {
      setExamLimitType('unlimited');
      setExamLimitValue(100);
    } else {
      setExamLimitType('number');
      setExamLimitValue((pkg.examLimit as number) || 100);
    }

    setDescription(pkg.description);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const finalIdLimit = idLimitType === 'unlimited' ? 'unlimited' : idLimitValue;
    const finalExamLimit = examLimitType === 'unlimited' ? 'unlimited' : examLimitValue;
    // For legacy compat
    const testsIncluded = examLimitType === 'unlimited' ? 99999 : examLimitValue;

    if (editingId) {
      updatePackage(editingId, { 
        name, price, testsIncluded, description, 
        idLimit: finalIdLimit, examLimit: finalExamLimit 
      });
    } else {
      addPackage({
        id: `pkg-${Date.now()}`,
        name, price, testsIncluded, description,
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
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
            <span>Packages & Settings</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create and manage B2B subscription packages for your coaching center tenants.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center space-x-2 bg-[#005C53] hover:bg-[#003831] text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Package</span>
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#005C53] flex items-center justify-center">
                <PackageIcon className="w-5 h-5" />
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleOpenEdit(pkg)} className="p-2 text-slate-400 hover:text-[#005C53] hover:bg-emerald-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(pkg.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4 flex-1">{pkg.description}</p>
            
            <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-bold">Student IDs</span>
                <span className="font-bold text-[#005C53]">
                  {pkg.idLimit === 'unlimited' ? 'Unlimited' : pkg.idLimit}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-bold">Total Exams</span>
                <span className="font-bold text-[#005C53]">
                  {pkg.examLimit === 'unlimited' ? 'Unlimited' : pkg.examLimit}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-end justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Price</div>
                <div className="text-2xl font-black text-slate-900">৳{pkg.price}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full space-y-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Package' : 'Create Package'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Package Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53]" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Price (৳)</label>
                <input required type="number" min="0" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53]" />
              </div>

              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Usage Limits</h4>
                
                {/* ID Limit */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student IDs Limit</label>
                  <div className="flex space-x-2">
                    <select 
                      value={idLimitType} 
                      onChange={e => setIdLimitType(e.target.value as 'number' | 'unlimited')}
                      className="px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53] bg-white"
                    >
                      <option value="number">Fixed Number</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                    {idLimitType === 'number' && (
                      <input 
                        type="number" min="1" 
                        value={idLimitValue} 
                        onChange={e => setIdLimitValue(Number(e.target.value))} 
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53]" 
                      />
                    )}
                  </div>
                </div>

                {/* Exam Limit */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Exams Limit</label>
                  <div className="flex space-x-2">
                    <select 
                      value={examLimitType} 
                      onChange={e => setExamLimitType(e.target.value as 'number' | 'unlimited')}
                      className="px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53] bg-white"
                    >
                      <option value="number">Fixed Number</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                    {examLimitType === 'number' && (
                      <input 
                        type="number" min="1" 
                        value={examLimitValue} 
                        onChange={e => setExamLimitValue(Number(e.target.value))} 
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53]" 
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53]" />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-[#005C53] hover:bg-[#003831] text-white rounded-xl text-sm font-bold shadow-sm">Save Package</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
