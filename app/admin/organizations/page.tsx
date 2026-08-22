'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/providers/StoreProvider';
import { Organization } from '@/lib/mock-data';
import { Building2, Plus, Search, CheckCircle2, XCircle, ArrowRight, Edit2, Lock, Image as ImageIcon } from 'lucide-react';

export default function OrganizationsDirectoryPage() {
  const { tenants, updateTenant, addTenant, packages, isInitialized } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [tier, setTier] = useState<'Standard' | 'Premium' | 'Enterprise'>('Enterprise');

  const toggleStatus = (id: string) => {
    const org = tenants.find(t => t.id === id);
    if (org) updateTenant(id, { status: org.status === 'active' ? 'suspended' : 'active' });
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
    setPassword(''); // Keep empty, only update if typed
    setSelectedPackages(org.packageIds || []);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const selectedPkgObjs = packages.filter(p => selectedPackages.includes(p.id));
    const primaryPkg = selectedPkgObjs[0];
    const tierName = selectedPkgObjs.map(p => p.name).join(', ') || 'Starter';


    if (editingId) {
      const updatePayload: any = {
        name, location, contactEmail: email, orgAdminEmail: email, orgAdminName: adminName,
        phone, logoUrl, packageIds: selectedPackages,
        subscriptionTier: tierName
      };
      if (password.trim() !== '') {
        updatePayload.password = password;
      }
      updateTenant(editingId, updatePayload);
    } else {
      addTenant({
        id: `org-${Date.now()}`, name, code: `ORG-${Math.floor(100 + Math.random() * 900)}`,
        location, contactEmail: email || 'contact@coaching.edu', subscriptionTier: tierName,
        maxSeats: primaryPkg?.idLimit === 'unlimited' ? -1 : (Number(primaryPkg?.idLimit) || 50),
        maxExamsPerMonth: primaryPkg?.examLimit === 'unlimited' ? -1 : (Number(primaryPkg?.examLimit) || 100),
        examsUsedThisMonth: 0, studentCount: 0, activeTests: 4, status: 'active',
        createdDate: new Date().toISOString().split('T')[0], orgAdminName: adminName || 'Manager',
        orgAdminEmail: email || 'manager@coaching.edu', phone, logoUrl, password, packageIds: selectedPackages
      });
    }
    setIsModalOpen(false);
  };


  const togglePackage = (pkgId: string) => {
    setSelectedPackages(prev => prev.includes(pkgId) ? prev.filter(id => id !== pkgId) : [...prev, pkgId]);
  };

  const filteredOrgs = tenants.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.location.toLowerCase().includes(searchTerm.toLowerCase()) || o.code.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow"><span className="dot"></span>B2B SaaS Hub</div>
          <h1>Organizations</h1>
          <p className="page-sub">Onboard coaching center tenants, manage seat limits, and assign packages.</p>
        </div>
        <div className="topbar-actions">
          <button onClick={handleOpenNew} className="btn btn-fill"><Plus className="w-4 h-4" /> Onboard New Tenant</button>
        </div>
      </div>

      <hr className="rule" />

      <div className="relative max-w-md mb-6">
        <Search className="w-4 h-4 text-[var(--ink-faint)] absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search by center name, location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-[3px] border border-[var(--line)] bg-[var(--paper-card)] text-[14px] focus:outline-none focus:border-[var(--ink)] focus:ring-1 focus:ring-[var(--ink)] placeholder:text-[var(--ink-faint)]"
        />
      </div>

      <div className="panel">
        <div className="panel-body p-0">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Coaching Institution</th>
                <th>Contact</th>
                <th>Packages</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 italic text-[var(--ink-faint)]">
                    {!isInitialized ? 'Loading organizations...' : 'No organizations found.'}
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org) => (
                  <tr key={org.id}>
                    <td className="who">
                      <div className="flex items-center gap-3">
                        {org.logoUrl ? (
                          <img src={org.logoUrl} alt="Logo" className="w-8 h-8 rounded-[3px] border border-[var(--line)] object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-[3px] bg-[var(--paper-alt)] border border-[var(--line-soft)] flex items-center justify-center text-[var(--ink-soft)]">
                            <Building2 className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            {org.name}
                            <span className="font-mono text-[10px] bg-[var(--paper-alt)] text-[var(--ink-soft)] px-1.5 py-0.5 rounded-[2px]">{org.code}</span>
                          </div>
                          <div className="text-[12px] text-[var(--ink-faint)] mt-0.5 font-normal">{org.location}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-[13px]">{org.orgAdminName}</div>
                      <div className="text-[12px] text-[var(--ink-faint)]">{org.contactEmail}</div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {org.packageIds?.length ? org.packageIds.map(pid => {
                          const p = packages.find(pkg => pkg.id === pid);
                          return p ? <span key={p.id} className="pill pass">{p.name}</span> : null;
                        }) : <span className="text-[12px] text-[var(--ink-faint)] italic">No packages</span>}
                      </div>
                    </td>
                    <td>
                      <button onClick={() => toggleStatus(org.id)} className={`pill ${org.status === 'active' ? 'pass' : 'mid'} flex items-center gap-1.5 border-none cursor-pointer hover:opacity-80`}>
                        {org.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {org.status === 'active' ? 'Active' : 'Suspended'}
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => handleOpenEdit(org)} className="bg-transparent border-none text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                        <Link href={`/admin/organizations/${org.id}`} className="flex items-center gap-1 text-[13px] font-medium text-[var(--brick)] hover:text-[var(--brick-dark)]">
                          View <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[var(--ink)]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[4px] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line-soft)] pb-4 mb-6">
              <h2 className="font-display text-[22px] text-[var(--ink)] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[var(--brick)]" />
                {editingId ? 'Edit Tenant Profile' : 'Onboard Coaching Center'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-transparent border-none text-[var(--ink-faint)] hover:text-[var(--ink)] text-[20px] cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">Company Name *</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-[var(--paper-card)] text-[14px] focus:outline-none focus:border-[var(--ink)]" />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">Location / Address</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-[var(--paper-card)] text-[14px] focus:outline-none focus:border-[var(--ink)]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">Admin Name</label>
                  <input type="text" value={adminName} onChange={e => setAdminName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-[var(--paper-card)] text-[14px] focus:outline-none focus:border-[var(--ink)]" />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">Email (Login ID)</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-[var(--paper-card)] text-[14px] focus:outline-none focus:border-[var(--ink)]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-[var(--paper-card)] text-[14px] focus:outline-none focus:border-[var(--ink)]" />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">Logo URL</label>
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-3" />
                    <input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full pl-9 pr-4 py-2.5 rounded-[3px] border border-[var(--line)] bg-[var(--paper-card)] text-[14px] focus:outline-none focus:border-[var(--ink)]" />
                  </div>
                </div>
              </div>

              <div className="p-5 bg-[var(--paper-card)] border border-[var(--line)] rounded-[3px]">
                <div className="flex items-center gap-2 text-[var(--ink)] font-medium mb-4">
                  <Lock className="w-4 h-4 text-[var(--brick)]" /> Authentication
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-1">{editingId ? 'Reset Password (Leave blank to keep)' : 'Initial Password'}</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!editingId} className="w-full px-3.5 py-2.5 rounded-[3px] border border-[var(--line)] bg-white text-[14px] focus:outline-none focus:border-[var(--ink)]" />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink-soft)] mb-3">Assign Packages</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border border-[var(--line-soft)] rounded-[3px] bg-[var(--paper-alt)]">
                  {packages.map(pkg => (
                    <label key={pkg.id} className={`flex items-center gap-3 p-3 rounded-[3px] border cursor-pointer transition-colors ${selectedPackages.includes(pkg.id) ? 'bg-[rgba(47,110,82,0.1)] border-[var(--forest)]' : 'bg-[var(--paper-card)] border-[var(--line)]'}`}>
                      <input type="checkbox" checked={selectedPackages.includes(pkg.id)} onChange={() => togglePackage(pkg.id)} className="w-4 h-4" />
                      <div>
                        <div className="text-[14px] font-medium text-[var(--ink)]">{pkg.name}</div>
                        <div className="text-[12px] text-[var(--ink-faint)]">
                          ৳{pkg.price} • {pkg.examLimit === 'unlimited' || pkg.examLimit === -1 ? 'Unlimited' : pkg.examLimit} exams • {pkg.idLimit === 'unlimited' || pkg.idLimit === -1 ? 'Unlimited' : pkg.idLimit} IDs
                        </div>
                      </div>

                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--line-soft)] mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-fill">
                  {editingId ? 'Save Changes' : 'Create & Issue Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
