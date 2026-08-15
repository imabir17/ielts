'use client';

import React from 'react';
import { MOCK_ORGANIZATIONS, MOCK_EXAM_LOGS, MOCK_AUDIT_LOGS, MOCK_ANOMALIES } from '@/lib/mock-data';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const totalStudents = MOCK_ORGANIZATIONS.reduce((acc, curr) => acc + curr.studentCount, 0);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow"><span className="dot"></span>Super admin mode</div>
          <h1>Platform overview</h1>
          <p className="page-sub">Global management of B2B coaching centers, exam logs, and test material IP.</p>
        </div>
        <div className="topbar-actions">
          <Link href="/admin/organizations" className="btn btn-ghost">Manage tenants</Link>
          <Link href="/admin/materials/new" className="btn btn-fill">+ Ingest test</Link>
        </div>
      </div>

      <hr className="rule" />

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-label">Active coaching orgs</span>
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
          </div>
          <div className="stat-num">{MOCK_ORGANIZATIONS.length}</div>
          <div className="stat-foot up">↗ Dhaka branches: Gulshan, Dhanmondi, Uttara</div>
        </div>
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-label">Enrolled student seats</span>
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="3.2" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>
          </div>
          <div className="stat-num">{totalStudents}</div>
          <div className="stat-foot">Across all coaching tenants</div>
        </div>
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-label">Published test bank</span>
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 11l2 2 4-4M4 5h16v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" /></svg>
          </div>
          <div className="stat-num">14</div>
          <div className="stat-foot up">Academic & General Training</div>
        </div>
        <div className="stat-card">
          <div className="stat-head">
            <span className="stat-label">System health & uptime</span>
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /></svg>
          </div>
          <div className="stat-num gold">99.9%</div>
          <div className="stat-foot">Vercel Edge / Supabase Ready</div>
        </div>
      </div>

      <div className="panel-row">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 15l4-5 4 3 4-6 4 4" /></svg>
              Live exam feed across centers
            </div>
            <span className="panel-meta">real-time log</span>
          </div>
          <div className="panel-body">
            {MOCK_EXAM_LOGS.map((log) => (
              <div key={log.id} className="log-row">
                <span className="log-time">{log.completedAt}</span>
                <span className="log-text">
                  <b>{log.studentName}</b> completed {log.testTitle} — {log.orgName}
                </span>
                <span className="log-tag ok">band {log.overallBand}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2L2 20h20z" /><path d="M12 9v5M12 17h.01" /></svg>
              Difficulty & anomaly flags
            </div>
            <span className="panel-meta">{MOCK_ANOMALIES.length} open</span>
          </div>
          <div className="panel-body">
            {MOCK_ANOMALIES.map((anom) => (
              <div key={anom.questionId} className="flag-row">
                <span className={`flag-dot ${anom.passRatePercentage < 50 ? 'high' : 'mid'}`}></span>
                <span className="flag-text">
                  <b>{anom.testTitle} {anom.module}</b> — {anom.prompt} ({anom.passRatePercentage}% pass rate).
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>
            Platform security & audit trail
          </div>
          <span className="panel-meta">{MOCK_AUDIT_LOGS.length} recent events</span>
        </div>
        <div className="panel-body">
          <table className="audit-table">
            <thead>
              <tr><th>Actor</th><th>Action</th><th>Scope</th><th>Time</th></tr>
            </thead>
            <tbody>
              {MOCK_AUDIT_LOGS.map((log) => (
                <tr key={log.id}>
                  <td className="who">{log.actor}</td>
                  <td>{log.action}</td>
                  <td>{log.target}</td>
                  <td className="time">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
