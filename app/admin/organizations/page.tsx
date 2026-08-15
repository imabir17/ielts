'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/providers/StoreProvider';
import { Organization } from '@/lib/mock-data';
import { Building2, Plus, Search, CheckCircle2, XCircle, ArrowRight, MapPin, Edit2, Lock, Image as ImageIcon } from 'lucide-react';

export default function OrganizationsDirectoryPage() {
  const { tenants, updateTenant, addTenant, packages } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  
  // Backwards compatibility for existing logic
  const [tier, setTier] = useState<'Standard' | 'Premium' | 'Enterprise'>('Enterprise');

  const toggleStatus = (id: string) => {
    const org = tenants.find(t => t.id === id);
    if (org) {
      updateTenant(id, { status: org.status === 'active' ? 'suspended' : 'active' });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName(''); setLocation(''); setEmail(''); setAdminName(''); setPhone(''); setLogoUrl(''); setPassword(''); setSelectedPackages([]);
  };

  const handleOpenNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (org: Organization) => {
    setEditingId(org.id);
    setName(org.name);
    setLocation(org.location);
    setEmail(org.contactEmail);
    setAdminName(org.orgAdminName);
    setPhone(org.phone || '');
    setLogoUrl(org.logoUrl || '');
    setPassword(org.password || '');
    setSelectedPackages(org.packageIds || []);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateTenant(editingId, {
        name, location, contactEmail: email, orgAdminEmail: email, orgAdminName: adminName,
        phone, logoUrl, password, packageIds: selectedPackages
      });
    } else {
      addTenant({
        id: `org-${Date.now()}`,
        name,
        code: `ORG-${Math.floor(100 + Math.random() * 900)}`,
        location,
        contactEmail: email || 'contact@coaching.edu',
        subscriptionTier: tier,
        maxSeats: tier === 'Enterprise' ? 300 : tier === 'Premium' ? 150 : 75,
        maxExamsPerMonth: tier === 'Enterprise' ? 600 : tier === 'Premium' ? 300 : 100,
        examsUsedThisMonth: 0,
        studentCount: 0,
        activeTests: 4,
        status: 'active',
        createdDate: new Date().toISOString().split('T')[0],
        orgAdminName: adminName || 'Manager',
        orgAdminEmail: email || 'manager@coaching.edu',
        phone,
        logoUrl,
        password,
        packageIds: selectedPackages
      });
    }

    setIsModalOpen(false);
  };

  const togglePackage = (pkgId: string) => {
    setSelectedPackages(prev => 
      prev.includes(pkgId) ? prev.filter(id => id !== pkgId) : [...prev, pkgId]
    );
  };

  const filteredOrgs = tenants.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
            <span>Coaching Centers Directory</span>
            <span className="text-xs bg-[#005C53] text-white font-bold px-2.5 py-1 rounded-full uppercase">
              B2B SaaS Hub
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Onboard coaching center tenants, manage seat limits, and assign packages.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center space-x-2 bg-[#005C53] hover:bg-[#003831] text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Tenant</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search by center name, location, or org code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#005C53] bg-white"
        />
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Coaching Institution</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Packages</th>
                <th className="px-6 py-4">Status Toggle</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 flex items-center space-x-3">
                    {org.logoUrl ? (
                      <img src={org.logoUrl} alt="Logo" className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-900 flex items-center space-x-2">
                        <span>{org.name}</span>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                          {org.code}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{org.location}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700 text-xs space-y-1">
                    <div className="font-bold">{org.orgAdminName}</div>
                    <div className="text-slate-500">{org.contactEmail}</div>
                    <div className="text-slate-500">{org.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {org.packageIds && org.packageIds.length > 0 ? (
                        org.packageIds.map(pid => {
                          const p = packages.find(pkg => pkg.id === pid);
                          return p ? (
                            <span key={p.id} className="bg-[#005C53]/10 text-[#005C53] text-[10px] px-2 py-1 rounded font-bold">
                              {p.name}
                            </span>
                          ) : null;
                        })
                      ) : (
                        <span className="text-slate-400 text-xs italic">No packages</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(org.id)}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        org.status === 'active'
                          ? 'bg-emerald-100 text-[#005C53] hover:bg-red-100 hover:text-red-700'
                          : 'bg-red-100 text-red-700 hover:bg-emerald-100 hover:text-[#005C53]'
                      }`}
                    >
                      {org.status === 'active' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Suspended</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => handleOpenEdit(org)} className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-[#005C53]">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/admin/organizations/${org.id}`}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-[#005C53] hover:underline"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-[#005C53]" />
                <span>{editingId ? 'Edit Tenant Profile' : 'Onboard Coaching Center'}</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Address</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Associated Person (Admin) Name</label>
                  <input type="text" value={adminName} onChange={e => setAdminName(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (Login ID)</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Logo URL</label>
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53]" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center space-x-2 text-[#005C53] font-bold">
                  <Lock className="w-4 h-4" />
                  <span>Authentication</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{editingId ? 'Reset Password (Leave blank to keep current)' : 'Initial Password'}</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!editingId} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#005C53]" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Assign Packages</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                  {packages.map(pkg => (
                    <label key={pkg.id} className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedPackages.includes(pkg.id) ? 'bg-[#005C53]/10 border-[#005C53]' : 'bg-white border-slate-200 hover:bg-slate-100'}`}>
                      <input type="checkbox" checked={selectedPackages.includes(pkg.id)} onChange={() => togglePackage(pkg.id)} className="w-4 h-4 text-[#005C53] rounded" />
                      <div>
                        <div className="text-sm font-bold text-slate-900">{pkg.name}</div>
                        <div className="text-[10px] text-slate-500">৳{pkg.price} • {pkg.testsIncluded} tests</div>
                      </div>
                    </label>
                  ))}
                  {packages.length === 0 && (
                    <div className="text-xs text-slate-400 p-2 italic col-span-2">No packages created yet. Go to Settings to create packages.</div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#005C53] text-white text-xs font-bold rounded-xl hover:bg-[#003831] shadow-sm">
                  {editingId ? 'Save Changes' : 'Create & Issue Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
